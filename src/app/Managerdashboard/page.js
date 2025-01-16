'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getUser } from '@/utils/auth';
import AddTask from '@/components/AddTask';
import { db } from '@/firebase/config';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { FiRefreshCw, FiLogOut, FiCalendar, FiFlag, FiUsers } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function Managerdashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState({});
  const [sortBy, setSortBy] = useState('deadline');

useEffect(() => {
    const userData = getUser();
    if (!userData) {
      router.replace('/');
      return;
    }
    else{
        setUser(userData);    
        fetchTasks();
        fetchEmployees();
    }
    
  }, []);

  const fetchEmployees = async () => {
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
    }
  };

  const fetchTasks = async () => {
      setLoading(true);
      try {
        const tasksRef = collection(db, 'tasks'); 
        const querySnapshot = await getDocs(tasksRef);
        const fetchedTasks = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTasks(fetchedTasks);
        console.log(fetchedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.replace('/');
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    switch (sortBy) {
      case 'deadline':
        return new Date(a.deadline) - new Date(b.deadline);
      case 'priority':
        return a.priority.localeCompare(b.priority);
      case 'status':
        return (a.employeeStatuses?.[user.id]?.status || 'pending')
          .localeCompare(b.employeeStatuses?.[user.id]?.status || 'pending');
      default:
        return 0;
    }
  });

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
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {fetchTasks();fetchEmployees();}}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <FiRefreshCw className="mr-2" />
                  Refresh
                </motion.button>
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
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8">
          <AddTask />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Task Overview</h2>
                <select
                    value={sortBy}
                    onChange={(e) => {
                        setSortBy(e.target.value);
                        setTasks(sortedTasks);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="deadline">Sort by Deadline</option>
                    <option value="priority">Sort by Priority</option>
                    <option value="status">Sort by Status</option>
                </select>
            </div>
            <div className="grid gap-6">
              <AnimatePresence>
                {tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-gray-800">{task.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{task.description}</p>
                      
                      <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center text-gray-600">
                          <FiCalendar className="mr-2" />
                          <span>Assigned: 
                              {(() => {
                                  const timestamp = task.createdAt;
                                  const date = new Date(timestamp.seconds * 1000);
                                  return date.toLocaleString();
                              })()}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FiCalendar className="mr-2" />
                          <span>Deadline: {task.deadline}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FiFlag className="mr-2" />
                          <span>Priority: {task.priority}</span>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                          <FiUsers className="mr-2" />
                          Employee Updates
                        </h4>
                        
                        {Object.entries(task.employeeStatuses || {}).length === 0 ? (
                          <p className="text-gray-500 italic">No employees reported to this task.</p>
                        ) : (
                          <div className="space-y-3">
                            {Object.entries(task.employeeStatuses || {}).map(([employeeId, status]) => (
                              <div key={employeeId} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-gray-800">
                                    {employees[employeeId]?.name || 'Unknown Employee'}
                                  </span>
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    status.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    status.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {status.status}
                                  </span>
                                </div>
                                <p className="text-gray-600 text-sm">
                                  {status.description || 'No description provided'}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}