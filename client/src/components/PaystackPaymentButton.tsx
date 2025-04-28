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
  ticketTypeId?: number; // Add ticketTypeId for multiple ticket types
}

export default function PaystackPaymentButton({ 
  eventId, 
  amount, 
  buttonText = "Pay Now", 
  className = "",
  ticketTypeId 
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
        
        // Log the current mode for debugging
        console.log(`Using ${data.liveMode ? 'LIVE' : 'TEST'} mode for Paystack payments`);
        
        // Always use the live key as requested
        setPublicKey(import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string);
        
        // Show toast notification about live mode
        toast({
          title: "Live Payment Mode",
          description: "Using actual payment processing. Your card will be charged.",
          variant: "default",
        });
      } catch (error) {
        console.error('Error fetching payment mode:', error);
        // Default to live key even if there's an error
        setPublicKey(import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string);
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
  
  // For display in button - always use ZAR format with R symbol
  const getFormattedAmountForDisplay = (): string => {
    const numericAmount = getNumericAmount();
    return `R${numericAmount.toFixed(2)}`;
  };
  
  const actualAmount = getNumericAmount();
  
  const initializePaymentMutation = useMutation({
    mutationFn: async () => {
      const numericAmount = getNumericAmount();
      console.log('Initializing payment for amount:', numericAmount);
      
      if (numericAmount <= 0) {
        throw new Error('Invalid amount');
      }
      
      // Add clear logs for debugging
      console.log('Sending payment request to server:', {
        amount: numericAmount,
        eventId,
        ticketTypeId
      });
      
      // We'll test using real Paystack integration for all amounts
      console.log('Using Paystack live for amount:', numericAmount);
      return apiRequest('POST', '/api/payments/initialize', {
        amount: numericAmount,
        eventId,
        ticketTypeId
      });
    },
    onSuccess: async (response) => {
      console.log('Payment initialization response:', response);
      const data = await response.json();
      console.log('Payment initialization data:', data);
      
      if (data.paymentUrl) {
        // Redirect to Paystack payment page
        toast({
          title: "Redirecting to Payment",
          description: "You're being redirected to the secure Paystack payment page.",
          variant: "default"
        });
        // Add a small delay before redirect to ensure toast shows
        setTimeout(() => {
          window.location.href = data.paymentUrl;
        }, 1000);
      } else if (data.success && data.ticket) {
        // Test ticket was created successfully
        toast({
          title: "Test Ticket Created",
          description: "A test ticket has been created for this event while we integrate with Paystack.",
          variant: "default"
        });
        
        // Redirect to success page manually for test tickets
        setTimeout(() => {
          window.location.href = '/payment/success';
        }, 1000);
      } else {
        toast({
          title: "Payment Error",
          description: "Could not initialize payment. Please try again.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    },
    onError: async (error: any) => {
      console.error('Payment initialization error:', error);
      
      try {
        // Try to extract more detailed error message from the response
        let errorMessage = "Failed to initiate payment";
        let errorTitle = "Payment Error";
        
        if (error.response) {
          const errorData = await error.response.json();
          errorMessage = errorData.message || errorMessage;
          
          // Check if this is a restriction error (403)
          if (error.response.status === 403) {
            errorTitle = "Restriction Error";
            // Use the server's error message which will be specific about age or gender
          }
        }
        
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
        });
      } catch (e) {
        // If we can't parse the error, just show a generic message
        toast({
          title: "Payment Error",
          description: "Failed to initiate payment. Please try again.",
          variant: "destructive",
        });
      }
      
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