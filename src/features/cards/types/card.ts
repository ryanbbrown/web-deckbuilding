export enum Zone {
  DECK = 'DECK',
  HAND = 'HAND',
  PLAYED = 'PLAYED',
  DISCARD = 'DISCARD',
  MARKET = 'MARKET',
}

export interface CardDefinition {
  name: string;
  text: string;
  cost: number;
  uid: string;
}

export interface CardInstance {
  definition: CardDefinition;
  ownerId?: string;
  zone: Zone;
  instanceId: string;
}
