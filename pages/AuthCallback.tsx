import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

const AuthCallback: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Handle the OAuth callback
        const handleCallback = async () => {
            try {
                // Get the session from the URL hash
                const { data, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Auth callback error:', error);
                    navigate('/login');
                    return;
                }

                if (data.session) {
                    // Session established, redirect to dashboard
                    navigate('/dashboard', { replace: true });
                } else {
                    // No session, redirect to login
                    navigate('/login');
                }
            } catch (err) {
                console.error('Callback handling error:', err);
                navigate('/login');
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div className="flex items-center justify-center h-screen bg-background">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Completing sign in...</p>
            </div>
        </div>
    );
};

export default AuthCallback;
