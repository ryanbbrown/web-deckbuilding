/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_YJS_SERVER_URL: string;
  readonly VITE_AUTH_SERVER_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
