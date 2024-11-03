import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <motion.button
      onClick={() => navigate('/')}
      className="fixed top-6 left-6 flex items-center gap-2 text-red-300 hover:text-red-400 transition-colors"
      whileHover={{ x: -4 }}
      whileTap={{ scale: 0.95 }}
    >
      <ArrowLeftIcon className="h-5 w-5" />
      <span>Back to Bento</span>
    </motion.button>
  );
};

export default BackButton;
