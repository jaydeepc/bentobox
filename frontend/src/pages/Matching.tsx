import { useState } from 'react';
import { motion } from 'framer-motion';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
  overall_status: 'match' | 'partial_match' | 'mismatch';
  confidence: number;
  reason: string;
}

const Matching = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [criteria, setCriteria] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length < 2) {
      setError('Please select two documents to compare');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const [file1, file2] = files;
      const [base64_1, base64_2] = await Promise.all([
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve(base64String.split(',')[1]);
          };
          reader.readAsDataURL(file1);
        }),
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve(base64String.split(',')[1]);
          };
          reader.readAsDataURL(file2);
        })
      ]);

      console.log('Sending request to matching service...');
      const response = await axios.post('http://localhost:3007/match', {
        documents_a: [{
          document_id: file1.name,
          content: base64_1,
          type: file1.type.includes('pdf') ? 'pdf' : 'image'
        }],
        documents_b: [{
          document_id: file2.name,
          content: base64_2,
          type: file2.type.includes('pdf') ? 'pdf' : 'image'
        }],
        criteria
      });

      console.log('Received response:', response.data);
      setResults(response.data.match_results);
    } catch (error) {
      console.error('Matching error:', error);
      setError('Error comparing documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'match': return 'text-green-400';
      case 'partial_match': return 'text-yellow-400';
      case 'mismatch': return 'text-red-400';
      default: return 'text-gray-400';
    }
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
            Document Matching
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
                      <p className="text-gray-300">Upload two documents (PDF or images) that you want to compare.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-red-800 rounded-full flex items-center justify-center font-bold">2</span>
                    <div>
                      <h3 className="font-semibold text-red-300">Define Criteria</h3>
                      <p className="text-gray-300">Specify what elements or fields should be compared between the documents.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-red-800 rounded-full flex items-center justify-center font-bold">3</span>
                    <div>
                      <h3 className="font-semibold text-red-300">Review Results</h3>
                      <p className="text-gray-300">Get detailed comparison results showing matches and differences.</p>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-red-800/50 shadow-lg">
                <h2 className="text-2xl font-semibold text-red-300 mb-4">Example</h2>
                <div className="bg-gray-900 rounded-lg p-4">
                  <pre className="text-gray-300 whitespace-pre-wrap">
                    Match fields: invoice number, date, amount;
                    Compare company details and line items;
                    Highlight any pricing discrepancies
                  </pre>
                </div>
              </div>
            </motion.div>

            {/* Matching Form */}
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
                        <DocumentDuplicateIcon className="h-12 w-12 text-red-300 mb-4" />
                        <span className="text-red-300">Click to upload documents</span>
                        <span className="text-sm text-gray-300 mt-2">
                          {files.length > 0
                            ? `${files.length} files selected`
                            : 'Select 2 documents to compare (PDF or Images)'}
                        </span>
                      </label>
                    </motion.div>
                  </div>

                  <div>
                    <label className="block text-lg mb-2 text-red-300">Matching Criteria</label>
                    <textarea
                      value={criteria}
                      onChange={(e) => setCriteria(e.target.value)}
                      className="w-full h-32 bg-gray-900 rounded-lg border border-red-800/50 text-white p-3
                               focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-colors"
                      placeholder="E.g., Match fields: invoice number, date, amount; highlight differences"
                    />
                  </div>

                  {error && (
                    <div className="text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading || files.length < 2 || !criteria}
                    className="w-full bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 
                             disabled:from-gray-800 disabled:to-gray-700 disabled:cursor-not-allowed 
                             py-3 rounded-lg font-semibold transition-colors shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? 'Processing...' : 'Compare Documents'}
                  </motion.button>
                </form>

                {results.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8"
                  >
                    <h2 className="text-2xl font-bold mb-6 text-red-300">Results</h2>
                    <div className="space-y-4">
                      {results.map((result, index) => (
                        <motion.div
                          key={`${result.document_id_a}-${result.document_id_b}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gray-900 rounded-lg p-6 border border-red-800/50 shadow-lg"
                        >
                          <div className="mb-4">
                            <h3 className="text-xl font-semibold text-red-300">Documents Compared</h3>
                            <p className="text-gray-300">
                              {result.document_id_a} ↔ {result.document_id_b}
                            </p>
                          </div>

                          <div className="mb-4 pb-4 border-b border-red-800/30">
                            <div className="flex justify-between items-center">
                              <span className="text-red-300">Overall Status:</span>
                              <span className={`${getStatusColor(result.overall_status)}`}>
                                {result.overall_status.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-red-300">Confidence:</span>
                              <span className={getConfidenceColor(result.confidence)}>
                                {Math.round(result.confidence * 100)}%
                              </span>
                            </div>
                            <p className="text-sm text-gray-300 mt-2">{result.reason}</p>
                          </div>

                          <div className="space-y-4">
                            {Object.entries(result.matched_fields).map(([field, comparison]) => (
                              <div key={field} className="border-t border-red-800/30 pt-4">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="text-lg font-medium text-red-300">{field}</h4>
                                  <span className={getStatusColor(comparison.status)}>
                                    {comparison.status.replace('_', ' ')}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-2">
                                  <div>
                                    <span className="text-gray-400">Document A:</span>
                                    <span className="ml-2 text-white">{comparison.value_a}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Document B:</span>
                                    <span className="ml-2 text-white">{comparison.value_b}</span>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-gray-400">Confidence:</span>
                                  <span className={getConfidenceColor(comparison.confidence)}>
                                    {Math.round(comparison.confidence * 100)}%
                                  </span>
                                </div>
                                <p className="text-sm text-gray-300 mt-2">{comparison.reason}</p>
                              </div>
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

export default Matching;
