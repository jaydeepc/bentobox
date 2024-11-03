import { motion } from 'framer-motion';
import BentoBox from '../components/BentoBox';
import japaneseCharacter from '../assets/images/icons/japanese-character-svgrepo-com.svg';
import japaneseCircle from '../assets/images/icons/japanese-circle-svgrepo-com.svg';
import dishAndToothpick from '../assets/images/icons/dish-and-toothpick-svgrepo-com.svg';
import branchesWithLeaves from '../assets/images/icons/branches-with-leaves-svgrepo-com.svg';

const Home = () => {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    if (href) {
      const element = document.querySelector(href);
      element?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
        <nav className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src={japaneseCharacter}
                alt="Logo" 
                className="w-6 h-6 invert opacity-80"
              />
              <span className="text-lg font-semibold text-red-300">Document Services</span>
            </div>
            <div className="flex items-center gap-8">
              <a href="#about" onClick={handleNavClick} className="text-gray-300 hover:text-red-300 transition-colors">About</a>
              <a href="#concept" onClick={handleNavClick} className="text-gray-300 hover:text-red-300 transition-colors">Concept</a>
              <a href="#services" onClick={handleNavClick} className="text-gray-300 hover:text-red-300 transition-colors">Services</a>
            </div>
          </div>
        </nav>
      </header>

      {/* About Section */}
      <section id="about" className="h-screen flex items-center justify-center px-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            {/* Left Side - Title and Description */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="lg:col-span-5"
            >
              <h1 className="text-7xl font-bold mb-8 leading-[1.1]">
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
                className="text-xl text-gray-300 leading-relaxed"
              >
                Understanding microservices through the elegance of a bento box. Explore how our document processing 
                services are organized into specialized, harmonious components.
              </motion.p>
            </motion.div>

            {/* Right Side - Large Bento Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="lg:col-span-7 relative"
            >
              <BentoBox />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Concept Section */}
      <section id="concept" className="min-h-screen flex items-center justify-center px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto py-24">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-5xl font-bold text-red-400 mb-16">The Bento Box Concept</h2>
            <div className="space-y-12">
              <motion.div 
                className="bg-gray-800/30 rounded-xl p-8 border border-gray-700/30 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-2xl font-bold text-red-300 mb-4">Organized Compartments</h3>
                <p className="text-xl text-gray-300 leading-relaxed">
                  Just as a bento box neatly organizes different dishes into compartments, our microservices 
                  architecture arranges document processing capabilities into distinct, specialized modules.
                </p>
              </motion.div>

              <motion.div 
                className="bg-gray-800/30 rounded-xl p-8 border border-gray-700/30 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-red-300 mb-4">Perfect Harmony</h3>
                <p className="text-xl text-gray-300 leading-relaxed">
                  Each service is self-contained yet designed to complement others. Like the components of a 
                  bento box, they can be used individually or combined to create the perfect solution.
                </p>
              </motion.div>

              <motion.div 
                className="bg-gray-800/30 rounded-xl p-8 border border-gray-700/30 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-2xl font-bold text-red-300 mb-4">Modular Integration</h3>
                <p className="text-xl text-gray-300 leading-relaxed">
                  Mix and match services to create custom document processing workflows. The modular nature 
                  allows for flexible integration into your existing applications.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="min-h-screen flex items-center justify-center px-8">
        <div className="max-w-7xl mx-auto py-24">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-bold text-red-400 mb-16 text-center">Available Services</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <motion.div 
                className="bg-gray-800/30 rounded-xl p-8 border border-gray-700/30 backdrop-blur-sm"
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
                <h3 className="text-2xl font-bold text-red-300 mb-4">Classification Service</h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  Automatically categorize and organize documents using advanced AI algorithms. Perfect for sorting 
                  large document collections.
                </p>
              </motion.div>

              <motion.div 
                className="bg-gray-800/30 rounded-xl p-8 border border-gray-700/30 backdrop-blur-sm"
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
                <h3 className="text-2xl font-bold text-red-300 mb-4">Parsing Service</h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  Extract structured data from documents with high precision. Ideal for automating data entry 
                  and creating searchable databases.
                </p>
              </motion.div>

              <motion.div 
                className="bg-gray-800/30 rounded-xl p-8 border border-gray-700/30 backdrop-blur-sm"
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
                <h3 className="text-2xl font-bold text-red-300 mb-4">More Coming Soon</h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  Our collection of document processing services is growing. Stay tuned for additional specialized 
                  services to enhance your workflows.
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
