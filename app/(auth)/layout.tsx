import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Link href="/" className="mb-8 flex items-center gap-2.5">
        <Image
          src="/brandings/logo-icon.svg"
          alt="NEO ID"
          width={36}
          height={33}
          className="h-[33px] w-auto"
        />
        <span className="text-2xl font-bold tracking-tight">
          NEO <span className="text-neo-teal">ID</span>
        </span>
      </Link>
      {children}
    </div>
  );
}
