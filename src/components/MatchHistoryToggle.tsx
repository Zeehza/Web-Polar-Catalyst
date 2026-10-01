"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ListOrdered } from "lucide-react";

export default function MatchHistoryToggle({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center w-full mt-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-brand-300 dark:hover:border-brand-700 transition-all shadow-sm"
      >
        <ListOrdered className="h-4 w-4 text-brand-500" />
        {isOpen ? "Sembunyikan Detail" : "Lihat Detail"}
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {isOpen && (
        <div className="w-full mt-12 animate-in fade-in slide-in-from-top-2 duration-300 text-left">
          {children}
        </div>
      )}
    </div>
  );
}
