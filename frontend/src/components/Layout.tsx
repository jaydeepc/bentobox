import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import BentoBox from './BentoBox';
import Header from './Header';
import branchesImage from '../assets/images/icons/branches-with-leaves-svgrepo-com.svg';
import japaneseCharacter from '../assets/images/icons/japanese-character-svgrepo-com.svg';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-x-hidden">
      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Japanese pattern */}
        <div className="absolute inset-0 japanese-pattern opacity-5"></div>
        
        {/* Decorative elements - Adjusted for better mobile display */}
        <img
          src={branchesImage}
          alt=""
          className="absolute -top-4 -right-4 sm:top-0 sm:right-0 w-24 sm:w-48 md:w-72 lg:w-96 h-24 sm:h-48 md:h-72 lg:h-96 transform rotate-90 opacity-5"
        />
        <img
          src={branchesImage}
          alt=""
          className="absolute -bottom-4 -left-4 sm:bottom-0 sm:left-0 w-24 sm:w-48 md:w-72 lg:w-96 h-24 sm:h-48 md:h-72 lg:h-96 transform -rotate-90 opacity-5"
        />
        <img
          src={japaneseCharacter}
          alt=""
          className="absolute top-1/4 -left-2 sm:left-10 w-12 sm:w-24 md:w-32 h-12 sm:h-24 md:h-32 opacity-5"
        />
        <img
          src={japaneseCharacter}
          alt=""
          className="absolute bottom-1/4 -right-2 sm:right-10 w-12 sm:w-24 md:w-32 h-12 sm:h-24 md:h-32 opacity-5 transform rotate-180"
        />
      </div>

      <Header />

      <AnimatePresence mode="wait">
        {isHome ? (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.div>
        ) : (
          <motion.div
            key="service"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className="absolute inset-0"
          >
            <div className="relative h-full pt-16">
              {/* Mini Bento Box - Adjusted for mobile */}
              <motion.div
                initial={{ scale: 1, x: 0, y: 0 }}
                animate={{ 
                  scale: 0.25,
                  x: 'calc(100vw - 80px)',
                  y: '16px'
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="absolute top-0 right-0 origin-top-right z-50 hidden sm:block"
              >
                <BentoBox isMinimized />
              </motion.div>

              {/* Service Content - Improved mobile padding */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="h-full pt-2 sm:pt-4 px-2 sm:px-4 overflow-auto pb-16 sm:pb-4"
              >
                {children}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;
