import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface ParsingResult {
  document_id: string;
  extracted_fields: Record<string, string>;
}

const Parsing = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [schema, setSchema] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ParsingResult[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const documents = await Promise.all(
        files.map(async (file) => {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64String = reader.result as string;
              resolve(base64String.split(',')[1]);
            };
            reader.readAsDataURL(file);
          });

          return {
            document_id: file.name,
            content: base64,
            type: file.type.includes('pdf') ? 'pdf' : 'image'
          };
        })
      );

      const response = await axios.post('http://localhost:3002/parse', {
        documents,
        schema
      });

      setResults(response.data.parsed_results);
    } catch (error) {
      console.error('Parsing error:', error);
      // Handle error appropriately
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-primary-300 hover:text-primary-200 mb-8"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Home
        </button>

        <h1 className="text-4xl font-bold mb-8">Document Parsing</h1>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div>
            <label className="block text-lg mb-2">Upload Documents</label>
            <div className="border-2 border-dashed border-primary-300 rounded-lg p-8 text-center">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept="image/*,application/pdf"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <DocumentArrowUpIcon className="h-12 w-12 text-primary-300 mb-4" />
                <span className="text-primary-300">Click to upload documents</span>
                <span className="text-sm text-gray-300 mt-2">
                  {files.length > 0
                    ? `${files.length} files selected`
                    : 'PDF or Images accepted'}
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-lg mb-2">Parsing Schema</label>
            <textarea
              value={schema}
              onChange={(e) => setSchema(e.target.value)}
              className="w-full h-32 bg-white/10 rounded-lg border border-primary-300 text-white"
              placeholder="Describe what information to extract..."
            />
          </div>

          <button
            type="submit"
            disabled={loading || files.length === 0 || !schema}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-800 
                     disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition-colors"
          >
            {loading ? 'Processing...' : 'Parse Documents'}
          </button>
        </form>

        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-bold mb-6">Extracted Information</h2>
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result.document_id}
                  className="bg-white/10 rounded-lg p-6"
                >
                  <h3 className="text-xl font-semibold mb-4">
                    {result.document_id}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(result.extracted_fields).map(([key, value]) => (
                      <div key={key} className="bg-white/5 p-3 rounded">
                        <span className="text-primary-300 block text-sm">
                          {key}:
                        </span>
                        <span className="text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Parsing;
