import nodemailer from 'nodemailer';
import crypto from 'crypto';

// In-memory storage for tokens and verification status
interface VerificationRecord {
  userId: number;
  token: string;
  expires: Date;
  verified: boolean;
}

interface PasswordResetRecord {
  userId: number;
  token: string;
  expires: Date;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private verificationRecords: Map<number, VerificationRecord> = new Map();
  private passwordResetRecords: Map<number, PasswordResetRecord> = new Map();
  private readonly tokenExpiryHours = 24; // Tokens expire after 24 hours
  private readonly senderEmail = process.env.EMAIL_SENDER || 'events@yourdomain.com';
  
  constructor() {
    // Create reusable transporter object using SMTP transport
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app password
      },
    });
  }

  /**
   * Generate a random token for verification or reset
   */
  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Create verification record and send verification email
   */
  async sendVerificationEmail(userId: number, email: string, username: string): Promise<string> {
    const token = this.generateToken();
    const expires = new Date();
    expires.setHours(expires.getHours() + this.tokenExpiryHours);

    // Store verification record
    this.verificationRecords.set(userId, {
      userId,
      token,
      expires,
      verified: false
    });

    const verificationLink = `${process.env.APP_URL || 'http://localhost:3000'}/verify-email?token=${token}&userId=${userId}`;
    
    // Email content
    const mailOptions = {
      from: this.senderEmail,
      to: email,
      subject: 'Verify your email address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Verification</h2>
          <p>Hello ${username},</p>
          <p>Thank you for registering! Please verify your email address by clicking the button below:</p>
          <p>
            <a href="${verificationLink}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
              Verify Email Address
            </a>
          </p>
          <p>Or copy and paste this link in your browser:</p>
          <p>${verificationLink}</p>
          <p>This link will expire in ${this.tokenExpiryHours} hours.</p>
          <p>If you did not sign up for an account, you can safely ignore this email.</p>
          <p>Regards,<br>The Events Team</p>
        </div>
      `
    };

    try {
      // Send the email
      await this.transporter.sendMail(mailOptions);
      return token;
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Verify a user's email with the provided token
   */
  verifyEmail(userId: number, token: string): boolean {
    const record = this.verificationRecords.get(userId);
    
    // Check if record exists, token matches, and hasn't expired
    if (record && 
        record.token === token && 
        record.expires > new Date()) {
      
      // Mark as verified
      record.verified = true;
      this.verificationRecords.set(userId, record);
      return true;
    }
    
    return false;
  }

  /**
   * Check if a user's email is verified
   */
  isEmailVerified(userId: number): boolean {
    const record = this.verificationRecords.get(userId);
    return record ? record.verified : false;
  }

  /**
   * Create password reset record and send reset email
   */
  async sendPasswordResetEmail(userId: number, email: string, username: string): Promise<string> {
    const token = this.generateToken();
    const expires = new Date();
    expires.setHours(expires.getHours() + this.tokenExpiryHours);

    // Store password reset record
    this.passwordResetRecords.set(userId, {
      userId,
      token,
      expires
    });

    const resetLink = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${token}&userId=${userId}`;
    
    // Email content
    const mailOptions = {
      from: this.senderEmail,
      to: email,
      subject: 'Reset your password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset</h2>
          <p>Hello ${username},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <p>
            <a href="${resetLink}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
              Reset Password
            </a>
          </p>
          <p>Or copy and paste this link in your browser:</p>
          <p>${resetLink}</p>
          <p>This link will expire in ${this.tokenExpiryHours} hours.</p>
          <p>If you did not request a password reset, you can safely ignore this email.</p>
          <p>Regards,<br>The Events Team</p>
        </div>
      `
    };

    try {
      // Send the email
      await this.transporter.sendMail(mailOptions);
      return token;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Validate a password reset token
   */
  validateResetToken(userId: number, token: string): boolean {
    const record = this.passwordResetRecords.get(userId);
    
    // Check if record exists, token matches, and hasn't expired
    if (record && 
        record.token === token && 
        record.expires > new Date()) {
      return true;
    }
    
    return false;
  }

  /**
   * Delete a password reset record after it's been used
   */
  deleteResetRecord(userId: number): void {
    this.passwordResetRecords.delete(userId);
  }

  /**
   * Simulate email sending (for testing without actual SMTP)
   */
  async simulateSendEmail(to: string, subject: string, html: string): Promise<boolean> {
    console.log('------------- SIMULATED EMAIL -------------');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('Content:');
    console.log(html);
    console.log('------------------------------------------');
    return true;
  }
}

export const emailService = new EmailService();
