"use client";
import dynamic from "next/dynamic";
const DriverDash = dynamic(() => import("./driver-dashboard"), { ssr: false });
export default function DriverDashboardPage() { return <DriverDash />; }
