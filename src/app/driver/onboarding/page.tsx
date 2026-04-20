"use client";
import dynamic from "next/dynamic";
const O = dynamic(() => import("./onboarding-content"), { ssr: false });
export default function OnboardingPage() { return <O />; }
