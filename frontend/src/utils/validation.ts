import { VALIDATION_RULES } from '../constants/global';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

export class FormValidator {
  private rules: Record<string, ValidationRule[]> = {};

  addRule(field: string, rule: ValidationRule): FormValidator {
    if (!this.rules[field]) {
      this.rules[field] = [];
    }
    this.rules[field].push(rule);
    return this;
  }

  validateField(field: string, value: any): string | null {
    const fieldRules = this.rules[field] || [];
    
    for (const rule of fieldRules) {
      const error = this.validateRule(value, rule);
      if (error) {
        return error;
      }
    }
    
    return null;
  }

  validateForm(data: Record<string, any>): ValidationErrors {
    const errors: ValidationErrors = {};
    
    for (const field in this.rules) {
      const error = this.validateField(field, data[field]);
      if (error) {
        errors[field] = error;
      }
    }
    
    return errors;
  }

  private validateRule(value: any, rule: ValidationRule): string | null {
    // Required validation
    if (rule.required && (value === undefined || value === null || value === '')) {
      return rule.message || `${this.getFieldName(rule)} is required`;
    }

    // Skip other validations if value is empty and not required
    if (!rule.required && (value === undefined || value === null || value === '')) {
      return null;
    }

    // Min length validation
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      return rule.message || `${this.getFieldName(rule)} must be at least ${rule.minLength} characters`;
    }

    // Max length validation
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      return rule.message || `${this.getFieldName(rule)} must be no more than ${rule.maxLength} characters`;
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return rule.message || `${this.getFieldName(rule)} format is invalid`;
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }

  private getFieldName(rule: ValidationRule): string {
    return rule.message ? rule.message.split(' ')[0] : 'Field';
  }
}

// Common validation rules
export const commonRules = {
  required: (message?: string): ValidationRule => ({
    required: true,
    message: message || 'This field is required',
  }),

  email: (message?: string): ValidationRule => ({
    pattern: VALIDATION_RULES.EMAIL_REGEX,
    message: message || 'Please enter a valid email address',
  }),

  password: (message?: string): ValidationRule => ({
    minLength: VALIDATION_RULES.PASSWORD_MIN_LENGTH,
    message: message || `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`,
  }),

  phone: (message?: string): ValidationRule => ({
    pattern: VALIDATION_RULES.PHONE_REGEX,
    message: message || 'Please enter a valid phone number',
  }),

  username: (message?: string): ValidationRule => ({
    minLength: VALIDATION_RULES.USERNAME_MIN_LENGTH,
    maxLength: VALIDATION_RULES.USERNAME_MAX_LENGTH,
    message: message || `Username must be between ${VALIDATION_RULES.USERNAME_MIN_LENGTH} and ${VALIDATION_RULES.USERNAME_MAX_LENGTH} characters`,
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    minLength: min,
    message: message || `Must be at least ${min} characters`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    maxLength: max,
    message: message || `Must be no more than ${max} characters`,
  }),

  pattern: (regex: RegExp, message?: string): ValidationRule => ({
    pattern: regex,
    message: message || 'Invalid format',
  }),
};

// Predefined validators for common forms
export const userFormValidator = new FormValidator()
  .addRule('user_name', commonRules.required('Name is required'))
  .addRule('user_name', commonRules.minLength(2, 'Name must be at least 2 characters'))
  .addRule('user_email', commonRules.required('Email is required'))
  .addRule('user_email', commonRules.email())
  .addRule('user_password', commonRules.required('Password is required'))
  .addRule('user_password', commonRules.password())
  .addRule('user_phone_number', commonRules.phone());

export const loginFormValidator = new FormValidator()
  .addRule('identifier', commonRules.required('Email or username is required'))
  .addRule('user_password', commonRules.required('Password is required'));

export const roleFormValidator = new FormValidator()
  .addRule('role_name', commonRules.required('Role name is required'))
  .addRule('role_name', commonRules.minLength(2, 'Role name must be at least 2 characters'));

export const departmentFormValidator = new FormValidator()
  .addRule('department_name', commonRules.required('Department name is required'))
  .addRule('department_name', commonRules.minLength(2, 'Department name must be at least 2 characters'));





