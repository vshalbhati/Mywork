'use client'
import React, { useState } from 'react';
import LoginPage from '../Login/page';
import Register from '../Register/page';
import { motion, AnimatePresence } from 'framer-motion';

const Homepage = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  
  const toggleView = () => {
    setIsLoginView(!isLoginView);
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.8,
      rotateY: direction > 0 ? -15 : 15
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    },
    exit: (direction) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.8,
      rotateY: direction < 0 ? -15 : 15
    })
  };

  const backgroundVariants = {
    initial: {
      backgroundPosition: '0% 50%'
    },
    animate: {
      backgroundPosition: '100% 50%',
      transition: {
        duration: 20,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "linear"
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen w-full flex items-center justify-center bg-gradient-to-r from-blue-500 via-purple-600 to-red-500 bg-[length:300%_300%] relative overflow-hidden"
      variants={backgroundVariants}
      initial="initial"
      animate="animate"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />

      {/* Form Container */}
      <div className="relative w-full max-w-md min-h-[550px] mx-4 perspective-1500">
        <AnimatePresence
          initial={false}
          custom={isLoginView ? 1 : -1}
          mode="wait"
        >
          {isLoginView ? (
            <motion.div
              key="login"
              className="absolute w-full h-full bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-xl cursor-grab active:cursor-grabbing touch-none
                         border border-white/20 hover:translate-y-[-2px] transition-all duration-300
                         hover:shadow-2xl"
              custom={isLoginView ? 1 : -1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
              onDragEnd={(e, { offset }) => {
                if (offset.x > 100) {
                  toggleView();
                }
              }}
            >
              <LoginPage onCreateAccountClick={toggleView} />
            </motion.div>
          ) : (
            <motion.div
              key="register"
              className="absolute w-full h-full bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-xl cursor-grab active:cursor-grabbing touch-none
                         border border-white/20 hover:translate-y-[-2px] transition-all duration-300
                         hover:shadow-2xl"
              custom={isLoginView ? 1 : -1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
              onDragEnd={(e, { offset }) => {
                if (offset.x < -100) {
                  toggleView();
                }
              }}
            >
              <Register onLoginClick={toggleView} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Homepage;