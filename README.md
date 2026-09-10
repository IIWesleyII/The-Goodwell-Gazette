# Goodwell Gazette

Goodwell Gazette is a news application that demonstrates how
[x402](https://www.x402.org/) can be used to sell access to individual pieces of
web content with stablecoin micropayments.

Instead of requiring a traditional account, subscription, or credit-card
checkout, a reader can request a premium article, receive an HTTP `402 Payment
Required` response, approve a small onchain payment from their wallet, and then
receive access to the article.

The project runs entirely on **Base Sepolia testnet** and is intended for
development and demonstration purposes only.

## Why This Project Exists

Most online payment systems are designed around transactions that are much
larger than a few cents. That makes it difficult to charge directly for small
units of digital content.

x402 brings payments into the normal HTTP request flow. Goodwell Gazette uses
that idea to demonstrate a simple pay-per-article model:

1. A reader requests a premium article.
2. The server responds with `402 Payment Required`.
3. The client reads the x402 payment requirements.
4. The reader approves the payment with an EVM-compatible wallet.
5. The client submits the payment and retries the request.
6. The server verifies the payment and returns the premium content.
7. Access can be remembered temporarily so the reader does not need to pay
   again immediately.

This provides a small example of how stablecoin payments could become a native
part of applications, APIs, and eventually autonomous software.


## Wallet Support

The browser client is designed to work with common EVM-compatible wallets,
including wallets such as:

- Phantom
- MetaMask
- Coinbase Wallet

