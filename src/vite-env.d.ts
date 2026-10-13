/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Optional public Ethereum Mainnet JSON-RPC URL (https). Shipped to every browser:
   * never put an API key or any secret here.
   */
  readonly VITE_MAINNET_RPC_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
