# Goodwell Gazette

Goodwell Gazette is a proof-of-concept news application that demonstrates how
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

## Features

- React frontend built with Vite
- Flask API using Blueprints
- SQLite article storage
- Public article listing endpoint
- Paywalled individual article endpoint
- x402 `402 Payment Required` payment flow
- USDC micropayments on Base Sepolia
- `$0.01` pay-per-article purchases
- Browser wallet support
- Base Sepolia network switching
- Temporary post-purchase access
- S3-hosted article assets
- Vite development proxy for `/api`

## Tech Stack

### Frontend

- React
- Vite
- JavaScript / TypeScript
- `viem`
- `@x402/fetch`
- `@x402/evm`

### Backend

- Python
- Flask
- Flask Blueprints
- SQLite
- x402

### Blockchain

- Base Sepolia
- Chain ID: `84532`
- CAIP-2 network ID: `eip155:84532`
- Hex chain ID: `0x14a34`
- USDC testnet payments
- x402 exact EVM payment scheme

## Architecture

```text
┌──────────────────┐
│      Reader      │
│  React + Wallet  │
└────────┬─────────┘
         │
         │ GET /api/articles/<slug>
         ▼
┌──────────────────┐
│    Flask API     │
│                  │
│  x402 middleware │
└────────┬─────────┘
         │
         │ 402 Payment Required
         ▼
┌──────────────────┐
│   x402 Client    │
│                  │
│ Create payment   │
│ with user wallet │
└────────┬─────────┘
         │
         │ Signed payment
         ▼
┌──────────────────┐
│ x402 Facilitator │
└────────┬─────────┘
         │
         │ Verify / settle
         ▼
┌──────────────────┐
│   Base Sepolia   │
│       USDC       │
└────────┬─────────┘
         │
         │ Payment accepted
         ▼
┌──────────────────┐
│  Premium Article │
└──────────────────┘
```

## API

### List Articles

```http
GET /api/articles
```

Returns the public list of articles and metadata needed by the frontend.

### Get Article

```http
GET /api/articles/<slug>
```

Free articles can be returned normally.

Premium articles require an x402 payment. An unpaid request receives an HTTP
`402 Payment Required` response containing the payment requirements.

After a valid payment is supplied, the server returns the protected article.

## x402 Payment Flow

A simplified request looks like this:

```text
Client
  |
  | GET /api/articles/example-story
  v
Server
  |
  | 402 Payment Required
  | payment requirements
  v
Client Wallet
  |
  | approve/sign payment
  v
Client
  |
  | retry request + payment
  v
Server / Facilitator
  |
  | verify and settle
  v
Client
  |
  | 200 OK
  | premium article
```

The application currently charges:

```text
$0.01 per premium article
```

All payments are testnet payments. No real funds are required.

## Wallet Support

The browser client is designed to work with common EVM-compatible wallets,
including wallets such as:

- Phantom
- MetaMask
- Coinbase Wallet

The frontend can request that the wallet switch to Base Sepolia and can add the
network when necessary.

## Development Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd goodwell-gazette
```

### 2. Backend Setup

Create and activate a Python virtual environment:

```bash
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

macOS / Linux:

```bash
source .venv/bin/activate
```

Install the backend dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file for the backend.

```env
X402_RECEIVE_ADDRESS=0xYOUR_RECEIVING_WALLET_ADDRESS
```

The receiving address should be an EVM address that can receive the Base
Sepolia test USDC used by the project.

The project uses the x402 facilitator:

```text
https://x402.org/facilitator
```

Do not commit private keys, wallet secrets, or production credentials.

### 4. Frontend Setup

From the frontend directory:

```bash
npm install
npm run dev
```

The Vite development server runs at:

```text
http://localhost:5173
```

During local development, Vite proxies `/api` requests to the Flask backend.

### 5. Start the Flask API

Start the backend using the project's Flask entry point.

For example:

```bash
python app.py
```

Use the actual entry-point filename in the repository if it differs.

## Data and Assets

Article data is stored locally using SQLite.

```text
articles.db
```

Article assets can be served from the project's S3 bucket:

```text
https://goodwell-gazette.s3.us-west-1.amazonaws.com
```

## Example Article Request

An unpaid request to a protected article:

```bash
curl http://localhost:5173/api/articles/example-story
```

The initial response should return:

```http
HTTP/1.1 402 Payment Required
```

The browser client handles the payment workflow automatically by interpreting
the payment requirements, requesting wallet approval, and retrying the request.

## Temporary Access

After a successful purchase, the application can issue temporary access so the
same reader does not need to immediately purchase the article again.

The project uses a **24-hour access-token approach** for this behavior.

This keeps the x402 payment responsible for unlocking the content while
separating the blockchain transaction from normal subsequent article requests.

## Testnet Only

Goodwell Gazette is intentionally a testnet project.

It is not intended to:

- Process real customer funds
- Hold production wallet keys
- Provide production-grade authentication
- Act as a complete payment processor

Its purpose is to demonstrate the architecture and developer experience of
integrating HTTP-native stablecoin payments into a normal web application.

## What This Demonstrates

Goodwell Gazette is less about building another news website and more about
showing a new payment primitive.

The same pattern could be applied to:

- Paid API requests
- Research reports
- Premium datasets
- AI agent tools
- Generated media
- File downloads
- Compute jobs
- Usage-based SaaS features
- Machine-to-machine payments

Because the payment requirement is communicated through HTTP itself, software
can discover both **what a resource costs** and **how to pay for it** during the
request.

That makes x402 particularly interesting for applications where automated
software or AI agents need to purchase digital resources without going through
a traditional human checkout flow.

## Project Status

Goodwell Gazette is a proof of concept and learning project focused on x402,
stablecoin micropayments, wallet interaction, and HTTP-native payments.

Future improvements could include:

- Improved purchase history
- More robust access-token storage
- Better wallet connection UX
- Additional x402 payment options
- Production-style caching
- Automated integration tests
- Expanded article and publisher tooling

## License

Add the license you want to use for this repository here.
