"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../supabase/client';

interface ClientSubscriptionCheckProps {
    children: React.ReactNode;
    redirectTo?: string;
}

export function ClientSubscriptionCheck({
    children,
    redirectTo = '/pricing'
}: ClientSubscriptionCheckProps) {
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    router.push('/sign-in');
                    return;
                }
                
                // No subscription check - all users have access
            } catch (error) {
                console.error('Error checking user:', error);
            } finally {
                setLoading(false);
            }
        };

        checkUser();
    }, [redirectTo, router]);

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    return <>{children}</>;
} 