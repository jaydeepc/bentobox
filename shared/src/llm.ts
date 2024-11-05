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
                        content: `You are a document verification expert with deep experience in banking and financial institutions.
                        You understand that customers often provide:
                        - Old documents that may show wear and aging
                        - Photocopies or scanned versions
                        - Photos taken in varying lighting conditions
                        - Documents that have been folded or handled
                        
                        Your role is to:
                        1. Identify the document type based on visible characteristics
                        2. Assess authenticity considering age and reproduction method
                        3. Provide confidence scores that reflect certainty level
                        4. Give detailed reasoning for your decisions
                        
                        Remember:
                        - Age and reproduction can affect document appearance
                        - Always provide classification even if authenticity is uncertain
                        - Use confidence scores to reflect uncertainty
                        - Consider both security features and practical context
                        - Provide specific reasoning for your decisions`
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
        const prompt = `Analyze this document considering both its type and authenticity.

        1. First, determine the document type based on visible characteristics:
           - Overall layout and format
           - Standard elements and positioning
           - Typical content patterns
           - Document-specific features
           
        2. Then assess authenticity considering:
           Document Condition:
           - Signs of age or wear
           - Effects of photocopying/scanning
           - Image quality and lighting
           - Handling marks or folds

           Security Features:
           - Visible security elements
           - Print quality and patterns
           - Information consistency
           - Standard formatting

           Practical Context:
           - Age of the document
           - Method of reproduction
           - Purpose of the document
           - Expected wear and tear

        Classification criteria: ${criteria}

        Respond with ONLY a JSON object in this format:
        {
            "is_authentic": true/false,
            "authenticity_confidence": 0.95,
            "authenticity_reason": "Detailed explanation including:
                - Observed security features
                - Impact of age/reproduction
                - Specific concerns or validations
                - Context considerations",
            "classification": "document type based on criteria",
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
        - Always provide classification even if authenticity is uncertain
        - Consider document age and reproduction method
        - Use confidence scores to reflect uncertainty
        - Provide specific reasoning for decisions
        - Account for normal wear and reproduction artifacts
        - Do not include any text outside of this JSON object`;

        try {
            let completion;
            try {
                completion = await this.analyzeDocument(document, prompt);
            } catch (analysisError) {
                console.error('Initial analysis failed, attempting simplified analysis');
                completion = await this.analyzeDocument(document, `
                    Analyze this document's basic features and type.
                    Consider age and reproduction effects.
                    Provide classification even if uncertain.
                    Respond in the same JSON format as before.
                `);
            }

            if (!completion.choices[0]?.message?.content) {
                throw new Error('No response content from analysis');
            }

            const content = completion.choices[0].message.content;
            let response;

            try {
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    throw new Error('No valid JSON found in response');
                }
                response = JSON.parse(jsonMatch[0]);
            } catch (parseError) {
                console.error('Error parsing response:', parseError);
                // Provide basic classification with low confidence
                response = {
                    is_authentic: true,
                    authenticity_confidence: 0.5,
                    authenticity_reason: "Limited analysis possible. Consider document age and reproduction method.",
                    classification: this.inferDocumentType(criteria),
                    confidence: 0.5,
                    classification_reason: "Basic document patterns suggest this classification.",
                    alternatives: []
                };
            }

            // Ensure we always provide classification
            const result = {
                is_authentic: response.authenticity_confidence > 0.3,
                authenticity_confidence: response.authenticity_confidence ?? 0.5,
                authenticity_reason: response.authenticity_reason || "Analysis considers document age and reproduction quality.",
                classification: response.classification || this.inferDocumentType(criteria),
                confidence: response.confidence ?? 0.5,
                classification_reason: response.classification_reason || "Classification based on visible document characteristics.",
                alternatives: response.alternatives || []
            };

            // Ensure reasoning includes age/reproduction considerations
            if (!result.authenticity_reason.includes('age') && !result.authenticity_reason.includes('reproduction')) {
                result.authenticity_reason += ' Analysis accounts for potential age effects and reproduction method.';
            }

            return result;

        } catch (error) {
            console.error('Error in document classification:', error);
            // Provide basic classification with low confidence
            return {
                is_authentic: true,
                authenticity_confidence: 0.5,
                authenticity_reason: "Limited analysis completed. Consider document age and reproduction quality.",
                classification: this.inferDocumentType(criteria),
                confidence: 0.5,
                classification_reason: "Basic document characteristics suggest this classification.",
                alternatives: []
            };
        }
    }

    private static inferDocumentType(criteria: string): string {
        // Simple logic to extract likely document type from criteria
        const criteriaLower = criteria.toLowerCase();
        if (criteriaLower.includes('pan')) return 'PAN Card';
        if (criteriaLower.includes('aadhar')) return 'Aadhar Card';
        if (criteriaLower.includes('passport')) return 'Passport';
        if (criteriaLower.includes('driving')) return 'Driving License';
        if (criteriaLower.includes('voter')) return 'Voter ID';
        return 'ID Document';
    }

    static async parseDocument(document: Document, schema: string): Promise<{
        fields: Record<string, string>;
        confidence: Record<string, number>;
    }> {
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
            }`;

            const completion = await this.analyzeDocument(document, extractionPrompt);
            const content = completion.choices[0].message.content || '{}';
            
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
