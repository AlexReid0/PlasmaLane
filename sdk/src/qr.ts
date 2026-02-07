/* ──────────────────────────────────────────────
 *  PlasmaLane SDK — QR code generation
 *
 *  Import separately: import { toDataURL } from "plasmalane-sdk/qr"
 *  This keeps the core SDK dependency-free if you don't need QR.
 * ────────────────────────────────────────────── */

import QRCode from "qrcode";
import type { QROptions } from "./types.js";

function mapOptions(opts?: QROptions): QRCode.QRCodeToDataURLOptions {
  return {
    width: opts?.width ?? 300,
    margin: opts?.margin ?? 2,
    color: {
      dark: opts?.color ?? "#000000",
      light: opts?.background ?? "#ffffff",
    },
    errorCorrectionLevel: "M",
  };
}

/**
 * Generate a QR code as a `data:image/png;base64,...` string.
 *
 * @example
 * ```ts
 * import { toDataURL } from "plasmalane-sdk/qr";
 *
 * const dataUrl = await toDataURL("https://mysite.com/pay?to=0x...");
 * // Use in <img src={dataUrl} />
 * ```
 */
export async function toDataURL(
  text: string,
  options?: QROptions,
): Promise<string> {
  return QRCode.toDataURL(text, mapOptions(options));
}

/**
 * Generate a QR code as an SVG string.
 *
 * @example
 * ```ts
 * import { toSVG } from "plasmalane-sdk/qr";
 *
 * const svg = await toSVG("https://mysite.com/pay?to=0x...");
 * document.getElementById("qr").innerHTML = svg;
 * ```
 */
export async function toSVG(
  text: string,
  options?: QROptions,
): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    width: options?.width ?? 300,
    margin: options?.margin ?? 2,
    color: {
      dark: options?.color ?? "#000000",
      light: options?.background ?? "#ffffff",
    },
    errorCorrectionLevel: "M",
  });
}

/**
 * Generate a QR code as a UTF-8 terminal string.
 * Useful for CLI tools and debugging.
 */
export async function toTerminal(text: string): Promise<string> {
  return QRCode.toString(text, { type: "terminal", small: true });
}
