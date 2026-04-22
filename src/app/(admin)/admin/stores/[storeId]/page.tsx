"use client";
import dynamic from "next/dynamic";
const StoreDetail = dynamic(() => import("./store-detail-content"), { ssr: false });
export default function Page() { return <StoreDetail />; }
