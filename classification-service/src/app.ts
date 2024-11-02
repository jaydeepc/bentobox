import express from 'express';
import { json } from 'body-parser';
import { ClassificationRequest, ClassificationResponse } from '../../shared/src/types';
import { LLMService } from '../../shared/src/llm';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(json({ limit: '50mb' }));

// Initialize OpenAI client
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required');
}
LLMService.initialize(OPENAI_API_KEY);

app.post('/classify', async (req, res) => {
    try {
        const request: ClassificationRequest = req.body;

        const classificationPromises = request.documents.map(async (doc) => {
            const result = await LLMService.classifyDocument(doc, request.criteria);

            return {
                document_id: doc.document_id,
                classification: result.classification,
                confidence_score: result.confidence,
                alternative_classifications: result.alternatives
            };
        });

        const results = await Promise.all(classificationPromises);
        const response: ClassificationResponse = { results };

        res.json(response);
    } catch (error) {
        console.error('Classification error:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Classification service running on port ${PORT}`);
    console.log('Service is ready to process documents using GPT-4 Vision');
});

export default app;
