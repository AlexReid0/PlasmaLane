/* ──────────────────────────────────────────────
 *  PlasmaLane SDK — Payment request helpers
 * ────────────────────────────────────────────── */

import { resolveToken, TOKENS } from "./constants.js";
import type {
  PaymentRequest,
  PaymentRequestParams,
  ParsedPaymentRequest,
} from "./types.js";

const DEFAULT_BASE_URL = "http://localhost:3000";
const DEFAULT_PAY_PATH = "/pay";

/**
 * Generate a random invoice ID.
 *
 * @example
 * ```ts
 * generateInvoiceId(); // => "INV-A3K7BNWX"
 * ```
 */
export function generateInvoiceId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "INV-";
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

/**
 * Create a payment request with a full URL.
 *
 * @example
 * ```ts
 * const req = createPaymentRequest({
 *   to: "0xMerchant...",
 *   token: "USDT",
 *   amount: "25.00",
 *   memo: "Coffee",
 * }, { baseUrl: "https://mysite.com" });
 *
 * req.url;   // "https://mysite.com/pay?to=0x...&token=0x...&amount=25.00&memo=Coffee&invoiceId=INV-..."
 * req.params // { to, token, amount, memo, invoiceId }
 * ```
 */
export function createPaymentRequest(
  params: PaymentRequestParams,
  options?: { baseUrl?: string; payPath?: string },
): PaymentRequest {
  const baseUrl = options?.baseUrl ?? DEFAULT_BASE_URL;
  const payPath = options?.payPath ?? DEFAULT_PAY_PATH;

  // Resolve token
  const resolved = resolveToken(params.token);
  if (!resolved) {
    throw new Error(
      `Unknown token "${params.token}". Use a known symbol (USDT, USDC) or a valid contract address.`,
    );
  }

  // Validate amount
  const numAmount = Number(params.amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    throw new Error(`Invalid amount "${params.amount}". Must be a positive number.`);
  }

  // Validate address
  if (!params.to.startsWith("0x") || params.to.length !== 42) {
    throw new Error(`Invalid recipient address "${params.to}".`);
  }

  const invoiceId = params.invoiceId || generateInvoiceId();
  const memo = params.memo ?? "";

  const searchParams = new URLSearchParams({
    to: params.to,
    token: resolved.address,
    amount: params.amount,
    memo,
    invoiceId,
  });

  const url = `${baseUrl.replace(/\/+$/, "")}${payPath}?${searchParams.toString()}`;

  return {
    url,
    params: {
      to: params.to,
      token: resolved.address,
      amount: params.amount,
      memo,
      invoiceId,
    },
    tokenInfo: resolved,
  };
}

/**
 * Parse a payment-request URL back into its component parts.
 *
 * @example
 * ```ts
 * const parsed = parsePaymentUrl("https://mysite.com/pay?to=0x...&token=0x...&amount=25");
 * parsed.to          // "0x..."
 * parsed.amount      // "25"
 * parsed.token       // { symbol: "USDT", ... } or null
 * ```
 */
export function parsePaymentUrl(url: string): ParsedPaymentRequest {
  const u = new URL(url);
  const to = (u.searchParams.get("to") ?? "") as `0x${string}`;
  const tokenAddress = (u.searchParams.get("token") ?? "") as `0x${string}`;
  const amount = u.searchParams.get("amount") ?? "0";
  const memo = u.searchParams.get("memo") ?? "";
  const invoiceId = u.searchParams.get("invoiceId") ?? "";

  const token = resolveToken(tokenAddress);

  return { to, tokenAddress, amount, memo, invoiceId, token };
}
