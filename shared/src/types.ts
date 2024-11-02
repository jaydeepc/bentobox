export interface Document {
  document_id: string;
  content: string; // base64 encoded content
  type: 'pdf' | 'image';
}

export interface ClassificationRequest {
  documents: Document[];
  criteria: string;
}

export interface AlternativeClassification {
  label: string;
  confidence: number;
}

export interface ClassificationResult {
  document_id: string;
  classification: string;
  confidence_score: number;
  alternative_classifications: AlternativeClassification[];
}

export interface ClassificationResponse {
  results: ClassificationResult[];
}

export interface ParsingRequest {
  documents: Document[];
  schema: string;
}

export interface ParsedResult {
  document_id: string;
  extracted_fields: Record<string, string>;
}

export interface ParsingResponse {
  parsed_results: ParsedResult[];
}
