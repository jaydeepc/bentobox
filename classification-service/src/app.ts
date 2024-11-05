import express, { Request, Response } from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import { body, validationResult } from 'express-validator';
import { ClassificationRequest, ClassificationResponse } from '../../shared/src/types';
import { LLMService } from '../../shared/src/llm';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Enable CORS and JSON parsing first
app.use(cors());
app.use(json({ limit: '50mb' }));

// Debug middleware to log all requests
app.use((req: Request, res: Response, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
});

// Initialize OpenAI client
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required');
}
LLMService.initialize(OPENAI_API_KEY);

// Validation middleware
const validateClassificationRequest = [
    body('documents').isArray().notEmpty().withMessage('Documents array is required'),
    body('documents.*.document_id').isString().notEmpty().withMessage('Document ID is required'),
    body('documents.*.content').isString().notEmpty().withMessage('Document content is required'),
    body('documents.*.type').isIn(['pdf', 'image']).withMessage('Document type must be pdf or image'),
    body('criteria').isString().notEmpty().withMessage('Classification criteria is required')
];

// Classification endpoint
app.post('/classify', validateClassificationRequest, async (req: Request, res: Response) => {
    console.log('Classification request received');
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const request: ClassificationRequest = req.body;
        console.log(`Processing ${request.documents.length} documents`);

        const classificationPromises = request.documents.map(async (doc) => {
            console.log(`Classifying document: ${doc.document_id}`);
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

        console.log('Classification completed successfully');
        res.json(response);
    } catch (error) {
        console.error('Classification error:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'healthy' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        details: err.message
    });
});

// 404 handler
app.use((req: Request, res: Response) => {
    console.log('404 Not Found:', req.method, req.path);
    res.status(404).json({
        error: 'Not Found',
        details: `Cannot ${req.method} ${req.path}`
    });
});

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
    console.log(`Classification service running on port ${PORT}`);
    console.log('Service is ready to process documents using GPT-4 Vision');
    console.log('Available endpoints:');
    console.log('- POST /classify');
    console.log('- GET /health');
});

// Handle server errors
server.on('error', (error: Error) => {
    console.error('Server error:', error);
    process.exit(1);
});

export default app;
