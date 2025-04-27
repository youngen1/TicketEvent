declare module 'paystack-node' {
  export default class PayStack {
    constructor(secretKey: string);
    
    initializeTransaction(params: {
      email: string;
      amount: number;
      reference?: string;
      callback_url?: string;
      metadata?: any;
    }): Promise<{
      body: {
        status: boolean;
        message: string;
        data: {
          authorization_url: string;
          access_code: string;
          reference: string;
        }
      }
    }>;
    
    verifyTransaction(params: {
      reference: string;
    }): Promise<{
      body: {
        status: boolean;
        message: string;
        data: {
          status: string;
          reference: string;
          amount: number;
          paid_at: string;
          channel: string;
          currency: string;
          transaction_date: string;
          customer: {
            email: string;
            name: string;
            phone?: string;
          }
        }
      }
    }>;
    
    listPaymentChannels(): Promise<{
      body: {
        status: boolean;
        message: string;
        data: Array<{
          id: number;
          name: string;
          slug: string;
          description: string;
          is_deleted: boolean;
        }>
      }
    }>;
  }
}