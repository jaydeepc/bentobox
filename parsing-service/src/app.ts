import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import { ParsingRequest, ParsingResponse } from '../../shared/src/types';
import { LLMService } from '../../shared/src/llm';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(json({ limit: '50mb' }));

// Initialize OpenAI client
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required');
}
LLMService.initialize(OPENAI_API_KEY);

app.post('/parse', async (req, res) => {
    try {
        const request: ParsingRequest = req.body;

        const parsingPromises = request.documents.map(async (doc) => {
            const result = await LLMService.parseDocument(doc, request.schema);

            return {
                document_id: doc.document_id,
                extracted_fields: result.fields
            };
        });

        const parsed_results = await Promise.all(parsingPromises);
        const response: ParsingResponse = { parsed_results };

        res.json(response);
    } catch (error) {
        console.error('Parsing error:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
    console.log(`Parsing service running on port ${PORT}`);
    console.log('Service is ready to process documents using GPT-4 Vision');
});

export default app;
