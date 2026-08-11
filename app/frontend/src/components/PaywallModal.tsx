import { useState } from "react";
import "./styles/PaywallModal.css";

import { createWalletClient, custom } from "viem";
import { baseSepolia } from "viem/chains";
import { wrapFetchWithPaymentFromConfig } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm";

import type { Article } from "../types/article";

type BrowserWallet = {
  name: string;
  provider: any;
};

type PaywallModalProps = {
  isOpen: boolean;
  slug: string;
  onClose: () => void;
  onArticlePurchased: (article: Article) => void;
};

const BASE_SEPOLIA_CHAIN_ID = "0x14a34";

const BASE_SEPOLIA_PARAMS = {
  chainId: BASE_SEPOLIA_CHAIN_ID,
  chainName: "Base Sepolia",
  nativeCurrency: {
    name: "Sepolia Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://sepolia.base.org"],
  blockExplorerUrls: ["https://sepolia.basescan.org"],
};

const WALLET_ICONS: Record<string, string> = {
  MetaMask: "/MetaMask-icon-fox.svg",
  Phantom: "/phantom_icon.png",
};

function getAvailableWallets(): BrowserWallet[] {
  if (typeof window === "undefined") {
    return [];
  }

  const ethereum = window.ethereum;

  if (!ethereum) {
    return [];
  }

  const providers = Array.isArray(ethereum.providers)
    ? ethereum.providers
    : [ethereum];

  const wallets: BrowserWallet[] = [];

  for (const provider of providers) {
    if (provider.isMetaMask) {
      wallets.push({
        name: "MetaMask",
        provider,
      });
    }

    if (provider.isCoinbaseWallet) {
      wallets.push({
        name: "Coinbase Wallet",
        provider,
      });
    }

    if (provider.isPhantom) {
      wallets.push({
        name: "Phantom",
        provider,
      });
    }
  }

  if (window.phantom?.ethereum?.isPhantom) {
    const alreadyHasPhantom = wallets.some(
      (wallet) => wallet.name === "Phantom"
    );

    if (!alreadyHasPhantom) {
      wallets.push({
        name: "Phantom",
        provider: window.phantom.ethereum,
      });
    }
  }

  if (wallets.length === 0 && ethereum) {
    wallets.push({
      name: "Browser Wallet",
      provider: ethereum,
    });
  }

  return wallets;
}

