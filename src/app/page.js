'use client'
import React from 'react';
import LoginPage from './Login/page';
import styles from './Homepage.module.css';
import loginImage from '../assets/images/login.png';
import Image from 'next/image';

const Homepage = () => {
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
      <div className={styles.loginSection}>
        <LoginPage />
      </div>
    </div>
  );
};

export default Homepage;