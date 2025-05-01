import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

enum VerificationStatus {
  LOADING,
  SUCCESS,
  ERROR,
  EXPIRED
}

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<VerificationStatus>(VerificationStatus.LOADING);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    async function verifyEmail() {
      // Get token and userId from URL query parameters
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const userId = params.get('userId');
      
      if (!token || !userId) {
        setStatus(VerificationStatus.ERROR);
        setError('Invalid verification link. Missing token or user ID.');
        return;
      }
      
      try {
        const res = await apiRequest('POST', '/api/auth/verify-email', { token, userId: parseInt(userId) });
        
        if (res.ok) {
          setStatus(VerificationStatus.SUCCESS);
          toast({
            title: 'Email verified',
            description: 'Your email has been successfully verified.',
          });
        } else {
          const data = await res.json();
          if (data.message && data.message.includes('expired')) {
            setStatus(VerificationStatus.EXPIRED);
          } else {
            setStatus(VerificationStatus.ERROR);
            setError(data.message || 'Verification failed. Please try again.');
          }
        }
      } catch (error) {
        setStatus(VerificationStatus.ERROR);
        setError('An error occurred during verification. Please try again.');
      }
    }
    
    verifyEmail();
  }, [toast]);
  
  // Handle resend verification email
  const handleResendVerification = async () => {
    const userId = new URLSearchParams(window.location.search).get('userId');
    
    if (!userId) {
      toast({
        title: 'Error',
        description: 'User ID not found. Please try again.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const res = await apiRequest('POST', '/api/auth/resend-verification', { userId: parseInt(userId) });
      
      if (res.ok) {
        toast({
          title: 'Verification email sent',
          description: 'A new verification email has been sent to your email address.',
        });
      } else {
        const data = await res.json();
        toast({
          title: 'Error',
          description: data.message || 'Failed to resend verification email. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const renderContent = () => {
    switch (status) {
      case VerificationStatus.LOADING:
        return (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Verifying your email...</p>
          </div>
        );
        
      case VerificationStatus.SUCCESS:
        return (
          <div className="flex flex-col items-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Email Verified Successfully</h3>
            <p className="text-muted-foreground text-center mb-6">
              Your email has been verified. You can now log in to your account.
            </p>
            <Button onClick={() => setLocation('/')} className="w-full">
              Go to Homepage
            </Button>
          </div>
        );
        
      case VerificationStatus.EXPIRED:
        return (
          <div className="flex flex-col items-center py-8">
            <XCircle className="h-16 w-16 text-amber-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Verification Link Expired</h3>
            <p className="text-muted-foreground text-center mb-6">
              The verification link has expired. Please click the button below to request a new verification email.
            </p>
            <Button onClick={handleResendVerification} className="w-full mb-4">
              Resend Verification Email
            </Button>
            <Link href="/" className="text-sm text-muted-foreground hover:underline">
              Return to Homepage
            </Link>
          </div>
        );
        
      case VerificationStatus.ERROR:
        return (
          <div className="flex flex-col items-center py-8">
            <XCircle className="h-16 w-16 text-destructive mb-4" />
            <h3 className="text-xl font-semibold mb-2">Verification Failed</h3>
            <p className="text-muted-foreground text-center mb-2">{error}</p>
            <p className="text-muted-foreground text-center mb-6">
              Please try clicking the link in your email again or contact support for assistance.
            </p>
            <Button onClick={() => setLocation('/')} variant="outline" className="w-full mb-4">
              Go to Homepage
            </Button>
            <Button onClick={handleResendVerification} className="w-full">
              Resend Verification Email
            </Button>
          </div>
        );
    }
  };
  
  return (
    <div className="container max-w-lg py-16 px-4">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Email Verification</CardTitle>
          <CardDescription className="text-center">
            Verify your email address to complete your account setup
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          Need help? Contact support@eventsapp.com
        </CardFooter>
      </Card>
    </div>
  );
}
