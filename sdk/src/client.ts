/* ──────────────────────────────────────────────
 *  PlasmaLane SDK — Client class
 *
 *  High-level API that ties everything together.
 * ────────────────────────────────────────────── */

import { createPaymentRequest, parsePaymentUrl, generateInvoiceId } from "./request.js";
import { createPaymentTransaction, getExplorerTxUrl } from "./transaction.js";
import type {
  PlasmaLaneOptions,
  PaymentRequestParams,
  PaymentRequest,
  ParsedPaymentRequest,
  PaymentTransactionRequest,
} from "./types.js";

/**
 * Main PlasmaLane client.
 *
 * @example
 * ```ts
 * import { PlasmaLane } from "plasmalane-sdk";
 *
 * const pl = new PlasmaLane({ baseUrl: "https://myshop.com" });
 *
 * // Merchant: create a payment request
 * const req = pl.createRequest({
 *   to: "0xMerchant...",
 *   token: "USDT",
 *   amount: "42.00",
 *   memo: "Widget order",
 * });
 * console.log(req.url); // share this URL or encode as QR
 *
 * // Customer: parse the URL and build a transaction
 * const parsed = pl.parseUrl(req.url);
 * const tx = pl.buildTransaction(parsed);
 * // tx is ready for wagmi writeContract() or viem walletClient.writeContract()
 * ```
 */
export class PlasmaLane {
  private readonly baseUrl: string;
  private readonly payPath: string;

  constructor(options?: PlasmaLaneOptions) {
    this.baseUrl = options?.baseUrl ?? "http://localhost:3000";
    this.payPath = options?.payPath ?? "/pay";
  }

  /** Create a payment request with a full URL. */
  createRequest(params: PaymentRequestParams): PaymentRequest {
    return createPaymentRequest(params, {
      baseUrl: this.baseUrl,
      payPath: this.payPath,
    });
  }

  /** Parse a payment-request URL. */
  parseUrl(url: string): ParsedPaymentRequest {
    return parsePaymentUrl(url);
  }

  /** Build a transaction request from a parsed payment. */
  buildTransaction(parsed: ParsedPaymentRequest): PaymentTransactionRequest {
    return createPaymentTransaction({
      to: parsed.to,
      tokenAddress: parsed.tokenAddress,
      amount: parsed.amount,
      decimals: parsed.token?.decimals ?? 6,
    });
  }

  /** Generate a random invoice ID. */
  generateInvoiceId(): string {
    return generateInvoiceId();
  }

  /** Get a Plasmascan explorer link for a tx hash. */
  explorerUrl(txHash: string): string {
    return getExplorerTxUrl(txHash);
  }
}
