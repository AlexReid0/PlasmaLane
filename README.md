# PlasmaLane

> Scan to Pay — stablecoin payments on [Plasma L1](https://plasma.to)

PlasmaLane is a demo-ready QR-based payment app and SDK for USDT/USDC transfers on the Plasma blockchain.

**A merchant generates a QR code → a customer scans it → lands on a web pay page → sends a stablecoin transfer from their wallet.** No mobile deep links, no app installs.

## Project Structure

```
PlasmaLane/
├── src/            # Next.js web app (merchant dashboard + customer pay page)
├── sdk/            # plasmalane-sdk — framework-agnostic TypeScript SDK
├── public/
└── package.json
```

## Web App

The Next.js app has two routes:

| Route | Description |
|---|---|
| `/` | **Merchant dashboard** — enter wallet address, pick USDT/USDC, set amount & memo → generates a QR code with the payment URL |
| `/pay` | **Customer pay page** — reads URL params, displays payment details, connects wallet via RainbowKit, sends the ERC-20 transfer |

### Run locally

```bash
npm install
npm run dev          # → http://localhost:3000
```

### Environment variables

Copy `.env.local.example` to `.env.local` and set:

```env
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Get a free WalletConnect project ID at [cloud.walletconnect.com](https://cloud.walletconnect.com).

## SDK

The `plasmalane-sdk` package lets anyone integrate PlasmaLane payments into their own app — any framework, any stack.

```bash
cd sdk && npm install && npm run build
```

```ts
import { PlasmaLane } from "plasmalane-sdk";
import { toDataURL } from "plasmalane-sdk/qr";

const pl = new PlasmaLane({ baseUrl: "https://myshop.com" });

// Create a payment request
const req = pl.createRequest({
  to: "0xMerchantAddress",
  token: "USDT",
  amount: "25.00",
  memo: "Coffee",
});

// Generate QR code
const qr = await toDataURL(req.url);

// Build a wagmi/viem-ready transaction
const tx = pl.buildTransaction(pl.parseUrl(req.url));
```

Full SDK docs: [`sdk/README.md`](./sdk/README.md)

## Network

| Field | Value |
|---|---|
| Chain | Plasma Mainnet |
| Chain ID | `9745` |
| RPC | `https://rpc.plasma.to` |
| Explorer | [plasmascan.to](https://plasmascan.to) |
| USDT | `0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb` |
| USDC | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` |

## License

MIT
