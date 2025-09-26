import * as Y from 'yjs';
import { StoreApi } from 'zustand';

// Unique origin to prevent echo loops
const ORIGIN = Symbol('y-origin');

// Deep equality check for complex objects
const deepEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;

  if (typeof a === 'object') {
    const aKeys = Object.keys(a as Record<string, unknown>);
    const bKeys = Object.keys(b as Record<string, unknown>);

    if (aKeys.length !== bKeys.length) return false;

    return aKeys.every((key) =>
      deepEqual(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key]
      )
    );
  }

  return false;
};

export interface BindingConfig<T> {
  store: StoreApi<T>;
  ymap: Y.Map<unknown>;
  key: keyof T;
  onSync?: () => void;
}

export interface Binding {
  unbind: () => void;
}

/**
 * Creates a bidirectional binding between a Zustand store key and a Yjs map entry.
 *
 * The binding follows these rules:
 * 1. Zustand → Yjs: After a local action, write that key to Yjs with a unique origin
 * 2. Yjs → Zustand: On change, update store unless transaction origin matches local
 * 3. Initial seeding: If Y has the key, hydrate store from Y; else seed Y from store
 */
export const bindStoreKeyToYjs = <T extends Record<string, unknown>>({
  store,
  ymap,
  key,
  onSync,
}: BindingConfig<T>): Binding => {
  const keyStr = String(key);
  let isInitialized = false;

  // Initial seeding
  const initializeBinding = () => {
    if (isInitialized) return;
    isInitialized = true;

    const yValue = ymap.get(keyStr);
    const storeValue = store.getState()[key];

    console.log(`[${keyStr}] Initializing binding:`, {
      yValue: yValue !== undefined ? yValue : 'undefined',
      storeValue: storeValue !== undefined ? storeValue : 'undefined',
    });

    if (yValue !== undefined) {
      // Y has data - hydrate store from Y
      console.log(`[${keyStr}] Hydrating store from Y`);
      store.setState((state) => ({
        ...state,
        [key]: yValue,
      }));
    } else if (storeValue !== undefined) {
      // Y is empty - seed Y from store
      console.log(`[${keyStr}] Seeding Y from store`);
      ymap.doc?.transact(() => {
        ymap.set(keyStr, storeValue);
      }, ORIGIN);
    }
  };

  // Yjs → Zustand observer
  const yObserver = (_event: Y.YMapEvent<unknown>, txn: Y.Transaction) => {
    if (txn.origin === ORIGIN) {
      console.log(`[${keyStr}] Y→Z: Skipping echo (our own transaction)`);
      return; // Prevent echo
    }

    const newValue = ymap.get(keyStr);
    if (newValue !== undefined) {
      console.log(
        `[${keyStr}] Y→Z: Updating store with remote change`,
        newValue
      );
      store.setState((state) => ({
        ...state,
        [key]: newValue,
      }));
      onSync?.();
    }
  };

  // Zustand → Yjs observer
  const unsubscribe = store.subscribe((state, prevState) => {
    const currentValue = state[key];
    const previousValue = prevState[key];

    // Use deep equality to prevent false positives from reference changes
    const hasChanged = !deepEqual(currentValue, previousValue);
    if (hasChanged && ymap.doc) {
      console.log(`[${keyStr}] Z→Y: Local change detected, updating Yjs`, {
        previous: previousValue,
        current: currentValue,
      });
      ymap.doc.transact(() => {
        ymap.set(keyStr, currentValue);
      }, ORIGIN);
    }
  });

  // Set up Y observer
  ymap.observe(yObserver);

  // Initialize the binding
  initializeBinding();

  // Return unbind function
  return {
    unbind: () => {
      unsubscribe();
      ymap.unobserve(yObserver);
    },
  };
};

/**
 * Creates bindings for multiple store keys at once
 */
export const bindMultipleKeys = <T extends Record<string, unknown>>(
  store: StoreApi<T>,
  ymap: Y.Map<unknown>,
  keys: (keyof T)[],
  onSync?: () => void
): Binding => {
  const bindings = keys.map((key) =>
    bindStoreKeyToYjs({ store, ymap, key, onSync })
  );

  return {
    unbind: () => {
      bindings.forEach((binding) => binding.unbind());
    },
  };
};
