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
        
        // Get search params
        const searchParams = new URLSearchParams(window.location.search);
        const reference = searchParams.get('reference');
        const amount = searchParams.get('amount');
        
        console.log('Payment success page loaded with params:', { reference, amount });
        
        if (reference) {
          // First verify the payment with the server
          console.log('Verifying payment reference:', reference);
          try {
            const verifyResponse = await apiRequest('GET', `/api/payments/verify/${reference}?amount=${amount}`);
            const verifyResult = await verifyResponse.json();
            
            console.log('Payment verification result:', verifyResult);
            
            // Now fetch the user's tickets
            const ticketsResponse = await apiRequest('GET', '/api/users/tickets');
            const tickets = await ticketsResponse.json();
            
            console.log('User tickets after verification:', tickets);
            
            if (tickets && tickets.length > 0) {
              // Find the ticket matching our reference
              const matchingTicket = tickets.find((t: any) => t.paymentReference === reference);
              
              // If not found, get the latest ticket
              const latestTicket = matchingTicket || tickets.sort((a: any, b: any) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              })[0];
              
              console.log('Found ticket for display:', latestTicket);
              
              // Create transaction details from ticket
              setTransactionDetails({
                reference: latestTicket.paymentReference,
                amount: latestTicket.totalAmount * 100, // Convert to cents for display
                status: latestTicket.paymentStatus,
                paidAt: latestTicket.purchaseDate || latestTicket.createdAt,
                testPayment: latestTicket.paymentReference.includes('-test')
              });
            } else {
              throw new Error('No tickets found');
            }
          } catch (error) {
            console.error('Error verifying payment:', error);
            throw new Error('Payment verification failed');
          }
        } else {
          // Fallback to just showing tickets if no reference provided
          const ticketsResponse = await apiRequest('GET', '/api/users/tickets');
          const tickets = await ticketsResponse.json();
          
          if (tickets && tickets.length > 0) {
            // Get the latest ticket
            const latestTicket = tickets.sort((a: any, b: any) => {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            })[0];
            
            console.log('No reference, showing latest ticket:', latestTicket);
            
            // Create transaction details from ticket
            setTransactionDetails({
              reference: latestTicket.paymentReference,
              amount: latestTicket.totalAmount * 100, // Convert to cents for display
              status: latestTicket.paymentStatus,
              paidAt: latestTicket.purchaseDate || latestTicket.createdAt,
              testPayment: latestTicket.paymentReference.includes('-test')
            });
          } else {
            throw new Error('No tickets found');
          }
        }
      } catch (err: any) {
        console.error('Error retrieving ticket details:', err);
        setError('We could not find your ticket. Please check your profile page.');
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
              
              {transactionDetails.testPayment && (
                <div className="mt-4 p-2 bg-yellow-50 rounded text-sm text-yellow-700">
                  This is a temporary test ticket while we fix the Paystack integration.
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