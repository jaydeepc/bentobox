import { useState } from 'react';
import { motion } from 'framer-motion';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface ParsingResult {
  document_id: string;
  extracted_fields: Record<string, string>;
  confidence_scores: Record<string, number>;
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

      const response = await axios.post('http://localhost:3006/parse', {
        documents,
        schema
      });

      setResults(response.data.parsed_results);
    } catch (error) {
      console.error('Parsing error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.button
            onClick={() => navigate('/')}
            className="flex items-center text-red-300 hover:text-red-200 mb-8 group"
            whileHover={{ x: -5 }}
          >
            <svg
              className="w-6 h-6 mr-2 transition-transform group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </motion.button>

          <motion.h1 
            className="text-5xl font-bold mb-12 bg-clip-text text-transparent bg-gradient-to-r from-red-300 to-red-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Document Parsing
          </motion.h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Instructions */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-gray-800 rounded-xl p-6 border border-red-800/50 shadow-lg">
                <h2 className="text-2xl font-semibold text-red-300 mb-4">Instructions</h2>
                <ol className="space-y-4">
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-red-800 rounded-full flex items-center justify-center font-bold">1</span>
                    <div>
                      <h3 className="font-semibold text-red-300">Upload Documents</h3>
                      <p className="text-gray-300">Upload one or more documents (PDF or images) containing information to extract.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-red-800 rounded-full flex items-center justify-center font-bold">2</span>
                    <div>
                      <h3 className="font-semibold text-red-300">Define Schema</h3>
                      <p className="text-gray-300">Specify what information you want to extract and where to find it.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-red-800 rounded-full flex items-center justify-center font-bold">3</span>
                    <div>
                      <h3 className="font-semibold text-red-300">Review Results</h3>
                      <p className="text-gray-300">Get structured data extracted from your documents.</p>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-red-800/50 shadow-lg">
                <h2 className="text-2xl font-semibold text-red-300 mb-4">Example</h2>
                <div className="bg-gray-900 rounded-lg p-4">
                  <pre className="text-gray-300 whitespace-pre-wrap">
                    Extract from invoices:
                    - Invoice number (top right)
                    - Date (format: MM/DD/YYYY)
                    - Total amount (preceded by 'Total:')
                    - Company name (look for logo/letterhead)
                    - Line items (product, quantity, price)
                  </pre>
                </div>
              </div>
            </motion.div>

            {/* Parsing Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="bg-gray-800 rounded-xl p-6 border border-red-800/50 shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-lg mb-2 text-red-300">Upload Documents</label>
                    <motion.div 
                      className="border-2 border-dashed border-red-800/50 rounded-lg p-8 text-center hover:border-red-500/50 transition-colors bg-gray-900"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
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
                        <DocumentArrowUpIcon className="h-12 w-12 text-red-300 mb-4" />
                        <span className="text-red-300">Click to upload documents</span>
                        <span className="text-sm text-gray-300 mt-2">
                          {files.length > 0
                            ? `${files.length} files selected`
                            : 'PDF or Images accepted'}
                        </span>
                      </label>
                    </motion.div>
                  </div>

                  <div>
                    <label className="block text-lg mb-2 text-red-300">Parsing Schema</label>
                    <textarea
                      value={schema}
                      onChange={(e) => setSchema(e.target.value)}
                      className="w-full h-32 bg-gray-900 rounded-lg border border-red-800/50 text-white p-3
                               focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-colors"
                      placeholder="Describe what information to extract..."
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading || files.length === 0 || !schema}
                    className="w-full bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 
                             disabled:from-gray-800 disabled:to-gray-700 disabled:cursor-not-allowed 
                             py-3 rounded-lg font-semibold transition-colors shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? 'Processing...' : 'Parse Documents'}
                  </motion.button>
                </form>

                {results.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8"
                  >
                    <h2 className="text-2xl font-bold mb-6 text-red-300">Extracted Information</h2>
                    <div className="space-y-4">
                      {results.map((result, index) => (
                        <motion.div
                          key={result.document_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gray-900 rounded-lg p-6 border border-red-800/50 shadow-lg"
                        >
                          <h3 className="text-xl font-semibold mb-4 text-red-300">
                            {result.document_id}
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            {Object.entries(result.extracted_fields).map(([key, value], fieldIndex) => (
                              <motion.div
                                key={key}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 + fieldIndex * 0.05 }}
                                className="bg-gray-800 p-3 rounded border border-red-800/50"
                              >
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-red-300 text-sm">
                                    {key}:
                                  </span>
                                  <span className={`text-sm ${getConfidenceColor(result.confidence_scores[key] || 0)}`}>
                                    {Math.round((result.confidence_scores[key] || 0) * 100)}% confident
                                  </span>
                                </div>
                                <span className="text-white">{value || 'Not found'}</span>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Parsing;
