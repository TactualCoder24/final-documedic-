import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import Skeleton from '../components/ui/Skeleton';

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
        <div className="min-h-screen soft-aurora flex pt-20 justify-center">
            <Skeleton variant="dashboard" />
        </div>
    );
};

export default AuthCallback;
