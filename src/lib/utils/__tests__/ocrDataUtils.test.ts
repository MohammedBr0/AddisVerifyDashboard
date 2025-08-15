import {
  convertEthiopianToGregorian,
  convertGregorianToEthiopian,
  formatDateForDisplay,
  formatDateForInput,
  mapExtractedFields,
  validateOCRData,
  cleanOCRData,
  OCRFieldMapping
} from '../ocrDataUtils';

describe('OCR Data Utilities', () => {
  describe('Date Conversion', () => {
    test('convertEthiopianToGregorian should convert Ethiopian date to Gregorian', () => {
      expect(convertEthiopianToGregorian('2013-04-15')).toBe('2020-04-15');
      expect(convertEthiopianToGregorian('2015-09-23')).toBe('2022-09-23');
    });

    test('convertGregorianToEthiopian should convert Gregorian date to Ethiopian', () => {
      expect(convertGregorianToEthiopian('2020-04-15')).toBe('2013-04-15');
      expect(convertGregorianToEthiopian('2022-09-23')).toBe('2015-09-23');
    });

    test('should handle invalid dates gracefully', () => {
      expect(convertEthiopianToGregorian('')).toBe('');
      expect(convertEthiopianToGregorian('invalid')).toBe('');
      expect(convertGregorianToEthiopian('')).toBe('');
      expect(convertGregorianToEthiopian('invalid')).toBe('');
    });
  });

  describe('Date Formatting', () => {
    test('formatDateForDisplay should format dates for display', () => {
      expect(formatDateForDisplay('2020-04-15')).toBe('April 15, 2020');
      expect(formatDateForDisplay('2022-09-23')).toBe('September 23, 2022');
    });

    test('formatDateForInput should format dates for input fields', () => {
      expect(formatDateForInput('2020-04-15')).toBe('2020-04-15');
      expect(formatDateForInput('2022-09-23')).toBe('2022-09-23');
    });

    test('should handle invalid dates gracefully', () => {
      expect(formatDateForDisplay('invalid')).toBe('invalid');
      expect(formatDateForInput('invalid')).toBe('');
    });
  });

  describe('Field Mapping', () => {
    test('mapExtractedFields should map extracted fields correctly', () => {
      const extractedFields = {
        full_name: 'John Doe',
        date_of_birth: '1990-05-15',
        gender: 'Male',
        id_number: '123456789',
        issuing_authority: 'Government of Ethiopia'
      };

      const fallbackData = {
        fullName: 'Default Name',
        dateOfBirth: '1990-01-01',
        gender: 'Unknown',
        idNumber: '',
        issuingAuthority: 'Default Authority'
      };

      const result = mapExtractedFields(extractedFields, fallbackData);

      expect(result.fullName).toBe('John Doe');
      expect(result.dateOfBirth).toBe('1990-05-15');
      expect(result.gender).toBe('Male');
      expect(result.idNumber).toBe('123456789');
      expect(result.issuingAuthority).toBe('Government of Ethiopia');
    });

    test('should handle Ethiopian dates with E.C. suffix', () => {
      const extractedFields = {
        date_of_birth: '2013-04-15 E.C.',
        date_of_issue: '2015-09-23 ዓ.ም'
      };

      const result = mapExtractedFields(extractedFields);

      expect(result.dateOfBirth).toBe('2020-04-15');
      expect(result.dateOfBirthEthiopian).toBe('2013-04-15');
      expect(result.dateOfIssue).toBe('2022-09-23');
      expect(result.dateOfIssueEthiopian).toBe('2015-09-23');
    });

    test('should handle multiple field name variations', () => {
      const extractedFields = {
        name: 'John Doe',
        birth_date: '1990-05-15',
        sex: 'Male',
        document_number: '123456789',
        authority: 'Government of Ethiopia'
      };

      const result = mapExtractedFields(extractedFields);

      expect(result.fullName).toBe('John Doe');
      expect(result.dateOfBirth).toBe('1990-05-15');
      expect(result.gender).toBe('Male');
      expect(result.idNumber).toBe('123456789');
      expect(result.issuingAuthority).toBe('Government of Ethiopia');
    });
  });

  describe('Validation', () => {
    test('validateOCRData should validate required fields', () => {
      const validData: OCRFieldMapping = {
        fullName: 'John Doe',
        dateOfBirth: '1990-05-15',
        dateOfExpiry: '2025-12-31',
        gender: 'Male',
        idNumber: '123456789',
        issuingAuthority: 'Government of Ethiopia'
      };

      const result = validateOCRData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should return errors for missing required fields', () => {
      const invalidData: OCRFieldMapping = {
        fullName: '',
        dateOfBirth: '',
        dateOfExpiry: '',
        gender: '',
        idNumber: '',
        issuingAuthority: ''
      };

      const result = validateOCRData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Full name is required');
      expect(result.errors).toContain('Date of birth is required');
      expect(result.errors).toContain('Expiry date is required');
      expect(result.errors).toContain('Gender is required');
      expect(result.errors).toContain('ID number is required');
      expect(result.errors).toContain('Issuing authority is required');
    });

    test('should validate date formats', () => {
      const invalidData: OCRFieldMapping = {
        fullName: 'John Doe',
        dateOfBirth: 'invalid-date',
        dateOfExpiry: 'invalid-date',
        gender: 'Male',
        idNumber: '123456789',
        issuingAuthority: 'Government of Ethiopia'
      };

      const result = validateOCRData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid date of birth format');
      expect(result.errors).toContain('Invalid expiry date format');
    });
  });

  describe('Data Cleaning', () => {
    test('cleanOCRData should trim whitespace and normalize data', () => {
      const dirtyData: OCRFieldMapping = {
        fullName: '  John Doe  ',
        fullNameAmharic: '  ጆን ዶው  ',
        dateOfBirth: '1990-05-15',
        dateOfExpiry: '2025-12-31',
        gender: '  Male  ',
        idNumber: '  123456789  ',
        documentType: '  Passport  ',
        issuingAuthority: '  Government of Ethiopia  ',
        documentId: '  DOC123  ',
        sex: '  Male  '
      };

      const result = cleanOCRData(dirtyData);

      expect(result.fullName).toBe('John Doe');
      expect(result.fullNameAmharic).toBe('ጆን ዶው');
      expect(result.gender).toBe('Male');
      expect(result.idNumber).toBe('123456789');
      expect(result.documentType).toBe('Passport');
      expect(result.issuingAuthority).toBe('Government of Ethiopia');
      expect(result.documentId).toBe('DOC123');
      expect(result.sex).toBe('Male');
    });
  });
});

