/* ──────────────────────────────────────────────
 *  PlasmaLane SDK — Type definitions
 * ────────────────────────────────────────────── */

/** Supported stablecoin symbols. */
export type TokenSymbol = "USDT" | "USDC";

/** Token metadata. */
export interface Token {
  symbol: TokenSymbol;
  name: string;
  address: `0x${string}`;
  decimals: number;
}

/** Parameters that fully describe a payment request. */
export interface PaymentRequestParams {
  /** Recipient (merchant) wallet address. */
  to: `0x${string}`;
  /** Token symbol ("USDT" | "USDC") or contract address. */
  token: TokenSymbol | `0x${string}`;
  /** Human-readable amount (e.g. "25.00"). */
  amount: string;
  /** Optional memo / description. */
  memo?: string;
  /** Optional invoice identifier. */
  invoiceId?: string;
}

/** A fully-resolved payment request with URL. */
export interface PaymentRequest {
  /** Full HTTPS payment-request URL. */
  url: string;
  /** Resolved parameters with token address. */
  params: {
    to: `0x${string}`;
    token: `0x${string}`;
    amount: string;
    memo: string;
    invoiceId: string;
  };
  /** Resolved token metadata. */
  tokenInfo: Token;
}

/** Result of parsing a payment URL. */
export interface ParsedPaymentRequest {
  to: `0x${string}`;
  tokenAddress: `0x${string}`;
  amount: string;
  memo: string;
  invoiceId: string;
  /** Resolved token (if address matches a known token). */
  token: Token | null;
}

/** Options for the PlasmaLane client. */
export interface PlasmaLaneOptions {
  /**
   * Base URL used when building payment-request links.
   * Include the scheme, e.g. "https://myapp.com".
   * @default "http://localhost:3000"
   */
  baseUrl?: string;
  /**
   * Path appended to baseUrl for the pay page.
   * @default "/pay"
   */
  payPath?: string;
}

/** Input for building an on-chain transfer call. */
export interface PaymentTransactionInput {
  to: `0x${string}`;
  tokenAddress: `0x${string}`;
  /** Human-readable amount (e.g. "25.00"). */
  amount: string;
  /** Token decimals (default 6). */
  decimals?: number;
}

/** Output: an object ready for wagmi's `writeContract` or viem's contract write. */
export interface PaymentTransactionRequest {
  address: `0x${string}`;
  abi: readonly Record<string, unknown>[];
  functionName: "transfer";
  args: [`0x${string}`, bigint];
}

/** QR code output format. */
export type QRFormat = "dataUrl" | "svg" | "utf8";

/** Options for QR code generation. */
export interface QROptions {
  /** Pixel width of the QR image. @default 300 */
  width?: number;
  /** Margin (quiet zone) in modules. @default 2 */
  margin?: number;
  /** Dark color. @default "#000000" */
  color?: string;
  /** Light / background color. @default "#ffffff" */
  background?: string;
}
