'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '@/firebase/config'
import { getUser } from '@/utils/auth'
import { collection, getDocs, query, where, setDoc, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'

function Page() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        role: '',
        department: '',
        manager: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [managerList, setManagerList] = useState([]);
    const [departmentList, setDepartmentList] = useState([]);

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5 }
        },
        exit: { 
            opacity: 0, 
            y: -20,
            transition: { duration: 0.3 }
        }
    };

    const formVariants = {
        hidden: { x: -20, opacity: 0 },
        visible: { 
            x: 0, 
            opacity: 1,
            transition: { delay: 0.3, duration: 0.5 }
        }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      try {
          const userDetails = getUser();
          if (!userDetails) {
            throw new Error('User details not found');
        }
          const userData = {
              _id: userDetails.id,
              name: userDetails.name || '',
              email: userDetails.email || '',
              position: formData.role,
              joinDate: new Date().toISOString(),
          };  

          const companyRef = doc(db, 'companies', userDetails.companyid);
          const companyDoc = await getDoc(companyRef);
          if (!companyDoc.exists()) {
            await setDoc(companyRef, {
                name: userDetails.companyname,
                departments: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
          }

          if (formData.role === 'Manager') {
              const departmentData = {
                  name: formData.department,
                  manager: userData,
                  employees: []
              };

              await updateDoc(companyRef, {
                  departments: arrayUnion(departmentData)
              });

          } else if (formData.role === 'Employee') {
              const companyData = companyDoc.data();

              const departments = companyData?.departments || [];
              const updatedDepartments = departments.map(dept => {
                    if (dept.name === formData.department) {
                        return {
                            ...dept,
                            employees: [...(dept.employees || []), userData]
                        };
                    }
                    return dept;
                });

              await updateDoc(companyRef, {
                departments: updatedDepartments
            });
          }

          await setDoc(doc(db, 'users', userDetails.id), {
              ...userData,
              department: formData.department,
              manager: formData.role === 'Employee' ? formData.manager : null,
              companyId: userDetails.companyid,
          });

          const UserData = {
            ...userData,
              department: formData.department,
              manager: formData.role === 'Employee' ? formData.manager : null,
              companyId: userDetails.companyid,
          }
          localStorage.setItem('user', JSON.stringify(UserData));
          if (formData.role === 'Manager') {
              router.replace('/Managerdashboard');
          } else {
              router.replace('/Dashboard');
          }

      } catch (error) {
          console.error('Registration error:', error);
          setError(error.message);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    const fetchDepartments = async () => {
        try {
            const userDetails = getUser();
            const companyRef = doc(db, 'companies', userDetails.companyid);
            const companyDoc = await getDoc(companyRef);
            if (companyDoc.exists()) {
              const companyData = companyDoc.data();
              const departments = companyData?.departments || [];
              setDepartmentList(departments);
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
            setError('Failed to fetch departments');
        }
    };
    fetchDepartments();
}, []);

useEffect(() => {
    const fetchManagers = async () => {
        if (formData.department && formData.role === 'Employee') {
            try {
                const userDetails = getUser();
                const companyRef = doc(db, 'companies', userDetails.companyid);
                const companyDoc = await getDoc(companyRef);
                if (companyDoc.exists()) {
                  const companyData = companyDoc.data();
                  const departments = companyData?.departments || [];
                  const selectedDept = departments.find(dept => dept.name === formData.department);
                  
                  if (selectedDept?.manager) {
                      setManagerList([selectedDept.manager]);
                  } else {
                      setManagerList([]);
                  }
                }
            } catch (error) {
                console.error('Error fetching managers:', error);
                setError('Failed to fetch managers');
            }
        }
    };
    fetchManagers();
}, [formData.department, formData.role]);

    const handleChange = (e) => {
      setFormData(prev => ({
          ...prev,
          [e.target.name]: e.target.value,
      }));
    };

    return (
        <motion.div 
            className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <motion.h2 
                    className="mt-6 text-center text-3xl font-extrabold text-gray-900"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    Please complete your profile
                </motion.h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <motion.div 
                    className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"
                    variants={formVariants}
                >
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key="role"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                    Role
                                </label>
                                <select
                                    id="role"
                                    name="role"
                                    required
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                >
                                    <option value="">Select Role</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Employee">Employee</option>
                                </select>
                            </motion.div>

                            {formData.role && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {formData.role === 'Manager' ? (
                                        <div className="mt-4">
                                            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                                                Department Name
                                            </label>
                                            <input
                                                type="text"
                                                name="department"
                                                id="department"
                                                required
                                                value={formData.department}
                                                onChange={handleChange}
                                                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="mt-4">
                                                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                                                    Select Department
                                                </label>
                                                <select
                                                    id="department"
                                                    name="department"
                                                    required
                                                    value={formData.department}
                                                    onChange={handleChange}
                                                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                                >
                                                    <option value="">Select Department</option>
                                                    {departmentList && departmentList.map((dept, index) => (
                                                        <option key={index} value={dept.name}>
                                                            {dept.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {formData.department && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="mt-4"
                                                >
                                                    <label htmlFor="manager" className="block text-sm font-medium text-gray-700">
                                                        Select Manager
                                                    </label>
                                                    <select
                                                        id="manager"
                                                        name="manager"
                                                        required
                                                        value={formData.manager}
                                                        onChange={handleChange}
                                                        className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                                    >
                                                        <option value="">Select Manager</option>
                                                        {managerList && managerList.map((manager,index) => (
                                                            <option key={index} value={manager.name}>
                                                                {manager.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </motion.div>
                                            )}
                                        </>
                                    )}
                                </motion.div>
                            )}

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                                        loading 
                                            ? 'bg-customGreen cursor-not-allowed' 
                                            : 'bg-customGreen hover:bg-green-300'
                                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                                >
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                            </motion.div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-4 text-red-600 text-sm text-center"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                </motion.div>
            </div>
        </motion.div>
    );
}

export default Page;