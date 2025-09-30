const OpenAI = require('openai');

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async validateDataWithAI(data, validationRules, category) {
    try {
      // Prepare the validation rules for AI with detailed descriptions
      const rulesText = validationRules.map(rule => 
        `Field: ${rule.sapFile}
         Database Field: ${rule.dbField}
         Description: ${rule.description || 'No description provided'}
         Data Type: ${rule.type}
         Length: ${rule.length}
         Mandatory: ${rule.mandatory ? 'Yes' : 'No'}
         Valid Values: ${rule.validValues ? rule.validValues.join(', ') : 'Any'}
         Related Table: ${rule.relatedTable || 'N/A'}
         Remarks: ${rule.remarks || 'None'}`
      ).join('\n\n');

      // Prepare all data for AI analysis (not just sample)
      const allData = data.map((row, index) => {
        const rowData = {};
        validationRules.forEach(rule => {
          rowData[rule.sapFile] = row[rule.sapFile] || '';
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
4. Length violations
5. Invalid values based on valid_values list
6. Business logic errors based on field descriptions
7. Data quality issues and inconsistencies
8. SAP Business One specific validation rules

For each row, return results in this JSON format:
{
  "results": [
    {
      "rowNumber": 1,
      "code": "unique_identifier_from_first_field",
      "status": "Valid|Warning|Error",
      "fieldsWithIssues": ["field1", "field2"],
      "message": "Detailed error description with specific field issues",
      "aiInsights": "AI-generated insights and recommendations for this row"
    }
  ],
  "summary": {
    "total": ${data.length},
    "valid": 0,
    "warnings": 0,
    "errors": 0
  },
  "aiRecommendations": "Overall recommendations for data quality improvement based on field descriptions and SAP Business One best practices"
}

Be thorough and provide actionable insights. Focus on the field descriptions to understand business context and validate accordingly.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
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
      
      // Try to parse the JSON response
      try {
        const parsedResponse = JSON.parse(response);
        return {
          success: true,
          data: parsedResponse
        };
      } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
        console.log('Raw response:', response);
        
        // Fallback to basic validation if AI response is not parseable
        return {
          success: false,
          error: 'Failed to parse AI response',
          fallback: true
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
        model: "gpt-4",
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
