// ID Type Mapping between Node.js Service and Python Service
// This file provides a centralized mapping system for ID types across services

export interface IdTypeMapping {
  nodejsCode: string;        // Code used in Node.js service (e.g., "ETH_PASSPORT")
  pythonCode: string;        // Code used in Python service (e.g., "passport")
  name: string;              // Display name
  description: string;       // Description of the ID type
  requiresFront: boolean;    // Whether front image is required
  requiresBack: boolean;     // Whether back image is required
  requiresSelfie: boolean;   // Whether selfie is required
  category: string;          // Category for organization
  icon: string;             // Icon/emoji representation
}

// Mapping from Node.js service codes to Python service codes
export const ID_TYPE_MAPPING: Record<string, IdTypeMapping> = {
  'ETH_PASSPORT': {
    nodejsCode: 'ETH_PASSPORT',
    pythonCode: 'passport',
    name: 'Ethiopian Passport',
    description: 'Official Ethiopian passport for international travel',
    requiresFront: true,
    requiresBack: false,
    requiresSelfie: true,
    category: 'Official Document',
    icon: '🛂'
  },
  'ETH_NATIONAL_ID': {
    nodejsCode: 'ETH_NATIONAL_ID',
    pythonCode: 'national_id',
    name: 'Ethiopian National ID',
    description: 'National identification card for Ethiopian citizens',
    requiresFront: true,
    requiresBack: true,
    requiresSelfie: true,
    category: 'Government ID',
    icon: '🆔'
  },
  'ETH_DRIVERS_LICENSE': {
    nodejsCode: 'ETH_DRIVERS_LICENSE',
    pythonCode: 'driver_license',
    name: 'Ethiopian Driver\'s License',
    description: 'Official driver\'s license issued by Ethiopian authorities',
    requiresFront: true,
    requiresBack: true,
    requiresSelfie: true,
    category: 'License',
    icon: '🚗'
  },
  'ETH_RESIDENCE_PERMIT': {
    nodejsCode: 'ETH_RESIDENCE_PERMIT',
    pythonCode: 'resident_id',
    name: 'Ethiopian Residence Permit',
    description: 'Residence permit for foreign nationals living in Ethiopia',
    requiresFront: true,
    requiresBack: true,
    requiresSelfie: true,
    category: 'Permit',
    icon: '🏠'
  },
  'ETH_STUDENT_ID': {
    nodejsCode: 'ETH_STUDENT_ID',
    pythonCode: 'national_id', // Fallback to national_id for student IDs
    name: 'Ethiopian Student ID',
    description: 'Student identification card from Ethiopian educational institutions',
    requiresFront: true,
    requiresBack: false,
    requiresSelfie: true,
    category: 'Educational',
    icon: '🎓'
  },
  'ETH_WORK_PERMIT': {
    nodejsCode: 'ETH_WORK_PERMIT',
    pythonCode: 'resident_id', // Fallback to resident_id for work permits
    name: 'Ethiopian Work Permit',
    description: 'Work permit for foreign nationals employed in Ethiopia',
    requiresFront: true,
    requiresBack: true,
    requiresSelfie: true,
    category: 'Permit',
    icon: '💼'
  },
  'ETH_BIRTH_CERTIFICATE': {
    nodejsCode: 'ETH_BIRTH_CERTIFICATE',
    pythonCode: 'national_id', // Fallback to national_id for birth certificates
    name: 'Ethiopian Birth Certificate',
    description: 'Official birth certificate issued by Ethiopian authorities',
    requiresFront: true,
    requiresBack: false,
    requiresSelfie: false,
    category: 'Civil Document',
    icon: '👶'
  },
  'ETH_MARRIAGE_CERTIFICATE': {
    nodejsCode: 'ETH_MARRIAGE_CERTIFICATE',
    pythonCode: 'national_id', // Fallback to national_id for marriage certificates
    name: 'Ethiopian Marriage Certificate',
    description: 'Official marriage certificate issued by Ethiopian authorities',
    requiresFront: true,
    requiresBack: false,
    requiresSelfie: false,
    category: 'Civil Document',
    icon: '💒'
  }
};

