/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LUCIA_INVEST_URL?: string;
  readonly VITE_INQUIRY_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
