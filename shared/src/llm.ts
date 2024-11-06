import OpenAI from 'openai';
import { Document } from './types';

interface ExtractedData {
    fields: Record<string, string>;
    confidence: Record<string, number>;
}

interface ParsedResponse {
    fields?: Record<string, unknown>;
    confidence?: Record<string, unknown>;
}

export class LLMService {
    private static openai: OpenAI;

    static initialize(apiKey: string) {
        this.openai = new OpenAI({ apiKey });
    }

    private static normalizeFieldName(field: string): string {
        // Convert to lowercase and replace spaces/special chars with underscores
        return field
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_') // Replace special chars with underscore
            .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
            .replace(/_+/g, '_'); // Replace multiple underscores with single
    }

    private static validateAndNormalizeResponse(response: ParsedResponse, fieldsToExtract: string[]): ExtractedData {
        const result: ExtractedData = {
            fields: {},
            confidence: {}
        };

        // Ensure fields and confidence exist
        const fields = response.fields || {};
        const confidence = response.confidence || {};

        // Process each expected field
        fieldsToExtract.forEach(field => {
            const normalizedField = this.normalizeFieldName(field);
            const value = fields[normalizedField];
            const confidenceValue = confidence[normalizedField];

            // Validate and convert field value to string
            result.fields[normalizedField] = typeof value === 'string' && value.trim() !== '' ? 
                value : 'Not found';
            
            // Validate and convert confidence value to number
            result.confidence[normalizedField] = typeof confidenceValue === 'number' && 
                confidenceValue >= 0 && 
                confidenceValue <= 1 ? 
                confidenceValue : 0.1;
        });

        return result;
    }

    private static async analyzeDocument(document: Document, prompt: string, retryCount = 0): Promise<OpenAI.Chat.ChatCompletion> {
        if (!this.openai) {
            throw new Error('OpenAI client not initialized. Call LLMService.initialize() first.');
        }

        try {
            const imageUrl = document.content.startsWith('data:') 
                ? document.content 
                : `data:${document.type === 'pdf' ? 'application/pdf' : 'image/jpeg'};base64,${document.content}`;

            return await this.openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: `You are a document analysis expert specializing in both verification and information extraction.
                        Your expertise includes:
                        - Document authenticity verification
                        - Security feature analysis
                        - Information extraction
                        - Pattern recognition
                        
                        Key Guidelines:
                        1. Be thorough in analysis
                        2. Consider document context
                        3. Look for alternative data formats
                        4. Provide detailed reasoning
                        5. Use confidence scores appropriately
                        6. Extract partial information when complete data isn't available
                        7. Always respond with valid JSON only, no additional text or formatting
                        8. Use snake_case for all field names (lowercase with underscores)
                        9. Never return empty strings, use "Not found" if information is missing`
                    },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            {
                                type: "image_url",
                                image_url: {
                                    url: imageUrl,
                                    detail: "high"
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 4096
            });
        } catch (error) {
            if (retryCount < 2) {
                console.log(`Retrying analysis, attempt ${retryCount + 1}`);
                return this.analyzeDocument(document, prompt, retryCount + 1);
            }
            throw error;
        }
    }

    static async parseDocument(document: Document, schema: string, retryCount = 0): Promise<ExtractedData> {
        try {
            // First, analyze the schema to identify the fields to extract
            const schemaAnalysisPrompt = `Analyze this schema and list the fields to extract: ${schema}
            
            Convert the field names to snake_case format and respond with ONLY a JSON array of field names, no additional text or formatting. For example:
            ["invoice_number", "date_of_birth", "phone_number"]
            
            Rules:
            1. Convert field names to snake_case (lowercase with underscores)
            2. Remove any special characters except underscores
            3. Only include fields that are explicitly requested
            4. Do not include any explanatory text
            5. Do not include any fields that weren't requested
            6. Ensure consistent field naming across retries`;

            const schemaCompletion = await this.openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are a schema analyzer. Extract field names from the schema, convert them to snake_case format, and respond with valid JSON only."
                    },
                    {
                        role: "user",
                        content: schemaAnalysisPrompt
                    }
                ]
            });

            const schemaContent = schemaCompletion.choices[0].message.content || '[]';
            const cleanedSchemaContent = schemaContent.replace(/```json\s*|\s*```/g, '').trim();
            const parsedFields = JSON.parse(cleanedSchemaContent);
            
            // Validate that parsedFields is an array of strings
            if (!Array.isArray(parsedFields)) {
                throw new Error('Schema analysis did not return an array');
            }
            
            // Normalize field names to ensure consistency
            const fieldsToExtract = parsedFields.map(field => {
                if (typeof field !== 'string') {
                    throw new Error('Schema analysis returned non-string field name');
                }
                return this.normalizeFieldName(field);
            }).filter(field => field.length > 0); // Remove any empty field names

            if (fieldsToExtract.length === 0) {
                throw new Error('No valid fields identified in schema');
            }

            // Now use these fields in the document analysis prompt
            const extractionPrompt = `Extract the following information from this document: ${fieldsToExtract.join(', ')}

            Context: ${schema}

            Important Instructions:
            1. Look for each field in standard locations
            2. Consider variations in format
            3. Extract partial information if complete data isn't clear
            4. Never return empty values, use "Not found" if information is missing
            5. Provide confidence scores based on clarity of extraction

            You must respond with ONLY a JSON object in this exact format, no additional text or formatting:
            {
                "fields": {
                    ${fieldsToExtract.map((field: string) => `"${field}": "extracted value or Not found"`).join(',\n                    ')}
                },
                "confidence": {
                    ${fieldsToExtract.map((field: string) => `"${field}": 0.95`).join(',\n                    ')}
                }
            }

            Guidelines for extraction:
            - Look for information in standard locations first
            - Check for alternative formats if standard format isn't found
            - Extract partial information rather than returning empty
            - Use lower confidence scores for uncertain extractions
            - Consider document type and common layouts
            - Look for contextual clues if direct information isn't clear
            - Never return empty strings, always provide a value or "Not found"`;

            const completion = await this.analyzeDocument(document, extractionPrompt);
            const content = completion.choices[0].message.content || '{}';
            
            // Clean the content to ensure it's valid JSON
            const cleanedContent = content.replace(/```json\s*|\s*```/g, '').trim();
            const response: ParsedResponse = JSON.parse(cleanedContent);

            // Validate and normalize the response
            const result = this.validateAndNormalizeResponse(response, fieldsToExtract);

            // Check if we got empty results and should retry
            const hasEmptyFields = Object.values(result.fields).some(value => !value || value === '');
            if (hasEmptyFields && retryCount < 2) {
                console.log('Some fields were empty, retrying extraction...');
                return this.parseDocument(document, schema, retryCount + 1);
            }

            return result;
        } catch (error) {
            console.error('Error in parseDocument:', error);
            if (retryCount < 2) {
                console.log('Retrying due to error...');
                return this.parseDocument(document, schema, retryCount + 1);
            }
            // If all retries failed, return empty results with low confidence
            return {
                fields: {},
                confidence: {}
            };
        }
    }
}
