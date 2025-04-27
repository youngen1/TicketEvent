import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';

interface PaystackPaymentButtonProps {
  eventId: number;
  amount: number | string;
  buttonText?: string;
  className?: string;
}

export default function PaystackPaymentButton({ 
  eventId, 
  amount, 
  buttonText = "Pay Now", 
  className = "" 
}: PaystackPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [publicKey, setPublicKey] = useState<string | null>(null);
  
  // Determine which public key to use
  useEffect(() => {
    // Check if we're in test or live mode by getting admin settings
    const fetchPaymentMode = async () => {
      try {
        const response = await apiRequest('GET', '/api/admin/payment-settings');
        const data = await response.json();
        
        // Use the appropriate key based on mode
        if (data.liveMode) {
          setPublicKey(import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string);
        } else {
          setPublicKey(import.meta.env.VITE_PAYSTACK_TEST_PUBLIC_KEY as string);
        }
      } catch (error) {
        console.error('Error fetching payment mode:', error);
        // Default to test key if there's an error
        setPublicKey(import.meta.env.VITE_PAYSTACK_TEST_PUBLIC_KEY as string);
      }
    };
    
    fetchPaymentMode();
  }, []);
  
  // Convert amount to number if it's a string (like 'R100')
  const getNumericAmount = (): number => {
    if (typeof amount === 'number') return amount;
    // If it's a string like 'R100', extract the number
    const numericValue = parseFloat(String(amount).replace(/[^0-9.]/g, ''));
    return isNaN(numericValue) ? 0 : numericValue;
  };
  
  // For display in button
  const getFormattedAmountForDisplay = (): string => {
    const numericAmount = getNumericAmount();
    return `R${numericAmount.toFixed(2)}`;
  };
  
  const actualAmount = getNumericAmount();
  
  const initializePaymentMutation = useMutation({
    mutationFn: async () => {
      const numericAmount = getNumericAmount();
      if (numericAmount <= 0) {
        throw new Error('Invalid amount');
      }
      
      return apiRequest('POST', '/api/payments/initialize', {
        amount: numericAmount,
        eventId
      });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      if (data.paymentUrl) {
        // Redirect to Paystack payment page
        window.location.href = data.paymentUrl;
      } else {
        toast({
          title: "Payment Error",
          description: "Could not initialize payment",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    },
    onError: (error: any) => {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initiate payment",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  });

  const handlePayment = async () => {
    setIsLoading(true);
    initializePaymentMutation.mutate();
  };

  return (
    <Button 
      onClick={handlePayment} 
      disabled={isLoading || !publicKey} 
      className={`bg-purple-600 hover:bg-purple-700 text-white ${className}`}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {buttonText || `Pay ${getFormattedAmountForDisplay()}`}
    </Button>
  );
}