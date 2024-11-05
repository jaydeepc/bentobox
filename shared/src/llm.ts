import OpenAI from 'openai';
import { Document } from './types';

export class LLMService {
    private static openai: OpenAI;

    static initialize(apiKey: string) {
        this.openai = new OpenAI({ apiKey });
    }

    private static async analyzeDocument(document: Document, prompt: string): Promise<OpenAI.Chat.ChatCompletion> {
        if (!this.openai) {
            throw new Error('OpenAI client not initialized. Call LLMService.initialize() first.');
        }

        // Convert base64 to data URL if needed
        const imageUrl = document.content.startsWith('data:') 
            ? document.content 
            : `data:${document.type === 'pdf' ? 'application/pdf' : 'image/jpeg'};base64,${document.content}`;

        return await this.openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a document analysis assistant. Always respond in valid JSON format according to the specified schema."
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
    }

    static async classifyDocument(document: Document, criteria: string): Promise<{
        classification: string;
        confidence: number;
        alternatives: Array<{ label: string; confidence: number }>;
    }> {
        const prompt = `Analyze this document based on these criteria: ${criteria}

        You must respond with ONLY a JSON object in this exact format:
        {
            "classification": "primary classification",
            "confidence": 0.95,
            "reasoning": "explanation of classification",
            "alternatives": [
                {
                    "label": "alternative classification",
                    "confidence": 0.45,
                    "reasoning": "explanation"
                }
            ]
        }

        Do not include any other text or explanation outside of this JSON object.`;

        try {
            const completion = await this.analyzeDocument(document, prompt);
            const content = completion.choices[0].message.content || '{}';
            
            // Try to extract JSON if the response contains additional text
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : content;
            
            const response = JSON.parse(jsonStr);

            return {
                classification: response.classification || 'Unknown',
                confidence: response.confidence || 0,
                alternatives: response.alternatives || []
            };
        } catch (error) {
            console.error('Error parsing classification response:', error);
            return {
                classification: 'Error',
                confidence: 0,
                alternatives: []
            };
        }
    }

    static async parseDocument(document: Document, schema: string): Promise<{
        fields: Record<string, string>;
        confidence: Record<string, number>;
    }> {
        // First, analyze the schema to identify the fields to extract
        const schemaAnalysisPrompt = `Analyze this schema and list the fields to extract: ${schema}
        
        You must respond with ONLY a JSON array of field names. For example:
        ["invoice_number", "date", "total_amount"]
        
        Rules:
        1. Convert the field names to snake_case
        2. Only include fields that are explicitly requested
        3. Do not include any explanatory text
        4. Do not include any fields that weren't requested`;

        try {
            const schemaCompletion = await this.openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are a schema analyzer. Extract field names from the given schema."
                    },
                    {
                        role: "user",
                        content: schemaAnalysisPrompt
                    }
                ]
            });

            const fieldsToExtract: string[] = JSON.parse(schemaCompletion.choices[0].message.content || '[]');

            // Now use these fields in the document analysis prompt
            const extractionPrompt = `Extract the following fields from this document: ${fieldsToExtract.join(', ')}

            Schema details: ${schema}

            You must respond with ONLY a JSON object containing exactly these fields:
            {
                "fields": {
                    ${fieldsToExtract.map((field: string) => `"${field}": "extracted value"`).join(',\n                    ')}
                },
                "confidence": {
                    ${fieldsToExtract.map((field: string) => `"${field}": 0.95`).join(',\n                    ')}
                }
            }

            Important:
            1. Only extract the specified fields
            2. For each field, provide a confidence score between 0 and 1
            3. If a field cannot be found, do not include it in the response
            4. Do not add any fields that weren't requested
            5. Do not include any other text or explanation outside of this JSON object`;

            const completion = await this.analyzeDocument(document, extractionPrompt);
            const content = completion.choices[0].message.content || '{}';
            
            // Try to extract JSON if the response contains additional text
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : content;
            
            const response = JSON.parse(jsonStr);

            return {
                fields: response.fields || {},
                confidence: response.confidence || {}
            };
        } catch (error) {
            console.error('Error parsing document response:', error);
            return {
                fields: {},
                confidence: {}
            };
        }
    }
}
