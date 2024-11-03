import { motion } from 'framer-motion';
import piramalLogo from '../assets/images/logo/piramal_logo.svg';
import japaneseCharacter from '../assets/images/icons/japanese-character-svgrepo-com.svg';
import japanesePagoda from '../assets/images/icons/japanese-pagoda-svgrepo-com.svg';
import branchesImage from '../assets/images/icons/branches-with-leaves-svgrepo-com.svg';

const Header = () => {
  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Japanese-style decorative bar */}
      <div className="h-1 w-full bg-gradient-to-r from-red-800 via-red-600 to-red-800"></div>
      
      <div className="bg-gradient-to-b from-gray-900/95 to-gray-900/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side with logo and decorative elements */}
            <div className="flex items-center gap-6">
              <motion.img 
                src={japaneseCharacter}
                alt="Japanese Character"
                className="w-8 h-8 opacity-80"
                whileHover={{ scale: 1.1, rotate: 10 }}
              />
              <div className="relative">
                <motion.img
                  src={piramalLogo}
                  alt="Piramal Logo"
                  className="h-8 invert opacity-90"
                  whileHover={{ scale: 1.05 }}
                />
                <motion.img
                  src={branchesImage}
                  alt=""
                  className="absolute -bottom-3 left-0 w-full h-1 opacity-30"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5 }}
                />
              </div>
            </div>

            {/* Right side decorative elements */}
            <div className="flex items-center gap-6">
              <motion.div
                className="text-red-300 text-sm font-medium tracking-wide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                AI-Powered
              </motion.div>
              <motion.img 
                src={japanesePagoda}
                alt="Japanese Pagoda"
                className="w-8 h-8 opacity-80"
                whileHover={{ scale: 1.1, rotate: -10 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom decorative shadow */}
      <div className="h-8 bg-gradient-to-b from-gray-900/50 to-transparent pointer-events-none"></div>
    </motion.header>
  );
};

export default Header;
