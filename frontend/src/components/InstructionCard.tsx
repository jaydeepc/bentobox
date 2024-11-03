import { motion } from 'framer-motion';

interface InstructionCardProps {
  number: number;
  title: string;
  description: string;
  example?: string;
  delay?: number;
}

const InstructionCard = ({ number, title, description, example, delay = 0 }: InstructionCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-gray-900 rounded-xl p-6 border border-red-800/50"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 bg-red-800 rounded-full flex items-center justify-center text-white font-bold">
          {number}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-red-300 mb-2">{title}</h3>
          <p className="text-gray-300 mb-4">{description}</p>
          {example && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ delay: delay + 0.2 }}
              className="bg-gray-950 rounded-lg p-4 font-mono text-sm text-gray-300"
            >
              <pre className="whitespace-pre-wrap">{example}</pre>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default InstructionCard;
