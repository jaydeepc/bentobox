import express, { Request, Response } from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import { body, validationResult } from 'express-validator';
import { ParsingRequest, ParsingResponse } from '../../shared/src/types';
import { LLMService } from '../../shared/src/llm';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Enable CORS and JSON parsing
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
const validateParsingRequest = [
    body('documents').isArray().notEmpty().withMessage('Documents array is required'),
    body('documents.*.document_id').isString().notEmpty().withMessage('Document ID is required'),
    body('documents.*.content').isString().notEmpty().withMessage('Document content is required'),
    body('documents.*.type').isIn(['pdf', 'image']).withMessage('Document type must be pdf or image'),
    body('schema').isString().notEmpty().withMessage('Parsing schema is required')
];

// Parsing endpoint
app.post('/parse', validateParsingRequest, async (req: Request, res: Response) => {
    console.log('Parsing request received');
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const request: ParsingRequest = req.body;
        console.log(`Processing ${request.documents.length} documents`);

        const results = [];
        for (const doc of request.documents) {
            console.log(`Parsing document: ${doc.document_id}`);
            try {
                const result = await LLMService.parseDocument(doc, request.schema);
                results.push({
                    document_id: doc.document_id,
                    extracted_fields: result.fields,
                    confidence_scores: result.confidence
                });
            } catch (error) {
                console.error(`Error parsing document ${doc.document_id}:`, error);
                results.push({
                    document_id: doc.document_id,
                    extracted_fields: {},
                    confidence_scores: {}
                });
            }
        }

        console.log('Parsing completed successfully');
        
        // Create response object with proper structure
        const responseObj = {
            parsed_results: results
        };

        // Log the response for debugging
        console.log('Response:', JSON.stringify(responseObj, null, 2));
        
        // Send response with explicit content type
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(responseObj));
    } catch (error) {
        console.error('Parsing error:', error);
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

const PORT = process.env.PORT || 3006;

const server = app.listen(PORT, () => {
    console.log(`Parsing service running on port ${PORT}`);
    console.log('Service is ready to process documents using GPT-4 Vision');
    console.log('Available endpoints:');
    console.log('- POST /parse');
    console.log('- GET /health');
});

// Handle server errors
server.on('error', (error: Error) => {
    console.error('Server error:', error);
    process.exit(1);
});

export default app;
