"use client";
import dynamic from "next/dynamic";
const E = dynamic(() => import("./earnings-content"), { ssr: false });
export default function Page() { return <E />; }
