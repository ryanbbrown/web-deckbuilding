import { describe, it, expect } from 'vitest';
import {
  createCardDefinition,
  createCardInstance,
  setCardOwner,
  moveCardToZone,
  isValidCardState,
} from '../services';
import { Zone } from '../types';

describe('Card Service', () => {
  describe('createCardDefinition', () => {
    it('should create a card definition with default cost', () => {
      const card = createCardDefinition('Test Card', 'Test text');

      expect(card.name).toBe('Test Card');
      expect(card.text).toBe('Test text');
      expect(card.cost).toBe(0);
      expect(card.uid).toBeDefined();
      expect(typeof card.uid).toBe('string');
    });

    it('should create a card definition with custom cost', () => {
      const card = createCardDefinition('Expensive Card', 'Costs money', 5);

      expect(card.cost).toBe(5);
    });

    it('should generate unique UIDs for different cards', () => {
      const card1 = createCardDefinition('Card 1', 'Text 1');
      const card2 = createCardDefinition('Card 2', 'Text 2');

      expect(card1.uid).not.toBe(card2.uid);
    });
  });

  describe('createCardInstance', () => {
    it('should create a card instance with default zone', () => {
      const definition = createCardDefinition('Test Card', 'Test text');
      const instance = createCardInstance(definition);

      expect(instance.definition).toBe(definition);
      expect(instance.zone).toBe(Zone.MARKET);
      expect(instance.instanceId).toBeDefined();
      expect(typeof instance.instanceId).toBe('string');
      expect(instance.ownerId).toBeUndefined();
    });

    it('should generate unique instance IDs', () => {
      const definition = createCardDefinition('Test Card', 'Test text');
      const instance1 = createCardInstance(definition);
      const instance2 = createCardInstance(definition);

      expect(instance1.instanceId).not.toBe(instance2.instanceId);
    });
  });

  describe('setCardOwner', () => {
    it('should set the owner of a card instance', () => {
      const definition = createCardDefinition('Test Card', 'Test text');
      const instance = createCardInstance(definition);
      const ownedInstance = setCardOwner(instance, 'player-123');

      expect(ownedInstance.ownerId).toBe('player-123');
      expect(ownedInstance.definition).toBe(definition);
      expect(ownedInstance.instanceId).toBe(instance.instanceId);
    });

    it('should not mutate the original instance', () => {
      const definition = createCardDefinition('Test Card', 'Test text');
      const instance = createCardInstance(definition);
      const ownedInstance = setCardOwner(instance, 'player-123');

      expect(instance.ownerId).toBeUndefined();
      expect(ownedInstance).not.toBe(instance);
    });
  });

  describe('isValidCardState', () => {
    it('should return true for unowned card in market', () => {
      const definition = createCardDefinition('Test Card', 'Test text');
      const instance = createCardInstance(definition);

      expect(isValidCardState(instance)).toBe(true);
    });

    it('should return false for unowned card in player zones', () => {
      const definition = createCardDefinition('Test Card', 'Test text');
      const instance = { ...createCardInstance(definition), zone: Zone.DECK };

      expect(isValidCardState(instance)).toBe(false);
    });

    it('should return true for owned card in player zones', () => {
      const definition = createCardDefinition('Test Card', 'Test text');
      const instance = createCardInstance(definition);
      const ownedInstance = setCardOwner(instance, 'player-123');
      const movedInstance = { ...ownedInstance, zone: Zone.DECK };

      expect(isValidCardState(movedInstance)).toBe(true);
    });

    it('should return false for owned card in market', () => {
      const definition = createCardDefinition('Test Card', 'Test text');
      const instance = createCardInstance(definition);
      const ownedInstance = setCardOwner(instance, 'player-123');

      expect(isValidCardState(ownedInstance)).toBe(false);
    });
  });

  describe('moveCardToZone', () => {
    it('should move an owned card to a valid player zone', () => {
      const definition = createCardDefinition('Test Card', 'Test text');
      const instance = createCardInstance(definition);
      const ownedInstance = setCardOwner(instance, 'player-123');
      const movedInstance = moveCardToZone(ownedInstance, Zone.HAND);

      expect(movedInstance.zone).toBe(Zone.HAND);
      expect(movedInstance.definition).toBe(definition);
      expect(movedInstance.instanceId).toBe(instance.instanceId);
    });

    it('should throw error for invalid zone transitions', () => {
      const definition = createCardDefinition('Test Card', 'Test text');
      const instance = createCardInstance(definition);

      expect(() => moveCardToZone(instance, Zone.DECK)).toThrow(
        'Invalid card state'
      );
    });

    it('should not mutate the original instance', () => {
      const definition = createCardDefinition('Test Card', 'Test text');
      const instance = createCardInstance(definition);
      const ownedInstance = setCardOwner(instance, 'player-123');
      const movedInstance = moveCardToZone(ownedInstance, Zone.HAND);

      expect(ownedInstance.zone).toBe(Zone.MARKET);
      expect(movedInstance).not.toBe(ownedInstance);
    });
  });
});
