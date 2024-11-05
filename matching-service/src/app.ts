import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import OpenAI from 'openai';
import type { ChatCompletionContentPart, ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3007;

// Basic middleware
app.use(cors());
app.use(json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize OpenAI
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required');
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({ status: 'healthy' });
});

interface MatchedField {
    value_a: string;
    value_b: string;
    status: 'match' | 'mismatch' | 'partial_match';
    confidence: number;
    reason: string;
}

interface MatchResult {
    document_id_a: string;
    document_id_b?: string;
    matched_fields: Record<string, MatchedField>;
    overall_status: 'match' | 'partial_match' | 'mismatch';
    confidence: number;
    reason: string;
}

interface ComparisonValue {
    field: string;
    value: string;
}

interface GPTResponse {
    matched_fields?: Record<string, MatchedField>;
    overall_status?: 'match' | 'partial_match' | 'mismatch';
    confidence?: number;
    reason?: string;
}

// Helper function to ensure proper JSON formatting
function formatMatchResult(result: Partial<MatchResult>): MatchResult {
    return {
        document_id_a: result.document_id_a || '',
        document_id_b: result.document_id_b,
        matched_fields: Object.entries(result.matched_fields || {}).reduce((acc, [key, value]) => ({
            ...acc,
            [key]: {
                value_a: value?.value_a || '',
                value_b: value?.value_b || '',
                status: value?.status || 'mismatch',
                confidence: value?.confidence || 0,
                reason: value?.reason || ''
            }
        }), {}),
        overall_status: result.overall_status || 'mismatch',
        confidence: result.confidence || 0,
        reason: result.reason || ''
    };
}

