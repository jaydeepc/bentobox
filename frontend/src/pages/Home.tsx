import { motion } from 'framer-motion';
import { useState } from 'react';
import BentoBox from '../components/BentoBox';
import japaneseCharacter from '../assets/images/icons/japanese-character-svgrepo-com.svg';
import japaneseCircle from '../assets/images/icons/japanese-circle-svgrepo-com.svg';
import dishAndToothpick from '../assets/images/icons/dish-and-toothpick-svgrepo-com.svg';
import branchesWithLeaves from '../assets/images/icons/branches-with-leaves-svgrepo-com.svg';

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    if (href) {
      const element = document.querySelector(href);
      element?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white min-h-screen">
      {/* Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src={japaneseCharacter}
                alt="Logo" 
                className="w-6 h-6 invert opacity-80"
              />
              <span className="text-lg sm:text-xl font-semibold text-red-300">Document Services</span>
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className="w-6 h-0.5 bg-gray-300 mb-1"></div>
              <div className="w-6 h-0.5 bg-gray-300 mb-1"></div>
              <div className="w-6 h-0.5 bg-gray-300"></div>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#about" onClick={handleNavClick} className="text-gray-300 hover:text-red-300 transition-colors">About</a>
              <a href="#concept" onClick={handleNavClick} className="text-gray-300 hover:text-red-300 transition-colors">Concept</a>
              <a href="#services" onClick={handleNavClick} className="text-gray-300 hover:text-red-300 transition-colors">Services</a>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} pt-4`}>
            <div className="flex flex-col gap-4">
              <a href="#about" onClick={handleNavClick} className="text-gray-300 hover:text-red-300 transition-colors">About</a>
              <a href="#concept" onClick={handleNavClick} className="text-gray-300 hover:text-red-300 transition-colors">Concept</a>
              <a href="#services" onClick={handleNavClick} className="text-gray-300 hover:text-red-300 transition-colors">Services</a>
            </div>
          </div>
        </nav>
      </header>

      {/* About Section */}
      <section id="about" className="pt-28 sm:pt-32 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-16">
            {/* Title and Description */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="max-w-xl"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 text-left">
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="block text-red-400 mb-1"
                >
                  Document
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="block text-red-400 mb-1"
                >
                  Processing
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="block text-white/90"
                >
                  Microservices
                </motion.span>
              </h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="text-lg sm:text-xl lg:text-2xl text-gray-300 leading-relaxed text-left"
              >
                Understanding microservices through the elegance of a bento box. Explore how our document processing 
                services are organized into specialized, harmonious components.
              </motion.p>
            </motion.div>

            {/* Bento Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="w-full max-w-2xl mx-auto lg:mx-0"
            >
              <BentoBox />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Concept Section */}
      <section id="concept" className="px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24">
        <div className="w-full max-w-7xl mx-auto py-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-red-400 mb-12 text-center">The Bento Box Concept</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <motion.div 
                className="relative bg-gray-800 rounded-xl p-8 border border-red-800/50 shadow-lg overflow-hidden group hover:bg-gray-800/80 transition-colors duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-red-500/50 to-transparent"></div>
                <h3 className="text-2xl font-bold text-red-300 mb-4 group-hover:text-red-400 transition-colors duration-300">Organized Compartments</h3>
                <p className="text-lg text-gray-300 leading-relaxed group-hover:text-white transition-colors duration-300">
                  Just as a bento box neatly organizes different dishes, our microservices architecture arranges document 
                  processing capabilities into distinct, specialized modules.
                </p>
              </motion.div>

              <motion.div 
                className="relative bg-gray-800 rounded-xl p-8 border border-red-800/50 shadow-lg overflow-hidden group hover:bg-gray-800/80 transition-colors duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-red-500/50 to-transparent"></div>
                <h3 className="text-2xl font-bold text-red-300 mb-4 group-hover:text-red-400 transition-colors duration-300">Perfect Harmony</h3>
                <p className="text-lg text-gray-300 leading-relaxed group-hover:text-white transition-colors duration-300">
                  Each service is self-contained yet designed to complement others, like the components of a bento box 
                  working together to create the perfect meal.
                </p>
              </motion.div>

              <motion.div 
                className="relative bg-gray-800 rounded-xl p-8 border border-red-800/50 shadow-lg overflow-hidden group hover:bg-gray-800/80 transition-colors duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-red-500/50 to-transparent"></div>
                <h3 className="text-2xl font-bold text-red-300 mb-4 group-hover:text-red-400 transition-colors duration-300">Modular Integration</h3>
                <p className="text-lg text-gray-300 leading-relaxed group-hover:text-white transition-colors duration-300">
                  Mix and match services to create custom workflows, just like selecting different items to create your 
                  perfect bento box combination.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24">
        <div className="w-full max-w-7xl mx-auto py-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-red-400 mb-8 text-left">Available Services</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div 
                className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/30 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="bg-red-500/10 rounded-lg p-3 w-12 h-12 mb-6">
                  <img 
                    src={japaneseCircle}
                    alt="" 
                    className="w-full h-full invert opacity-60"
                  />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-red-300 mb-4">Classification Service</h3>
                <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                  Automatically categorize and organize documents using advanced AI algorithms. Perfect for sorting 
                  large document collections.
                </p>
              </motion.div>

              <motion.div 
                className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/30 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className="bg-red-500/10 rounded-lg p-3 w-12 h-12 mb-6">
                  <img 
                    src={dishAndToothpick}
                    alt="" 
                    className="w-full h-full invert opacity-60"
                  />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-red-300 mb-4">Parsing Service</h3>
                <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                  Extract structured data from documents with high precision. Ideal for automating data entry 
                  and creating searchable databases.
                </p>
              </motion.div>

              <motion.div 
                className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/30 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <div className="bg-red-500/10 rounded-lg p-3 w-12 h-12 mb-6">
                  <img 
                    src={branchesWithLeaves}
                    alt="" 
                    className="w-full h-full invert opacity-60"
                  />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-red-300 mb-4">Matching Service</h3>
                <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                  Compare documents to identify matching elements and discrepancies based on configurable criteria. 
                  Perfect for verifying consistency across related documents.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
