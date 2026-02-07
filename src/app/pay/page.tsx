"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
  useReadContract,
} from "wagmi";
import { parseUnits, formatUnits, type Address } from "viem";
import { ERC20_ABI, TOKEN_LIST, plasma, APP_NAME } from "@/lib/constants";
import Logo from "@/components/Logo";

/* ─────────────────── Types ─────────────────── */
type PaymentStatus =
  | "idle"
  | "switching"
  | "confirming"
  | "sending"
  | "success"
  | "error";

/* ─────────────────── Spinner SVG ───────────── */
function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin-slow"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="8" cy="8" r="6" strokeOpacity="0.2" />
      <path d="M8 2a6 6 0 0 1 6 6" strokeLinecap="round" />
    </svg>
  );
}

/* ─────────────────── Inner component ────────── */
function PaymentFlow() {
  const searchParams = useSearchParams();

  /* ── Parse URL params ──────────────────────── */
  const to = (searchParams.get("to") ?? "") as Address;
  const tokenAddress = (searchParams.get("token") ?? "") as Address;
  const amountRaw = searchParams.get("amount") ?? "0";
  const memo = searchParams.get("memo") ?? "";
  const invoiceId = searchParams.get("invoiceId") ?? "";

  const token = useMemo(
    () =>
      TOKEN_LIST.find(
        (t) => t.address.toLowerCase() === tokenAddress.toLowerCase(),
      ) ?? TOKEN_LIST[0],
    [tokenAddress],
  );

  /* ── Wallet state ──────────────────────────── */
  const { address, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  /* ── Read on-chain balance ─────────────────── */
  const { data: rawBalance } = useReadContract({
    address: token.address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const balance =
    rawBalance != null
      ? formatUnits(rawBalance as bigint, token.decimals)
      : null;

  /* ── Transfer ──────────────────────────────── */
  const parsedAmount = useMemo(() => {
    try {
      return parseUnits(amountRaw, token.decimals);
    } catch {
      return BigInt(0);
    }
  }, [amountRaw, token.decimals]);

  const {
    writeContractAsync,
    data: txHash,
    isPending: isSigning,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash: txHash });

  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isConfirmed) setStatus("success");
    else if (isConfirming) setStatus("confirming");
    else if (isSigning) setStatus("sending");
  }, [isConfirmed, isConfirming, isSigning]);

  useEffect(() => {
    const err = writeError ?? receiptError;
    if (err) {
      setStatus("error");
      setErrorMsg(
        (err as { shortMessage?: string }).shortMessage ??
          err.message ??
          "Transaction failed",
      );
    }
  }, [writeError, receiptError]);

  /* ── Pay handler ───────────────────────────── */
  const handlePay = useCallback(async () => {
    try {
      setErrorMsg("");
      setStatus("idle");

      if (chainId !== plasma.id) {
        setStatus("switching");
        await switchChainAsync({ chainId: plasma.id });
      }

      setStatus("sending");

      await writeContractAsync({
        address: token.address,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [to, parsedAmount],
      });
    } catch (err: unknown) {
      setStatus("error");
      const e = err as { shortMessage?: string; message?: string };
      setErrorMsg(e.shortMessage ?? e.message ?? "Transaction failed");
    }
  }, [
    chainId,
    switchChainAsync,
    writeContractAsync,
    to,
    parsedAmount,
    token.address,
  ]);

  /* ── Insufficient balance ──────────────────── */
  const hasInsufficientBalance =
    balance != null && parsedAmount > BigInt(0) && rawBalance != null
      ? (rawBalance as bigint) < parsedAmount
      : false;

  /* ── Validation ────────────────────────────── */
  const isValidRequest =
    to.startsWith("0x") && to.length === 42 && Number(amountRaw) > 0;

  if (!isValidRequest) {
    return (
      <div className="glass-card mx-auto max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
          <svg className="h-6 w-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="mb-2 text-lg font-bold text-white">Invalid request</h2>
        <p className="text-sm leading-relaxed text-gray-500">
          This payment link is missing required parameters.
          <br />
          Ask the merchant for a new QR code.
        </p>
      </div>
    );
  }

  /* ── Success view ──────────────────────────── */
  if (status === "success") {
    return (
      <div className="glass-card mx-auto max-w-sm space-y-5 text-center">
        <div className="animate-check-in mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <svg className="h-8 w-8 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Payment sent</h3>
          <p className="mt-1 text-sm text-gray-500">
            {Number(amountRaw).toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}{" "}
            {token.symbol} transferred successfully
          </p>
        </div>
        {txHash && (
          <a
            href={`${plasma.blockExplorers.default.url}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary mx-auto inline-flex !text-xs"
          >
            View on Plasmascan
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 2h6v6M10 2L3 9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        )}
      </div>
    );
  }

  /* ── Main payment view ─────────────────────── */
  return (
    <div className="glass-card mx-auto max-w-sm space-y-5">
      {/* Amount */}
      <div className="pt-2 text-center">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gray-600">
          Payment request
        </p>
        <p className="amount-display">
          {Number(amountRaw).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
          })}
        </p>
        <p className="mt-1.5 text-xs font-medium text-gray-500">
          {token.symbol} on Plasma
        </p>
      </div>

      {/* Divider */}
      <div className="divider" />

      {/* Details */}
      <div className="space-y-0">
        <DetailRow label="To" value={truncAddr(to)} mono />
        {memo && <DetailRow label="Memo" value={memo} />}
        {invoiceId && <DetailRow label="Invoice" value={invoiceId} mono />}
      </div>

      {/* Divider */}
      <div className="divider" />

      {/* Wallet */}
      <div className="flex flex-col items-center gap-3">
        <ConnectButton showBalance={false} />

        {isConnected && balance != null && (
          <p className="text-[11px] text-gray-600">
            Balance:{" "}
            <span className="font-medium text-gray-400">
              {Number(balance).toLocaleString("en-US", {
                maximumFractionDigits: 2,
              })}{" "}
              {token.symbol}
            </span>
          </p>
        )}
      </div>

      {/* Pay button */}
      <button
        onClick={handlePay}
        disabled={
          !isConnected ||
          status === "sending" ||
          status === "confirming" ||
          status === "switching" ||
          hasInsufficientBalance
        }
        className="btn-primary w-full py-4 text-[15px]"
      >
        {!isConnected ? (
          "Connect wallet to pay"
        ) : status === "switching" ? (
          <>
            <Spinner /> Switching network…
          </>
        ) : status === "sending" ? (
          <>
            <Spinner /> Confirm in wallet…
          </>
        ) : status === "confirming" ? (
          <>
            <Spinner /> Confirming…
          </>
        ) : hasInsufficientBalance ? (
          `Insufficient ${token.symbol}`
        ) : (
          `Pay ${Number(amountRaw).toLocaleString("en-US", { minimumFractionDigits: 2 })} ${token.symbol}`
        )}
      </button>

      {/* Error */}
      {status === "error" && (
        <div className="badge-error mx-auto max-w-full !rounded-xl !px-4 !py-2.5 text-center">
          {errorMsg}
        </div>
      )}

      {/* Fine print */}
      <p className="text-center text-[10px] leading-relaxed text-gray-700">
        Verify the address before confirming. Transactions are irreversible.
      </p>
    </div>
  );
}

/* ─────── Helpers ────────────────────────────── */
function truncAddr(addr: string) {
  if (addr.length < 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="detail-row">
      <span className="text-xs text-gray-600">{label}</span>
      <span
        className={`text-sm text-gray-300 ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

/* ─────── Page wrapper ───────────────────────── */
export default function PayPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-5 py-10">
      <header className="mb-8">
        <Logo size="md" />
      </header>

      <Suspense
        fallback={
          <div className="glass-card mx-auto max-w-sm py-20 text-center text-sm text-gray-600">
            Loading payment…
          </div>
        }
      >
        <PaymentFlow />
      </Suspense>

      <footer className="mt-8 text-center text-[10px] text-gray-700">
        Powered by{" "}
        <a
          href="https://plasma.to"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 transition-colors hover:text-plasma-400"
        >
          Plasma
        </a>
      </footer>
    </main>
  );
}