// Matching endpoint
app.post('/match', async (req, res) => {
    try {
        const { documents_a, documents_b, criteria, comparison_values } = req.body;

        if (!documents_a?.length) {
            return res.status(400).json({
                error: 'At least one document is required in documents_a'
            });
        }

        if (!documents_b?.length && !comparison_values) {
            return res.status(400).json({
                error: 'Either documents_b or comparison_values must be provided'
            });
        }

        if (documents_b?.length && documents_a.length !== documents_b.length) {
            return res.status(400).json({
                error: 'Document arrays must have the same length when comparing documents'
            });
        }

        const results: MatchResult[] = [];
        for (let i = 0; i < documents_a.length; i++) {
            const docA = documents_a[i];
            
            try {
                let messages: ChatCompletionMessageParam[];
                if (documents_b) {
                    const docB = documents_b[i];
                    const content: ChatCompletionContentPart[] = [
                        {
                            type: "text",
                            text: `Compare these documents based on these specific criteria: ${criteria}

Instructions:
1. ONLY compare the fields specified in the criteria
2. Do not extract or compare any additional fields
3. For each specified field:
   - Extract the exact values from both documents
   - Compare them carefully
   - Consider minor variations
   - Provide confidence scores
   - Explain any differences

Respond with a JSON object in this exact format:
{
    "matched_fields": {
        "field_name": {
            "value_a": "exact text from doc A",
            "value_b": "exact text from doc B",
            "status": "match/mismatch/partial_match",
            "confidence": 0.95,
            "reason": "detailed explanation"
        }
    },
    "overall_status": "match/partial_match/mismatch",
    "confidence": 0.95,
    "reason": "detailed explanation"
}`
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: docA.content.startsWith('data:') 
                                    ? docA.content 
                                    : `data:${docA.type === 'pdf' ? 'application/pdf' : 'image/jpeg'};base64,${docA.content}`
                            }
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: docB.content.startsWith('data:') 
                                    ? docB.content 
                                    : `data:${docB.type === 'pdf' ? 'application/pdf' : 'image/jpeg'};base64,${docB.content}`
                            }
                        }
                    ];

                    messages = [
                        {
                            role: "system" as const,
                            content: "You are an expert document analyzer. Your task is to compare ONLY the specified fields between documents. Do not extract or compare any additional information."
                        },
                        {
                            role: "user" as const,
                            content
                        }
                    ];
                } else {
                    // Compare with provided values
                    const fieldsToMatch = (comparison_values as ComparisonValue[]).map(v => `"${v.field}": "${v.value}"`).join(', ');
                    const content: ChatCompletionContentPart[] = [
                        {
                            type: "text",
                            text: `Find and compare ONLY these specific fields and values in the document:
{${fieldsToMatch}}

Instructions:
1. ONLY look for the exact fields listed above
2. Do not extract or compare any other fields
3. For each specified field:
   - Find the exact value in the document
   - Compare with the provided value
   - Consider minor variations
   - Provide confidence score
   - Explain any differences

Respond with a JSON object in this exact format:
{
    "matched_fields": {
        "field_name": {
            "value_a": "exact text from document",
            "value_b": "expected value",
            "status": "match/mismatch/partial_match",
            "confidence": 0.95,
            "reason": "detailed explanation"
        }
    },
    "overall_status": "match/partial_match/mismatch",
    "confidence": 0.95,
    "reason": "detailed explanation"
}`
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: docA.content.startsWith('data:') 
                                    ? docA.content 
                                    : `data:${docA.type === 'pdf' ? 'application/pdf' : 'image/jpeg'};base64,${docA.content}`
                            }
                        }
                    ];

                    messages = [
                        {
                            role: "system" as const,
                            content: "You are an expert document analyzer. Your task is to find and compare ONLY the specified fields in the document. Do not extract or compare any additional information."
                        },
                        {
                            role: "user" as const,
                            content
                        }
                    ];
                }

                const completion = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages,
                    max_tokens: 4096
                });

                const content = completion.choices[0].message.content || '{}';
                let response: GPTResponse;
                try {
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    const jsonStr = jsonMatch ? jsonMatch[0] : '{}';
                    response = JSON.parse(jsonStr) as GPTResponse;
                } catch (parseError) {
                    console.error('Error parsing GPT response:', parseError);
                    response = {
                        matched_fields: {},
                        overall_status: 'mismatch',
                        confidence: 0,
                        reason: 'Failed to parse comparison results'
                    };
                }

                // Ensure only requested fields are included
                const filteredFields: Record<string, MatchedField> = {};
                if (documents_b) {
                    // For document-to-document mode, keep fields mentioned in criteria
                    const criteriaFields = criteria.toLowerCase().match(/\b\w+\b/g) || [];
                    Object.entries(response.matched_fields || {}).forEach(([field, value]) => {
                        if (criteriaFields.some((cf: string) => field.toLowerCase().includes(cf))) {
                            filteredFields[field] = value as MatchedField;
                        }
                    });
                } else {
                    // For document-to-values mode, only keep fields from comparison_values
                    (comparison_values as ComparisonValue[]).forEach(({ field }: ComparisonValue) => {
                        if (response.matched_fields?.[field]) {
                            filteredFields[field] = response.matched_fields[field] as MatchedField;
                        }
                    });
                }

                const result = formatMatchResult({
                    document_id_a: docA.document_id,
                    document_id_b: documents_b ? documents_b[i].document_id : undefined,
                    matched_fields: filteredFields,
                    overall_status: response.overall_status || 'mismatch',
                    confidence: response.confidence || 0,
                    reason: response.reason || 'Comparison completed'
                });

                results.push(result);
            } catch (error) {
                console.error(`Error processing document ${docA.document_id}:`, error);
                results.push(formatMatchResult({
                    document_id_a: docA.document_id,
                    document_id_b: documents_b ? documents_b[i].document_id : undefined,
                    matched_fields: {},
                    overall_status: 'mismatch',
                    confidence: 0,
                    reason: 'Error during comparison'
                }));
            }
        }

        res.json({ match_results: results });
    } catch (error) {
        console.error('Match error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Matching service running on port ${PORT}`);
});
