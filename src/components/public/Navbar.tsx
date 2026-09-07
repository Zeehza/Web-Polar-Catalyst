import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/polar catalyst.svg"
              alt="Polar Catalyst"
              width={36}
              height={36}
              className="rounded-full bg-transparent dark:invert"
              suppressHydrationWarning
            />
            <span className="text-xl font-bold tracking-tight text-brand-500 dark:text-brand-400">
              Polar Catalyst
            </span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link
              href="/events"
              className="text-sm font-medium text-neutral-600 transition-colors hover:text-brand-500 dark:text-neutral-400 dark:hover:text-brand-400"
            >
              Events
            </Link>
            <Link
              href="/results"
              className="text-sm font-medium text-neutral-600 transition-colors hover:text-brand-500 dark:text-neutral-400 dark:hover:text-brand-400"
            >
              Results
            </Link>

            <Link
              href="/contact"
              className="text-sm font-medium text-neutral-600 transition-colors hover:text-brand-500 dark:text-neutral-400 dark:hover:text-brand-400"
            >
              Contact
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
