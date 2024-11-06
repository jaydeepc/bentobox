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

interface ClassificationResponse {
    is_authentic: boolean;
    authenticity_confidence: number;
    authenticity_reason: string;
    classification: string;
    confidence: number;
    classification_reason: string;
    alternatives: Array<{ label: string; confidence: number }>;
}

export class LLMService {
    private static openai: OpenAI;

    static initialize(apiKey: string) {
        this.openai = new OpenAI({ apiKey });
    }

    private static normalizeFieldName(field: string): string {
        return field
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '')
            .replace(/_+/g, '_');
    }

    private static validateAndNormalizeResponse(response: ParsedResponse, fieldsToExtract: string[]): ExtractedData {
        const result: ExtractedData = {
            fields: {},
            confidence: {}
        };

        const responseFields = response.fields || {};
        const responseConfidence = response.confidence || {};

        fieldsToExtract.forEach(field => {
            const normalizedField = this.normalizeFieldName(field);
            const value = responseFields[normalizedField];
            const confidenceValue = responseConfidence[normalizedField];

            result.fields[normalizedField] = typeof value === 'string' && value.trim() !== '' ? 
                value : 'Not found';
            
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
                response_format: { "type": "json_object" },
                messages: [
                    {
                        role: "system",
                        content: `You are a document analysis expert with two distinct roles:

                        ROLE 1: DOCUMENT CLASSIFIER
                        Your first task is to identify the document type based on visual layout and content,
                        regardless of authenticity.

                        Document Types (Use EXACTLY these names):
                        - AADHAAR
                        - PAN CARD
                        - VOTER ID
                        - DRIVING LICENSE
                        - PASSPORT
                        - BANK STATEMENT
                        - TAX FORM
                        - INVOICE
                        - CERTIFICATE
                        - TRANSCRIPT
                        - MARKSHEET
                        - BUSINESS LETTER
                        - CONTRACT
                        - REPORT

                        Classification Rules:
                        1. Use EXACT names from the list above
                        2. Do not add prefixes or categories
                        3. Match user's requested type if provided
                        4. Be consistent in naming across runs

                        Classification Confidence Rules:
                        - 1.0: Perfect match with all elements clearly visible
                        - 0.95-0.99: Almost perfect match with tiny uncertainties
                        - 0.9-0.94: Very clear match with minor elements unclear
                        - 0.8-0.89: Clear match with some elements missing
                        - 0.6-0.79: Basic match with several elements missing
                        - 0.4-0.59: Uncertain match with major elements missing
                        - 0.0-0.39: Cannot confidently identify

                        ROLE 2: AUTHENTICITY VERIFIER
                        Your second task is to verify document authenticity,
                        completely separate from document classification.

                        Security Feature Requirements:
                        1. Government IDs
                           - Clear, detailed hologram
                           - Microprinting
                           - QR codes/barcodes
                           - Official seals
                           - Consistent fonts
                           - No digital artifacts
                        
                        2. Other Documents
                           - Official letterhead
                           - Valid signatures
                           - Proper formatting
                           - Consistent quality

                        Red Flags (Non-Authentic):
                        - Blurred security features
                        - Missing required elements
                        - Digital artifacts
                        - Template characteristics
                        - Poor quality printing
                        - Inconsistent fonts
                        - Misaligned elements
                        - Unusual spacing

                        Authenticity Confidence Rules:
                        - 0.7-0.8: Original with clear security features (max for digital)
                        - 0.5-0.7: Likely original but some features unclear
                        - 0.3-0.5: Cannot verify authenticity
                        - 0.1-0.3: Signs of modification/template
                        - 0.0-0.1: Clearly non-authentic

                        Critical Rules:
                        1. Classify document type BEFORE checking authenticity
                        2. Use EXACT document type names
                        3. Document type can be clear even if non-authentic
                        4. High classification confidence doesn't mean authentic
                        5. Be consistent in classification across runs
                        6. Be extremely strict with authenticity
                        7. Never exceed 0.8 authenticity for digital
                        8. List specific features observed
                        9. Document all issues found`
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

    static async classifyDocument(document: Document, criteria: string): Promise<ClassificationResponse> {
        const prompt = `Analyze this document in two separate steps:

        STEP 1: DOCUMENT CLASSIFICATION
        Identify the document type based on visual layout and content:
        - What specific document type is this? (Use EXACT names from list)
        - What key identifying features do you see?
        - How many standard elements are present?
        - How clear and visible are these elements?
        - If type was requested, does it match exactly?
        - List all identifying features observed
        
        STEP 2: AUTHENTICITY VERIFICATION
        After classification, check authenticity separately:
        - What security features are present/missing?
        - How clear are the security features?
        - Are there any signs of tampering?
        - Is this a template or mock-up?
        - List any red flags observed
        - Document specific issues found

        Additional Criteria: ${criteria}

        Respond with a JSON object containing:
        {
            "is_authentic": boolean (default false),
            "authenticity_confidence": number (0-0.8 max),
            "authenticity_reason": "List security features and issues",
            "classification": "EXACT document type name",
            "confidence": number (0-1.0 for classification),
            "classification_reason": "List identifying features seen",
            "alternatives": [
                {
                    "label": "alternative exact type name",
                    "confidence": number (0-1.0)
                }
            ]
        }

        Important Requirements:
        - Use EXACT document type names from the list
        - Match requested type name if provided
        - Be consistent in type names across runs
        - Allow 100% confidence when certain
        - Be specific about features observed
        - List all identifying elements seen
        - Document any missing elements
        - Note any inconsistencies
        - Be extremely strict with authenticity
        - Separate classification from authenticity`;

        try {
            const completion = await this.analyzeDocument(document, prompt);
            const content = completion.choices[0].message.content || '{}';
            
            const response = JSON.parse(content) as Partial<ClassificationResponse>;

            // Validate classification confidence - allow up to 100% if very certain
            const validateClassificationConfidence = (score: number | undefined) => {
                if (typeof score !== 'number' || score < 0 || score > 1) {
                    return 0.5; // Default to moderate confidence
                }
                return score; // Allow full range 0-1
            };

            // Validate authenticity confidence - strict limits
            const validateAuthenticityConfidence = (score: number | undefined) => {
                if (typeof score !== 'number' || score < 0 || score > 1) {
                    return 0.3; // Default to low confidence
                }
                return Math.min(score, 0.8); // Cap at 0.8 for digital
            };

            // Validate classification
            const classification = response.classification || "UNKNOWN";
            const classificationConfidence = validateClassificationConfidence(response.confidence);
            
            // Validate authenticity separately with stricter rules
            const isAuthentic = response.is_authentic === true && 
                              validateAuthenticityConfidence(response.authenticity_confidence) > 0.6;
            const authenticityConfidence = validateAuthenticityConfidence(response.authenticity_confidence);

            return {
                is_authentic: isAuthentic,
                authenticity_confidence: authenticityConfidence,
                authenticity_reason: response.authenticity_reason || 
                    "Document treated as non-authentic due to insufficient security features.",
                classification: classification,
                confidence: classificationConfidence,
                classification_reason: response.classification_reason || 
                    "Classification based on visible document characteristics.",
                alternatives: Array.isArray(response.alternatives) ? 
                    response.alternatives.map(alt => ({
                        label: alt.label || "UNKNOWN",
                        confidence: validateClassificationConfidence(alt.confidence)
                    })) : []
            };
        } catch (error) {
            console.error('Error in document classification:', error);
            return {
                is_authentic: false,
                authenticity_confidence: 0.3,
                authenticity_reason: "Unable to verify authenticity due to processing error.",
                classification: "UNKNOWN",
                confidence: 0.5,
                classification_reason: "Unable to complete classification due to processing error.",
                alternatives: []
            };
        }
    }

    static async parseDocument(document: Document, schema: string, retryCount = 0): Promise<ExtractedData> {
        try {
            const schemaAnalysisPrompt = `Analyze this schema and list the fields to extract: ${schema}
            
            Convert the field names to snake_case format and respond with a JSON object containing an array of field names. For example:
            {
                "fields": ["invoice_number", "date_of_birth", "phone_number"]
            }
            
            Rules:
            1. Convert field names to snake_case (lowercase with underscores)
            2. Remove any special characters except underscores
            3. Only include fields that are explicitly requested
            4. Do not include any explanatory text
            5. Do not include any fields that weren't requested
            6. Ensure consistent field naming across retries`;

            const schemaCompletion = await this.openai.chat.completions.create({
                model: "gpt-4o",
                response_format: { "type": "json_object" },
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

            const schemaContent = schemaCompletion.choices[0].message.content || '{"fields":[]}';
            const parsedSchema = JSON.parse(schemaContent);
            const fieldsToExtract = (parsedSchema.fields || [])
                .filter((field: unknown) => typeof field === 'string')
                .map((field: string) => this.normalizeFieldName(field))
                .filter((field: string) => field.length > 0);

            if (fieldsToExtract.length === 0) {
                throw new Error('No valid fields identified in schema');
            }

            const extractionPrompt = `Extract the following information from this document: ${fieldsToExtract.join(', ')}

            Context: ${schema}

            Important Instructions:
            1. Look for each field in standard locations
            2. Consider variations in format
            3. Extract partial information if complete data isn't clear
            4. Never return empty values, use "Not found" if information is missing
            5. Provide confidence scores based on clarity of extraction

            You must respond with a JSON object in this exact format:
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
            
            const response: ParsedResponse = JSON.parse(content);
            const result = this.validateAndNormalizeResponse(response, fieldsToExtract);

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
            return {
                fields: {},
                confidence: {}
            };
        }
    }
}
