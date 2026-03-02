"use client";

import { usePathname } from "next/navigation";
import { User, Car, FileText, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const steps = [
  {
    name: "Personnel",
    href: "/driver/wizard/personal",
    icon: User,
  },
  {
    name: "Véhicule",
    href: "/driver/wizard/vehicle",
    icon: Car,
  },
  {
    name: "Documents",
    href: "/driver/wizard/documents",
    icon: FileText,
  },
  {
    name: "Confirmation",
    href: "/driver/wizard/confirmation",
    icon: CheckCircle,
  },
];

export function WizardStepper() {
  const pathname = usePathname();
  const currentStepIndex = steps.findIndex((step) => pathname === step.href);

  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li
            key={step.name}
            className={cn("relative flex-1", {
              "pr-8 sm:pr-20": stepIdx !== steps.length - 1,
            })}
          >
            {stepIdx < currentStepIndex ? (
              <>
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="h-0.5 w-full bg-primary" />
                </div>
                <Link
                  href={step.href}
                  className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary hover:bg-primary/90"
                >
                  <step.icon
                    className="h-5 w-5 text-primary-foreground"
                    aria-hidden="true"
                  />
                  <span className="sr-only">{step.name}</span>
                </Link>
              </>
            ) : stepIdx === currentStepIndex ? (
              <>
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <Link
                  href={step.href}
                  className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary bg-background"
                  aria-current="step"
                >
                  <step.icon
                    className="h-5 w-5 text-primary"
                    aria-hidden="true"
                  />
                  <span className="sr-only">{step.name}</span>
                </Link>
              </>
            ) : (
              <>
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <div className="pointer-events-none relative flex h-9 w-9 items-center justify-center rounded-full bg-background border-2 border-gray-300">
                  <step.icon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                  <span className="sr-only">{step.name}</span>
                </div>
              </>
            )}
             <p className="absolute -bottom-6 w-max left-1/2 -translate-x-1/2 text-xs font-medium text-center text-muted-foreground hidden sm:block">{step.name}</p>
          </li>
        ))}
      </ol>
    </nav>
  );
}
