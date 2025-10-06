-- Create sap_bp_master_instructions table for static functionality
CREATE TABLE IF NOT EXISTS "sap_bp_master_instructions" (
    id SERIAL PRIMARY KEY,
    sap_field_name VARCHAR(255),
    db_field_name VARCHAR(255),
    description TEXT,
    data_type VARCHAR(100),
    field_length INTEGER,
    is_mandatory BOOLEAN DEFAULT FALSE,
    valid_values TEXT,
    related_table VARCHAR(255),
    remarks TEXT,
    instruction_image_path TEXT,
    table_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for Business Partner Master Data
INSERT INTO "sap_bp_master_instructions" (
    sap_field_name, db_field_name, description, data_type, field_length, 
    is_mandatory, valid_values, related_table, remarks, table_name
) VALUES
('CardCode', 'CardCode', 'Business Partner Code', 'string', 15, true, NULL, NULL, 'Unique identifier for the business partner', 'General Info'),
('CardName', 'CardName', 'Business Partner Name', 'string', 100, true, NULL, NULL, 'Full name of the business partner', 'General Info'),
('CardType', 'CardType', 'Business Partner Type', 'enum', NULL, true, 'cCustomer,cSupplier,cLid', NULL, 'Type of business partner', 'General Info'),
('GroupCode', 'GroupCode', 'Group Code', 'long', 6, true, NULL, 'OCRG', 'Group classification code', 'General Info'),
('Phone1', 'Phone1', 'Primary Phone Number', 'string', 100, false, NULL, NULL, 'Main contact phone number', 'General Info'),
('Phone2', 'Phone2', 'Secondary Phone Number', 'string', 50, false, NULL, NULL, 'Alternative phone number', 'General Info'),
('Fax', 'Fax', 'Fax Number', 'string', 50, false, NULL, NULL, 'Fax number for the business partner', 'General Info'),
('Email', 'Email', 'Email Address', 'string', 100, false, NULL, NULL, 'Primary email address', 'General Info'),
('Notes', 'Notes', 'Remarks', 'string', 100, false, NULL, NULL, 'Additional notes or comments', 'General Info'),
('ZipCode', 'ZipCode', 'Postal Code', 'string', 20, false, NULL, NULL, 'Postal/ZIP code', 'Address'),
('Address', 'Address', 'Street Address', 'string', 100, false, NULL, NULL, 'Street address line', 'Address'),
('City', 'City', 'City Name', 'string', 100, false, NULL, NULL, 'City name', 'Address'),
('State', 'State', 'State/Province', 'string', 100, false, NULL, NULL, 'State or province', 'Address'),
('Country', 'Country', 'Country Code', 'string', 3, false, NULL, NULL, 'ISO country code', 'Address'),
('TaxId', 'TaxId', 'Tax Identification Number', 'string', 50, false, NULL, NULL, 'Tax ID for the business partner', 'Tax Info'),
('VatNumber', 'VatNumber', 'VAT Number', 'string', 50, false, NULL, NULL, 'VAT registration number', 'Tax Info'),
('ContactPerson', 'ContactPerson', 'Contact Person Name', 'string', 90, false, NULL, NULL, 'Name of the contact person', 'Contact Person'),
('MailAddress', 'MailAddress', 'Mailing Address', 'string', 100, false, NULL, NULL, 'Mailing address', 'Contact Person'),
('MailZipCode', 'MailZipCode', 'Mailing Postal Code', 'string', 20, false, NULL, NULL, 'Mailing postal code', 'Contact Person')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sap_bp_master_instructions_sap_field_name ON "sap_bp_master_instructions"(sap_field_name);
CREATE INDEX IF NOT EXISTS idx_sap_bp_master_instructions_table_name ON "sap_bp_master_instructions"(table_name);
