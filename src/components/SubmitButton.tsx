"use client";

import React, { useRef } from "react";
import { useFormStatus } from "react-dom";

function InnerButton({ children, className, title }: { children: React.ReactNode; className?: string; title?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className} title={title}>
      {pending ? (
        <span className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}

export function FormWithToast({
  action,
  children,
  className,
  wrapperClassName,
  toastMessage = "Berhasil diperbarui!",
}: {
  action: (formData: FormData) => Promise<void>;
  children: React.ReactNode;
  className?: string;
  wrapperClassName?: string;
  toastMessage?: string;
}) {
  const toastRef = useRef<HTMLDivElement>(null);

  const handleAction = async (formData: FormData) => {
    await action(formData);
    if (toastRef.current) {
      toastRef.current.style.opacity = "1";
      toastRef.current.style.transform = "translateY(0)";
      setTimeout(() => {
        if (toastRef.current) {
          toastRef.current.style.opacity = "0";
          toastRef.current.style.transform = "translateY(-8px)";
        }
      }, 2000);
    }
  };

  return (
    <div className={`relative ${wrapperClassName || ""}`}>
      <form action={handleAction} className={className}>
        {children}
      </form>
      <div
        ref={toastRef}
        className="absolute -top-10 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap opacity-0 -translate-y-2 transition-all duration-300 pointer-events-none z-50"
      >
        ✓ {toastMessage}
      </div>
    </div>
  );
}

export { InnerButton };
