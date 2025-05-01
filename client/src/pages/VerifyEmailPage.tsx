import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export default function VerifyEmailPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  
  useEffect(() => {
    async function verifyEmail() {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const userId = params.get('userId');

      if (!token || !userId) {
        setVerificationStatus('failed');
        toast({
          title: 'Invalid Verification Link',
          description: 'The verification link is invalid. Please request a new one.',
          variant: 'destructive',
        });
        return;
      }

      try {
        const response = await apiRequest('POST', '/api/auth/verify-email', { token, userId });

        if (response.ok) {
          setVerificationStatus('success');
          toast({
            title: 'Email Verified',
            description: 'Your email has been successfully verified.',
          });
        } else {
          setVerificationStatus('failed');
          const errorData = await response.json();
          throw new Error(errorData.message || 'Email verification failed');
        }
      } catch (error: any) {
        setVerificationStatus('failed');
        toast({
          title: 'Verification Failed',
          description: error.message || 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
      }
    }

    verifyEmail();
  }, [toast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>
            {verificationStatus === 'loading' && 'Verifying your email address...'}
            {verificationStatus === 'success' && 'Your email has been verified!'}
            {verificationStatus === 'failed' && 'Email verification failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center pt-6 pb-8">
          {verificationStatus === 'loading' && (
            <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
          )}
          {verificationStatus === 'success' && (
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          )}
          {verificationStatus === 'failed' && (
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
          )}

          <p className="text-center text-muted-foreground">
            {verificationStatus === 'loading' && 'Please wait while we verify your email address...'}
            {verificationStatus === 'success' && 'Thank you for verifying your email address. You can now enjoy all features of the platform.'}
            {verificationStatus === 'failed' && 'We could not verify your email address. The link may have expired or is invalid.'}
          </p>
        </CardContent>
        <CardFooter>
          {verificationStatus !== 'loading' && (
            <Button className="w-full" onClick={() => setLocation('/')}>
              {verificationStatus === 'success' ? 'Continue to App' : 'Return to Login'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
