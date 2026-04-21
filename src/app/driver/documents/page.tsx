"use client";
import dynamic from "next/dynamic";
const D = dynamic(() => import("./documents-content"), { ssr: false });
export default function Page() { return <D />; }
