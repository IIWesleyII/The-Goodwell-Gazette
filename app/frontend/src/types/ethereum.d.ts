export {};

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      isPhantom?: boolean;
      providers?: Array<any>;
      request: (args: {
        method: string;
        params?: unknown[] | object;
      }) => Promise<any>;
    };

    phantom?: {
      ethereum?: {
        isPhantom?: boolean;
        request: (args: {
          method: string;
          params?: unknown[] | object;
        }) => Promise<any>;
      };
    };
  }
}