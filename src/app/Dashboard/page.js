'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getUser } from '@/utils/auth';
import { db } from '@/firebase/config';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { FiRefreshCw, FiLogOut, FiCalendar, FiFlag, FiUsers } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskStates, setTaskStates] = useState({});
  const [sortBy, setSortBy] = useState('deadline');

  useEffect(() => {
    const userData = getUser();
    if (!userData) {
      router.replace('/');
      return;
    }

    setUser(userData);
    fetchTasks();
    return () => {
      setTasks([]);
      setTaskStates({});
      setUser(null);
    };
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      const initialStates = {};
      tasks.forEach(task => {
        const employeeStatus = task.employeeStatuses?.[user.id] || {
          status: 'pending',
          description: ''
        };
        initialStates[task.id] = {
          status: employeeStatus.status,
          description: employeeStatus.description
        };
      });
      setTaskStates(initialStates);
    }
  }, [tasks]);

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
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = async (taskId, updatedStatus, updatedDescription) => {
    try {
      const taskDocRef = doc(db, 'tasks', taskId);

      const task = tasks.find((task) => task.id === taskId);
      const updatedEmployeeStatuses = {
        ...task.employeeStatuses,
        [user.id]: { status: updatedStatus, description: updatedDescription },
      };

      await updateDoc(taskDocRef, { employeeStatuses: updatedEmployeeStatuses });

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? { ...task, employeeStatuses: updatedEmployeeStatuses }
            : task
        )
      );
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleStatusChange = (taskId, value) => {
    setTaskStates(prev => ({
      ...prev,
      [taskId]: { ...prev[taskId], status: value }
    }));
  };

  const handleDescriptionChange = (taskId, value) => {
    setTaskStates(prev => ({
      ...prev,
      [taskId]: { ...prev[taskId], description: value }
    }));
  };

  const handleSubmit = async (taskId) => {
    const taskState = taskStates[taskId];
    await handleTaskUpdate(taskId, taskState.status, taskState.description);
  };

  const handleLogout = () => {
    setTasks([]);
    setTaskStates({});
    localStorage.removeItem('user');
    setUser(null);
    router.replace('/');
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

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg mb-8">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <motion.h1 
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              className="text-2xl font-bold text-gray-800"
            >
              Welcome, {user?.name || 'Employee'}
            </motion.h1>
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchTasks}
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

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Tasks</h2>
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
          {tasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-lg shadow-md p-8 text-center"
            >
              <FiUsers className="mx-auto text-4xl text-gray-400 mb-4" />
              <p className="text-gray-600">No tasks assigned to you yet.</p>
            </motion.div>
          ) : (
            <div className="grid gap-6">
              <AnimatePresence>
                {user && tasks.map((task) => {
                  const employeeStatus = task.employeeStatuses?.[user.id] || {
                    status: 'pending',
                    description: ''
                  };
                  const isCompleted = employeeStatus.status === 'completed';
                  const taskState = taskStates[task.id] || {
                    status: employeeStatus.status,
                    description: employeeStatus.description
                  };

                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`bg-white rounded-lg shadow-md overflow-hidden ${
                        isCompleted ? 'border-l-4 border-green-500' : ''
                      }`}
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
                            <span>{task.deadline || 'No deadline'}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <FiFlag className="mr-2" />
                            <span>{task.priority}</span>
                          </div>
                        </div>

                        {isCompleted ? (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-green-50 rounded-lg p-4"
                          >
                            <div className="flex items-center text-green-800 mb-2">
                              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="font-medium">Task Completed</span>
                            </div>
                            <p className="text-green-700">{employeeStatus.description}</p>
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-4"
                          >
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                              <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                value={taskState.status}
                                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                              >
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="not completed">Not Completed</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                              <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                rows="4"
                                placeholder="Add your progress description here..."
                                value={taskState.description}
                                onChange={(e) => handleDescriptionChange(task.id, e.target.value)}
                              ></textarea>
                            </div>

                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleSubmit(task.id)}
                              className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                              <span className="mr-2">Update Status</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </motion.button>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}