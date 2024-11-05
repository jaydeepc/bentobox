import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { body, validationResult } from 'express-validator';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3003;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Validation middleware for the match endpoint
const validateMatchRequest = [
  body('documents_a').isArray().notEmpty(),
  body('documents_b').isArray().notEmpty(),
  body('criteria').isString().notEmpty(),
  body('documents_a.*.document_id').isString(),
  body('documents_a.*.content').isString(),
  body('documents_a.*.type').isString(),
  body('documents_b.*.document_id').isString(),
  body('documents_b.*.content').isString(),
  body('documents_b.*.type').isString(),
];

interface Document {
  document_id: string;
  content: string;
  type: string;
}

interface MatchRequest {
  documents_a: Document[];
  documents_b: Document[];
  criteria: string;
}

interface MatchedField {
  value_a: string;
  value_b: string;
  status: 'match' | 'mismatch';
  delta?: string;
}

interface MatchResult {
  document_id_a: string;
  document_id_b: string;
  matched_fields: {
    [key: string]: MatchedField;
  };
  overall_status: 'match' | 'partial_match' | 'mismatch';
}

app.post('/match', validateMatchRequest, async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { documents_a, documents_b, criteria }: MatchRequest = req.body;

    // Process each pair of documents
    const match_results: MatchResult[] = [];

    for (let i = 0; i < documents_a.length; i++) {
      const docA = documents_a[i];
      const docB = documents_b[i];

      // Use GPT-4V to analyze and compare the documents
      const prompt = `Compare the following documents and identify matches and differences based on these criteria: ${criteria}
                     Document A (${docA.document_id}): ${docA.content}
                     Document B (${docB.document_id}): ${docB.content}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/${docA.type};base64,${docA.content}`
                }
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/${docB.type};base64,${docB.content}`
                }
              }
            ]
          }
        ],
        max_tokens: 4096
      });

      // Process the GPT-4V response to extract matching information
      const analysis = completion.choices[0].message.content;
      
      // Parse the analysis to determine matches and differences
      // This is a simplified example - you would need to implement proper parsing logic
      const matchResult: MatchResult = {
        document_id_a: docA.document_id,
        document_id_b: docB.document_id,
        matched_fields: {},
        overall_status: 'partial_match'
      };

      // Extract field comparisons from the analysis
      // This would need to be implemented based on the specific format of your criteria
      // and how GPT-4V returns the analysis

      match_results.push(matchResult);
    }

    res.json({ match_results });
  } catch (error) {
    console.error('Error in matching service:', error);
    res.status(500).json({ error: 'Internal server error during document matching' });
  }
});

app.listen(port, () => {
  console.log(`Matching service listening at http://localhost:${port}`);
});
