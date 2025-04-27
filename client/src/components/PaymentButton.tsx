import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from "@/hooks/use-toast";

interface PaymentButtonProps {
  eventId: number;
  amount: number | string;
  buttonText?: string;
  className?: string;
}

export default function PaymentButton({ 
  eventId, 
  amount, 
  buttonText = "Pay Now", 
  className = "" 
}: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
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
  console.log("Payment amount received:", amount, "converted to:", actualAmount);
  
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
          variant: "destructive"
        });
      }
      setIsLoading(false);
    },
    onError: (error: any) => {
      console.error('Payment initialization error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initialize payment",
        variant: "destructive"
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
      disabled={isLoading} 
      className={`bg-purple-600 hover:bg-purple-700 text-white ${className}`}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {buttonText || `Pay ${getFormattedAmountForDisplay()}`}
    </Button>
  );
}