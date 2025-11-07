require('dotenv').config();
const { pool } = require('./config/database');

async function createMissingTables() {
  try {
    console.log('🔧 Creating missing database tables...\n');
    
    const missingTables = [
      {
        name: 'StateCode',
        description: 'State Code master data table',
        columns: `
          id SERIAL PRIMARY KEY,
          state_code VARCHAR(10) NOT NULL UNIQUE,
          state_name VARCHAR(100) NOT NULL,
          country_code VARCHAR(3),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `
      },
      {
        name: 'GroupCode',
        description: 'Group Code master data table',
        columns: `
          id SERIAL PRIMARY KEY,
          group_code VARCHAR(20) NOT NULL UNIQUE,
          group_name VARCHAR(100) NOT NULL,
          group_type VARCHAR(50),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `
      },
      {
        name: 'ItemDetails',
        description: 'Item Details master data table',
        columns: `
          id SERIAL PRIMARY KEY,
          item_code VARCHAR(50) NOT NULL UNIQUE,
          item_name VARCHAR(200) NOT NULL,
          item_description TEXT,
          item_type VARCHAR(50),
          unit_of_measure VARCHAR(20),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `
      },
      {
        name: 'ChartofAccounts',
        description: 'Chart of Accounts master data table',
        columns: `
          id SERIAL PRIMARY KEY,
          account_code VARCHAR(20) NOT NULL UNIQUE,
          account_name VARCHAR(200) NOT NULL,
          account_type VARCHAR(50),
          parent_account_code VARCHAR(20),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `
      }
    ];
    
    for (const table of missingTables) {
      console.log(`📋 Creating table: ${table.name}`);
      
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS "${table.name}" (
          ${table.columns}
        )
      `;
      
      await pool.query(createTableQuery);
      
      // Insert some sample data
      const sampleDataQueries = {
        StateCode: `
          INSERT INTO "StateCode" (state_code, state_name, country_code) VALUES
          ('CA', 'California', 'USA'),
          ('NY', 'New York', 'USA'),
          ('TX', 'Texas', 'USA'),
          ('FL', 'Florida', 'USA')
          ON CONFLICT (state_code) DO NOTHING
        `,
        GroupCode: `
          INSERT INTO "GroupCode" (group_code, group_name, group_type) VALUES
          ('CUST', 'Customer Group', 'Business Partner'),
          ('VEND', 'Vendor Group', 'Business Partner'),
          ('EMP', 'Employee Group', 'Internal'),
          ('SUPP', 'Supplier Group', 'Business Partner')
          ON CONFLICT (group_code) DO NOTHING
        `,
        ItemDetails: `
          INSERT INTO "ItemDetails" (item_code, item_name, item_description, item_type, unit_of_measure) VALUES
          ('ITEM001', 'Sample Product 1', 'Description for sample product 1', 'Finished Goods', 'PCS'),
          ('ITEM002', 'Sample Product 2', 'Description for sample product 2', 'Raw Material', 'KG'),
          ('ITEM003', 'Sample Service 1', 'Description for sample service 1', 'Service', 'HRS')
          ON CONFLICT (item_code) DO NOTHING
        `,
        ChartofAccounts: `
          INSERT INTO "ChartofAccounts" (account_code, account_name, account_type, parent_account_code) VALUES
          ('1000', 'Assets', 'Asset', NULL),
          ('1100', 'Current Assets', 'Asset', '1000'),
          ('1200', 'Fixed Assets', 'Asset', '1000'),
          ('2000', 'Liabilities', 'Liability', NULL),
          ('3000', 'Equity', 'Equity', NULL)
          ON CONFLICT (account_code) DO NOTHING
        `
      };
      
      if (sampleDataQueries[table.name]) {
        await pool.query(sampleDataQueries[table.name]);
        console.log(`✅ ${table.name} table created with sample data`);
      } else {
        console.log(`✅ ${table.name} table created`);
      }
    }
    
    console.log('\n🔍 Verifying all tables exist...\n');
    
    // Verify all tables exist
    const result = await pool.query(`
      SELECT 
        sc."SubCategoryName",
        sc."Data_Table",
        CASE 
          WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = sc."Data_Table"
          ) THEN 'EXISTS'
          ELSE 'NOT FOUND'
        END as table_status
      FROM "SAP_SubCategories" sc
      ORDER BY sc."SubCategoryID"
    `);
    
    console.table(result.rows);
    
    const missingCount = result.rows.filter(row => row.table_status === 'NOT FOUND').length;
    
    if (missingCount === 0) {
      console.log('\n🎉 All tables are now created and ready!');
      console.log('✅ Your API endpoints should now work correctly.');
    } else {
      console.log(`\n⚠️  ${missingCount} tables are still missing.`);
    }
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  } finally {
    await pool.end();
  }
}

createMissingTables();
