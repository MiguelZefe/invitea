import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="absolute top-0 left-0 z-50 flex w-full items-center justify-between gap-4 px-5 py-5 sm:px-8 sm:py-6">
      <Link href="/" aria-label="INVITEA, inicio" className="shrink-0">
        <Image
          src="/invitea-logo.svg"
          alt="INVITEA"
          width={210}
          height={60}
          className="h-10 w-auto sm:h-12"
        />
      </Link>

      <span className="shrink-0 text-xs opacity-70 sm:text-sm">
        By MiguelZefe
      </span>
    </nav>
  );
}
