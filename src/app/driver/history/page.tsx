"use client";
import dynamic from "next/dynamic";
const H = dynamic(() => import("./history-content"), { ssr: false });
export default function Page() { return <H />; }
