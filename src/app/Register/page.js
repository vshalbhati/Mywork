'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/firebase/config';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiCheckCircle } from 'react-icons/fi';

const Register = ({onLoginClick}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      await updateProfile(userCredential.user, {
        displayName: formData.name
      });
      
      const companyname= formData.email.split('@')[1];
      const companiesRef = collection(db, 'companies');
      const q = query(companiesRef, where('name', '==', companyname));
      const querySnapshot = await getDocs(q);
      
      let companyId;
      
      if (querySnapshot.empty) {
        const companyDoc = await addDoc(companiesRef, {
          name: companyname,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        companyId = companyDoc.id;
      } else {
        companyId = querySnapshot.docs[0].id;
      }

      const userData = {
        id: userCredential.user.uid,
        name: formData.name,
        email: formData.email,
        companyid: companyId,
        companyname: companyname,
      };
      localStorage.setItem('user', JSON.stringify(userData));
      router.push('/Registration');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    // <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    //   <div className="sm:mx-auto sm:w-full sm:max-w-md">
    //     <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
    //       Create your account
    //     </h2>
    //   </div>

    //   <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
    //     <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
    //       <form className="space-y-6" onSubmit={handleSubmit}>
    //         <div>
    //           <label htmlFor="name" className="block text-sm font-medium text-gray-700">
    //             Full Name
    //           </label>
    //           <div className="mt-1">
    //             <input
    //               id="name"
    //               name="name"
    //               type="text"
    //               required
    //               value={formData.name}
    //               onChange={handleChange}
    //               className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    //             />
    //           </div>
    //         </div>

    //         <div>
    //           <label htmlFor="email" className="block text-sm font-medium text-gray-700">
    //             Your work email
    //           </label>
    //           <div className="mt-1">
    //             <input
    //               id="email"
    //               name="email"
    //               type="email"
    //               autoComplete="email"
    //               required
    //               value={formData.email}
    //               onChange={handleChange}
    //               className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    //             />
    //           </div>
    //         </div>

    //         <div>
    //           <label htmlFor="password" className="block text-sm font-medium text-gray-700">
    //             Password
    //           </label>
    //           <div className="mt-1">
    //             <input
    //               id="password"
    //               name="password"
    //               type="password"
    //               required
    //               value={formData.password}
    //               onChange={handleChange}
    //               className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    //             />
    //           </div>
    //         </div>

    //         <div>
    //           <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
    //             Confirm Password
    //           </label>
    //           <div className="mt-1">
    //             <input
    //               id="confirmPassword"
    //               name="confirmPassword"
    //               type="password"
    //               required
    //               value={formData.confirmPassword}
    //               onChange={handleChange}
    //               className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    //             />
    //           </div>
    //         </div>

    //         <div>
    //           <button
    //             type="submit"
    //             disabled={loading}
    //             className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
    //               loading 
    //                 ? 'bg-customGreen cursor-not-allowed' 
    //                 : 'bg-customGreen hover:bg-green-300'
    //             } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}              
    //           >
    //             {loading ? 'Registering...' : 'Register'}
    //           </button>
    //         </div>
    //       </form>

    //       <div className="mt-6 text-center">
    //         <Button onClick={onLoginClick} className="font-medium text-customGreen hover:text-green-300">
    //           Already have an account? Sign in
    //         </Button>
    //       </div>
    //     </div>
    //   </div>
    // </div>
    <div className="w-full max-w-md p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-purple-600">Create Account</h2>
      </motion.div>

      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
        onSubmit={handleSubmit}
      >
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiUser className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 
                         focus:ring-2 focus:ring-purple-600 focus:border-transparent
                         transition-all duration-200 outline-none bg-white/50"
              required
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiMail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Work Email"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 
                         focus:ring-2 focus:ring-purple-600 focus:border-transparent
                         transition-all duration-200 outline-none bg-white/50"
              required
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiLock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 
                         focus:ring-2 focus:ring-purple-600 focus:border-transparent
                         transition-all duration-200 outline-none bg-white/50"
              required
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiCheckCircle className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 
                         focus:ring-2 focus:ring-purple-600 focus:border-transparent
                         transition-all duration-200 outline-none bg-white/50"
              required
            />
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 text-sm p-2 bg-red-50 rounded-lg text-center"
          >
            {error}
          </motion.div>
        )}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg font-medium
                     transform transition-all duration-200 hover:bg-purple-700
                     hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50
                     disabled:cursor-not-allowed shadow-lg hover:shadow-xl
                     flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-6"
        >
          <button
            type="button"
            onClick={onLoginClick}
            className="mt-2 text-purple-600 hover:text-purple-500 font-medium
                     transition-colors duration-200 focus:outline-none
                     focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
                     rounded-md px-4 py-2"
          >
            Sign in instead
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="relative"
        >
          <div className="relative flex justify-center text-sm">
            <span className="text-gray-500">
              By registering, you agree to our Terms and Privacy Policy
            </span>
          </div>
        </motion.div>
      </motion.form>

      {/* Password strength indicator (optional) */}
      {formData.password && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 space-y-2"
        >
          <div className="text-xs text-white">Password strength:</div>
          <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                formData.password.length > 8
                  ? 'bg-green-500 w-full'
                  : formData.password.length > 5
                  ? 'bg-yellow-500 w-2/3'
                  : 'bg-red-500 w-1/3'
              }`}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

const validatePassword = (password) => {
  const checks = {
    length: password.length >= 8,
    hasNumber: /\d/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  return checks;
};

export default Register;