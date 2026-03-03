"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StorePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/store/dashboard");
  }, [router]);
  return null;
}
