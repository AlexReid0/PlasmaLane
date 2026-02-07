/* ──────────────────────────────────────────────
 *  PlasmaLane SDK — Public API
 *
 *  import { PlasmaLane, createPaymentRequest, ... } from "plasmalane-sdk";
 * ────────────────────────────────────────────── */

// Client
export { PlasmaLane } from "./client.js";

// Request helpers
export {
  createPaymentRequest,
  parsePaymentUrl,
  generateInvoiceId,
} from "./request.js";

// Transaction helpers
export {
  createPaymentTransaction,
  getExplorerTxUrl,
  getExplorerAddressUrl,
} from "./transaction.js";

// Constants
export {
  PLASMA_CHAIN,
  TOKENS,
  TOKEN_LIST,
  ERC20_ABI,
  resolveToken,
} from "./constants.js";

// Types
export type {
  Token,
  TokenSymbol,
  PaymentRequest,
  PaymentRequestParams,
  ParsedPaymentRequest,
  PlasmaLaneOptions,
  PaymentTransactionInput,
  PaymentTransactionRequest,
  QRFormat,
  QROptions,
} from "./types.js";
