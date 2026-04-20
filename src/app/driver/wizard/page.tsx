"use client";
import dynamic from "next/dynamic";
const W = dynamic(() => import("./wizard-content"), { ssr: false });
export default function WizardPage() { return <W />; }
