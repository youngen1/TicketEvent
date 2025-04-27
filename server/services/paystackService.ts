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
}

class PaystackService {
  private paystack: any;

  constructor() {
    // Use the environment variable if available, otherwise use test key for development
    const secretKey = process.env.PAYSTACK_SECRET_KEY || 'sk_test_your_dummy_key_here';
    
    this.paystack = new Paystack(secretKey);
    
    // Log that we're using a dummy key for development
    if (!process.env.PAYSTACK_SECRET_KEY) {
      console.warn('Using a dummy PAYSTACK_SECRET_KEY for development. Payment functionality will be limited to testing flows.');
    }
  }

  /**
   * Initialize a transaction and get a payment URL
   */
  async initializeTransaction(params: PaymentInitializeParams) {
    try {
      // In development mode with dummy key, return mock data
      if (!process.env.PAYSTACK_SECRET_KEY) {
        console.log('Using mock payment data for development');
        return {
          authorization_url: `https://checkout.paystack.com/${params.reference || 'mock-reference'}`,
          access_code: 'mock_access_code',
          reference: params.reference || `mock-ref-${Date.now()}`
        };
      }
      
      // Convert amount to kobo (Paystack uses the smallest currency unit)
      const amountInKobo = Math.round(params.amount * 100);

      const response = await this.paystack.initializeTransaction({
        email: params.email,
        amount: amountInKobo,
        reference: params.reference,
        callback_url: params.callback_url,
        metadata: params.metadata
      });

      if (!response.body.status) {
        throw new Error(response.body.message || 'Failed to initialize transaction');
      }

      return response.body.data;
    } catch (error: any) {
      console.error('Paystack initialize transaction error:', error);
      
      // For development, return mock data instead of failing
      if (!process.env.PAYSTACK_SECRET_KEY) {
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
      if (!process.env.PAYSTACK_SECRET_KEY) {
        console.log('Using mock verification data for development');
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
      if (!process.env.PAYSTACK_SECRET_KEY) {
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