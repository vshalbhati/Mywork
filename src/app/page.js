'use client'
import React, { useState } from 'react';
import LoginPage from './Login/page';
import styles from './Homepage.module.css';
import loginImage from '../assets/images/login.png';
import Image from 'next/image';
import Register from './Register/page';

const Homepage = () => {
  const [isLoginView, setIsLoginView] = useState(true);

  const toggleView = () => {
    setIsLoginView(!isLoginView);
  };
  return (
    <div className={styles.container}>
      <div className={styles.imageSection}>
        <Image 
          src={loginImage}
          alt="Login illustration"
          className={styles.image}
          priority
        />
      </div>
      {/* <div className={styles.loginSection}>
        <LoginPage />
      </div> */}
      <div className={styles.formContainer}>
        <div className={`${styles.slidingContainer} ${isLoginView ? styles.slideRight : styles.slideLeft}`}>
          {isLoginView ? (
            <LoginPage onCreateAccountClick={toggleView} />
          ) : (
            <Register onLoginClick={toggleView} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Homepage;