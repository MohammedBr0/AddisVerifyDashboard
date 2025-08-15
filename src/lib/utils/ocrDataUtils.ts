// OCR Data Processing Utilities for Ethiopian Documents
// Handles date formatting, field mapping, and data validation

export interface OCRFieldMapping {
  fullName: string;
  fullNameAmharic?: string;
  dateOfBirth: string;
  dateOfBirthEthiopian?: string;
  dateOfIssue?: string;
  dateOfIssueEthiopian?: string;
  dateOfExpiry: string;
  dateOfExpiryEthiopian?: string;
  gender: string;
  idNumber: string;
  documentType?: string;
  issuingAuthority: string;
  documentId?: string;
  sex?: string;
  documentStatus?: {
    is_valid: boolean;
    is_older_than_18: boolean;
    is_document_accepted: boolean;
  };
}

/**
 * Convert Ethiopian date to Gregorian date
 * @param ethiopianDate - Date in Ethiopian format (e.g., "2013-04-15")
 * @returns Gregorian date string (YYYY-MM-DD)
 */
export function convertEthiopianToGregorian(ethiopianDate: string): string {
  if (!ethiopianDate || typeof ethiopianDate !== 'string') {
    return '';
  }

  try {
    // Ethiopian calendar starts 7-8 years behind Gregorian
    // This is a simplified conversion - for production, use a proper Ethiopian calendar library
    const [year, month, day] = ethiopianDate.split('-').map(Number);
    if (!year || !month || !day) return '';

    // Approximate conversion (Ethiopian year + 7 = Gregorian year)
    const gregorianYear = year + 7;
    
    // Format as YYYY-MM-DD
    return `${gregorianYear.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error converting Ethiopian date:', error);
    return '';
  }
}

/**
 * Convert Gregorian date to Ethiopian date
 * @param gregorianDate - Date in Gregorian format (YYYY-MM-DD)
 * @returns Ethiopian date string (YYYY-MM-DD)
 */
export function convertGregorianToEthiopian(gregorianDate: string): string {
  if (!gregorianDate || typeof gregorianDate !== 'string') {
    return '';
  }

  try {
    const [year, month, day] = gregorianDate.split('-').map(Number);
    if (!year || !month || !day) return '';

    // Approximate conversion (Gregorian year - 7 = Ethiopian year)
    const ethiopianYear = year - 7;
    
    // Format as YYYY-MM-DD
    return `${ethiopianYear.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error converting Gregorian date:', error);
    return '';
  }
}

/**
 * Format date for display
 * @param dateString - Date string in any format
 * @returns Formatted date string
 */
export function formatDateForDisplay(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
}

/**
 * Validate and format date for input field
 * @param dateString - Date string
 * @returns Formatted date string for input field (YYYY-MM-DD)
 */
export function formatDateForInput(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    return date.toISOString().split('T')[0];
  } catch (error) {
    return '';
  }
}

/**
 * Map extracted OCR fields to standardized format
 * @param extractedFields - Raw extracted fields from OCR API
 * @param fallbackData - Fallback data if extraction fails
 * @returns Mapped OCR data
 */
export function mapExtractedFields(
  extractedFields: any,
  fallbackData: Partial<OCRFieldMapping> = {}
): OCRFieldMapping {
  const mapped: OCRFieldMapping = {
    fullName: '',
    dateOfBirth: '',
    dateOfExpiry: '',
    gender: '',
    idNumber: '',
    issuingAuthority: '',
    ...fallbackData
  };

  // Map full name (multiple possible field names)
  mapped.fullName = extractedFields.full_name || 
                   extractedFields.name || 
                   extractedFields.fullName ||
                   extractedFields.given_name + ' ' + extractedFields.surname ||
                   fallbackData.fullName || '';

  // Map Amharic name
  mapped.fullNameAmharic = extractedFields.full_name_amharic || 
                          extractedFields.name_amharic ||
                          extractedFields.amharic_name ||
                          fallbackData.fullNameAmharic;

  // Map date of birth (handle multiple formats)
  const dobRaw = extractedFields.date_of_birth || 
                 extractedFields.birth_date || 
                 extractedFields.dob ||
                 extractedFields.birthdate;
  
  if (dobRaw) {
    // Check if it's Ethiopian date format
    if (dobRaw.includes('E.C.') || dobRaw.includes('ዓ.ም')) {
      // Extract Ethiopian date and convert
      const ethiopianDate = extractEthiopianDate(dobRaw);
      mapped.dateOfBirth = convertEthiopianToGregorian(ethiopianDate);
      mapped.dateOfBirthEthiopian = ethiopianDate;
    } else {
      mapped.dateOfBirth = formatDateForInput(dobRaw);
    }
  }

  // Map date of issue
  const doiRaw = extractedFields.date_of_issue || 
                 extractedFields.issue_date ||
                 extractedFields.issued_date;
  
  if (doiRaw) {
    if (doiRaw.includes('E.C.') || doiRaw.includes('ዓ.ም')) {
      const ethiopianDate = extractEthiopianDate(doiRaw);
      mapped.dateOfIssue = convertEthiopianToGregorian(ethiopianDate);
      mapped.dateOfIssueEthiopian = ethiopianDate;
    } else {
      mapped.dateOfIssue = formatDateForInput(doiRaw);
    }
  }

  // Map date of expiry
  const doeRaw = extractedFields.date_of_expiry || 
                 extractedFields.expiry_date || 
                 extractedFields.expiration_date ||
                 extractedFields.expires ||
                 extractedFields.valid_until;
  
  if (doeRaw) {
    if (doeRaw.includes('E.C.') || doeRaw.includes('ዓ.ም')) {
      const ethiopianDate = extractEthiopianDate(doeRaw);
      mapped.dateOfExpiry = convertEthiopianToGregorian(ethiopianDate);
      mapped.dateOfExpiryEthiopian = ethiopianDate;
    } else {
      mapped.dateOfExpiry = formatDateForInput(doeRaw);
    }
  }

  // Map gender/sex
  mapped.gender = extractedFields.gender || 
                 extractedFields.sex ||
                 fallbackData.gender || '';

  // Map sex separately if different from gender
  if (extractedFields.sex && extractedFields.sex !== mapped.gender) {
    mapped.sex = extractedFields.sex;
  }

  // Map ID number (multiple possible field names)
  mapped.idNumber = extractedFields.id_number || 
                   extractedFields.document_number || 
                   extractedFields.passport_number ||
                   extractedFields.identity_number ||
                   extractedFields.personal_number ||
                   fallbackData.idNumber || '';

  // Map document ID
  mapped.documentId = extractedFields.document_id || 
                     extractedFields.id ||
                     fallbackData.documentId;

  // Map document type
  mapped.documentType = extractedFields.document_type || 
                       extractedFields.type ||
                       fallbackData.documentType;

  // Map issuing authority
  mapped.issuingAuthority = extractedFields.issuing_authority || 
                           extractedFields.issuing_country || 
                           extractedFields.authority ||
                           extractedFields.issuer ||
                           fallbackData.issuingAuthority || '';

  // Map document status
  if (extractedFields.document_status) {
    mapped.documentStatus = {
      is_valid: extractedFields.document_status.is_valid ?? true,
      is_older_than_18: extractedFields.document_status.is_older_than_18 ?? true,
      is_document_accepted: extractedFields.document_status.is_document_accepted ?? true
    };
  }

  return mapped;
}

