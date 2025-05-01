import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';

enum ResetState {
  VALIDATING,
  VALID,
  INVALID,
  SUCCESS
}

// Form validation schema
const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [resetState, setResetState] = useState<ResetState>(ResetState.VALIDATING);
  const [token, setToken] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });
  
  // Validate token on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    const userIdParam = params.get('userId');
    
    if (!tokenParam || !userIdParam) {
      setResetState(ResetState.INVALID);
      setError('Invalid password reset link. Missing token or user ID.');
      return;
    }
    
    setToken(tokenParam);
    setUserId(userIdParam);
    
    // Validate token with the API
    async function validateToken() {
      try {
        const res = await apiRequest('POST', '/api/auth/validate-reset-token', {
          token: tokenParam,
          userId: parseInt(userIdParam),
        });
        
        if (res.ok) {
          setResetState(ResetState.VALID);
        } else {
          const data = await res.json();
          setResetState(ResetState.INVALID);
          setError(data.message || 'Invalid or expired password reset link.');
        }
      } catch (error) {
        setResetState(ResetState.INVALID);
        setError('An error occurred while validating your reset link. Please try again.');
      }
    }
    
    validateToken();
  }, []);
  
  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token || !userId) {
      toast({
        title: 'Error',
        description: 'Invalid reset link. Please request a new password reset link.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const res = await apiRequest('POST', '/api/auth/reset-password', {
        token,
        userId: parseInt(userId),
        password: data.password,
      });
      
      if (res.ok) {
        setResetState(ResetState.SUCCESS);
        toast({
          title: 'Success',
          description: 'Your password has been reset successfully.',
        });
      } else {
        const error = await res.json();
        toast({
          title: 'Error',
          description: error.message || 'An error occurred. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderContent = () => {
    switch (resetState) {
      case ResetState.VALIDATING:
        return (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Validating your reset link...</p>
          </div>
        );
        
      case ResetState.VALID:
        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter new password"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm new password"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          </Form>
        );
        
      case ResetState.INVALID:
        return (
          <div className="flex flex-col items-center py-8">
            <XCircle className="h-16 w-16 text-destructive mb-4" />
            <h3 className="text-xl font-semibold mb-2">Invalid Reset Link</h3>
            <p className="text-muted-foreground text-center mb-6">{error}</p>
            <Button onClick={() => setLocation('/forgot-password')} className="w-full">
              Request New Reset Link
            </Button>
          </div>
        );
        
      case ResetState.SUCCESS:
        return (
          <div className="flex flex-col items-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Password Reset Successfully</h3>
            <p className="text-muted-foreground text-center mb-6">
              Your password has been reset successfully. You can now log in with your new password.
            </p>
            <Button onClick={() => setLocation('/')} className="w-full">
              Go to Homepage
            </Button>
          </div>
        );
    }
  };
  
  return (
    <div className="container max-w-lg py-16 px-4">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            {resetState === ResetState.VALID
              ? 'Create a new password for your account'
              : 'Processing your password reset request'}
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
