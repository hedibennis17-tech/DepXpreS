"use client";
import dynamic from "next/dynamic";
const CartPage = dynamic(() => import("./cart-content"), { ssr: false });
export default function Cart() { return <CartPage />; }
