import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { plasma, APP_NAME } from "./constants";

export const wagmiConfig = getDefaultConfig({
  appName: APP_NAME,
  /* ───────────────────────────────────────────────────────
   *  WalletConnect Cloud project ID.
   *  Get one for free at https://cloud.walletconnect.com
   *  For local dev, the demo ID below works but will be
   *  rate-limited.  Replace for production.
   * ─────────────────────────────────────────────────────── */
  projectId:
    process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? "3a8170812b534d0ff9d794f19a901d64",
  chains: [plasma],
  ssr: true,
});
