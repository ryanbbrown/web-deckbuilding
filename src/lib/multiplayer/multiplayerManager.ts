import { StoreApi } from 'zustand';
import {
  connectRoom,
  getAuthToken,
  createNewRoomId,
} from './connectionManager';
import { bindMultipleKeys } from './zustandYjsBinding';
import type { Connection } from './connectionManager';
import type { Binding } from './zustandYjsBinding';
// Import the exported store state types
import type { GameState } from '../../store/game-store';
import type { MarketState } from '../../store/market-store';
import type { PlayerState } from '../../store/player-store';

interface MultiplayerState {
  roomId: string | null;
  isConnected: boolean;
  connection: Connection | null;
  bindings: Map<string, Binding>;
}

class MultiplayerManager {
  private state: MultiplayerState = {
    roomId: null,
    isConnected: false,
    connection: null,
    bindings: new Map(),
  };

  private gameStore: StoreApi<GameState> | null = null;
  private marketStore: StoreApi<MarketState> | null = null;
  private playerStore: StoreApi<PlayerState> | null = null;

  setStores(stores: {
    gameStore: StoreApi<GameState>;
    marketStore: StoreApi<MarketState>;
    playerStore: StoreApi<PlayerState>;
  }) {
    this.gameStore = stores.gameStore;
    this.marketStore = stores.marketStore;
    this.playerStore = stores.playerStore;
  }

  async createRoom(): Promise<string> {
    if (this.state.connection) {
      console.warn('Already connected to a room');
      return this.state.roomId || '';
    }

    const roomId = createNewRoomId();
    const token = await getAuthToken();

    const connection = connectRoom({
      serverUrl: 'wss://web-deckbuilding-yredis.fly.dev',
      roomId,
      token,
    });

    // Wait for connection
    await new Promise<void>((resolve) => {
      connection.provider.on('status', (e) => {
        if (e.status === 'connected') {
          resolve();
        }
      });
    });

    this.state.connection = connection;
    this.state.roomId = roomId;
    this.state.isConnected = true;

    // Update store states
    this.updateStoreStates(roomId, true);

    // Create bindings
    this.createBindings();

    return roomId;
  }

  async joinRoom(roomId: string): Promise<void> {
    if (this.state.connection) {
      console.warn('Already connected to a room');
      return;
    }

    const token = await getAuthToken();

    const connection = connectRoom({
      serverUrl: 'wss://web-deckbuilding-yredis.fly.dev',
      roomId,
      token,
    });

    // Wait for connection and initial sync
    await new Promise<void>((resolve) => {
      let connected = false;
      let synced = false;

      const checkReady = () => {
        if (connected && synced) resolve();
      };

      connection.provider.on('status', (e) => {
        if (e.status === 'connected') {
          connected = true;
          checkReady();
        }
      });

      connection.provider.on('sync', (isSynced) => {
        if (isSynced) {
          synced = true;
          checkReady();
        }
      });
    });

    this.state.connection = connection;
    this.state.roomId = roomId;
    this.state.isConnected = true;

    // Update store states
    this.updateStoreStates(roomId, true);

    // Create bindings
    this.createBindings();
  }

  leaveRoom(): void {
    // Unbind all
    this.state.bindings.forEach((binding) => binding.unbind());
    this.state.bindings.clear();

    // Destroy connection
    if (this.state.connection) {
      this.state.connection.destroy();
    }

    // Update store states
    this.updateStoreStates(null, false);

    // Reset state
    this.state.roomId = null;
    this.state.isConnected = false;
    this.state.connection = null;
  }

  private updateStoreStates(roomId: string | null, isConnected: boolean): void {
    if (this.gameStore) {
      this.gameStore.setState({ roomId, isConnected });
    }
    if (this.marketStore) {
      this.marketStore.setState({ roomId, isConnected });
    }
    if (this.playerStore) {
      this.playerStore.setState({ roomId, isConnected });
    }
  }

  private createBindings(): void {
    if (!this.state.connection) return;
    if (!this.gameStore || !this.marketStore || !this.playerStore) {
      console.error('Stores not set for multiplayer manager');
      return;
    }

    // Bind game store
    const gameBinding = bindMultipleKeys(
      this.gameStore,
      this.state.connection.shared.game,
      ['game']
    );
    this.state.bindings.set('game', gameBinding);

    // Bind market store
    const marketBinding = bindMultipleKeys(
      this.marketStore,
      this.state.connection.shared.market,
      ['catalog']
    );
    this.state.bindings.set('market', marketBinding);

    // Bind player store to a regular Y.Map
    // Note: We'll use the game map for players data since players is a nested structure
    const playerBinding = bindMultipleKeys(
      this.playerStore,
      this.state.connection.shared.game,
      ['players']
    );
    this.state.bindings.set('players', playerBinding);
  }

  getState(): Readonly<MultiplayerState> {
    return { ...this.state, bindings: new Map(this.state.bindings) };
  }
}

// Singleton instance
export const multiplayerManager = new MultiplayerManager();
