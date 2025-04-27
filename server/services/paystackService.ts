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
    this.initialize();
  }
  
  /**
   * Initialize the Paystack API client with the appropriate key
   */
  private initialize() {
    // For R2 test event, always use live mode
    process.env.PAYSTACK_MODE = 'live';
    const isLiveMode = true;
    
    // Always use the live key for the R2 event
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is required for live payments but is missing');
    }
    
    this.paystack = new Paystack(secretKey);
    
    // Log that we're using live mode
    console.log(`Paystack initialized in LIVE mode for real payment processing.`);
  }
  
  /**
   * Reinitialize the Paystack API client with updated keys
   */
  public reinitialize() {
    this.initialize();
    console.log('Paystack service reinitialized with updated settings');
  }

  /**
   * Initialize a transaction and get a payment URL
   */
  async initializeTransaction(params: PaymentInitializeParams) {
    try {
      console.log('Initializing Paystack transaction for R2 event:', {
        email: params.email,
        amount: params.amount,
        reference: params.reference
      });
      
      // Convert amount to kobo (Paystack uses the smallest currency unit)
      const amountInKobo = Math.round(params.amount * 100);

      // Convert metadata to JSON string if it exists (Paystack requires metadata as string)
      const metadataString = params.metadata ? JSON.stringify(params.metadata) : undefined;
      
      // Using live Paystack API for all transactions
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

      console.log('Paystack transaction initialization successful:', {
        reference: response.body.data.reference,
        authUrl: response.body.data.authorization_url
      });

      return response.body.data;
    } catch (error: any) {
      console.error('Paystack initialize transaction error:', error);
      throw new Error(error.message || 'Could not initialize payment');
    }
  }

  /**
   * Verify a payment using the transaction reference
   */
  async verifyPayment(params: VerifyPaymentParams) {
    try {
      console.log('Verifying Paystack payment with reference:', params.reference);
      
      // Always using real Paystack API for verification
      const response = await this.paystack.verifyTransaction({
        reference: params.reference
      });

      if (!response.body.status) {
        throw new Error(response.body.message || 'Failed to verify transaction');
      }

      console.log('Paystack payment verification successful:', {
        reference: response.body.data.reference,
        status: response.body.data.status,
        amount: response.body.data.amount,
        currency: response.body.data.currency
      });

      return response.body.data;
    } catch (error: any) {
      console.error('Paystack verify payment error:', error);
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