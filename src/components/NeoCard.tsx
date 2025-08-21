"use client";

import { cn } from "@/lib/utils";

export default function NeoCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "neo-card bg-gradient-to-br from-gray-900/80 to-black/80 border border-yellow-500/40 p-8 rounded-xl shadow-xl",
        className
      )}
    >
      {children}
    </div>
  );
}
