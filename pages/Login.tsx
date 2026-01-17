import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Logo from '../components/icons/Logo';
import { motion } from 'framer-motion';
import Input from '../components/ui/Input';

const Login: React.FC = () => {
  const { user, loading, signInWithGoogle, signInWithEmailPassword, signUpWithEmailPassword } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const redirectPath = sessionStorage.getItem('redirectPath');
      if (redirectPath) {
        sessionStorage.removeItem('redirectPath');
      }
      navigate(redirectPath || '/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleAuthAction = async (action: 'google' | 'email') => {
    setError(null);
    try {
      if (action === 'google') {
        await signInWithGoogle();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during sign-in.");
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm-password') as string;

    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      if (isSignUp) {
        await signUpWithEmailPassword(email, password);
      } else {
        await signInWithEmailPassword(email, password);
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${isSignUp ? 'sign up' : 'sign in'}.`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-success/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob" style={{ animationDelay: '4s' }} />
      </div>

      <motion.div
        className="w-full max-w-5xl grid md:grid-cols-2 rounded-3xl shadow-2xl overflow-hidden border border-border/60 bg-card/80 backdrop-blur-xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="hidden md:flex flex-col items-center justify-center p-12 bg-gradient-to-br from-primary/10 via-accent/10 to-success/10 text-center relative overflow-hidden">
          <div className="absolute -top-1/4 -right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/4 -left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
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
            <h2 className="text-2xl font-bold font-heading">{isSignUp ? "Create Your Account" : "Welcome Back"}</h2>
            <p className="text-muted-foreground mt-1">{isSignUp ? "Start your health journey with us." : "Sign in to access your dashboard."}</p>

            <form className="mt-6 space-y-4" onSubmit={handleEmailSubmit}>
              <div>
                <label htmlFor="email" className="sr-only">Email</label>
                <Input id="email" name="email" type="email" placeholder="Email Address" required className="h-12" />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <Input id="password" name="password" type="password" placeholder="Password" required className="h-12" />
              </div>
              {isSignUp && (
                <div>
                  <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
                  <Input id="confirm-password" name="confirm-password" type="password" placeholder="Confirm Password" required className="h-12" />
                </div>
              )}
              {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</p>}
              <Button type="submit" disabled={loading} variant="gradient" className="w-full text-base" size="lg">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (isSignUp ? 'Sign Up' : 'Sign In')}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button
              onClick={() => handleAuthAction('google')}
              disabled={loading}
              variant="outline"
              className="w-full text-base"
              size="lg"
            >
              <svg className="w-5 h-5 mr-3" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 25.5 170.1 66.3l-63.5 61.9C325.1 110.1 289.6 96 248 96c-88.8 0-160.1 71.3-160.1 160s71.3 160 160.1 160c97.4 0 140.3-81.2 143.8-116.2H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path>
              </svg>
              Sign In with Google
            </Button>

            <p className="mt-6 text-sm text-center text-muted-foreground">
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <button onClick={() => { setIsSignUp(!isSignUp); setError(null); }} className="font-semibold text-primary hover:underline">
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>

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
