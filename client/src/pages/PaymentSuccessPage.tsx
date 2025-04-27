import React, { useEffect, useState } from 'react';
import { useLocation, useRoute, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Check, ArrowLeft } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export default function PaymentSuccessPage() {
  const [location] = useLocation();
  const [match, params] = useRoute('/payment/success');
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        setIsLoading(true);
        
        // Get reference from URL query params
        const urlParams = new URLSearchParams(window.location.search);
        const reference = urlParams.get('reference');
        const isMock = urlParams.get('mock') === 'true';
        
        if (!reference) {
          throw new Error('Payment reference not found');
        }
        
        if (isMock) {
          // For mock payments, create fake transaction details
          setTransactionDetails({
            reference,
            amount: 29999, // In smallest currency unit (cents/kobo)
            status: 'success',
            paidAt: new Date().toISOString(),
            mockPayment: true
          });
        } else {
          // For real payments, verify with backend
          const response = await apiRequest('GET', `/api/payments/verify/${reference}`);
          const data = await response.json();
          
          if (!data.success) {
            throw new Error('Payment verification failed');
          }
          
          setTransactionDetails(data.data);
        }
      } catch (err: any) {
        console.error('Error verifying payment:', err);
        setError(err.message || 'An error occurred while verifying your payment');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (match) {
      fetchTransactionDetails();
    }
  }, [match]);
  
  // Format amount from cents/kobo to regular currency
  const formatAmount = (amount: number) => {
    return `R${(amount / 100).toFixed(2)}`;
  };
  
  if (!match) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <div className="text-center mb-6">
          {isLoading ? (
            <div className="w-16 h-16 mx-auto border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin" />
          ) : error ? (
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center text-red-500">
              <span className="text-2xl">×</span>
            </div>
          ) : (
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center text-green-500">
              <Check className="w-8 h-8" />
            </div>
          )}
          
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            {isLoading ? 'Processing Payment...' : 
             error ? 'Payment Failed' : 
             'Payment Successful!'}
          </h2>
        </div>
        
        {error ? (
          <div className="text-center mb-6">
            <p className="text-red-600">{error}</p>
            <p className="mt-2 text-gray-600">Please try again or contact support.</p>
          </div>
        ) : null}
        
        {!isLoading && !error && transactionDetails && (
          <div className="border-t border-b border-gray-200 py-4 mb-6">
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-gray-500">Reference</dt>
                <dd className="text-gray-900">{transactionDetails.reference}</dd>
              </div>
              
              <div className="flex justify-between">
                <dt className="text-gray-500">Amount</dt>
                <dd className="text-gray-900 font-medium">
                  {formatAmount(transactionDetails.amount)}
                </dd>
              </div>
              
              <div className="flex justify-between">
                <dt className="text-gray-500">Status</dt>
                <dd className="text-green-600 font-medium">
                  {transactionDetails.status}
                </dd>
              </div>
              
              <div className="flex justify-between">
                <dt className="text-gray-500">Date</dt>
                <dd className="text-gray-900">
                  {new Date(transactionDetails.paidAt || transactionDetails.paid_at || Date.now()).toLocaleString()}
                </dd>
              </div>
              
              {transactionDetails.mockPayment && (
                <div className="mt-4 p-2 bg-yellow-50 rounded text-sm text-yellow-800">
                  This is a demo transaction. No actual payment was processed.
                </div>
              )}
            </dl>
          </div>
        )}
        
        <div className="text-center">
          <Link href="/">
            <Button className="inline-flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}