import { defineChain } from "viem";

/* ──────────────────────────────────────────────────────────
 *  Plasma L1  –  Chain Definition
 *  Chain ID 9745 (0x2611) confirmed via eth_chainId RPC call
 * ────────────────────────────────────────────────────────── */
export const plasma = defineChain({
  id: 9745,
  name: "Plasma",
  nativeCurrency: {
    name: "XPL",
    symbol: "XPL",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://rpc.plasma.to"] },
  },
  blockExplorers: {
    default: {
      name: "Plasmascan",
      url: "https://plasmascan.to",
    },
  },
});

/* ──────────────────────────────────────────────────────────
 *  Supported stablecoin tokens on Plasma
 *  USDT address verified on-chain (symbol() → "USDT0", decimals → 6)
 * ────────────────────────────────────────────────────────── */
export interface Token {
  symbol: string;
  name: string;
  address: `0x${string}`;
  decimals: number;
  logo: string; // emoji for demo
}

export const TOKENS: Record<string, Token> = {
  USDT: {
    symbol: "USDT",
    name: "Tether USD",
    address: "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb",
    decimals: 6,
    logo: "💵",
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    decimals: 6,
    logo: "💲",
  },
};

export const TOKEN_LIST = Object.values(TOKENS);

/* ──────────────────────────────────────────────────────────
 *  Minimal ERC-20 ABI (only what we need for transfers)
 * ────────────────────────────────────────────────────────── */
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

/* ──────────────────────────────────────────────────────────
 *  App-level constants
 * ────────────────────────────────────────────────────────── */
export const APP_NAME = "PlasmaLane";
export const APP_DESCRIPTION = "Scan to Pay – stablecoin payments on Plasma";

/**
 * Base URL used to build the payment-request link.
 * In production, replace with your deployed domain.
 */
export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://plasma-lane.vercel.app";
