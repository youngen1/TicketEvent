import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'wouter';

export default function PaymentSettingsPage() {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [liveMode, setLiveMode] = useState(false);

  // Redirect non-authenticated users
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  // Optional: check for admin role (if you have roles)
  // if (!user?.isAdmin) {
  //   return <Redirect to="/" />;
  // }

  // Fetch current payment settings
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/admin/payment-settings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/payment-settings');
      return response.json();
    },
    onSuccess: (data) => {
      setLiveMode(data.liveMode);
    },
    retry: 1,
  });

  // Update payment settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (mode: boolean) => {
      return apiRequest('POST', '/api/admin/payment-settings', { liveMode: mode });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-settings'] });
      toast({
        title: "Settings Updated",
        description: `Payment system is now in ${liveMode ? 'LIVE' : 'TEST'} mode`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update payment settings",
        variant: "destructive",
      });
    }
  });

  const handleToggleMode = () => {
    const newMode = !liveMode;
    setLiveMode(newMode);
    updateSettingsMutation.mutate(newMode);
  };

  const hasPaystackKeys = !!import.meta.env.VITE_PAYSTACK_TEST_PUBLIC_KEY && !!import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load payment settings. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Payment Settings</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Provider</CardTitle>
            <CardDescription>
              Configure your payment gateway settings for processing transactions
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-6">
              {!hasPaystackKeys && (
                <Alert variant="warning" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Missing API Keys</AlertTitle>
                  <AlertDescription>
                    You need to set up your Paystack API keys for both test and live modes.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-1.5">
                <h3 className="text-lg font-medium">Payment Integration</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Currently using <strong>Paystack</strong> as the payment gateway
                </p>
              </div>

              <div className="flex items-center justify-between space-y-0 rounded-md border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="payment-mode">
                    Payment Mode
                  </Label>
                  <div className="text-sm text-muted-foreground">
                    {liveMode ? 
                      'LIVE mode is active. Real transactions will be processed.' : 
                      'TEST mode is active. No real transactions will be processed.'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={liveMode ? "text-sm font-medium text-muted-foreground" : "text-sm font-bold"}>
                    Test
                  </span>
                  <Switch 
                    id="payment-mode" 
                    checked={liveMode}
                    onCheckedChange={handleToggleMode}
                    disabled={updateSettingsMutation.isPending}
                  />
                  <span className={liveMode ? "text-sm font-bold" : "text-sm font-medium text-muted-foreground"}>
                    Live
                  </span>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Test Environment Keys</Label>
                <div className="text-sm border rounded-md p-3 bg-muted/50">
                  <p>Test Public Key: {import.meta.env.VITE_PAYSTACK_TEST_PUBLIC_KEY ? 
                    `${import.meta.env.VITE_PAYSTACK_TEST_PUBLIC_KEY.substring(0, 8)}...` : 
                    'Not configured'}
                  </p>
                  <p>Test Secret Key: {process.env.PAYSTACK_TEST_SECRET_KEY ? 
                    '••••••••••••••••••••••••••' : 
                    'Not configured'}
                  </p>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Live Environment Keys</Label>
                <div className="text-sm border rounded-md p-3 bg-muted/50">
                  <p>Live Public Key: {import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ? 
                    `${import.meta.env.VITE_PAYSTACK_PUBLIC_KEY.substring(0, 8)}...` : 
                    'Not configured'}
                  </p>
                  <p>Live Secret Key: {process.env.PAYSTACK_SECRET_KEY ? 
                    '••••••••••••••••••••••••••' : 
                    'Not configured'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between border-t px-6 py-4">
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <Button 
              onClick={handleToggleMode} 
              disabled={updateSettingsMutation.isPending}
            >
              {updateSettingsMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}