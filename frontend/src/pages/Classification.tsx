import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface ClassificationResult {
  document_id: string;
  is_authentic: boolean;
  authenticity_confidence: number;
  authenticity_reason: string;
  classification: string;
  confidence: number;
  classification_reason: string;
  alternatives: Array<{ label: string; confidence: number }>;
}

interface DocumentWithPreview {
  file: File;
  preview: string;
}

const Classification = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentWithPreview[]>([]);
  const [criteria, setCriteria] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ClassificationResult[]>([]);

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      documents.forEach(doc => URL.revokeObjectURL(doc.preview));
    };
  }, [documents]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newDocuments = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setDocuments(prev => [...prev, ...newDocuments]);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => {
      URL.revokeObjectURL(prev[index].preview);
      const newDocs = [...prev];
      newDocs.splice(index, 1);
      return newDocs;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const documentsData = await Promise.all(
        documents.map(async ({ file }) => {
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

      const response = await axios.post('http://localhost:3001/classify', {
        documents: documentsData,
        criteria
      });

      setResults(response.data.classification_results);
    } catch (error) {
      console.error('Classification error:', error);
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
            Document Classification
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
                      <p className="text-gray-300">Upload one or more documents (PDF or images) to classify.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-red-800 rounded-full flex items-center justify-center font-bold">2</span>
                    <div>
                      <h3 className="font-semibold text-red-300">Define Criteria</h3>
                      <p className="text-gray-300">Specify the classification criteria or categories.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-red-800 rounded-full flex items-center justify-center font-bold">3</span>
                    <div>
                      <h3 className="font-semibold text-red-300">Review Results</h3>
                      <p className="text-gray-300">Get document classifications with confidence scores.</p>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-red-800/50 shadow-lg">
                <h2 className="text-2xl font-semibold text-red-300 mb-4">Example</h2>
                <div className="bg-gray-900 rounded-lg p-4">
                  <pre className="text-gray-300 whitespace-pre-wrap">
                    Classify documents into:
                    - Invoice
                    - Receipt
                    - Purchase Order
                    - Shipping Label
                    - Other
                  </pre>
                </div>
              </div>
            </motion.div>

            {/* Classification Form */}
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
                          {documents.length > 0
                            ? `${documents.length} files selected`
                            : 'PDF or Images accepted'}
                        </span>
                      </label>
                    </motion.div>

                    {/* Document Previews */}
                    {documents.length > 0 && (
                      <div className="mt-4 space-y-4">
                        {documents.map((doc, index) => (
                          <div key={index} className="flex items-center gap-4 bg-gray-900 p-4 rounded-lg">
                            {doc.file.type.includes('image') ? (
                              <img 
                                src={doc.preview} 
                                alt={doc.file.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                            ) : (
                              <div className="w-16 h-16 flex items-center justify-center bg-gray-800 rounded">
                                <DocumentArrowUpIcon className="h-8 w-8 text-red-300" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-red-300 truncate">{doc.file.name}</p>
                              <p className="text-xs text-gray-400">{(doc.file.size / 1024).toFixed(1)} KB</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeDocument(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-lg mb-2 text-red-300">Classification Criteria</label>
                    <textarea
                      value={criteria}
                      onChange={(e) => setCriteria(e.target.value)}
                      className="w-full h-32 bg-gray-900 rounded-lg border border-red-800/50 text-white p-3
                               focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-colors"
                      placeholder="Describe the classification criteria..."
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading || documents.length === 0 || !criteria}
                    className="w-full bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 
                             disabled:from-gray-800 disabled:to-gray-700 disabled:cursor-not-allowed 
                             py-3 rounded-lg font-semibold transition-colors shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? 'Processing...' : 'Classify Documents'}
                  </motion.button>
                </form>

                {results.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8"
                  >
                    <h2 className="text-2xl font-bold mb-6 text-red-300">Classification Results</h2>
                    <div className="space-y-4">
                      {results.map((result, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gray-900 rounded-lg p-6 border border-red-800/50 shadow-lg"
                        >
                          {/* Document Preview */}
                          <div className="mb-4">
                            <h3 className="text-lg font-semibold text-red-300 mb-2">
                              {result.document_id}
                            </h3>
                            {documents[index]?.file.type.includes('image') && (
                              <img 
                                src={documents[index].preview}
                                alt={result.document_id}
                                className="w-full h-48 object-contain rounded-lg bg-gray-800"
                              />
                            )}
                          </div>

                          {/* Authenticity Section */}
                          <div className="mb-4 pb-4 border-b border-red-800/30">
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="text-lg font-semibold text-red-300">
                                Document Authenticity
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-sm ${
                                result.is_authentic ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                              }`}>
                                {result.is_authentic ? 'Authentic' : 'Potentially Fake'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-300">Confidence:</span>
                              <span className={getConfidenceColor(result.authenticity_confidence)}>
                                {Math.round(result.authenticity_confidence * 100)}%
                              </span>
                            </div>
                            <p className="text-sm text-gray-300">{result.authenticity_reason}</p>
                          </div>

                          {/* Classification Section */}
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="text-lg font-semibold text-red-300">
                                Classification
                              </h3>
                              <span className={getConfidenceColor(result.confidence)}>
                                {Math.round(result.confidence * 100)}% confident
                              </span>
                            </div>
                            <p className="text-xl mb-2">{result.classification}</p>
                            <p className="text-sm text-gray-300 mb-4">{result.classification_reason}</p>

                            {/* Alternatives */}
                            {result.alternatives.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-red-300">Alternatives:</h4>
                                {result.alternatives.map((alt, altIndex) => (
                                  <div
                                    key={altIndex}
                                    className="flex justify-between items-center text-sm"
                                  >
                                    <span className="text-gray-300">{alt.label}</span>
                                    <span className={getConfidenceColor(alt.confidence)}>
                                      {Math.round(alt.confidence * 100)}%
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
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

export default Classification;
