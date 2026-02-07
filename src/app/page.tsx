"use client";

import { useCallback, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { TOKEN_LIST, BASE_URL, APP_NAME } from "@/lib/constants";
import Logo from "@/components/Logo";

function generateInvoiceId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "INV-";
  for (let i = 0; i < 8; i++)
    id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

export default function MerchantPage() {
  const [merchantAddr, setMerchantAddr] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState(TOKEN_LIST[0].symbol);
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [invoiceId, setInvoiceId] = useState(generateInvoiceId);
  const [copied, setCopied] = useState(false);

  const selectedToken = useMemo(
    () => TOKEN_LIST.find((t) => t.symbol === tokenSymbol) ?? TOKEN_LIST[0],
    [tokenSymbol],
  );

  const isValid =
    merchantAddr.startsWith("0x") &&
    merchantAddr.length === 42 &&
    Number(amount) > 0;

  const paymentUrl = useMemo(() => {
    if (!isValid) return "";
    const params = new URLSearchParams({
      to: merchantAddr,
      token: selectedToken.address,
      amount,
      memo,
      invoiceId,
    });
    return `${BASE_URL}/pay?${params.toString()}`;
  }, [merchantAddr, selectedToken, amount, memo, invoiceId, isValid]);

  const copyLink = useCallback(() => {
    if (!paymentUrl) return;
    navigator.clipboard.writeText(paymentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [paymentUrl]);

  const regenerateInvoice = () => setInvoiceId(generateInvoiceId());

  return (
    <main className="mx-auto flex min-h-screen max-w-[1040px] flex-col px-5 py-8 sm:py-12">
      {/* ── Header ──────────────────────────────── */}
      <header className="mb-10 flex flex-col items-center gap-3 text-center">
        <Logo size="lg" />
        <p className="max-w-sm text-sm leading-relaxed text-gray-500">
          Create a payment request and share the QR code with your customer.
        </p>
      </header>

      {/* ── Main grid ───────────────────────────── */}
      <div className="grid w-full gap-6 lg:grid-cols-[1fr_420px]">
        {/* ─── Left: Form ───────────────────────── */}
        <div className="glass-card space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-plasma-600/20 text-xs font-bold text-plasma-400">
              1
            </div>
            <h2 className="text-base font-semibold">Payment details</h2>
          </div>

          {/* Merchant address */}
          <div>
            <label className="label-text">Recipient address</label>
            <input
              className="input-field font-mono text-xs tracking-wide"
              placeholder="0x..."
              spellCheck={false}
              value={merchantAddr}
              onChange={(e) => setMerchantAddr(e.target.value.trim())}
            />
          </div>

          {/* Token */}
          <div>
            <label className="label-text">Stablecoin</label>
            <div className="flex gap-2">
              {TOKEN_LIST.map((t) => (
                <button
                  key={t.symbol}
                  onClick={() => setTokenSymbol(t.symbol)}
                  className={`token-btn ${tokenSymbol === t.symbol ? "token-btn-active" : ""}`}
                >
                  {t.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="label-text">Amount</label>
            <div className="relative">
              <input
                className="input-field pr-16 text-2xl font-bold"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
                {selectedToken.symbol}
              </span>
            </div>
          </div>

          {/* Memo + Invoice row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-text">Memo</label>
              <input
                className="input-field"
                placeholder="Coffee order #42"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>
            <div>
              <label className="label-text">Invoice ID</label>
              <div className="flex gap-2">
                <input
                  className="input-field flex-1 font-mono text-xs"
                  value={invoiceId}
                  onChange={(e) => setInvoiceId(e.target.value)}
                />
                <button
                  onClick={regenerateInvoice}
                  className="btn-secondary !px-3"
                  title="Generate new ID"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M2.5 8a5.5 5.5 0 0 1 9.3-4M13.5 8a5.5 5.5 0 0 1-9.3 4" />
                    <path d="M11.5 1v3h3M4.5 15v-3h-3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right: QR Output ─────────────────── */}
        <div className="glass-card flex flex-col items-center justify-center">
          {isValid ? (
            <div className="flex w-full flex-col items-center gap-5">
              {/* Step badge */}
              <div className="flex items-center gap-3 self-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-plasma-600/20 text-xs font-bold text-plasma-400">
                  2
                </div>
                <h2 className="text-base font-semibold">Share QR code</h2>
              </div>

              <div className="divider w-full" />

              {/* Amount preview */}
              <div className="text-center">
                <p className="amount-display">
                  {Number(amount).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6,
                  })}
                </p>
                <p className="mt-1.5 text-xs font-medium text-gray-500">
                  {selectedToken.symbol} on Plasma
                </p>
              </div>

              {/* QR */}
              <div className="qr-container">
                <QRCodeSVG
                  value={paymentUrl}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#060a14"
                  level="M"
                  includeMargin={false}
                />
              </div>

              {/* Meta */}
              {memo && (
                <p className="max-w-[280px] text-center text-xs text-gray-500">
                  {memo}
                </p>
              )}
              <p className="font-mono text-[10px] text-gray-600">
                {invoiceId}
              </p>

              {/* Copy button */}
              <button onClick={copyLink} className="btn-primary w-full">
                {copied ? (
                  <>
                    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 8.5l3.5 3.5 6.5-8" />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="5" y="5" width="8" height="8" rx="1.5" />
                      <path d="M3 11V3.5A1.5 1.5 0 0 1 4.5 2H11" />
                    </svg>
                    Copy payment link
                  </>
                )}
              </button>

              {/* URL preview */}
              <details className="w-full">
                <summary className="cursor-pointer text-[11px] text-gray-600 transition-colors hover:text-gray-400">
                  Show link
                </summary>
                <p className="mt-2 break-all rounded-xl bg-black/30 p-3 font-mono text-[10px] leading-relaxed text-gray-500">
                  {paymentUrl}
                </p>
              </details>
            </div>
          ) : (
            /* ─── Empty state ─────────────────────── */
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] text-gray-600">
                <svg
                  className="h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="3" height="3" rx="0.5" />
                  <rect x="18" y="14" width="3" height="3" rx="0.5" />
                  <rect x="14" y="18" width="3" height="3" rx="0.5" />
                  <rect x="18" y="18" width="3" height="3" rx="0.5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">
                  QR code preview
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  Fill in the payment details to generate
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ──────────────────────────────── */}
      <footer className="mt-auto pt-12 text-center text-[11px] text-gray-600">
        {APP_NAME} &middot; Stablecoin payments on{" "}
        <a
          href="https://plasma.to"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 transition-colors hover:text-plasma-400"
        >
          Plasma
        </a>
      </footer>
    </main>
  );
}
