// Import the centralized mapping system
import { ID_TYPE_MAPPING, getAllIdTypeMappings } from './idTypeMapping';

// Ethiopia-specific ID types that users can select from
// This now uses the centralized mapping system for consistency
export const ETHIOPIA_ID_TYPES = {
  PASSPORT: {
    name: 'Ethiopian Passport',
    code: 'ETH_PASSPORT',
    country: 'Ethiopia',
    requiresFront: true,
    requiresBack: false,
    requiresSelfie: true,
    description: 'Official Ethiopian passport for international travel',
    icon: '🛂', // Passport control emoji
    category: 'Official Document'
  },
  NATIONAL_ID: {
    name: 'Ethiopian National ID',
    code: 'ETH_NATIONAL_ID',
    country: 'Ethiopia',
    requiresFront: true,
    requiresBack: true,
    requiresSelfie: true,
    description: 'National identification card for Ethiopian citizens',
    icon: '🆔', // ID emoji
    category: 'Government ID'
  },
  DRIVERS_LICENSE: {
    name: 'Ethiopian Driver\'s License',
    code: 'ETH_DRIVERS_LICENSE',
    country: 'Ethiopia',
    requiresFront: true,
    requiresBack: true,
    requiresSelfie: true,
    description: 'Official driver\'s license issued by Ethiopian authorities',
    icon: '🚗', // Car emoji
    category: 'License'
  },
  RESIDENCE_PERMIT: {
    name: 'Ethiopian Residence Permit',
    code: 'ETH_RESIDENCE_PERMIT',
    country: 'Ethiopia',
    requiresFront: true,
    requiresBack: true,
    requiresSelfie: true,
    description: 'Residence permit for foreign nationals living in Ethiopia',
    icon: '🏠', // House emoji
    category: 'Permit'
  },
  STUDENT_ID: {
    name: 'Ethiopian Student ID',
    code: 'ETH_STUDENT_ID',
    country: 'Ethiopia',
    requiresFront: true,
    requiresBack: false,
    requiresSelfie: true,
    description: 'Student identification card from Ethiopian educational institutions',
    icon: '🎓', // Graduation cap emoji
    category: 'Educational'
  },
  WORK_PERMIT: {
    name: 'Ethiopian Work Permit',
    code: 'ETH_WORK_PERMIT',
    country: 'Ethiopia',
    requiresFront: true,
    requiresBack: true,
    requiresSelfie: true,
    description: 'Work permit for foreign nationals employed in Ethiopia',
    icon: '💼', // Briefcase emoji
    category: 'Permit'
  },
  BIRTH_CERTIFICATE: {
    name: 'Ethiopian Birth Certificate',
    code: 'ETH_BIRTH_CERTIFICATE',
    country: 'Ethiopia',
    requiresFront: true,
    requiresBack: false,
    requiresSelfie: false,
    description: 'Official birth certificate issued by Ethiopian authorities',
    icon: '👶', // Baby emoji
    category: 'Civil Document'
  },
  MARRIAGE_CERTIFICATE: {
    name: 'Ethiopian Marriage Certificate',
    code: 'ETH_MARRIAGE_CERTIFICATE',
    country: 'Ethiopia',
    requiresFront: true,
    requiresBack: false,
    requiresSelfie: false,
    description: 'Official marriage certificate issued by Ethiopian authorities',
    icon: '💒', // Wedding emoji
    category: 'Civil Document'
  }
} as const;

// Type for individual Ethiopian ID type
export type EthiopianIdType = typeof ETHIOPIA_ID_TYPES[keyof typeof ETHIOPIA_ID_TYPES];

// Categories for organizing ID types
export const ID_TYPE_CATEGORIES = {
  'Official Document': ['PASSPORT'],
  'Government ID': ['NATIONAL_ID'],
  'License': ['DRIVERS_LICENSE'],
  'Permit': ['RESIDENCE_PERMIT', 'WORK_PERMIT'],
  'Educational': ['STUDENT_ID'],
  'Civil Document': ['BIRTH_CERTIFICATE', 'MARRIAGE_CERTIFICATE']
} as const;

// Get ID types by category
export const getIdTypesByCategory = (category: keyof typeof ID_TYPE_CATEGORIES) => {
  return ID_TYPE_CATEGORIES[category].map(key => ({
    key,
    ...ETHIOPIA_ID_TYPES[key as keyof typeof ETHIOPIA_ID_TYPES]
  }));
};

// Get all categories
export const getAllCategories = () => {
  return Object.keys(ID_TYPE_CATEGORIES) as Array<keyof typeof ID_TYPE_CATEGORIES>;
};

// Get all Ethiopian ID types as array
export const getAllEthiopianIdTypes = () => {
  return Object.entries(ETHIOPIA_ID_TYPES).map(([key, value]) => ({
    key: key as keyof typeof ETHIOPIA_ID_TYPES,
    ...value
  }));
};

// Get all ID types using the centralized mapping system
export const getAllIdTypesFromMapping = () => {
  return getAllIdTypeMappings();
};