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
            model: "gpt-4o",
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
        const prompt = `Extract information from this document based on this schema: ${schema}

        You must respond with ONLY a JSON object in this exact format:
        {
            "fields": {
                "fieldName": "extracted value"
            },
            "confidence": {
                "fieldName": 0.95
            },
            "reasoning": {
                "fieldName": "explanation of extraction"
            }
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
