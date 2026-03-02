import { Logo } from "@/components/logo";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/client" aria-label="Go to homepage">
            <Logo className="h-14 w-14" />
          </Link>
        </div>
        <main>{children}</main>
      </div>
    </div>
  );
}
