import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { DocumentMagnifyingGlassIcon, DocumentTextIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';

interface BentoBoxProps {
  isMinimized?: boolean;
}

const BentoBox = ({ isMinimized = false }: BentoBoxProps) => {
  const navigate = useNavigate();

  const handleSectionClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className={`relative w-full mx-auto ${isMinimized ? 'p-1' : 'p-4 sm:p-6 lg:p-8'}`}>
      {/* Main Bento Box Container */}
      <div className="relative w-full aspect-[4/3] rounded-2xl bg-black p-3 sm:p-4 shadow-2xl">
        <div className="absolute inset-0 rounded-2xl border-4 border-black"></div>
        
        {/* Inner Box with Red Background */}
        <div className="relative h-full w-full bg-[#8B0000] rounded-xl overflow-hidden">
          {/* Grid Layout */}
          <div className="absolute inset-0 grid grid-cols-2 gap-2 sm:gap-3 p-2 sm:p-3">
            {/* Left Column - Split into 3 sections */}
            <div className="grid grid-rows-3 gap-2 sm:gap-3">
              <motion.div
                className="relative bg-[#B22222] rounded-lg shadow-inner cursor-pointer overflow-hidden service-pulse"
                whileHover={{ scale: 1.02 }}
                onClick={() => handleSectionClick('/classification')}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center p-2 sm:p-3">
                  <DocumentMagnifyingGlassIcon className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white mb-1 sm:mb-2" />
                  <h3 className="text-white text-sm sm:text-base lg:text-lg font-semibold text-center service-text">Classification</h3>
                </div>
              </motion.div>

              <motion.div
                className="relative bg-[#B22222] rounded-lg shadow-inner cursor-pointer overflow-hidden service-pulse"
                whileHover={{ scale: 1.02 }}
                onClick={() => handleSectionClick('/matching')}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center p-2 sm:p-3">
                  <DocumentDuplicateIcon className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white mb-1 sm:mb-2" />
                  <h3 className="text-white text-sm sm:text-base lg:text-lg font-semibold text-center service-text">Matching</h3>
                </div>
              </motion.div>

              {/* Placeholder for future service */}
              <motion.div
                className="relative bg-[#B22222] rounded-lg shadow-inner cursor-not-allowed overflow-hidden opacity-60"
                whileHover={{ scale: 1.02 }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white/50 text-xs sm:text-sm lg:text-base">Coming Soon</p>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Single large section */}
            <motion.div
              className="relative bg-[#B22222] rounded-lg shadow-inner cursor-pointer overflow-hidden service-pulse"
              whileHover={{ scale: 1.02 }}
              onClick={() => handleSectionClick('/parsing')}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-2 sm:p-4">
                <DocumentTextIcon className="h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-white mb-2 sm:mb-3" />
                <h3 className="text-white text-base sm:text-lg lg:text-xl font-semibold text-center service-text mb-1 sm:mb-2">Parsing</h3>
                <p className="text-white/70 text-xs sm:text-sm lg:text-base text-center max-w-[80%]">
                  Extract information from documents
                </p>
              </div>
            </motion.div>
          </div>

          {/* Divider Lines */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Vertical Divider */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#8B0000] transform -translate-x-1/2"></div>
            
            {/* Horizontal Dividers for left column */}
            <div className="absolute left-0 w-[calc(50%-1px)] top-1/3 h-0.5 bg-[#8B0000]"></div>
            <div className="absolute left-0 w-[calc(50%-1px)] top-2/3 h-0.5 bg-[#8B0000]"></div>
          </div>
        </div>

        {/* Shine Effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
      </div>

      {/* Chopsticks - Only show when not minimized and on larger screens */}
      {!isMinimized && (
        <div className="absolute -right-8 sm:-right-16 top-1/2 -translate-y-1/2 transform rotate-45 hidden sm:block">
          <div className="w-1 sm:w-2 h-32 sm:h-48 bg-gradient-to-b from-[#8B4513] to-[#2C1810] rounded-full shadow-lg"></div>
          <div className="w-1 sm:w-2 h-32 sm:h-48 bg-gradient-to-b from-[#8B4513] to-[#2C1810] rounded-full shadow-lg ml-2 sm:ml-3 -mt-28 sm:-mt-44"></div>
        </div>
      )}
    </div>
  );
};

export default BentoBox;
