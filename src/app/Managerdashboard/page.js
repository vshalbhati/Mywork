'use client';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getUser } from '@/utils/auth';
import AddTask from '@/components/AddTask';
import { FiLogOut, FiUsers, FiCheckSquare, FiPlus, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Tasks from '@/components/Tasks';
import Employees from '@/components/Employees';
import { db } from '@/firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function Managerdashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks');
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [employees, setEmployees] = useState({});

  useEffect(() => {
    const userData = getUser();
    if (!userData) {
      router.replace('/');
      return;
    }
    else {
      setUser(userData);
      fetchEmployees();
    }
  }, []);

  const fetchEmployees = async () => {
    try {
      const userData = getUser();
      const employeesRef = collection(db, 'users');
      const q = query(
        employeesRef, 
        where('position', '==', 'Employee'),
        where('manager', '==', userData.name),
        where('department', '==', userData.department)
      );
      
      const querySnapshot = await getDocs(q);
      const employeeData = {};
      
      querySnapshot.docs.forEach((doc) => {
        employeeData[doc.id] = doc.data();
      });
      setEmployees(employeeData);
      } 
      catch (error) {
        console.error('Error fetching employees:', error);
      }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.replace('/');
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const buttonVariants = {
    initial: { scale: 0 },
    animate: { scale: 1, transition: { type: "spring", stiffness: 260, damping: 20 } },
    exit: { scale: 0 }
  };

  const modalVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 25 } 
    },
    exit: { 
      scale: 0.8, 
      opacity: 0,
      transition: { duration: 0.2 } 
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-lg">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <motion.h1
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                className="text-2xl font-bold text-gray-800"
              >
                Welcome, {user?.name || 'Manager'}
              </motion.h1>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                <FiLogOut className="mr-2" />
                Log out
              </motion.button>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8 relative">
          {/* <AddTask /> */}

          <AnimatePresence mode="wait">
            {!isAddTaskOpen && (
              <motion.button
                variants={buttonVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                onClick={() => setIsAddTaskOpen(true)}
                className="absolute right-8 px-4 top-8 w-38 h-10 bg-green-500 rounded-full text-white shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiPlus className="w-6 h-6 mr-2" />
                Add Task
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isAddTaskOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setIsAddTaskOpen(false);
                }}
              >
                <motion.div
                  variants={modalVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="bg-white rounded-lg p-6 w-full max-w-md relative"
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsAddTaskOpen(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                  >
                    <FiX className="w-6 h-6" />
                  </motion.button>
                  <AddTask onClose={() => setIsAddTaskOpen(false)} employees={employees}/>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="mt-8 mb-6">
            <div className="flex space-x-4 border-b border-gray-200">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                onClick={() => setActiveTab('tasks')}
                className={`flex items-center px-6 py-3 ${
                  activeTab === 'tasks'
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-500 hover:text-gray-700'
                } transition-colors duration-200`}
              >
                <FiCheckSquare className="mr-2" />
                Tasks
              </motion.button>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                onClick={() => setActiveTab('employees')}
                className={`flex items-center px-6 py-3 ${
                  activeTab === 'employees'
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-500 hover:text-gray-700'
                } transition-colors duration-200`}
              >
                <FiUsers className="mr-2" />
                Employees
              </motion.button>
            </div>
          </div>

          <AnimatePresence mode='wait'>
            {activeTab === 'tasks' && (
              <motion.div
                key="tasks"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <Tasks />
              </motion.div>
            )}
            {activeTab === 'employees' && (
              <motion.div
                key="employees"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <Employees />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </ProtectedRoute>
  );
}