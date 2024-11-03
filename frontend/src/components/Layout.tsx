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
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Japanese pattern */}
        <div className="absolute inset-0 japanese-pattern opacity-5"></div>
        
        {/* Decorative elements */}
        <img
          src={branchesImage}
          alt=""
          className="absolute top-0 right-0 w-96 h-96 transform rotate-90 opacity-5"
        />
        <img
          src={branchesImage}
          alt=""
          className="absolute bottom-0 left-0 w-96 h-96 transform -rotate-90 opacity-5"
        />
        <img
          src={japaneseCharacter}
          alt=""
          className="absolute top-1/4 left-10 w-32 h-32 opacity-5"
        />
        <img
          src={japaneseCharacter}
          alt=""
          className="absolute bottom-1/4 right-10 w-32 h-32 opacity-5 transform rotate-180"
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
            className="py-24 px-4"
          >
            <motion.div className="max-w-7xl mx-auto">
              <motion.div 
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-5xl font-bold mb-4 text-gradient-japanese">
                  AI Document Services
                </h1>
                <p className="text-xl text-red-200/70">
                  Powerful document analysis powered by GPT-4 Vision
                </p>
              </motion.div>
              <BentoBox />
            </motion.div>
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
            <div className="relative h-full pt-20">
              {/* Mini Bento Box */}
              <motion.div
                initial={{ scale: 1, x: 0, y: 0 }}
                animate={{ 
                  scale: 0.3,
                  x: 'calc(100vw - 250px)',
                  y: '20px'
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="absolute top-0 right-0 origin-top-right z-50"
              >
                <BentoBox isMinimized />
              </motion.div>

              {/* Service Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="h-full pt-4 px-4 overflow-auto"
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
