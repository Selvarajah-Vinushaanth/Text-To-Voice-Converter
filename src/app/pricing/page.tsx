"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Pricing() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to dashboard since we removed pricing plans
        router.push("/dashboard");
    }, [router]);

    return (
        <div className="flex justify-center items-center min-h-screen">
            Redirecting to dashboard...
        </div>
    );
}