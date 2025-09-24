// Validation utility functions
const validateData = (data, validationRules) => {
  const validationResults = [];
  let validCount = 0;
  let warningCount = 0;
  let errorCount = 0;
  
  data.forEach((row, index) => {
    const rowNumber = index + 1;
    const errors = [];
    const warnings = [];
    
    validationRules.forEach(rule => {
      const value = row[rule.sapFile];
      
      // Check mandatory fields
      if (rule.mandatory && (!value || value.toString().trim() === '')) {
        errors.push(`${rule.sapFile} - Field is mandatory and cannot be empty`);
      }
      
      // Check field length
      if (value && value.toString().length > rule.length) {
        errors.push(`${rule.sapFile} - Field length exceeds maximum of ${rule.length} characters`);
      }
      
      // Check valid values
      if (value && rule.validValues && !rule.validValues.includes(value.toString())) {
        errors.push(`${rule.sapFile} - Invalid value. Must be one of: ${rule.validValues.join(', ')}`);
      }
      
      // Check data type
      if (value && rule.type === 'Integer' && isNaN(parseInt(value))) {
        errors.push(`${rule.sapFile} - Must be a valid integer`);
      }
    });
    
    const status = errors.length > 0 ? 'Error' : warnings.length > 0 ? 'Warning' : 'Valid';
    
    if (status === 'Valid') validCount++;
    else if (status === 'Warning') warningCount++;
    else errorCount++;
    
    validationResults.push({
      rowNumber,
      code: row[validationRules[0]?.sapFile] || `Row ${rowNumber}`,
      status,
      fieldsWithIssues: [...errors, ...warnings].map(e => e.split(' - ')[0]),
      message: errors.length > 0 ? errors.join('; ') : warnings.length > 0 ? warnings.join('; ') : 'No errors found'
    });
  });
  
  return {
    results: validationResults,
    summary: {
      total: data.length,
      valid: validCount,
      warnings: warningCount,
      errors: errorCount
    }
  };
};

const generateSampleData = (fields) => {
  return fields.map(field => {
    let sampleValue = '';
    
    if (field.validValues && field.validValues.length > 0) {
      sampleValue = field.validValues[0];
    } else if (field.type === 'Integer') {
      sampleValue = '123';
    } else if (field.type === 'String') {
      sampleValue = `Sample ${field.sapFile}`;
    } else {
      sampleValue = 'Sample Value';
    }
    
    return {
      [field.sapFile]: sampleValue
    };
  });
};

module.exports = {
  validateData,
  generateSampleData
};
