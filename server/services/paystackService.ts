import Paystack from 'paystack-node';

interface PaymentInitializeParams {
  email: string;
  amount: number; // in kobo (smallest currency unit)
  reference?: string;
  callback_url?: string;
  metadata?: any;
}

interface VerifyPaymentParams {
  reference: string;
  amount?: string | number; // Optional amount for mock payments
}

class PaystackService {
  private paystack: any;

  constructor() {
    // Check for live or test mode
    const isLiveMode = process.env.PAYSTACK_MODE === 'live';
    
    // Use the appropriate key based on mode
    let secretKey;
    if (isLiveMode) {
      secretKey = process.env.PAYSTACK_SECRET_KEY;
      if (!secretKey) {
        console.warn('Live mode is set but PAYSTACK_SECRET_KEY is missing. Falling back to test mode.');
        secretKey = process.env.PAYSTACK_TEST_SECRET_KEY || 'sk_test_your_dummy_key_here';
      }
    } else {
      secretKey = process.env.PAYSTACK_TEST_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY || 'sk_test_your_dummy_key_here';
    }
    
    this.paystack = new Paystack(secretKey);
    
    // Log the current mode
    if (!secretKey || secretKey === 'sk_test_your_dummy_key_here') {
      console.warn('Using a dummy PAYSTACK_SECRET_KEY for development. Payment functionality will be limited to testing flows.');
    } else {
      console.log(`Paystack initialized in ${isLiveMode ? 'LIVE' : 'TEST'} mode.`);
    }
  }

  /**
   * Initialize a transaction and get a payment URL
   */
  async initializeTransaction(params: PaymentInitializeParams) {
    try {
      // In development mode with dummy key, return mock data with a local success callback
      const hasValidKey = process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_TEST_SECRET_KEY;
      if (!hasValidKey) {
        console.log('Using mock payment data for development (no valid API keys found)');
        // Create a local callback URL that will show a payment successful page
        const successUrl = new URL(params.callback_url || 'http://localhost:5000');
        successUrl.searchParams.append('reference', params.reference || `mock-ref-${Date.now()}`);
        successUrl.searchParams.append('amount', params.amount.toString());
        successUrl.searchParams.append('mock', 'true');
        
        return {
          authorization_url: successUrl.toString(),
          access_code: 'mock_access_code',
          reference: params.reference || `mock-ref-${Date.now()}`
        };
      }
      
      // Convert amount to kobo (Paystack uses the smallest currency unit)
      const amountInKobo = Math.round(params.amount * 100);

      // Convert metadata to JSON string if it exists (Paystack requires metadata as string)
      const metadataString = params.metadata ? JSON.stringify(params.metadata) : undefined;
      
      const response = await this.paystack.initializeTransaction({
        email: params.email,
        amount: amountInKobo,
        reference: params.reference,
        callback_url: params.callback_url,
        metadata: metadataString
      });

      if (!response.body.status) {
        throw new Error(response.body.message || 'Failed to initialize transaction');
      }

      return response.body.data;
    } catch (error: any) {
      console.error('Paystack initialize transaction error:', error);
      
      // For development, return mock data instead of failing
      const hasValidKey = process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_TEST_SECRET_KEY;
      if (!hasValidKey) {
        console.log('Using mock payment data after error for development');
        return {
          authorization_url: `https://checkout.paystack.com/${params.reference || 'mock-reference'}`,
          access_code: 'mock_access_code',
          reference: params.reference || `mock-ref-${Date.now()}`
        };
      }
      
      throw new Error(error.message || 'Could not initialize payment');
    }
  }

  /**
   * Verify a payment using the transaction reference
   */
  async verifyPayment(params: VerifyPaymentParams) {
    try {
      // In development mode with dummy key, return mock data
      const hasValidKey = process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_TEST_SECRET_KEY;
      if (!hasValidKey) {
        console.log('Using mock verification data for development (no valid API keys found)');
        
        // Try to extract amount from reference
        // Format is typically eventId-timestamp-userId, but
        // we will also check for query parameter if it exists
        let mockAmount = 5000; // Default 50.00 in cents
        
        // If params contains amount directly (i.e., from URL params)
        if (params.amount) {
          mockAmount = Math.round(parseFloat(String(params.amount)) * 100);
        }
        
        return {
          status: "success",
          reference: params.reference,
          amount: mockAmount,
          paid_at: new Date().toISOString(),
          channel: "card",
          currency: "ZAR",
          transaction_date: new Date().toISOString(),
          customer: {
            email: "demo@example.com",
            name: "Demo User"
          }
        };
      }
      
      const response = await this.paystack.verifyTransaction({
        reference: params.reference
      });

      if (!response.body.status) {
        throw new Error(response.body.message || 'Failed to verify transaction');
      }

      return response.body.data;
    } catch (error: any) {
      console.error('Paystack verify payment error:', error);
      
      // For development, return mock data instead of failing
      const hasValidKey = process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_TEST_SECRET_KEY;
      if (!hasValidKey) {
        console.log('Using mock verification data after error for development');
        return {
          status: "success",
          reference: params.reference,
          amount: 5000, // 50.00 in the smallest currency unit
          paid_at: new Date().toISOString(),
          channel: "card",
          currency: "ZAR",
          transaction_date: new Date().toISOString(),
          customer: {
            email: "demo@example.com",
            name: "Demo User"
          }
        };
      }
      
      throw new Error(error.message || 'Could not verify payment');
    }
  }

  /**
   * Get a list of available payment channels
   */
  async getPaymentChannels() {
    try {
      const response = await this.paystack.listPaymentChannels();

      if (!response.body.status) {
        throw new Error(response.body.message || 'Failed to get payment channels');
      }

      return response.body.data;
    } catch (error: any) {
      console.error('Paystack list payment channels error:', error);
      throw new Error(error.message || 'Could not get payment channels');
    }
  }
}

// Export singleton instance
export const paystackService = new PaystackService();