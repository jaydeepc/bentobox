import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { DocumentMagnifyingGlassIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

const BentoBox = () => {
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const handleSectionClick = (route: string, section: string) => {
    setSelectedSection(section);
    // Increased delay to match the full animation sequence
    setTimeout(() => {
      navigate(route);
    }, 1000); // Synchronized with the full animation duration
  };

  const sectionVariants = {
    normal: {
      scale: 1,
      zIndex: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    expanded: {
      scale: [1, 1.8, 1.4, 0],
      zIndex: 50,
      transition: { 
        duration: 1,
        times: [0, 0.4, 0.6, 1],
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const containerVariants = {
    normal: {
      scale: 1,
      opacity: 1,
      transition: { 
        duration: 0.4,
        ease: "easeOut"
      }
    },
    minimized: {
      scale: 0.6,
      opacity: 0,
      transition: { 
        duration: 0.6,
        delay: 0.4, // Start minimizing after section expands
        ease: "easeIn"
      }
    }
  };

  const overlayVariants = {
    hidden: { 
      opacity: 0,
      transition: { duration: 0.3 }
    },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <>
      <AnimatePresence>
        {selectedSection && (
          <motion.div
            className="bento-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          />
        )}
      </AnimatePresence>

      <div className="relative w-full max-w-4xl mx-auto p-8">
        {/* Main Bento Box Container */}
        <motion.div 
          className="relative aspect-[4/3] rounded-3xl bg-black p-4 shadow-2xl bento-container"
          variants={containerVariants}
          animate={selectedSection ? "minimized" : "normal"}
        >
          <div className="absolute inset-0 rounded-3xl border-8 border-black"></div>
          
          {/* Inner Box with Red Background */}
          <div className="relative h-full w-full bg-[#8B0000] rounded-2xl overflow-hidden">
            {/* Grid Layout */}
            <div className="absolute inset-0 grid grid-cols-2 gap-4 p-4">
              {/* Left Column - Split into 3 sections */}
              <div className="grid grid-rows-3 gap-4">
                <motion.div
                  className="relative bg-[#B22222] rounded-xl shadow-inner cursor-pointer overflow-hidden bento-section"
                  variants={sectionVariants}
                  animate={selectedSection === 'classification' ? "expanded" : "normal"}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                  onClick={() => handleSectionClick('/classification', 'classification')}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <DocumentMagnifyingGlassIcon className="h-8 w-8 text-white mb-2" />
                    <h3 className="text-white text-lg font-semibold text-center">Classification</h3>
                  </div>
                </motion.div>

                {/* Placeholder for future service */}
                <motion.div
                  className="relative bg-[#B22222] rounded-xl shadow-inner cursor-not-allowed overflow-hidden"
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-white/50 text-sm">Coming Soon</p>
                  </div>
                </motion.div>

                {/* Placeholder for future service */}
                <motion.div
                  className="relative bg-[#B22222] rounded-xl shadow-inner cursor-not-allowed overflow-hidden"
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-white/50 text-sm">Coming Soon</p>
                  </div>
                </motion.div>
              </div>

              {/* Right Column - Single large section */}
              <motion.div
                className="relative bg-[#B22222] rounded-xl shadow-inner cursor-pointer overflow-hidden bento-section"
                variants={sectionVariants}
                animate={selectedSection === 'parsing' ? "expanded" : "normal"}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                onClick={() => handleSectionClick('/parsing', 'parsing')}
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
            <motion.div 
              className="absolute inset-0 pointer-events-none"
              animate={selectedSection ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Vertical Divider */}
              <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-[#8B0000] transform -translate-x-1/2"></div>
              
              {/* Horizontal Dividers for left column */}
              <div className="absolute left-0 w-[calc(50%-2px)] top-1/3 h-1 bg-[#8B0000]"></div>
              <div className="absolute left-0 w-[calc(50%-2px)] top-2/3 h-1 bg-[#8B0000]"></div>
            </motion.div>
          </div>

          {/* Shine Effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
        </motion.div>

        {/* Chopsticks */}
        <motion.div 
          className="absolute -right-16 top-1/2 -translate-y-1/2 transform rotate-45"
          animate={selectedSection ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-2 h-48 bg-gradient-to-b from-[#8B4513] to-[#2C1810] rounded-full shadow-lg"></div>
          <div className="w-2 h-48 bg-gradient-to-b from-[#8B4513] to-[#2C1810] rounded-full shadow-lg ml-3 -mt-44"></div>
        </motion.div>
      </div>
    </>
  );
};

export default BentoBox;
