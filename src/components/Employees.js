'use client'
import React, {useState, useEffect} from 'react'
import { db } from '@/firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { FiRefreshCw, FiCalendar, FiFlag, FiUsers, FiMail, FiUser } from 'react-icons/fi';
import { motion } from 'framer-motion';

function Employees() {
    const [employees, setEmployees] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchEmployees();     
    }, []);

    const fetchEmployees = async () => {
        setIsLoading(true);
        try {
            const employeesRef = collection(db, 'users');
            const querySnapshot = await getDocs(employeesRef);
            const employeeData = {};
            querySnapshot.docs.forEach((doc) => {
                employeeData[doc.id] = doc.data();
            });
            setEmployees(employeeData);
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <motion.h1 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="text-2xl font-bold text-gray-800 flex items-center"
                >
                    <FiUsers className="mr-2" /> Employees Directory
                </motion.h1>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchEmployees}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                >
                    <FiRefreshCw className="mr-2" />
                    Refresh
                </motion.button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <FiRefreshCw className="w-8 h-8 text-blue-500" />
                    </motion.div>
                </div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {employees && Object.keys(employees).map((employeeId) => (
                        <motion.div
                            key={employeeId}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            className="bg-white rounded-lg shadow-md p-6 transition-shadow hover:shadow-lg"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <FiUser className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <div className="ml-4">
                                        <h2 className="text-xl font-semibold text-gray-800">
                                            {employees[employeeId].name}
                                        </h2>
                                        <div className="flex items-center text-gray-600 mt-1">
                                            <FiMail className="w-4 h-4 mr-2" />
                                            <p className="text-sm">{employees[employeeId].email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="border-t pt-4">
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <span className="flex items-center">
                                        <FiFlag className="mr-2" />
                                        Role: {employees[employeeId].role || 'Employee'}
                                    </span>
                                    <span className="flex items-center">
                                        <FiCalendar className="mr-2" />
                                        {new Date().toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {!isLoading && Object.keys(employees).length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-gray-600 mt-8"
                >
                    No employees found
                </motion.div>
            )}
        </div>
    );
}

export default Employees;