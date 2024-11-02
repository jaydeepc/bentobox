import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { DocumentMagnifyingGlassIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const BentoBox = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full max-w-4xl mx-auto p-8">
      {/* Main Bento Box Container */}
      <div className="relative aspect-[4/3] rounded-3xl bg-black p-4 shadow-2xl">
        <div className="absolute inset-0 rounded-3xl border-8 border-black"></div>
        
        {/* Inner Box with Red Background */}
        <div className="relative h-full w-full bg-[#8B0000] rounded-2xl overflow-hidden">
          {/* Grid Layout */}
          <div className="absolute inset-0 grid grid-cols-2 gap-4 p-4">
            {/* Left Column - Split into 3 sections */}
            <div className="grid grid-rows-3 gap-4">
              <motion.div
                className="relative bg-[#B22222] rounded-xl shadow-inner cursor-pointer overflow-hidden"
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate('/classification')}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  <DocumentMagnifyingGlassIcon className="h-8 w-8 text-white mb-2" />
                  <h3 className="text-white text-lg font-semibold text-center">Classification</h3>
                </div>
              </motion.div>

              {/* Placeholder for future service */}
              <motion.div
                className="relative bg-[#B22222] rounded-xl shadow-inner cursor-not-allowed overflow-hidden"
                whileHover={{ scale: 1.02 }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white/50 text-sm">Coming Soon</p>
                </div>
              </motion.div>

              {/* Placeholder for future service */}
              <motion.div
                className="relative bg-[#B22222] rounded-xl shadow-inner cursor-not-allowed overflow-hidden"
                whileHover={{ scale: 1.02 }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white/50 text-sm">Coming Soon</p>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Single large section */}
            <motion.div
              className="relative bg-[#B22222] rounded-xl shadow-inner cursor-pointer overflow-hidden"
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/parsing')}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <DocumentTextIcon className="h-12 w-12 text-white mb-2" />
                <h3 className="text-white text-xl font-semibold text-center">Parsing</h3>
                <p className="text-white/70 text-sm text-center mt-2">
                  Extract information from documents
                </p>
              </div>
            </motion.div>
          </div>

          {/* Divider Lines */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Vertical Divider */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-[#8B0000] transform -translate-x-1/2"></div>
            
            {/* Horizontal Dividers for left column */}
            <div className="absolute left-0 w-[calc(50%-2px)] top-1/3 h-1 bg-[#8B0000]"></div>
            <div className="absolute left-0 w-[calc(50%-2px)] top-2/3 h-1 bg-[#8B0000]"></div>
          </div>
        </div>

        {/* Shine Effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
      </div>

      {/* Chopsticks */}
      <div className="absolute -right-16 top-1/2 -translate-y-1/2 transform rotate-45">
        <div className="w-2 h-48 bg-gradient-to-b from-[#8B4513] to-[#2C1810] rounded-full shadow-lg"></div>
        <div className="w-2 h-48 bg-gradient-to-b from-[#8B4513] to-[#2C1810] rounded-full shadow-lg ml-3 -mt-44"></div>
      </div>
    </div>
  );
};

export default BentoBox;
