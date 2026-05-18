import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Logo from '../components/icons/Logo';
import { motion, AnimatePresence } from 'framer-motion';
import Input from '../components/ui/Input';
import { useTranslation } from 'react-i18next';

type RoleType = 'patient' | 'doctor' | 'clinic';

const ROLE_DASHBOARD: Record<RoleType, string> = {
  patient: '/dashboard',
  doctor: '/doctor-dashboard',
  clinic: '/clinic-dashboard',
};

const roles: { id: RoleType; label: string; emoji: string; desc: string; color: string; border: string; bg: string }[] = [
  {
    id: 'patient',
    label: 'Patient',
    emoji: '🧑‍⚕️',
    desc: 'Manage your personal health records, medications & appointments.',
    color: 'from-blue-500 to-indigo-600',
    border: 'border-blue-400/40',
    bg: 'bg-blue-500/10 hover:bg-blue-500/20',
  },
  {
    id: 'doctor',
    label: 'Doctor',
    emoji: '👨‍⚕️',
    desc: 'Access patient records, lab results, and manage your schedule.',
    color: 'from-violet-500 to-purple-600',
    border: 'border-violet-400/40',
    bg: 'bg-violet-500/10 hover:bg-violet-500/20',
  },
  {
    id: 'clinic',
    label: 'Clinic / Hospital',
    emoji: '🏥',
    desc: 'Enterprise portal for patient population, billing, and OPD management.',
    color: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-400/40',
    bg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
  },
];

