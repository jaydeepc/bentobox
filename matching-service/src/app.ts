import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import OpenAI from 'openai';
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
    document_id_b: string;
    matched_fields: Record<string, MatchedField>;
    overall_status: 'match' | 'mismatch' | 'partial_match';
    confidence: number;
    reason: string;
}

// Helper function to ensure proper JSON formatting
function formatMatchResult(result: Partial<MatchResult>): MatchResult {
    return {
        document_id_a: result.document_id_a || '',
        document_id_b: result.document_id_b || '',
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
        const { documents_a, documents_b, criteria } = req.body;

        if (!documents_a?.length || !documents_b?.length || !criteria) {
            return res.status(400).json({
                error: 'Missing required fields'
            });
        }

        if (documents_a.length !== documents_b.length) {
            return res.status(400).json({
                error: 'Document arrays must have the same length'
            });
        }

        const results: MatchResult[] = [];
        for (let i = 0; i < documents_a.length; i++) {
            const docA = documents_a[i];
            const docB = documents_b[i];
            
            try {
                const completion = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content: `You are a document comparison expert. Analyze documents and provide results in this exact JSON format:
                            {
                                "matched_fields": {
                                    "field_name": {
                                        "value_a": "value from doc A",
                                        "value_b": "value from doc B",
                                        "status": "match/mismatch/partial_match",
                                        "confidence": 0.95,
                                        "reason": "explanation"
                                    }
                                },
                                "overall_status": "match/partial_match/mismatch",
                                "confidence": 0.95,
                                "reason": "overall explanation"
                            }`
                        },
                        {
                            role: "user",
                            content: [
                                { 
                                    type: "text", 
                                    text: `Compare these documents based on: ${criteria}. Respond ONLY with a JSON object in the specified format.` 
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
                            ]
                        }
                    ],
                    max_tokens: 4096
                });

                const content = completion.choices[0].message.content || '{}';
                let response;
                try {
                    // Try to extract JSON from the response
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    const jsonStr = jsonMatch ? jsonMatch[0] : '{}';
                    response = JSON.parse(jsonStr);
                } catch (parseError) {
                    console.error('Error parsing GPT response:', parseError);
                    // Create a default response if parsing fails
                    response = {
                        matched_fields: {},
                        overall_status: 'mismatch',
                        confidence: 0,
                        reason: 'Failed to parse comparison results'
                    };
                }

                const result = formatMatchResult({
                    document_id_a: docA.document_id,
                    document_id_b: docB.document_id,
                    matched_fields: response.matched_fields || {},
                    overall_status: response.overall_status || 'mismatch',
                    confidence: response.confidence || 0,
                    reason: response.reason || 'Comparison completed'
                });

                results.push(result);
            } catch (error) {
                console.error(`Error processing document pair ${i + 1}:`, error);
                results.push(formatMatchResult({
                    document_id_a: docA.document_id,
                    document_id_b: docB.document_id,
                    matched_fields: {},
                    overall_status: 'mismatch',
                    confidence: 0,
                    reason: 'Error during comparison'
                }));
            }
        }

        // Send properly formatted JSON response
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