/**
 * Extract Ethiopian date from text containing Ethiopian calendar references
 * @param text - Text containing Ethiopian date
 * @returns Ethiopian date string (YYYY-MM-DD)
 */
function extractEthiopianDate(text: string): string {
  if (!text) return '';
  
  try {
    // Look for Ethiopian date patterns
    // Pattern 1: YYYY-MM-DD E.C. or YYYY-MM-DD ዓ.ም
    const pattern1 = /(\d{4})-(\d{1,2})-(\d{1,2})\s*(?:E\.C\.|ዓ\.ም)/;
    const match1 = text.match(pattern1);
    if (match1) {
      return `${match1[1]}-${match1[2].padStart(2, '0')}-${match1[3].padStart(2, '0')}`;
    }

    // Pattern 2: DD/MM/YYYY E.C. or DD/MM/YYYY ዓ.ም
    const pattern2 = /(\d{1,2})\/(\d{1,2})\/(\d{4})\s*(?:E\.C\.|ዓ\.ም)/;
    const match2 = text.match(pattern2);
    if (match2) {
      return `${match2[3]}-${match2[2].padStart(2, '0')}-${match2[1].padStart(2, '0')}`;
    }

    // Pattern 3: Just numbers that might be Ethiopian date
    const numbers = text.match(/\d+/g);
    if (numbers && numbers.length >= 3) {
      // Assume first three numbers are year, month, day
      const year = numbers[0];
      const month = numbers[1];
      const day = numbers[2];
      
      if (year.length === 4 && parseInt(month) <= 12 && parseInt(day) <= 31) {
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
  } catch (error) {
    console.error('Error extracting Ethiopian date:', error);
  }
  
  return '';
}

/**
 * Validate OCR data before saving
 * @param ocrData - OCR data to validate
 * @returns Validation result with errors
 */
export function validateOCRData(ocrData: OCRFieldMapping): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!ocrData.fullName?.trim()) {
    errors.push('Full name is required');
  }

  if (!ocrData.dateOfBirth) {
    errors.push('Date of birth is required');
  } else {
    const dob = new Date(ocrData.dateOfBirth);
    if (isNaN(dob.getTime())) {
      errors.push('Invalid date of birth format');
    }
  }

  if (!ocrData.dateOfExpiry) {
    errors.push('Expiry date is required');
  } else {
    const doe = new Date(ocrData.dateOfExpiry);
    if (isNaN(doe.getTime())) {
      errors.push('Invalid expiry date format');
    }
  }

  if (!ocrData.gender?.trim()) {
    errors.push('Gender is required');
  }

  if (!ocrData.idNumber?.trim()) {
    errors.push('ID number is required');
  }

  if (!ocrData.issuingAuthority?.trim()) {
    errors.push('Issuing authority is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Clean and normalize OCR data
 * @param ocrData - Raw OCR data
 * @returns Cleaned OCR data
 */
export function cleanOCRData(ocrData: OCRFieldMapping): OCRFieldMapping {
  return {
    ...ocrData,
    fullName: ocrData.fullName?.trim() || '',
    fullNameAmharic: ocrData.fullNameAmharic?.trim(),
    gender: ocrData.gender?.trim() || '',
    idNumber: ocrData.idNumber?.trim() || '',
    documentType: ocrData.documentType?.trim(),
    issuingAuthority: ocrData.issuingAuthority?.trim() || '',
    documentId: ocrData.documentId?.trim(),
    sex: ocrData.sex?.trim()
  };
}
