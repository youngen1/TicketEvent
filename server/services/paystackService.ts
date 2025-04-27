import PayStack from 'paystack-node';

// This service will use environment variables for the Paystack API keys
// PAYSTACK_SECRET_KEY should be set in the environment
const paystack = new PayStack(process.env.PAYSTACK_SECRET_KEY || 'your-test-secret-key');

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
  /**
   * Initialize a transaction and get a payment URL
   */
  async initializeTransaction(params: PaymentInitializeParams) {
    try {
      // Amount must be in kobo (1 Rand = 100 kobo)
      const amountInKobo = Math.round(params.amount * 100);
      
      const response = await paystack.initializeTransaction({
        email: params.email,
        amount: amountInKobo,
        reference: params.reference,
        callback_url: params.callback_url,
        metadata: params.metadata
      });
      
      return response.body.data;
    } catch (error) {
      console.error('Error initializing Paystack transaction:', error);
      throw error;
    }
  }

  /**
   * Verify a payment using the transaction reference
   */
  async verifyPayment(params: VerifyPaymentParams) {
    try {
      const response = await paystack.verifyTransaction({
        reference: params.reference
      });
      
      return response.body.data;
    } catch (error) {
      console.error('Error verifying Paystack payment:', error);
      throw error;
    }
  }

  /**
   * Get a list of available payment channels
   */
  async getPaymentChannels() {
    try {
      const response = await paystack.listPaymentChannels();
      return response.body.data;
    } catch (error) {
      console.error('Error getting Paystack payment channels:', error);
      throw error;
    }
  }
}

export default new PaystackService();