import { UserProfile, DepartmentOption } from '../types';

export interface OfficerDemoAccount {
  id: string;
  name: string;
  designation: string;
  department: DepartmentOption | string;
  email: string;
  secondaryEmail?: string;
  password: string;
  phone: string;
  ward: string;
  isAvailable: boolean;
  isSupervisor?: boolean;
  avatarUrl?: string;
}

/**
 * Standard Demo Credentials for all 15 Municipal Officers (3 per department)
 * Primary domain: @namnadhwani.gov.in
 */
export const OFFICER_DEMO_ACCOUNTS: OfficerDemoAccount[] = [
  // ==========================================================================
  // 1. STORMWATER DRAINAGE
  // ==========================================================================
  {
    id: 'usr-off-drainage-a',
    name: 'Officer Priya Sharma',
    designation: 'Senior Hydraulic Engineer & Ward Supervisor',
    department: 'Stormwater Drainage',
    email: 'priya@namnadhwani.gov.in',
    secondaryEmail: 'priya.sharma@civicloop.gov.in',
    password: 'Priya@123',
    phone: '+91 98234 56789',
    ward: 'Ward 18 & 20 - East Zone',
    isAvailable: true,
    isSupervisor: true,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-off-drainage-b',
    name: 'Inspector Manoj Verma',
    designation: 'Field Drainage Inspector',
    department: 'Stormwater Drainage',
    email: 'manoj@namnadhwani.gov.in',
    secondaryEmail: 'manoj.verma@civicloop.gov.in',
    password: 'Manoj@123',
    phone: '+91 98234 56790',
    ward: 'Ward 18 & 20 - East Zone',
    isAvailable: true,
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-off-drainage-c',
    name: 'Engineer Sunita Rao',
    designation: 'Sub-Division Desilting Specialist',
    department: 'Stormwater Drainage',
    email: 'sunita@namnadhwani.gov.in',
    secondaryEmail: 'sunita.rao@civicloop.gov.in',
    password: 'Sunita@123',
    phone: '+91 98234 56791',
    ward: 'Ward 18 & 20 - East Zone',
    isAvailable: true,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  },

  // ==========================================================================
  // 2. ROADS & INFRASTRUCTURE
  // ==========================================================================
  {
    id: 'usr-off-roads-a',
    name: 'Inspector Rajesh Kumar',
    designation: 'Executive Road Maintenance Engineer',
    department: 'Roads & Infrastructure',
    email: 'rajesh@namnadhwani.gov.in',
    secondaryEmail: 'rajesh.kumar@civicloop.gov.in',
    password: 'Rajesh@123',
    phone: '+91 98123 45678',
    ward: 'Ward 18 & 19 - Central Zone',
    isAvailable: true,
    isSupervisor: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-off-roads-b',
    name: 'Engineer Anita Desai',
    designation: 'Senior Bituminous Surface Specialist',
    department: 'Roads & Infrastructure',
    email: 'anita@namnadhwani.gov.in',
    secondaryEmail: 'anita.desai@civicloop.gov.in',
    password: 'Anita@123',
    phone: '+91 98123 45679',
    ward: 'Ward 18 & 19 - Central Zone',
    isAvailable: true,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-off-roads-c',
    name: 'Specialist Vikram Singh',
    designation: 'Traffic Corridor & Pavement Inspector',
    department: 'Roads & Infrastructure',
    email: 'vikram@namnadhwani.gov.in',
    secondaryEmail: 'vikram.singh@civicloop.gov.in',
    password: 'Vikram@123',
    phone: '+91 98123 45680',
    ward: 'Ward 18 & 19 - Central Zone',
    isAvailable: true,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },

  // ==========================================================================
  // 3. WASTE MANAGEMENT
  // ==========================================================================
  {
    id: 'usr-off-waste-a',
    name: 'Inspector Ramesh Patel',
    designation: 'Chief Sanitation & Waste Supervisor',
    department: 'Waste Management',
    email: 'ramesh@namnadhwani.gov.in',
    secondaryEmail: 'ramesh.patel@civicloop.gov.in',
    password: 'Ramesh@123',
    phone: '+91 98345 67890',
    ward: 'Ward 12 & 18 - South Zone',
    isAvailable: true,
    isSupervisor: true,
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-off-waste-b',
    name: 'Supervisor Deepa Joshi',
    designation: 'Solid Waste Field Inspector',
    department: 'Waste Management',
    email: 'deepa@namnadhwani.gov.in',
    secondaryEmail: 'deepa.joshi@civicloop.gov.in',
    password: 'Deepa@123',
    phone: '+91 98345 67891',
    ward: 'Ward 12 & 18 - South Zone',
    isAvailable: true,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-off-waste-c',
    name: 'Field Officer Arjun Nair',
    designation: 'Bulk Commercial Waste Officer',
    department: 'Waste Management',
    email: 'arjun@namnadhwani.gov.in',
    secondaryEmail: 'arjun.nair@civicloop.gov.in',
    password: 'Arjun@123',
    phone: '+91 98345 67892',
    ward: 'Ward 12 & 18 - South Zone',
    isAvailable: true,
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  },

  // ==========================================================================
  // 4. WATER SUPPLY
  // ==========================================================================
  {
    id: 'usr-off-water-a',
    name: 'Engineer Lakshmi Narayan',
    designation: 'Principal Distribution Pipeline Engineer',
    department: 'Water Supply',
    email: 'lakshmi@namnadhwani.gov.in',
    secondaryEmail: 'lakshmi.narayan@civicloop.gov.in',
    password: 'Lakshmi@123',
    phone: '+91 98567 89012',
    ward: 'Ward 12 & 19 - West Zone',
    isAvailable: true,
    isSupervisor: true,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-off-water-b',
    name: 'Inspector Rohan Gupta',
    designation: 'Pressure Valve & Supply Inspector',
    department: 'Water Supply',
    email: 'rohan@namnadhwani.gov.in',
    secondaryEmail: 'rohan.gupta@civicloop.gov.in',
    password: 'Rohan@123',
    phone: '+91 98567 89013',
    ward: 'Ward 12 & 19 - West Zone',
    isAvailable: true,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-off-water-c',
    name: 'Engineer Meera Kulkarni',
    designation: 'Pipeline Leakage & SCADA Analyst',
    department: 'Water Supply',
    email: 'meera@namnadhwani.gov.in',
    secondaryEmail: 'meera.kulkarni@civicloop.gov.in',
    password: 'Meera@123',
    phone: '+91 98567 89014',
    ward: 'Ward 12 & 19 - West Zone',
    isAvailable: true,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },

  // ==========================================================================
  // 5. STREET LIGHTING
  // ==========================================================================
  {
    id: 'usr-off-lighting-a',
    name: 'Officer Suresh Rao',
    designation: 'Public Illumination & Grid Supervisor',
    department: 'Street Lighting',
    email: 'suresh@namnadhwani.gov.in',
    secondaryEmail: 'suresh.rao@civicloop.gov.in',
    password: 'Suresh@123',
    phone: '+91 98456 78901',
    ward: 'Ward 18 - North Zone',
    isAvailable: true,
    isSupervisor: true,
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-off-lighting-b',
    name: 'Tech Inspector Kavita Hegde',
    designation: 'LED Luminaire & Feeder Inspector',
    department: 'Street Lighting',
    email: 'kavita@namnadhwani.gov.in',
    secondaryEmail: 'kavita.hegde@civicloop.gov.in',
    password: 'Kavita@123',
    phone: '+91 98456 78902',
    ward: 'Ward 18 - North Zone',
    isAvailable: true,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-off-lighting-c',
    name: 'Linesman Prakash Gowda',
    designation: 'Emergency Electrical Response Technician',
    department: 'Street Lighting',
    email: 'prakash@namnadhwani.gov.in',
    secondaryEmail: 'prakash.gowda@civicloop.gov.in',
    password: 'Prakash@123',
    phone: '+91 98456 78903',
    ward: 'Ward 18 - North Zone',
    isAvailable: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
];

/**
 * Normalizes email input for robust comparison
 */
export const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

/**
 * Normalizes department string for robust comparison
 */
export const normalizeDept = (dept?: string): string => {
  if (!dept) return '';
  return dept.trim().toLowerCase();
};

/**
 * Validates officer credentials against the mock accounts database
 */
export interface AuthValidationResult {
  success: boolean;
  officer?: UserProfile;
  error?: string;
}

export function authenticateOfficerCredentials(
  department: string,
  email: string,
  password: string
): AuthValidationResult {
  const normEmail = normalizeEmail(email);
  const normDept = normalizeDept(department);
  const cleanPassword = password.trim();

  if (!normDept) {
    return {
      success: false,
      error: 'Please select a valid municipal department.',
    };
  }

  if (!normEmail || !cleanPassword) {
    return {
      success: false,
      error: 'Email and password are required.',
    };
  }

  // Find account matching email or secondary email
  const match = OFFICER_DEMO_ACCOUNTS.find((acc) => {
    const primary = normalizeEmail(acc.email);
    const secondary = acc.secondaryEmail ? normalizeEmail(acc.secondaryEmail) : '';
    const prefix = primary.split('@')[0];
    return (
      normEmail === primary ||
      normEmail === secondary ||
      normEmail === `${prefix}@namnadhwani.gov.in` ||
      normEmail === `${prefix}@civicloop.gov.in`
    );
  });

  if (!match) {
    return {
      success: false,
      error: 'Invalid officer credentials or department.',
    };
  }

  // Verify password
  if (match.password !== cleanPassword) {
    return {
      success: false,
      error: 'Invalid officer credentials or department.',
    };
  }

  // Verify department match
  const accDept = normalizeDept(match.department);
  const isDeptMatch =
    accDept === normDept ||
    accDept.includes(normDept) ||
    normDept.includes(accDept);

  if (!isDeptMatch) {
    return {
      success: false,
      error: `Invalid officer credentials or department. Officer ${match.name} belongs to ${match.department}, not ${department}.`,
    };
  }

  // Return formatted UserProfile
  const officerProfile: UserProfile = {
    id: match.id,
    name: match.name,
    designation: match.designation,
    email: match.email,
    role: 'officer',
    department: match.department,
    phone: match.phone,
    language: 'en',
    ward: match.ward,
    isAvailable: match.isAvailable,
    isSupervisor: match.isSupervisor,
    avatarUrl: match.avatarUrl,
  };

  return {
    success: true,
    officer: officerProfile,
  };
}

/**
 * Returns accounts grouped by department for demo credentials showcase
 */
export function getDemoAccountsByDepartment(): Record<string, OfficerDemoAccount[]> {
  const grouped: Record<string, OfficerDemoAccount[]> = {};
  for (const acc of OFFICER_DEMO_ACCOUNTS) {
    if (!grouped[acc.department]) {
      grouped[acc.department] = [];
    }
    grouped[acc.department].push(acc);
  }
  return grouped;
}
