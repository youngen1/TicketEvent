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
    
    // Always use the live key for the R2 event
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is required for live payments but is missing');
    }
    
    // Fix: Paystack-Node doesn't actually support environment parameter in constructor
    this.paystack = new Paystack(secretKey);
    
    // Log that we're using live mode
    console.log(`Paystack initialized in LIVE mode with correct environment settings.`);
    
    // Debug to check the Paystack client was created properly
    console.log(`Paystack client initialized: ${!!this.paystack}`);
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
      // No need to enforce R10 minimum - we'll let Paystack handle any minimums
      const calculatedKobo = Math.round(params.amount * 100);
      const amountInKobo = calculatedKobo;
      
      console.log(`Processing payment: Original amount ${params.amount} → ${calculatedKobo} kobo`);

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
   * Get a list of available payment channels (banks)
   */
  async getPaymentChannels() {
    try {
      try {
        const response = await this.paystack.listPaymentChannels();
        
        if (response && response.body && response.body.status && response.body.data) {
          return response.body.data;
        }
      } catch (apiError) {
        console.error('Error fetching banks from Paystack API:', apiError);
      }
      
      // Fallback - return static list of major banks in South Africa
      console.log('Using fallback bank list for Paystack');
      return [
        { id: 1, name: "ABSA Bank", slug: "absa-bank" },
        { id: 2, name: "Capitec Bank", slug: "capitec-bank" },
        { id: 3, name: "First National Bank", slug: "fnb" },
        { id: 4, name: "Nedbank", slug: "nedbank" },
        { id: 5, name: "Standard Bank", slug: "standard-bank" },
        { id: 6, name: "African Bank", slug: "african-bank" },
        { id: 7, name: "Bidvest Bank", slug: "bidvest-bank" },
        { id: 8, name: "Discovery Bank", slug: "discovery-bank" },
        { id: 9, name: "Investec", slug: "investec" },
        { id: 10, name: "TymeBank", slug: "tyme-bank" },
        { id: 11, name: "Bank Zero", slug: "bank-zero" },
        { id: 12, name: "Grobank", slug: "grobank" },
        { id: 13, name: "VBS Mutual Bank", slug: "vbs-mutual-bank" },
        { id: 14, name: "Ubank", slug: "ubank" },
        { id: 15, name: "Sasfin Bank", slug: "sasfin-bank" }
      ];
    } catch (error: any) {
      console.error('Error in getPaymentChannels:', error);
      // If everything fails, return a minimal list
      return [
        { id: 1, name: "ABSA Bank", slug: "absa-bank" },
        { id: 2, name: "Capitec Bank", slug: "capitec-bank" },
        { id: 3, name: "First National Bank", slug: "fnb" },
        { id: 4, name: "Nedbank", slug: "nedbank" },
        { id: 5, name: "Standard Bank", slug: "standard-bank" }
      ];
    }
  }
}

// Export singleton instance
export const paystackService = new PaystackService();