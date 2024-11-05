import OpenAI from 'openai';
import { Document } from './types';

export class LLMService {
    private static openai: OpenAI;

    static initialize(apiKey: string) {
        this.openai = new OpenAI({ apiKey });
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
                        6. Extract partial information when complete data isn't available`
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

    static async classifyDocument(document: Document, criteria: string): Promise<{
        is_authentic: boolean;
        authenticity_confidence: number;
        authenticity_reason: string;
        classification: string;
        confidence: number;
        classification_reason: string;
        alternatives: Array<{ label: string; confidence: number }>;
    }> {
        const prompt = `Analyze this document's authenticity and classify it according to the given criteria.

        Document Analysis Steps:
        1. Verify core document features:
           - Standard layout and formatting
           - Expected security elements
           - Information consistency
           - Quality of printing/imaging

        2. Consider document context:
           - Purpose of the document
           - Standard features for this document type
           - Expected security measures

        3. Evaluate authenticity based on:
           - Presence of required security features
           - Consistency with standard templates
           - Quality and placement of official elements
           - Information format and validity

        4. Classify according to: ${criteria}

        Respond with ONLY a JSON object in this format:
        {
            "is_authentic": true/false,
            "authenticity_confidence": 0.95,
            "authenticity_reason": "Detailed explanation of authenticity assessment",
            "classification": "document type",
            "confidence": 0.95,
            "classification_reason": "Specific reasons for classification",
            "alternatives": [
                {
                    "label": "alternative classification",
                    "confidence": 0.45
                }
            ]
        }

        Important Guidelines:
        - Consider document age and condition
        - Account for scanning/photo quality
        - Look for definitive security features
        - Provide classification even if authenticity is uncertain
        - Use confidence scores to reflect uncertainty
        - Give detailed reasoning for decisions`;

        try {
            const completion = await this.analyzeDocument(document, prompt);
            const content = completion.choices[0].message.content || '{}';
            
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : content;
            
            const response = JSON.parse(jsonStr);

            return {
                is_authentic: response.is_authentic ?? true,
                authenticity_confidence: response.authenticity_confidence ?? 0.5,
                authenticity_reason: response.authenticity_reason || "Analysis considers document condition and reproduction quality.",
                classification: response.classification || "Unknown",
                confidence: response.confidence ?? 0.5,
                classification_reason: response.classification_reason || "Classification based on visible characteristics.",
                alternatives: response.alternatives || []
            };
        } catch (error) {
            console.error('Error in document classification:', error);
            return {
                is_authentic: true,
                authenticity_confidence: 0.5,
                authenticity_reason: "Limited analysis completed. Consider document condition and reproduction quality.",
                classification: "Unknown",
                confidence: 0.5,
                classification_reason: "Classification based on visible characteristics.",
                alternatives: []
            };
        }
    }

    static async parseDocument(document: Document, schema: string, retryCount = 0): Promise<{
        fields: Record<string, string>;
        confidence: Record<string, number>;
    }> {
        try {
            // First, analyze the schema to identify the fields to extract
            const schemaAnalysisPrompt = `Analyze this schema and list the fields to extract: ${schema}
            
            You must respond with ONLY a JSON array of field names. For example:
            ["invoice_number", "date", "total_amount"]
            
            Rules:
            1. Convert the field names to snake_case
            2. Only include fields that are explicitly requested
            3. Do not include any explanatory text
            4. Do not include any fields that weren't requested`;

            const schemaCompletion = await this.openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are a schema analyzer. Extract field names from the schema."
                    },
                    {
                        role: "user",
                        content: schemaAnalysisPrompt
                    }
                ]
            });

            const fieldsToExtract: string[] = JSON.parse(schemaCompletion.choices[0].message.content || '[]');

            if (fieldsToExtract.length === 0) {
                throw new Error('No fields identified in schema');
            }

            // Now use these fields in the document analysis prompt
            const extractionPrompt = `Extract the following information from this document: ${fieldsToExtract.join(', ')}

            Context: ${schema}

            Important Instructions:
            1. Look for each field in standard locations
            2. Consider variations in format
            3. Extract partial information if complete data isn't clear
            4. Never return empty values without trying alternatives
            5. Provide confidence scores based on clarity of extraction

            You must respond with ONLY a JSON object in this exact format:
            {
                "fields": {
                    ${fieldsToExtract.map((field: string) => `"${field}": "extracted value"`).join(',\n                    ')}
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
            - Look for contextual clues if direct information isn't clear`;

            const completion = await this.analyzeDocument(document, extractionPrompt);
            const content = completion.choices[0].message.content || '{}';
            
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : content;
            
            const response = JSON.parse(jsonStr);

            // Validate the response
            const fields = response.fields || {};
            const confidence = response.confidence || {};

            // Check if we got empty results and should retry
            const hasEmptyFields = Object.values(fields).some(value => !value || value === '');
            if (hasEmptyFields && retryCount < 2) {
                console.log('Some fields were empty, retrying extraction...');
                return this.parseDocument(document, schema, retryCount + 1);
            }

            // Ensure all requested fields are present
            const result = {
                fields: {} as Record<string, string>,
                confidence: {} as Record<string, number>
            };

            fieldsToExtract.forEach(field => {
                result.fields[field] = fields[field] || 'Not found';
                result.confidence[field] = confidence[field] || 0.1;
            });

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
