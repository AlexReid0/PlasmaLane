/* ──────────────────────────────────────────────
 *  PlasmaLane SDK — Chain & token constants
 * ────────────────────────────────────────────── */

import type { Token, TokenSymbol } from "./types.js";

/**
 * Plasma Mainnet chain configuration.
 * Chain ID 9745 (0x2611) — verified via eth_chainId RPC.
 */
export const PLASMA_CHAIN = {
  id: 9745,
  name: "Plasma",
  rpcUrl: "https://rpc.plasma.to",
  explorerUrl: "https://plasmascan.to",
  nativeCurrency: {
    name: "XPL",
    symbol: "XPL",
    decimals: 18,
  },
} as const;

/** Known stablecoins on Plasma. */
export const TOKENS: Record<TokenSymbol, Token> = {
  USDT: {
    symbol: "USDT",
    name: "Tether USD",
    address: "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb",
    decimals: 6,
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    decimals: 6,
  },
};

/** All known tokens as an array. */
export const TOKEN_LIST: Token[] = Object.values(TOKENS);

/** Minimal ERC-20 ABI (transfer + balanceOf + decimals + symbol). */
export const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
] as const;

/**
 * Resolve a token symbol or address to a Token object.
 * Returns `null` if the address doesn't match a known token.
 */
export function resolveToken(
  symbolOrAddress: TokenSymbol | `0x${string}`,
): Token | null {
  // Try symbol first
  if (symbolOrAddress in TOKENS) {
    return TOKENS[symbolOrAddress as TokenSymbol];
  }
  // Try address match
  const lower = symbolOrAddress.toLowerCase();
  return TOKEN_LIST.find((t) => t.address.toLowerCase() === lower) ?? null;
}
