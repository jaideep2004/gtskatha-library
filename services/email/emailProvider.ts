export interface PasswordResetEmail {
  to: string;
  name: string;
  resetUrl: string;
}

export interface EmailProvider {
  sendPasswordReset(input: PasswordResetEmail): Promise<void>;
}
