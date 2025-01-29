'use client'
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Environment } from '@react-three/drei';
import {
  FaArrowRight,
  FaCode,
  FaBrain,
  FaLightbulb 
} from 'react-icons/fa';
import './globals.css';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';

function LoadingGeometry() {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x += 0.005;
      groupRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      {[0, 1, 2].map((index) => (
        <mesh 
          key={index} 
          position={[
            Math.sin(index * 2) * 2, 
            Math.cos(index * 2) * 2, 
            0
          ]}
        >
          <icosahedronGeometry args={[0.5, 1]} />
          <meshStandardMaterial 
            color={['#6366f1', '#10b981', '#ec4899'][index]} 
            opacity={0.7} 
            transparent 
          />
        </mesh>
      ))}
    </group>
  );
}

export default function TaskFlowLandingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const totalLoadingTime = 3000;
    const startTime = Date.now();

    const loadingAnimation = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min((elapsedTime / totalLoadingTime) * 100, 100);
      
      setLoadingProgress(progress);

      if (progress < 100) {
        requestAnimationFrame(loadingAnimation);
      } else {
        setIsLoading(false);
      }
    };

    requestAnimationFrame(loadingAnimation);
  }, []);

  // Main Landing Page Component
  const MainLandingPage = () => {
    const route = useRouter();
    const [email, setEmail] = useState('');
    const features = [
      {
        icon: <FaCode className="text-4xl text-indigo-500" />,
        title: 'Intelligent Workflow',
        description: 'AI-powered task optimization and intelligent routing',
        gradient: 'from-indigo-500 to-purple-600'
      },
      {
        icon: <FaBrain className="text-4xl text-emerald-500" />,
        title: 'Predictive Analytics',
        description: 'Advanced machine learning insights for team performance',
        gradient: 'from-emerald-500 to-teal-600'
      },
      {
        icon: <FaLightbulb className="text-4xl text-pink-500" />,
        title: 'Creative Collaboration',
        description: 'Innovative workspace design for maximum creativity',
        gradient: 'from-pink-500 to-rose-600'
      }
    ];

    const handleEmailSubmit = (e) => {
      e.preventDefault();
      alert(`Welcome to TaskFlow AI, ${email}!`);
      setEmail('');
    };

    return (
      <div className="relative min-h-screen bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Canvas 
            camera={{ position: [0, 0, 5] }}
            shadows
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <Environment preset="city" />
              
              <Stars 
                radius={300} 
                depth={50} 
                count={5000} 
                factor={4} 
                saturation={0} 
              />
            </Suspense>
          </Canvas>
        </div>

        <div className="relative z-10">
          <motion.nav 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 p-6 bg-black/30 backdrop-blur-md"
          >
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <motion.h1 
                className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                TaskFlow AI
              </motion.h1>
              <div className="flex items-center space-x-6">
                {['Features', 'Pricing', 'Solutions'].map((item, index) => (
                  <motion.a 
                    key={index}
                    href={`#${item.toLowerCase()}`} 
                    className="text-gray-300 hover:text-white transition-colors"
                    whileHover={{ scale: 1.1 }}
                  >
                    {item}
                  </motion.a>
                ))}
                <motion.button 
                  className="bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-2 rounded-full shadow-2xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => route.push('/Signin')}
                >
                  Login
                </motion.button>
              </div>
            </div>
          </motion.nav>

          {/* Hero Section */}
          <div className="relative min-h-screen flex items-center justify-center px-6">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <h2 className="text-6xl font-extrabold leading-tight">
                  Revolutionize 
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600">
                    Team Productivity
                  </span>
                </h2>
                <p className="text-xl text-gray-300">
                  Unleash the power of AI-driven task management, transforming how teams collaborate, track, and achieve unprecedented goals.
                </p>
                
                <motion.form 
                  onSubmit={handleEmailSubmit}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex bg-white/10 backdrop-blur-md rounded-full p-2"
                >
                  <input 
                    type="email"
                    placeholder="Enter your work email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-grow bg-transparent px-6 py-3 text-white placeholder-gray-400 focus:outline-none"
                  />
                  <motion.button 
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-8 py-3 rounded-full flex items-center space-x-2"
                  >
                    <span>Get Started</span>
                    <FaArrowRight />
                  </motion.button>
                </motion.form>
              </motion.div>

              {/* Animated Feature Showcase */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
              >
                <div className="grid grid-cols-3 gap-4">
                  {features.map((feature, index) => (
                    <motion.div 
                      key={index}
                      whileHover={{ scale: 1.1 }}
                      className="bg-white/20 p-4 rounded-lg flex flex-col items-center justify-center"
                    >
                      {feature.icon}
                      <span className="text-xs mt-2 text-center">{feature.title}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Features Section */}
          <section className="py-24 bg-black/50 backdrop-blur-xl">
            <div className="max-w-6xl mx-auto px-6">
              <h3 className="text-4xl font-bold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600">
                Breakthrough Features
              </h3>

              <div className="grid md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                    whileHover={{ scale: 1.05 }}
                    className={`
                      relative p-8 rounded-3xl border border-white/10 
                      backdrop-blur-md overflow-hidden group
                      bg-gradient-to-br ${feature.gradient} opacity-80
                    `}
                  >
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-50 transition-all duration-300"></div>
                    <div className="relative z-10 text-center">
                      <div className="mb-6 flex justify-center">
                        {feature.icon}
                      </div>
                      <h4 className="text-2xl font-bold mb-4">
                        {feature.title}
                      </h4>
                      <p className="text-white/80">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  };

  const LoadingScreen = () => {
    return (
      <motion.div 
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-50 bg-gradient-to-br from-black to-gray-900 flex flex-col items-center justify-center"
      >
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            
            <Stars 
              radius={300} 
              depth={50} 
              count={5000} 
              factor={4} 
              saturation={0} 
            />
            
            <Float
              speed={2}
              rotationIntensity={1}
              floatIntensity={1}
            >
              <LoadingGeometry />
            </Float>
            
            <OrbitControls 
              enableZoom={false} 
              autoRotate 
              autoRotateSpeed={0.5} 
            />
          </Canvas>
        </div>

        {/* Loading Content */}
        <div className="relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600"
          >
            TaskFlow AI
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl text-gray-300 mb-12"
          >
            Preparing your intelligent workspace
          </motion.p>

          {/* Slow Progress Bar */}
          <div className="w-96 bg-gray-800 rounded-full h-4 mb-4 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${loadingProgress}%` }}
              transition={{ 
                duration: 3, 
                ease: "easeInOut" 
              }}
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-700 rounded-full"
            />
          </div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-gray-400 text-lg"
          >
            {Math.round(loadingProgress)}% Loaded
          </motion.p>
        </div>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      {isLoading ? (
        <LoadingScreen key="loading" />
      ) : (
        <MainLandingPage key="main" />
      )}
    </AnimatePresence>
  );
}
