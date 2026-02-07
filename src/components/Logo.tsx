"use client";

import { APP_NAME } from "@/lib/constants";

export default function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims = { sm: 28, md: 36, lg: 44 }[size];
  const text = { sm: "text-base", md: "text-xl", lg: "text-2xl" }[size];

  return (
    <div className="flex items-center gap-2.5">
      {/* Abstract mark — two overlapping parallelogram "lanes" */}
      <svg
        width={dims}
        height={dims}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <rect width="36" height="36" rx="10" fill="url(#logo-bg)" />
        {/* Lane 1 */}
        <path
          d="M10 24L16 8H20L14 24H10Z"
          fill="white"
          fillOpacity="0.95"
        />
        {/* Lane 2 */}
        <path
          d="M17 24L23 8H27L21 24H17Z"
          fill="white"
          fillOpacity="0.5"
        />
        <defs>
          <linearGradient id="logo-bg" x1="0" y1="0" x2="36" y2="36">
            <stop stopColor="#5c7cfa" />
            <stop offset="1" stopColor="#364fc7" />
          </linearGradient>
        </defs>
      </svg>
      <span className={`${text} font-bold tracking-tight text-white`}>
        {APP_NAME}
      </span>
    </div>
  );
}
