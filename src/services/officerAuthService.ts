import { UserProfile } from '../types';

/** Officer identities are managed in Supabase; no credentials are stored in code. */
export interface OfficerDemoAccount {
  id: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  password: string;
  phone: string;
  ward: string;
  isAvailable: boolean;
}

export interface AuthValidationResult {
  success: boolean;
  officer?: UserProfile;
  error?: string;
}

export const OFFICER_DEMO_ACCOUNTS: OfficerDemoAccount[] = [];
export const getDemoAccountsByDepartment = (): Record<string, OfficerDemoAccount[]> => ({});
export const authenticateOfficerCredentials = (_department?: string, _email?: string, _password?: string): AuthValidationResult => ({
  success: false,
  error: 'Officer accounts are authenticated through Supabase.',
});
