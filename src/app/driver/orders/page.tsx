"use client";
import dynamic from "next/dynamic";
const O = dynamic(() => import("./orders-content"), { ssr: false });
export default function Page() { return <O />; }
