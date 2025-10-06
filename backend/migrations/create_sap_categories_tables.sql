-- Create SAP_MainCategories table
CREATE TABLE IF NOT EXISTS "SAP_MainCategories" (
    "MainCategoryID" SERIAL PRIMARY KEY,
    "MainCategoryName" VARCHAR(255) NOT NULL UNIQUE,
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create SAP_SubCategories table
CREATE TABLE IF NOT EXISTS "SAP_SubCategories" (
    "SubCategoryID" SERIAL PRIMARY KEY,
    "MainCategoryID" INTEGER NOT NULL,
    "SubCategoryName" VARCHAR(255) NOT NULL,
    "TemplatePath" TEXT,
    "SamplePath" TEXT,
    "Data_Table" VARCHAR(255),
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("MainCategoryID") REFERENCES "SAP_MainCategories"("MainCategoryID") ON DELETE CASCADE
);

-- Insert sample data for Main Categories
INSERT INTO "SAP_MainCategories" ("MainCategoryName") VALUES
('Business Partner Master Data'),
('Item Master Data'),
('Financial Data'),
('Set Up Data')
ON CONFLICT ("MainCategoryName") DO NOTHING;

-- Insert sample data for Sub Categories
-- Business Partner Master Data (MainCategoryID = 1)
INSERT INTO "SAP_SubCategories" ("MainCategoryID", "SubCategoryName", "TemplatePath", "SamplePath", "Data_Table") VALUES
(1, 'General Info', 'D:\Hari\DTW Excel Templates&Sample Files\Template files\General Info.xlsx', 'D:\Hari\DTW Excel Templates&Sample Files\Sample files\General Info.xlsx', 'bp_general_info'),
(1, 'Address', 'D:\Hari\DTW Excel Templates&Sample Files\Template files\Address.xlsx', 'D:\Hari\DTW Excel Templates&Sample Files\Sample files\Address.xlsx', 'bp_address_info'),
(1, 'Tax Info', 'D:\Hari\DTW Excel Templates&Sample Files\Template files\Tax Info.xlsx', 'D:\Hari\DTW Excel Templates&Sample Files\Sample files\Tax Info.xlsx', 'bp_tax_info'),
(1, 'Contact Person', 'D:\Hari\DTW Excel Templates&Sample Files\Template files\Contact Person.xlsx', 'D:\Hari\DTW Excel Templates&Sample Files\Sample files\Contact Person.xlsx', 'bp_contact_person'),
(1, 'State Code', 'D:\Hari\DTW Excel Templates&Sample Files\Template files\State Code.xlsx', 'D:\Hari\DTW Excel Templates&Sample Files\Sample files\State Code.xlsx', 'bp_state_codes'),
(1, 'Group Code', 'D:\Hari\DTW Excel Templates&Sample Files\Template files\Group Code.xlsx', 'D:\Hari\DTW Excel Templates&Sample Files\Sample files\Group Code.xlsx', 'bp_group_codes'),
(1, 'Groups', 'D:\Hari\DTW Excel Templates&Sample Files\Template files\Groups.xlsx', 'D:\Hari\DTW Excel Templates&Sample Files\Sample files\Groups.xlsx', 'Groups')
ON CONFLICT DO NOTHING;

-- Item Master Data (MainCategoryID = 2)
INSERT INTO "SAP_SubCategories" ("MainCategoryID", "SubCategoryName", "TemplatePath", "SamplePath", "Data_Table") VALUES
(2, 'Item Details', 'D:\Hari\DTW Excel Templates&Sample Files\Template files\Item Details.xlsx', 'D:\Hari\DTW Excel Templates&Sample Files\Sample files\Item Details.xlsx', 'item_details'),
(2, 'Pricing', 'D:\Hari\DTW Excel Templates&Sample Files\Template files\Pricing.xlsx', 'D:\Hari\DTW Excel Templates&Sample Files\Sample files\Pricing.xlsx', 'item_pricing'),
(2, 'Inventory', 'D:\Hari\DTW Excel Templates&Sample Files\Template files\Inventory.xlsx', 'D:\Hari\DTW Excel Templates&Sample Files\Sample files\Inventory.xlsx', 'item_inventory'),
(2, 'Categories', 'D:\Hari\DTW Excel Templates&Sample Files\Template files\Categories.xlsx', 'D:\Hari\DTW Excel Templates&Sample Files\Sample files\Categories.xlsx', 'item_categories'),
(2, 'Specifications', 'D:\Hari\DTW Excel Templates&Sample Files\Template files\Specifications.xlsx', 'D:\Hari\DTW Excel Templates&Sample Files\Sample files\Specifications.xlsx', 'item_specifications')
ON CONFLICT DO NOTHING;

-- Financial Data (MainCategoryID = 3)
INSERT INTO "SAP_SubCategories" ("MainCategoryID", "SubCategoryName", "TemplatePath", "SamplePath", "Data_Table") VALUES
(3, 'Chart of Accounts', 'D:\Hari\DTW Excel Templates&Sample Files\Template files\Chart of Accounts.xlsx', 'D:\Hari\DTW Excel Templates&Sample Files\Sample files\Chart of Accounts.xlsx', 'chart_of_accounts'),
(3, 'GL Accounts', 'D:\Hari\DTW Excel Templates&Sample Files\Template files\GL Accounts.xlsx', 'D:\Hari\DTW Excel Templates&Sample Files\Sample files\GL Accounts.xlsx', 'gl_accounts'),
(3, 'Cost Centers', 'D:\Hari\DTW Excel Templates&Sample Files\Template files\Cost Centers.xlsx', 'D:\Hari\DTW Excel Templates&Sample Files\Sample files\Cost Centers.xlsx', 'cost_centers'),
(3, 'Profit Centers', 'D:\Hari\DTW Excel Templates&Sample Files\Template files\Profit Centers.xlsx', 'D:\Hari\DTW Excel Templates&Sample Files\Sample files\Profit Centers.xlsx', 'profit_centers')
ON CONFLICT DO NOTHING;

-- Set Up Data (MainCategoryID = 4)
INSERT INTO "SAP_SubCategories" ("MainCategoryID", "SubCategoryName", "TemplatePath", "SamplePath", "Data_Table") VALUES
(4, 'Company Settings', 'D:\Hari\DTW Excel Templates&Sample Files\Template files\Company Settings.xlsx', 'D:\Hari\DTW Excel Templates&Sample Files\Sample files\Company Settings.xlsx', 'company_settings'),
(4, 'User Management', 'D:\Hari\DTW Excel Templates&Sample Files\Template files\User Management.xlsx', 'D:\Hari\DTW Excel Templates&Sample Files\Sample files\User Management.xlsx', 'user_management'),
(4, 'System Configuration', 'D:\Hari\DTW Excel Templates&Sample Files\Template files\System Configuration.xlsx', 'D:\Hari\DTW Excel Templates&Sample Files\Sample files\System Configuration.xlsx', 'system_configuration'),
(4, 'Integration Settings', 'D:\Hari\DTW Excel Templates&Sample Files\Template files\Integration Settings.xlsx', 'D:\Hari\DTW Excel Templates&Sample Files\Sample files\Integration Settings.xlsx', 'integration_settings')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subcategories_maincategoryid ON "SAP_SubCategories"("MainCategoryID");
CREATE INDEX IF NOT EXISTS idx_maincategories_name ON "SAP_MainCategories"("MainCategoryName");
