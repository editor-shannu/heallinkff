import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { FaceCapture } from "../../components/FaceCapture";
import { useFirebaseAuth } from "../../hooks/useFirebaseAuth";
import { useFaceVerification } from "../../hooks/useFaceVerification";
import { AlertCircle, CheckCircle, Shield, Loader2 } from "lucide-react";

interface LoginFormData {
  email: string;
  password: string;
}

interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export const Login = (): JSX.Element => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showFaceCapture, setShowFaceCapture] = useState(false);
  const [faceVerificationStep, setFaceVerificationStep] = useState<'login' | 'register' | null>(null);
  const [pendingCredentials, setPendingCredentials] = useState<{ email: string; password: string } | null>(null);
  
  const { 
    signInWithGoogle, 
    signInWithEmailPassword, 
    signUpWithEmailPassword, 
    loading, 
    error,
    clearError 
  } = useFirebaseAuth();
  
  const { 
    isProcessing: faceProcessing, 
    result: faceResult, 
    registerFace, 
    verifyFace, 
    checkAccountStatus, 
    clearResult 
  } = useFaceVerification();
  
  const loginForm = useForm<LoginFormData>();
  const signUpForm = useForm<SignUpFormData>();

  // Clear errors when switching between login/signup
  useEffect(() => {
    clearError();
    clearResult();
  }, [isSignUp, clearError, clearResult]);

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      const result = await signInWithEmailPassword(data.email, data.password);
      
      if (result.success && result.user) {
        // Check if account is terminated
        const userId = result.user.uid;
        const accountStatus = checkAccountStatus(userId);
        
        if (accountStatus.isTerminated) {
          throw new Error('Account has been terminated due to security violations.');
        }
        
        if (accountStatus.hasFaceRegistered) {
          // Require face verification for existing users
          setPendingCredentials(data);
          setFaceVerificationStep('login');
          setShowFaceCapture(true);
        }
        // If no face registered, allow login (backward compatibility)
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      loginForm.setError('root', {
        type: 'manual',
        message: error.message || 'Login failed'
      });
    }
  };

  const onSignUpSubmit = async (data: SignUpFormData) => {
    if (data.password !== data.confirmPassword) {
      signUpForm.setError('confirmPassword', {
        type: 'manual',
        message: 'Passwords do not match'
      });
      return;
    }

    try {
      clearError();
      const result = await signUpWithEmailPassword(data.email, data.password);
      
      if (result.success && result.user) {
        // Require face registration for new users
        setPendingCredentials({ email: data.email, password: data.password });
        setFaceVerificationStep('register');
        setShowFaceCapture(true);
      }
    } catch (error: any) {
      console.error('Sign up failed:', error);
      signUpForm.setError('root', {
        type: 'manual',
        message: error.message || 'Sign up failed'
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      clearError();
      const result = await signInWithGoogle();
      
      if (result.success && result.user) {
        // Check if account is terminated
        const userId = result.user.uid;
        const accountStatus = checkAccountStatus(userId);
        
        if (accountStatus.isTerminated) {
          throw new Error('Account has been terminated due to security violations.');
        }
        
        if (!accountStatus.hasFaceRegistered) {
          // Require face registration for new Google users
          setFaceVerificationStep('register');
          setShowFaceCapture(true);
        } else {
          // Require face verification for existing Google users
          setFaceVerificationStep('login');
          setShowFaceCapture(true);
        }
      }
    } catch (error: any) {
      console.error('Google sign in failed:', error);
    }
  };

  const handleFaceCapture = async (videoElement: HTMLVideoElement) => {
    try {
      clearResult();
      
      if (faceVerificationStep === 'register') {
        // Register new face
        const result = await registerFace('temp-user-id', videoElement);
        
        if (result.success) {
          setShowFaceCapture(false);
          setFaceVerificationStep(null);
          setPendingCredentials(null);
          // User is now fully authenticated
        }
      } else if (faceVerificationStep === 'login') {
        // Verify existing face
        const result = await verifyFace('temp-user-id', videoElement);
        
        if (result.success) {
          setShowFaceCapture(false);
          setFaceVerificationStep(null);
          setPendingCredentials(null);
          // User is now fully authenticated
        }
      }
    } catch (error) {
      console.error('Face capture error:', error);
    }
  };

  const closeFaceCapture = () => {
    setShowFaceCapture(false);
    setFaceVerificationStep(null);
    setPendingCredentials(null);
    clearResult();
  };

  return (
    <>
      <div className="bg-[#3bacd6] w-full min-h-screen flex flex-col relative overflow-hidden">
        {/* Background Images - Responsive */}
        <div className="absolute inset-0 flex flex-col">
          <img
            className="w-full h-[200px] sm:h-[250px] md:h-[300px] object-cover"
            alt="Login image"
            src="/login-image.svg"
          />
          
          <div className="flex-1 flex items-start justify-center pt-4">
            <img
              className="w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] md:w-[300px] md:h-[300px] object-contain"
              alt="Heal Link Logo"
              src="/heallinklogononame-photoroom--1--1.png"
            />
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="absolute bottom-0 left-0 right-0 bg-neutral-50 rounded-t-[50px] border-0 shadow-[0px_-4px_20px_rgba(0,0,0,0.1)] min-h-[60vh] max-h-[80vh] overflow-y-auto">
          <CardContent className="p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="font-['Oswald'] font-normal text-[#1d2366] text-3xl sm:text-4xl md:text-5xl tracking-[2.25px] mb-4">
                Heal Link
              </h1>
              <p className="font-['Oswald'] font-normal text-[#006d77] text-sm sm:text-base tracking-[0.60px]">
                Connecting you to better healthcare!
              </p>
            </div>

            {/* Error Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Form Errors */}
            {(loginForm.formState.errors.root || signUpForm.formState.errors.root) && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>
                    {loginForm.formState.errors.root?.message || signUpForm.formState.errors.root?.message}
                  </span>
                </div>
              </div>
            )}

            {/* Face Verification Result */}
            {faceResult && (
              <div className={`border px-4 py-3 rounded-lg mb-6 text-sm ${
                faceResult.success 
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : faceResult.status === 'duplicate-face-detected'
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-yellow-50 border-yellow-200 text-yellow-700'
              }`}>
                <div className="flex items-center space-x-2">
                  {faceResult.success ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span>{faceResult.message}</span>
                </div>
                {faceResult.confidence && (
                  <div className="mt-1 text-xs opacity-75">
                    Confidence: {faceResult.confidence}%
                  </div>
                )}
              </div>
            )}

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6 text-sm">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Enhanced with Face ID security for your protection</span>
              </div>
            </div>

            {/* Login Form */}
            {!isSignUp ? (
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    {...loginForm.register('email', { required: 'Email is required' })}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-red-500 text-sm">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    {...loginForm.register('password', { required: 'Password is required' })}
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-red-500 text-sm">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-14 bg-[#003c90] hover:bg-[#003c90]/90 rounded-[30px] shadow-[0px_4px_4px_#00000040] font-['Oswald'] font-bold text-white text-sm tracking-[0.52px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      SIGNING IN...
                    </>
                  ) : (
                    'LOGIN'
                  )}
                </Button>
              </form>
            ) : (
              /* Sign Up Form */
              <form onSubmit={signUpForm.handleSubmit(onSignUpSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    {...signUpForm.register('email', { required: 'Email is required' })}
                  />
                  {signUpForm.formState.errors.email && (
                    <p className="text-red-500 text-sm">{signUpForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    {...signUpForm.register('password', { 
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                  />
                  {signUpForm.formState.errors.password && (
                    <p className="text-red-500 text-sm">{signUpForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    {...signUpForm.register('confirmPassword', { required: 'Please confirm your password' })}
                  />
                  {signUpForm.formState.errors.confirmPassword && (
                    <p className="text-red-500 text-sm">{signUpForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-14 bg-[#003c90] hover:bg-[#003c90]/90 rounded-[30px] shadow-[0px_4px_4px_#00000040] font-['Oswald'] font-bold text-white text-sm tracking-[0.52px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      CREATING ACCOUNT...
                    </>
                  ) : (
                    'SIGN UP'
                  )}
                </Button>
              </form>
            )}

            {/* Google Sign In */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-neutral-50 px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full mt-4 h-12 border-2 border-gray-300 hover:bg-gray-50 font-['Oswald'] font-medium text-gray-700"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Continue with Google
              </Button>
            </div>

            {/* Toggle between Login and Sign Up */}
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-['Oswald'] font-normal text-[#006d77] text-sm tracking-[0.09px] hover:underline"
              >
                {isSignUp ? (
                  <>Already have an account? <span className="font-medium">Sign in!</span></>
                ) : (
                  <>Don't have an account? <span className="font-medium">Sign up!</span></>
                )}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Face Capture Modal */}
      <FaceCapture
        isOpen={showFaceCapture}
        onClose={closeFaceCapture}
        onCapture={handleFaceCapture}
        title={faceVerificationStep === 'register' ? 'Register Your Face' : 'Verify Your Identity'}
        subtitle={faceVerificationStep === 'register' 
          ? 'Set up Face ID for secure access' 
          : 'Confirm your identity with Face ID'
        }
        isProcessing={faceProcessing}
      />
    </>
  );
};