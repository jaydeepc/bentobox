import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

interface PlaygroundLayoutProps {
  title: string;
  instructions: React.ReactNode;
  playground: React.ReactNode;
}

const PlaygroundLayout = ({ title, instructions, playground }: PlaygroundLayoutProps) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const instructionsRef = useRef<HTMLDivElement>(null);
  const playgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const instructionsEl = instructionsRef.current;
    const playgroundEl = playgroundRef.current;

    if (container && instructionsEl && playgroundEl) {
      // Initial animation
      gsap.from(instructionsEl, {
        x: -100,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      });

      gsap.from(playgroundEl, {
        x: 100,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.2
      });

      // Scroll animations
      ScrollTrigger.create({
        trigger: instructionsEl,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          gsap.to(instructionsEl, {
            y: self.progress * 50,
            duration: 0
          });
        }
      });

      ScrollTrigger.create({
        trigger: playgroundEl,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          gsap.to(playgroundEl, {
            y: self.progress * 100,
            duration: 0
          });
        }
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
          ref={containerRef}
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-red-300 hover:text-red-200 mb-8 group"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </button>

          <h1 className="text-5xl font-bold mb-12 bg-clip-text text-transparent bg-gradient-to-r from-red-300 to-red-500">
            {title}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Instructions Section */}
            <div
              ref={instructionsRef}
              className="bg-gray-800 rounded-3xl p-6 border-2 border-red-800/50"
            >
              <div className="space-y-6">
                {instructions}
              </div>
            </div>

            {/* Playground Section */}
            <div
              ref={playgroundRef}
              className="bg-gray-800 rounded-3xl p-6 border-2 border-red-800/50 lg:sticky lg:top-8"
            >
              <div className="relative">
                {playground}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PlaygroundLayout;