// Reverse mapping from Python service codes to Node.js service codes
export const PYTHON_TO_NODEJS_MAPPING: Record<string, string[]> = {
  'passport': ['ETH_PASSPORT'],
  'national_id': ['ETH_NATIONAL_ID', 'ETH_STUDENT_ID', 'ETH_BIRTH_CERTIFICATE', 'ETH_MARRIAGE_CERTIFICATE'],
  'driver_license': ['ETH_DRIVERS_LICENSE'],
  'resident_id': ['ETH_RESIDENCE_PERMIT', 'ETH_WORK_PERMIT']
};

// Utility functions for ID type mapping

/**
 * Convert Node.js service ID type code to Python service code
 * @param nodejsCode - The ID type code from Node.js service
 * @returns The corresponding Python service code, or null if not found
 */
export function nodejsToPythonCode(nodejsCode: string): string | null {
  const mapping = ID_TYPE_MAPPING[nodejsCode];
  return mapping ? mapping.pythonCode : null;
}

/**
 * Convert Python service ID type code to Node.js service codes
 * @param pythonCode - The ID type code from Python service
 * @returns Array of corresponding Node.js service codes
 */
export function pythonToNodejsCodes(pythonCode: string): string[] {
  return PYTHON_TO_NODEJS_MAPPING[pythonCode] || [];
}

/**
 * Get all available ID type mappings
 * @returns Array of all ID type mappings
 */
export function getAllIdTypeMappings(): IdTypeMapping[] {
  return Object.values(ID_TYPE_MAPPING);
}

/**
 * Get ID type mapping by Node.js code
 * @param nodejsCode - The ID type code from Node.js service
 * @returns The ID type mapping, or null if not found
 */
export function getIdTypeMappingByNodejsCode(nodejsCode: string): IdTypeMapping | null {
  return ID_TYPE_MAPPING[nodejsCode] || null;
}

/**
 * Get ID type mappings by Python code
 * @param pythonCode - The ID type code from Python service
 * @returns Array of ID type mappings that match the Python code
 */
export function getIdTypeMappingsByPythonCode(pythonCode: string): IdTypeMapping[] {
  const nodejsCodes = pythonToNodejsCodes(pythonCode);
  return nodejsCodes.map(code => ID_TYPE_MAPPING[code]).filter(Boolean);
}

/**
 * Get ID type mappings by category
 * @param category - The category to filter by
 * @returns Array of ID type mappings in the specified category
 */
export function getIdTypeMappingsByCategory(category: string): IdTypeMapping[] {
  return getAllIdTypeMappings().filter(mapping => mapping.category === category);
}

/**
 * Get all available categories
 * @returns Array of all available categories
 */
export function getAllCategories(): string[] {
  const categories = new Set(getAllIdTypeMappings().map(mapping => mapping.category));
  return Array.from(categories);
}

/**
 * Validate if a Node.js code exists in the mapping
 * @param nodejsCode - The ID type code to validate
 * @returns True if the code exists in the mapping
 */
export function isValidNodejsCode(nodejsCode: string): boolean {
  return nodejsCode in ID_TYPE_MAPPING;
}

/**
 * Validate if a Python code exists in the mapping
 * @param pythonCode - The ID type code to validate
 * @returns True if the code exists in the mapping
 */
export function isValidPythonCode(pythonCode: string): boolean {
  return pythonCode in PYTHON_TO_NODEJS_MAPPING;
}

/**
 * Get the best matching Node.js code for a Python code
 * @param pythonCode - The Python service code
 * @param preferredNodejsCode - Optional preferred Node.js code if multiple matches exist
 * @returns The best matching Node.js code, or null if no match
 */
export function getBestNodejsCodeForPythonCode(pythonCode: string, preferredNodejsCode?: string): string | null {
  const nodejsCodes = pythonToNodejsCodes(pythonCode);
  
  if (nodejsCodes.length === 0) {
    return null;
  }
  
  if (nodejsCodes.length === 1) {
    return nodejsCodes[0];
  }
  
  // If a preferred code is provided and it's in the list, use it
  if (preferredNodejsCode && nodejsCodes.includes(preferredNodejsCode)) {
    return preferredNodejsCode;
  }
  
  // Otherwise, return the first match (could be improved with priority logic)
  return nodejsCodes[0];
}

// Type definitions for better TypeScript support
export type NodejsIdTypeCode = keyof typeof ID_TYPE_MAPPING;
export type PythonIdTypeCode = keyof typeof PYTHON_TO_NODEJS_MAPPING;
