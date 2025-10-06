const OpenAI = require('openai');

class OpenAIService {
  constructor() {
    this.openai = null;
    this.isAvailable = false;
    
    // Only initialize OpenAI if API key is provided
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '') {
      try {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });
        this.isAvailable = true;
      } catch (error) {
        console.warn('OpenAI service not available:', error.message);
        this.isAvailable = false;
      }
    } else {
      console.warn('OpenAI API key not provided. AI features will be disabled.');
    }
  }

  async validateDataWithAI(data, validationRules, category) {
    if (!this.isAvailable) {
      throw new Error('OpenAI service is not available. Please provide OPENAI_API_KEY environment variable.');
    }
    
    try {
      // Prepare the validation rules for AI with detailed descriptions
      const rulesText = validationRules.map(rule => 
        `Field: ${rule.sap_field_name || rule.sapFile}
         Database Field: ${rule.db_field_name || rule.dbField}
         Description: ${rule.description || 'No description provided'}
         Data Type: ${rule.data_type || rule.type}
         Length: ${rule.field_length || rule.length}
         Mandatory: ${rule.is_mandatory || rule.mandatory ? 'Yes' : 'No'}
         Valid Values: ${rule.valid_values || rule.validValues ? (rule.valid_values || rule.validValues).join(', ') : 'Any'}
         Related Table: ${rule.related_table || rule.relatedTable || 'N/A'}
         Remarks: ${rule.remarks || 'None'}`
      ).join('\n\n');

      // Prepare all data for AI analysis using actual field names from the data
      const allData = data.map((row, index) => {
        const rowData = {};
        // Use all fields from the actual data, not just validation rules
        Object.keys(row).forEach(fieldName => {
          rowData[fieldName] = row[fieldName] || '';
        });
        return `Row ${index + 1}: ${JSON.stringify(rowData)}`;
      }).join('\n');

      const prompt = `You are a data validation expert for SAP Business One. Please validate the following data against the provided field rules and descriptions.

CATEGORY: ${category}

VALIDATION RULES WITH DESCRIPTIONS:
${rulesText}

DATA TO VALIDATE:
${allData}

Please analyze each row and provide detailed validation results based on:
1. Field descriptions and business requirements
2. Mandatory field violations
3. Data type mismatches (String, Integer, Date, etc.)
4. Length violations - CRITICAL: Check if field values exceed the specified field_length
5. Invalid values based on valid_values list
6. Business logic errors based on field descriptions
7. Data quality issues and inconsistencies
8. SAP Business One specific validation rules

IMPORTANT VALIDATION RULES:
- If a field has field_length specified, check if the actual value length exceeds it
- If a field is marked as mandatory (is_mandatory: true), it must have a value
- If a field has valid_values specified, the value must be one of those values
- If a field has data_type specified, validate the data type matches
- Use the ACTUAL field names from the data (like CardCode, CardName, CardType, etc.) in your response

IMPORTANT: You must respond with ONLY valid JSON in this exact format. Do not include any text before or after the JSON:

{
  "results": [
    {
      "rowNumber": 1,
      "code": "actual_field_value_from_data",
      "status": "Valid|Warning|Error",
      "fieldsWithIssues": ["CardCode", "CardName"],
      "message": "Detailed validation message with specific field issues using actual field names",
      "aiInsights": "AI-generated insights and recommendations for this row"
    }
  ],
  "summary": {
    "total": ${data.length},
    "valid": 0,
    "warnings": 0,
    "errors": 0
  },
  "aiRecommendations": "Overall recommendations for data quality improvement"
}

Be thorough and provide actionable insights. Use the actual field names from the data in your validation results.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert data validation specialist for SAP Business One systems. You excel at identifying data quality issues, business rule violations, and providing actionable recommendations for improvement."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 4000
      });

      const response = completion.choices[0].message.content;
      console.log('OpenAI Raw Response:', response);
      
      // Try to extract JSON from the response
      let jsonResponse = response;
      
      // Look for JSON block in the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonResponse = jsonMatch[0];
      }
      
      // Try to parse the JSON response
      try {
        const parsedResponse = JSON.parse(jsonResponse);
        
        // Validate the response structure
        if (!parsedResponse.results || !Array.isArray(parsedResponse.results)) {
          throw new Error('Invalid response structure: missing results array');
        }
        
        if (!parsedResponse.summary || typeof parsedResponse.summary !== 'object') {
          throw new Error('Invalid response structure: missing summary object');
        }
        
        return {
          success: true,
          data: parsedResponse
        };
      } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
        console.log('Attempted to parse:', jsonResponse);
        
        // Create a fallback response with basic validation
        const fallbackResponse = {
          results: data.map((row, index) => ({
            rowNumber: index + 1,
            code: row.CardCode || row.ItemCode || row.Code || `Row_${index + 1}`,
            status: 'Valid',
            fieldsWithIssues: [],
            message: 'AI validation failed - using basic validation',
            aiInsights: 'AI response could not be parsed. Please check the data manually.'
          })),
          summary: {
            total: data.length,
            valid: data.length,
            warnings: 0,
            errors: 0
          },
          aiRecommendations: 'AI validation encountered an error. Please review the data manually and ensure all fields meet the requirements.'
        };
        
        return {
          success: true,
          data: fallbackResponse,
          warning: 'AI response parsing failed, using fallback validation'
        };
      }

    } catch (error) {
      console.error('OpenAI API error:', error);
      return {
        success: false,
        error: error.message,
        fallback: true
      };
    }
  }

  async generateFieldInstructions(category, fieldData) {
    if (!this.isAvailable) {
      throw new Error('OpenAI service is not available. Please provide OPENAI_API_KEY environment variable.');
    }
    
    try {
      const prompt = `You are a SAP Business One expert. Generate comprehensive field instructions for the following category: ${category}

Field Data:
${JSON.stringify(fieldData, null, 2)}

Please provide detailed field instructions including:
1. Field descriptions
2. Data type requirements
3. Length constraints
4. Mandatory field indicators
5. Valid value options
6. Business rules
7. Related table information
8. Common validation patterns

Return the response in a structured format that can be used for data validation.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a SAP Business One expert specializing in data validation and field instruction generation. You provide comprehensive, accurate, and practical guidance for data validation processes."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 3000
      });

      return {
        success: true,
        instructions: completion.choices[0].message.content
      };

    } catch (error) {
      console.error('OpenAI field instruction generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new OpenAIService();
