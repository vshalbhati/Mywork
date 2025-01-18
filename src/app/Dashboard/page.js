'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, memo } from 'react';
import { getUser } from '@/utils/auth';
import { db } from '@/firebase/config';
import { collection, doc, getDocs, updateDoc, query, where } from 'firebase/firestore';
import { FiRefreshCw, FiLogOut, FiCalendar, FiFlag, FiUsers, FiEdit2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const TaskCard = memo(({ 
  task, 
  user, 
  taskState, 
  isEditing,
  onEditToggle,
  onStatusChange,
  onDescriptionChange,
  onSubmit,
  getPriorityColor 
}) => {
  const employeeStatus = task.employeeStatuses?.[user?.id] || {
    status: 'pending',
    description: ''
  };
  const isCompleted = employeeStatus.status === 'completed';

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`bg-white rounded-lg shadow-md overflow-hidden ${
        isCompleted ? 'border-l-4 border-green-500' : 
        taskState.status === 'not completed' ? 'border-l-4 border-red-500' :
        'border-l-4 border-yellow-500'
      }`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800">{task.title}</h3>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            {!isCompleted && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onEditToggle(task.id)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <FiEdit2 className="w-4 h-4 text-gray-600" />
              </motion.button>
            )}
          </div>
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

        <AnimatePresence mode="wait" initial={false}>
          {isCompleted ? (
            <motion.div
              key="completed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
          ) : isEditing ? (
            <motion.div
              key="editing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  value={taskState.status}
                  onChange={(e) => onStatusChange(task.id, e.target.value)}
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
                  value={taskState.description || ''}
                  onChange={(e) => onDescriptionChange(task.id, e.target.value)}
                ></textarea>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSubmit(task.id)}
                className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <span className="mr-2">Update Status</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="status"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`rounded-lg p-4 ${
                taskState.status === 'not completed' ? 'bg-red-50' : 'bg-yellow-50'
              }`}
            >
              <div className={`flex items-center mb-2 ${
                taskState.status === 'not completed' ? 'text-red-800' : 'text-yellow-800'
              }`}>
                <span className="font-medium">Status: {taskState.status}</span>
              </div>
              <p className={
                taskState.status === 'not completed' ? 'text-red-700' : 'text-yellow-700'
              }>{taskState.description || 'No description provided'}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

TaskCard.displayName = 'TaskCard';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskStates, setTaskStates] = useState({});
  const [sortBy, setSortBy] = useState('deadline');
  const [editMode, setEditMode] = useState({});

  const handleEditToggle = useCallback((taskId) => {
    setEditMode(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  }, []);

    const handleLogout = () => {
      setTasks([]);
      setTaskStates({});
      localStorage.removeItem('user');
      setUser(null);
      router.replace('/');
    };
  const handleStatusChange = useCallback((taskId, value) => {
    setTaskStates(prev => ({
      ...prev,
      [taskId]: { ...prev[taskId], status: value }
    }));
  }, []);

  const handleDescriptionChange = useCallback((taskId, value) => {
    setTaskStates(prev => ({
      ...prev,
      [taskId]: { ...prev[taskId], description: value }
    }));
  }, []);

  const getPriorityColor = useCallback((priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const handleTaskUpdate = useCallback(async (taskId, updatedStatus, updatedDescription) => {
    try {
      const taskDocRef = doc(db, 'tasks', taskId);
      const task = tasks.find((t) => t.id === taskId);
      const updatedEmployeeStatuses = {
        ...task.employeeStatuses,
        [user.id]: { status: updatedStatus, description: updatedDescription },
      };

      await updateDoc(taskDocRef, { employeeStatuses: updatedEmployeeStatuses });

      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === taskId
            ? { ...t, employeeStatuses: updatedEmployeeStatuses }
            : t
        )
      );
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }, [tasks, user]);

  const handleSubmit = useCallback(async (taskId) => {
    const taskState = taskStates[taskId];
    await handleTaskUpdate(taskId, taskState.status, taskState.description);
    setEditMode(prev => ({
      ...prev,
      [taskId]: false
    }));
  }, [taskStates, handleTaskUpdate]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const employeeId = currentUser.uid;
      const tasksRef = collection(db, 'tasks');

      const q = query(tasksRef, where('assignedTo', 'array-contains', employeeId));
      
      const querySnapshot = await getDocs(q);
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
  }, []);

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
  }, [router, fetchTasks]);

  useEffect(() => {
    if (tasks.length > 0 && user) {
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
  }, [tasks, user]);

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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Your Tasks</h2>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
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
              <AnimatePresence mode="wait">
                {sortedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    user={user}
                    taskState={taskStates[task.id] || {}}
                    isEditing={editMode[task.id]}
                    onEditToggle={handleEditToggle}
                    onStatusChange={handleStatusChange}
                    onDescriptionChange={handleDescriptionChange}
                    onSubmit={handleSubmit}
                    getPriorityColor={getPriorityColor}
                  />
                ))}
              </AnimatePresence>
              </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}