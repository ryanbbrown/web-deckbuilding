import * as Y from 'yjs';

export interface SharedDoc {
  game: Y.Map<unknown>;
  market: Y.Map<unknown>;
  players: Y.Map<Y.Map<unknown>>;
}

export const attachShared = (doc: Y.Doc): SharedDoc => ({
  game: doc.getMap('game'),
  market: doc.getMap('market'),
  players: doc.getMap('players'),
});

export const initializeDoc = (doc: Y.Doc): void => {
  doc.getMap('game');
  doc.getMap('market');
  doc.getMap('players');
};
