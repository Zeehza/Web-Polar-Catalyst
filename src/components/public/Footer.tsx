import Link from "next/link";
import Image from "next/image";
import { FaXTwitter, FaInstagram, FaYoutube, FaDiscord } from "react-icons/fa6";

export function Footer() {
  return (
    <footer className="w-full border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="container mx-auto px-4 py-8 md:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:items-start">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/polar catalyst.svg"
                alt="Polar Catalyst"
                width={28}
                height={28}
                className="rounded-full bg-transparent dark:invert"
                suppressHydrationWarning
              />
              <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Polar Catalyst
              </span>
            </Link>
            <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 md:text-left">
              <i>&quot;We Don&apos;t Follow The Crowd, We Move It.&quot;</i>
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 md:items-end">
            <div className="flex gap-4">
              <Link
                href="https://discord.gg/Wb4eMan7rg"
                className="text-neutral-500 transition-colors hover:text-brand-500 dark:text-neutral-400 dark:hover:text-brand-400"
              >
                <FaDiscord className="h-5 w-5" suppressHydrationWarning />
                <span className="sr-only">Discord</span>
              </Link>
              <Link
                href="#"
                className="text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              >
                <FaXTwitter className="h-5 w-5" suppressHydrationWarning />
                <span className="sr-only">X (Twitter)</span>
              </Link>
              <Link
                href="#"
                className="text-neutral-500 transition-colors hover:text-pink-500 dark:text-neutral-400 dark:hover:text-pink-400"
              >
                <FaInstagram className="h-5 w-5" suppressHydrationWarning />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="#"
                className="text-neutral-500 transition-colors hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400"
              >
                <FaYoutube className="h-5 w-5" suppressHydrationWarning />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
            <p
              className="text-sm text-neutral-500 dark:text-neutral-400"
              suppressHydrationWarning
            >
              © {new Date().getFullYear()} Polar Catalyst. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
