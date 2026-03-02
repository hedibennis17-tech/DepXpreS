import { Logo } from "@/components/logo";
import { WizardStepper } from "@/components/driver/wizard-stepper";
import Link from "next/link";

export default function WizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50">
        <header className="bg-background border-b py-4">
            <div className="container mx-auto flex justify-between items-center">
                 <Link href="/client" className="flex items-center space-x-2">
                    <Logo className="h-8 w-8" />
                    <span className="font-bold">FastDép Connect</span>
                </Link>
                <div className="w-full max-w-lg">
                    <WizardStepper />
                </div>
                <div className="w-24"></div>
            </div>
        </header>
      <main className="py-10">
        <div className="container mx-auto max-w-3xl">
          {children}
        </div>
      </main>
    </div>
  );
}
