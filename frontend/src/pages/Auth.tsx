import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Fingerprint, Smartphone, LogIn, Mail, ArrowLeft, UserPlus } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { BiometricAuth } from "@aparajita/capacitor-biometric-auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    try {
      const result = await BiometricAuth.checkBiometry();
      setBiometricAvailable(result.isAvailable);
    } catch (e) {
      console.log("Biometrics not available:", e);
    }
  };

  const performBiometricLogin = async () => {
    try {
      await BiometricAuth.authenticate({
        reason: "Log in securely to AutoMile",
        cancelTitle: "Cancel",
      });

      toast.success("Biometric authentication successful!");
      navigate("/app");
    } catch (error) {
      toast.error("Biometric authentication failed or canceled.");
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      if (auth?.app?.name === "mock-app") {
        await new Promise((resolve) => setTimeout(resolve, 800));
        toast.success("Mock UI Mode: Bypassed Google Auth!");
        navigate("/app");
        return;
      }

      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Successfully logged in with Google!");
      navigate("/app");
    } catch (error: any) {
      toast.error(error.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    
    setLoading(true);
    try {
      if (auth?.app?.name === "mock-app") {
        await new Promise((resolve) => setTimeout(resolve, 800));
        toast.success(`Mock UI Mode: Successfully ${isSignUp ? "signed up" : "logged in"}!`);
        navigate("/app");
        return;
      }

      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("Successfully signed up!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Successfully logged in!");
      }
      navigate("/app");
    } catch (error: any) {
      toast.error(error.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 pt-safe pb-safe text-foreground">
      <div className="w-full max-w-sm flex flex-col items-center gap-8 animate-slide-up">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
            <Smartphone className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-black tracking-tight uppercase">AutoMile <span className="text-primary">Guide</span></h1>
          <p className="text-sm text-muted-foreground">
            {showEmailForm 
              ? (isSignUp ? "Create your account" : "Log in with email") 
              : "Log in to view your predictive maintenance."}
          </p>
        </div>

        {!showEmailForm ? (
          <>
            <div className="w-full flex justify-center py-4">
              <button 
                disabled={!biometricAvailable}
                onClick={performBiometricLogin}
                className={`w-28 h-28 rounded-full flex flex-col items-center justify-center gap-2 border-[3px] transition-all
                  ${biometricAvailable 
                    ? "border-primary text-primary hover:bg-primary/5 cursor-pointer shadow-[0_0_30px_rgba(255,100,0,0.15)]" 
                    : "border-border text-muted-foreground opacity-50 cursor-not-allowed"
                  }`}
              >
                <Fingerprint className="w-10 h-10" />
                <span className="text-xs font-bold uppercase tracking-wider">Face ID</span>
              </button>
            </div>
            
            <div className="w-full flex flex-col gap-3 mt-4">
              <Button 
                onClick={handleGoogleLogin}
                disabled={loading}
                variant="outline" 
                className="w-full h-12 border-border text-foreground hover:bg-secondary justify-start font-semibold"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </Button>

              <Button 
                onClick={() => setShowEmailForm(true)}
                variant="ghost" 
                className="w-full h-12 text-muted-foreground hover:text-foreground hover:bg-transparent"
              >
                <Mail className="w-5 h-5 mr-2" /> Continue with Email
              </Button>
            </div>
          </>
        ) : (
          <form onSubmit={handleEmailAuth} className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col gap-2">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary/50 border-border h-12"
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-secondary/50 border-border h-12"
                required
              />
            </div>
            
            <Button type="submit" disabled={loading} className="w-full h-12 font-bold uppercase tracking-wide">
              {loading ? "Processing..." : (isSignUp ? "Sign Up" : "Log In")}
            </Button>
            
            <div className="flex flex-col gap-2 mt-2">
              <Button 
                type="button"
                variant="link" 
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-primary text-xs font-bold"
              >
                {isSignUp ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
              </Button>
              
              <Button 
                type="button"
                variant="ghost" 
                onClick={() => setShowEmailForm(false)}
                className="text-muted-foreground text-xs"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to options
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
