import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Logo from '../components/icons/Logo';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
  const { user, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
       <motion.div 
         className="w-full max-w-4xl grid md:grid-cols-2 rounded-2xl shadow-2xl overflow-hidden border border-border/60"
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ duration: 0.5 }}
        >
        <div className="hidden md:flex flex-col items-center justify-center p-12 bg-primary/5 text-center relative overflow-hidden">
            <div className="absolute -top-1/4 -right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-1/4 -left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
             <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
             >
                <Logo className="w-24 h-24 mb-4 text-primary" />
                <h1 className="text-4xl font-bold font-heading text-foreground">DocuMedic</h1>
                <p className="mt-2 text-lg text-muted-foreground">Your Health. Smarter. Safer.</p>
            </motion.div>
        </div>

        <div className="p-8 sm:p-12 flex flex-col justify-center bg-card">
           <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
           >
                <h2 className="text-2xl font-bold font-heading">Welcome Back</h2>
                <p className="text-muted-foreground mt-1">Sign in to access your personal health dashboard.</p>
            
                <div className="mt-8 space-y-4">
                <Button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full text-lg"
                    size="lg"
                >
                    {loading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                    <svg className="w-5 h-5 mr-3" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                        <path fill="currentColor" d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 25.5 170.1 66.3l-63.5 61.9C325.1 110.1 289.6 96 248 96c-88.8 0-160.1 71.3-160.1 160s71.3 160 160.1 160c97.4 0 140.3-81.2 143.8-116.2H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path>
                    </svg>
                    )}
                    Sign In with Google
                </Button>
                </div>

                <p className="mt-8 px-8 text-xs text-center text-muted-foreground">
                  By clicking continue, you agree to our{' '}
                  <Link to="/terms-of-service" className="underline hover:text-primary transition-colors">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy-policy" className="underline hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                  .
                </p>
           </motion.div>
        </div>
       </motion.div>
    </div>
  );
};

export default Login;