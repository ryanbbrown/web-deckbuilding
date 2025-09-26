import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { v4 as uuidv4 } from 'uuid';
import { attachShared, initializeDoc, type SharedDoc } from './yjsSchema';

export interface ConnectionConfig {
  serverUrl: string;
  roomId: string;
  token: string;
}

export interface Connection {
  doc: Y.Doc;
  provider: WebsocketProvider;
  shared: SharedDoc;
  destroy: () => void;
  roomId: string;
}

export const connectRoom = ({
  serverUrl,
  roomId,
  token,
}: ConnectionConfig): Connection => {
  const doc = new Y.Doc();

  // Ensure the doc has the right structure
  initializeDoc(doc);

  // Get typed references to the maps
  const shared = attachShared(doc);

  const provider = new WebsocketProvider(serverUrl, roomId, doc, {
    params: { yauth: token },
  });

  provider.on('status', (e) => {
    console.log('[ws]', e.status);
  });

  provider.on('sync', (isSynced) => {
    console.log('[ws] sync', isSynced);
  });

  const destroy = () => {
    provider.destroy();
    doc.destroy();
  };

  return { doc, provider, shared, destroy, roomId };
};

export const createNewRoomId = (): string => {
  return uuidv4();
};

const AUTH_SERVER_URL =
  typeof import.meta.env !== 'undefined' && import.meta.env.VITE_AUTH_SERVER_URL
    ? String(import.meta.env.VITE_AUTH_SERVER_URL)
    : 'https://web-deckbuilding-yredis.fly.dev';

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

export const getAuthToken = async (): Promise<string> => {
  const now = Date.now();

  if (cachedToken && tokenExpiry && tokenExpiry > now + 60000) {
    return cachedToken;
  }

  const response = await fetch(`${AUTH_SERVER_URL}/auth/token`);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch token: ${response.status} ${response.statusText}`
    );
  }

  const token = await response.text();
  cachedToken = token;
  tokenExpiry = now + 55 * 60 * 1000;

  return token;
};
