# plasmalane-sdk

> Scan-to-Pay stablecoin payment SDK for [Plasma L1](https://plasma.to)

A lightweight, framework-agnostic TypeScript SDK for creating and processing stablecoin payment requests on the Plasma blockchain.

## Install

```bash
npm install plasmalane-sdk
```

## Quick Start

```ts
import { PlasmaLane } from "plasmalane-sdk";

const pl = new PlasmaLane({ baseUrl: "https://myshop.com" });

// Create a payment request
const request = pl.createRequest({
  to: "0xYourMerchantAddress",
  token: "USDT",
  amount: "25.00",
  memo: "Order #42",
});

console.log(request.url);
// => https://myshop.com/pay?to=0x...&token=0x...&amount=25.00&memo=Order+%2342&invoiceId=INV-A3K7BNWX
```

## API

### `PlasmaLane` class

High-level client that wraps all helpers.

```ts
const pl = new PlasmaLane({
  baseUrl: "https://myshop.com", // default: "http://localhost:3000"
  payPath: "/pay",               // default: "/pay"
});

pl.createRequest(params)    // → PaymentRequest
pl.parseUrl(url)            // → ParsedPaymentRequest
pl.buildTransaction(parsed) // → PaymentTransactionRequest (wagmi/viem ready)
pl.generateInvoiceId()      // → "INV-XXXXXXXX"
pl.explorerUrl(txHash)      // → "https://plasmascan.to/tx/0x..."
```

### Standalone functions

Every method is also available as a standalone import:

```ts
import {
  createPaymentRequest,
  parsePaymentUrl,
  createPaymentTransaction,
  generateInvoiceId,
  getExplorerTxUrl,
} from "plasmalane-sdk";
```

### QR Code Generation

QR helpers are in a separate entry point to keep the core dependency-free:

```ts
import { toDataURL, toSVG, toTerminal } from "plasmalane-sdk/qr";

// Generate a data URL for <img>
const dataUrl = await toDataURL(request.url, { width: 400 });

// Generate an SVG string
const svg = await toSVG(request.url);

// Print to terminal (for debugging)
console.log(await toTerminal(request.url));
```

### Building Transactions

The SDK builds transaction objects compatible with **wagmi** and **viem**:

```ts
import { createPaymentTransaction } from "plasmalane-sdk";

const tx = createPaymentTransaction({
  to: "0xMerchant...",
  tokenAddress: "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb",
  amount: "25.00",
  decimals: 6,
});

// tx = { address, abi, functionName: "transfer", args: [to, amount] }

// wagmi
const { writeContract } = useWriteContract();
writeContract(tx);

// viem
const hash = await walletClient.writeContract(tx);
```

## Constants

```ts
import { PLASMA_CHAIN, TOKENS, ERC20_ABI } from "plasmalane-sdk";

PLASMA_CHAIN.id          // 9745
PLASMA_CHAIN.rpcUrl      // "https://rpc.plasma.to"
PLASMA_CHAIN.explorerUrl // "https://plasmascan.to"

TOKENS.USDT.address      // "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb"
TOKENS.USDC.address      // "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
```

## Full Integration Example (React + wagmi)

```tsx
import { PlasmaLane } from "plasmalane-sdk";
import { toDataURL } from "plasmalane-sdk/qr";
import { useWriteContract } from "wagmi";

const pl = new PlasmaLane({ baseUrl: "https://myshop.com" });

// Merchant side: generate QR
function MerchantCheckout({ address, total }) {
  const [qr, setQr] = useState("");

  useEffect(() => {
    const req = pl.createRequest({
      to: address,
      token: "USDT",
      amount: total,
      memo: "Checkout",
    });
    toDataURL(req.url).then(setQr);
  }, [address, total]);

  return <img src={qr} alt="Scan to pay" />;
}

// Customer side: pay
function PayButton({ paymentUrl }) {
  const { writeContract } = useWriteContract();
  const parsed = pl.parseUrl(paymentUrl);
  const tx = pl.buildTransaction(parsed);

  return (
    <button onClick={() => writeContract(tx)}>
      Pay {parsed.amount} {parsed.token?.symbol}
    </button>
  );
}
```

## Network

| Field | Value |
|---|---|
| Chain ID | `9745` |
| RPC | `https://rpc.plasma.to` |
| Explorer | `https://plasmascan.to` |
| Native Currency | XPL |

## License

MIT