function PaywallModal({
  isOpen,
  slug,
  onArticlePurchased,
}: PaywallModalProps) {
  const [step, setStep] = useState<"payment" | "wallets">("payment");
  const [wallets, setWallets] = useState<BrowserWallet[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  if (!isOpen) {
    return null;
  }

  function handleBuyArticle() {
    const detectedWallets = getAvailableWallets();

    setWallets(detectedWallets);
    setStatusMessage(null);
    setStep("wallets");
  }

  async function handleWalletClick(wallet: BrowserWallet) {
    try {
      setIsPaying(true);
      setStatusMessage(`Connecting to ${wallet.name}...`);

      const accounts = await wallet.provider.request({
        method: "eth_requestAccounts",
      });

      const address = accounts[0] as `0x${string}`;

      console.log("Selected wallet:", wallet.name);
      console.log("Connected account:", address);

      setStatusMessage("Checking network...");

      const chainId = await wallet.provider.request({
        method: "eth_chainId",
      });

      if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
        setStatusMessage("Switching to Base Sepolia...");

        try {
          await wallet.provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: BASE_SEPOLIA_CHAIN_ID }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await wallet.provider.request({
              method: "wallet_addEthereumChain",
              params: [BASE_SEPOLIA_PARAMS],
            });
          } else {
            throw switchError;
          }
        }
      }

      setStatusMessage("Preparing payment...");

      const walletClient = createWalletClient({
        chain: baseSepolia,
        transport: custom(wallet.provider),
      });

      const signer = {
        address,

        signTypedData: async (params: {
          domain: any;
          types: any;
          primaryType: string;
          message: any;
        }) => {
          return walletClient.signTypedData({
            account: address,
            domain: params.domain,
            types: params.types,
            primaryType: params.primaryType as any,
            message: params.message,
          });
        },
      };

      const fetchWithPayment = wrapFetchWithPaymentFromConfig(fetch, {
        schemes: [
          {
            network: "eip155:84532",
            client: new ExactEvmScheme(signer as any),
          },
        ],
      });

      setStatusMessage("Requesting paid article...");

      const response = await fetchWithPayment(`/api/articles/${slug}/unlock`, {
        method: "GET",
      });

      console.log("Paid article response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Paid article request failed:", errorText);
        setStatusMessage("Payment failed or article could not be unlocked.");
        return;
      }

      const unlockPayload: {
        article: Article;
        access_token: string;
        expires_at: string;
      } = await response.json();

      localStorage.setItem(
        `article-access:${slug}`,
        JSON.stringify({
          token: unlockPayload.access_token,
          expiresAt: unlockPayload.expires_at,
        })
      );

      setStatusMessage("Article unlocked!");

      onArticlePurchased(unlockPayload.article);
    } catch (error) {
      console.error("Wallet payment failed:", error);
      setStatusMessage("Wallet payment failed.");
    } finally {
      setIsPaying(false);
    }
  }

  function handleBack() {
    setStep("payment");
    setWallets([]);
    setStatusMessage(null);
  }

  return (
    <div className="paywall-modal__backdrop">
      <div className="paywall-modal__card">

        {step === "payment" ? (
          <div className="paywall-modal__content">
            <div className="paywall-modal__brand">
              <img
                className="paywall-modal__mark"
                src="/tumbleweed_no_background.png"
                alt=""
                aria-hidden="true"
              />
              <h2 className="paywall-modal__title">The Goodwell Gazette</h2>
            </div>

            <div className="paywall-modal__intro">
              <p className="paywall-modal__kicker">Subscriber edition</p>
              <p className="paywall-modal__lede">
                Keep reading with a monthly subscription or unlock this story
                with a daily article pass good for 24 hours.
              </p>
            </div>

            <div className="paywall-modal__subscription-info">
              <h3>How subscribing works</h3>
              <ul>
                <li>Subscribe for $2.99 per month to support new editions.</li>
                <li>Subscriber access covers premium Gazette stories.</li>
                <li>Prefer a single read? Buy this article for $0.01.</li>
              </ul>
            </div>

            <div className="paywall-modal__actions">
              <button className="paywall-modal__button paywall-modal__button--subscribe">
                Subscribe $2.99 a month
              </button>

              <button
                className="paywall-modal__button paywall-modal__button--buy"
                onClick={handleBuyArticle}
              >
                Buy article $0.01
              </button>
            </div>
          </div>
        ) : (
          <div className="paywall-modal__content">
            <h2 className="paywall-modal__title">Choose wallet</h2>

            {wallets.length > 0 ? (
              <div className="paywall-modal__wallet-list">
                {wallets.map((wallet) => (
                  <button
                    key={wallet.name}
                    className="paywall-modal__wallet-button"
                    onClick={() => handleWalletClick(wallet)}
                    disabled={isPaying}
                  >
                    {WALLET_ICONS[wallet.name] ? (
                      <img
                        className="paywall-modal__wallet-icon"
                        src={WALLET_ICONS[wallet.name]}
                        alt=""
                        aria-hidden="true"
                      />
                    ) : null}
                    {wallet.name}
                  </button>
                ))}
              </div>
            ) : (
              <div className="paywall-modal__empty-wallets">
                <p>No browser wallet detected.</p>
                <p>Install MetaMask, Coinbase Wallet, or Phantom to continue.</p>
              </div>
            )}

            {statusMessage ? (
              <p className="paywall-modal__status">{statusMessage}</p>
            ) : null}

            <button
              className="paywall-modal__back-button"
              onClick={handleBack}
              disabled={isPaying}
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaywallModal;
