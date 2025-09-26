import { SignIn } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8 bg-card rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-foreground">
            Traffic Offense Admin Dashboard
          </h2>
          <p className="mt-2 text-muted-foreground">
            Sign in to your account
          </p>
        </div>
        <div className="mt-8">
          <SignIn 
            signUpForceRedirectUrl="/"
            fallbackRedirectUrl="/"
            afterSignInUrl="/"
          />
        </div>
      </div>
    </div>
  );
}