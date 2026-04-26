"use client";
import dynamic from "next/dynamic";
const Nav = dynamic(() => import("./navigation-content"), { ssr: false });
export default function Page() { return <Nav />; }