const Login: React.FC = () => {
  const { t } = useTranslation();
  const { user, loading, userRole, signInWithGoogle, signInWithEmailPassword, signUpWithEmailPassword, setUserRole } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'role' | 'auth'>('role');
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingRole, setSavingRole] = useState(false);

  // If user is already logged in, redirect based on role
  useEffect(() => {
    if (user && userRole) {
      const redirectPath = sessionStorage.getItem('redirectPath');
      if (redirectPath) {
        sessionStorage.removeItem('redirectPath');
        navigate(redirectPath, { replace: true });
      } else {
        navigate(ROLE_DASHBOARD[userRole as RoleType] || '/dashboard', { replace: true });
      }
    } else if (user && !userRole) {
      // User logged in but no role yet — show role selector
      setStep('role');
    }
  }, [user, userRole, navigate]);

  const handleRoleSelect = (role: RoleType) => {
    setSelectedRole(role);
  };

  const handleRoleContinue = async () => {
    if (!selectedRole) return;
    if (user) {
      // Already logged in, just save role and redirect
      setSavingRole(true);
      try {
        await setUserRole(selectedRole);
        navigate(ROLE_DASHBOARD[selectedRole], { replace: true });
      } catch (err: any) {
        setError('Failed to save role. Please try again.');
      } finally {
        setSavingRole(false);
      }
    } else {
      setStep('auth');
    }
  };

  const handleAuthAction = async (action: 'google') => {
    setError(null);
    try {
      if (action === 'google') {
        await signInWithGoogle();
        // After Google sign-in, user effect will trigger
        // We still need to save the role after auth
        if (selectedRole) {
          await setUserRole(selectedRole);
        }
      }
    } catch (err: any) {
      setError(err.message || t('login.error_signin', 'An error occurred during sign-in.'));
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
      setError(t('login.error_mismatch', 'Passwords do not match.'));
      return;
    }

    try {
      if (isSignUp) {
        await signUpWithEmailPassword(email, password);
      } else {
        await signInWithEmailPassword(email, password);
      }
      // Save role after auth — user effect will pick up via useEffect
      // but we eagerly save it here too
      if (selectedRole) {
        await setUserRole(selectedRole);
      }
    } catch (err: any) {
      setError(err.message || (isSignUp
        ? t('login.error_fail_signup', 'Failed to sign up.')
        : t('login.error_fail_signin', 'Failed to sign in.')));
    }
  };

  const selectedRoleData = roles.find(r => r.id === selectedRole);

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
        {/* Left Panel */}
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
            <p className="mt-2 text-lg text-muted-foreground">{t('login.hero_subtitle', 'Your Health. Smarter. Safer.')}</p>

            {selectedRoleData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-8 p-4 rounded-2xl border ${selectedRoleData.border} ${selectedRoleData.bg} transition-all`}
              >
                <div className="text-4xl mb-2">{selectedRoleData.emoji}</div>
                <p className="font-semibold text-foreground">{selectedRoleData.label} Mode</p>
                <p className="text-xs text-muted-foreground mt-1">{selectedRoleData.desc}</p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Right Panel */}
        <div className="p-8 sm:p-12 flex flex-col justify-center bg-card">
          <AnimatePresence mode="wait">
            {step === 'role' ? (
              <motion.div
                key="role-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold font-heading mb-1">Who are you?</h2>
                <p className="text-muted-foreground text-sm mb-6">Select your role to get started</p>

                <div className="space-y-3">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => handleRoleSelect(role.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-left
                        ${selectedRole === role.id
                          ? `border-2 ${role.border} ${role.bg} shadow-md`
                          : 'border-border/60 hover:border-border bg-card hover:bg-secondary/40'
                        }`}
                    >
                      <span className="text-3xl shrink-0">{role.emoji}</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground">{role.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{role.desc}</p>
                      </div>
                      {selectedRole === role.id && (
                        <span className={`ml-auto shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${role.color} flex items-center justify-center`}>
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <Button
                  onClick={handleRoleContinue}
                  disabled={!selectedRole || savingRole}
                  variant="gradient"
                  className="w-full mt-6 text-base"
                  size="lg"
                >
                  {savingRole
                    ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : 'Continue →'
                  }
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="auth-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={() => { setStep('role'); setError(null); }}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
                >
                  ← Change Role
                  {selectedRoleData && (
                    <span className="ml-1 font-medium text-foreground">({selectedRoleData.label})</span>
                  )}
                </button>

                <h2 className="text-2xl font-bold font-heading">
                  {isSignUp ? t('login.create_account', 'Create Your Account') : t('login.welcome_back', 'Welcome Back')}
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  {isSignUp
                    ? t('login.signup_desc', 'Start your health journey with us.')
                    : t('login.signin_desc', 'Sign in to access your dashboard.')}
                </p>

                <form className="mt-6 space-y-4" onSubmit={handleEmailSubmit}>
                  <div>
                    <label htmlFor="email" className="sr-only">Email</label>
                    <Input id="email" name="email" type="email" placeholder={t('auth.email_placeholder', 'Email Address')} required className="h-12" />
                  </div>
                  <div>
                    <label htmlFor="password" className="sr-only">Password</label>
                    <Input id="password" name="password" type="password" placeholder={t('auth.password_placeholder', 'Password')} required className="h-12" />
                  </div>
                  {isSignUp && (
                    <div>
                      <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
                      <Input id="confirm-password" name="confirm-password" type="password" placeholder={t('auth.confirm_password', 'Confirm Password')} required className="h-12" />
                    </div>
                  )}
                  {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</p>}
                  <Button type="submit" disabled={loading} variant="gradient" className="w-full text-base" size="lg">
                    {loading
                      ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : (isSignUp ? t('auth.sign_up', 'Sign Up') : t('auth.sign_in', 'Sign In'))
                    }
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">{t('login.or_continue', 'Or continue with')}</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleAuthAction('google')}
                  disabled={loading}
                  variant="outline"
                  className="w-full text-base"
                  size="lg"
                >
                  <svg className="w-5 h-5 mr-3" aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 25.5 170.1 66.3l-63.5 61.9C325.1 110.1 289.6 96 248 96c-88.8 0-160.1 71.3-160.1 160s71.3 160 160.1 160c97.4 0 140.3-81.2 143.8-116.2H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path>
                  </svg>
                  {t('login.google', 'Sign In with Google')}
                </Button>

                <p className="mt-6 text-sm text-center text-muted-foreground">
                  {isSignUp ? t('login.already_have', 'Already have an account? ') : t('login.dont_have', "Don't have an account? ")}
                  <button onClick={() => { setIsSignUp(!isSignUp); setError(null); }} className="font-semibold text-primary hover:underline">
                    {isSignUp ? t('auth.sign_in', 'Sign In') : t('auth.sign_up', 'Sign Up')}
                  </button>
                </p>

                <p className="mt-6 px-4 text-xs text-center text-muted-foreground">
                  {t('login.terms_prefix', 'By clicking continue, you agree to our ')}
                  <Link to="/terms-of-service" className="underline hover:text-primary transition-colors">
                    {t('settings.terms', 'Terms of Service')}
                  </Link>
                  {t('login.terms_and', ' and ')}
                  <Link to="/privacy-policy" className="underline hover:text-primary transition-colors">
                    {t('settings.privacy', 'Privacy Policy')}
                  </Link>
                  .
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
