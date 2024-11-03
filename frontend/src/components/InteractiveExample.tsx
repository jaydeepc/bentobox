import { useState } from 'react';
import { motion } from 'framer-motion';

interface InteractiveExampleProps {
  title: string;
  initialInput: string;
  outputPreview: string;
  inputLabel?: string;
  outputLabel?: string;
}

const InteractiveExample = ({
  title,
  initialInput,
  outputPreview,
  inputLabel = 'Input',
  outputLabel = 'Output'
}: InteractiveExampleProps) => {
  const [input, setInput] = useState(initialInput);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 rounded-xl p-6 border border-red-800/50 mt-4"
    >
      <h4 className="text-lg font-semibold text-red-300 mb-4">{title}</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-300 mb-2">{inputLabel}</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-32 bg-gray-950 rounded-lg p-3 font-mono text-sm text-gray-300 border border-red-800/50"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-2">{outputLabel}</label>
          <div className="w-full h-32 bg-gray-950 rounded-lg p-3 font-mono text-sm text-gray-300 border border-red-800/50 overflow-auto">
            <pre className="whitespace-pre-wrap">{outputPreview}</pre>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InteractiveExample;
