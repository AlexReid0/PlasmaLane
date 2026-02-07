/* ──────────────────────────────────────────────
 *  PlasmaLane SDK — Transaction builder
 * ────────────────────────────────────────────── */

import { ERC20_ABI } from "./constants.js";
import type { PaymentTransactionInput, PaymentTransactionRequest } from "./types.js";

/**
 * Build a transaction request object for an ERC-20 transfer.
 *
 * The returned object is directly compatible with:
 * - wagmi's `useWriteContract` / `writeContract`
 * - viem's `walletClient.writeContract`
 *
 * @example
 * ```ts
 * import { createPaymentTransaction } from "plasmalane-sdk";
 * import { useWriteContract } from "wagmi";
 *
 * const tx = createPaymentTransaction({
 *   to: "0xMerchant...",
 *   tokenAddress: "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb",
 *   amount: "25.00",
 *   decimals: 6,
 * });
 *
 * // With wagmi
 * const { writeContract } = useWriteContract();
 * writeContract(tx);
 *
 * // With viem
 * const hash = await walletClient.writeContract(tx);
 * ```
 */
export function createPaymentTransaction(
  input: PaymentTransactionInput,
): PaymentTransactionRequest {
  const decimals = input.decimals ?? 6;

  // Parse amount to smallest unit (BigInt)
  const parts = input.amount.split(".");
  const whole = parts[0] ?? "0";
  const frac = (parts[1] ?? "").padEnd(decimals, "0").slice(0, decimals);
  const raw = BigInt(whole) * BigInt(10 ** decimals) + BigInt(frac);

  return {
    address: input.tokenAddress,
    abi: ERC20_ABI,
    functionName: "transfer",
    args: [input.to, raw],
  };
}

/**
 * Get the Plasmascan explorer URL for a transaction.
 *
 * @example
 * ```ts
 * getExplorerTxUrl("0xabc123...");
 * // => "https://plasmascan.to/tx/0xabc123..."
 * ```
 */
export function getExplorerTxUrl(txHash: string): string {
  return `https://plasmascan.to/tx/${txHash}`;
}

/**
 * Get the Plasmascan explorer URL for an address.
 */
export function getExplorerAddressUrl(address: string): string {
  return `https://plasmascan.to/address/${address}`;
}
