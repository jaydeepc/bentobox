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

        return await this.openai.chat.completions.create({
            model: "gpt-4-vision-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image_url",
                            image_url: {
                                url: document.content, // base64 image data
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
        const prompt = `Please analyze this document based on the following classification criteria: ${criteria}

        Provide your response in the following JSON format:
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

        Consider both visual elements (layout, logos, design) and textual content in your analysis.`;

        const completion = await this.analyzeDocument(document, prompt);
        const response = JSON.parse(completion.choices[0].message.content || '{}');

        return {
            classification: response.classification,
            confidence: response.confidence,
            alternatives: response.alternatives
        };
    }

    static async parseDocument(document: Document, schema: string): Promise<{
        fields: Record<string, string>;
        confidence: Record<string, number>;
    }> {
        const prompt = `Please extract information from this document based on the following schema: ${schema}

        Provide your response in the following JSON format:
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

        Consider both visual layout and textual content when extracting information.`;

        const completion = await this.analyzeDocument(document, prompt);
        const response = JSON.parse(completion.choices[0].message.content || '{}');

        return {
            fields: response.fields,
            confidence: response.confidence
        };
    }
}
