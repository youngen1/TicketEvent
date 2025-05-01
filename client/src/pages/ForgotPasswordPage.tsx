import { useState } from 'react';
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
import { CheckCircle } from 'lucide-react';

// Form validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });
  
  async function onSubmit(data: ForgotPasswordFormValues) {
    setIsSubmitting(true);
    
    try {
      const res = await apiRequest('POST', '/api/auth/forgot-password', { email: data.email });
      
      if (res.ok) {
        setEmailSent(true);
        // Note: We don't show success message specific to any email to prevent email enumeration
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
  }
  
  if (emailSent) {
    return (
      <div className="container max-w-lg py-16 px-4">
        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Email Sent</CardTitle>
            <CardDescription className="text-center">
              Check your inbox for password reset instructions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Check Your Email</h3>
              <p className="text-muted-foreground text-center mb-6">
                If an account exists for {form.getValues().email}, we've sent password reset instructions to that email address.
                Please check your inbox and follow the instructions to reset your password.
              </p>
              <p className="text-muted-foreground text-center text-sm mb-6">
                Don't see the email? Check your spam folder or make sure you entered the correct email address.
              </p>
              <Button onClick={() => setLocation('/')} className="w-full">
                Return to Homepage
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground">
            Need help? Contact support@eventsapp.com
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-lg py-16 px-4">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Forgot Password</CardTitle>
          <CardDescription className="text-center">
            Enter your email address to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email address"
                        type="email"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Reset Password'}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setLocation('/')}
              className="text-sm text-muted-foreground hover:underline"
            >
              Return to Homepage
            </button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          Remember your password? Try logging in again.
        </CardFooter>
      </Card>
    </div>
  );
}
