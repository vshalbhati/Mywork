'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getUser } from '@/utils/auth';
import { db } from '@/firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { FiRefreshCw, FiCalendar, FiFlag, FiUsers, FiFilter, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

function Tasks() {
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
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const taskVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        },
        exit: { 
            y: -20, 
            opacity: 0,
            transition: { duration: 0.2 }
        }
    };

    const getStatusIcon = (status) => {
        switch(status?.toLowerCase()) {
            case 'completed':
                return <FiCheckCircle className="w-5 h-5 text-green-500" />;
            case 'pending':
                return <FiClock className="w-5 h-5 text-yellow-500" />;
            default:
                return <FiAlertCircle className="w-5 h-5 text-red-500" />;
        }
    };

  return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 max-w-7xl mx-auto"
        >
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Task Overview</h2>
                        <p className="text-gray-600">Manage and track all tasks and their progress</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="relative"
                        >
                            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                                <option value="deadline">Sort by Deadline</option>
                                <option value="priority">Sort by Priority</option>
                                <option value="status">Sort by Status</option>
                            </select>
                        </motion.div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {fetchTasks();fetchEmployees();}}
                            className="flex items-center px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md"
                        >
                            <FiRefreshCw className="mr-2" />
                            Refresh
                        </motion.button>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="flex justify-center items-center h-64">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="p-4 bg-white rounded-full shadow-md"
                    >
                        <FiRefreshCw className="w-8 h-8 text-blue-500" />
                    </motion.div>
                </div>
            )}

            {!loading && (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid gap-6"
                >
                    <AnimatePresence mode="wait">
                        {tasks.map((task) => (
                            <motion.div
                                key={task.id}
                                variants={taskVariants}
                                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800 mb-2">{task.title}</h3>
                                            <div className="flex gap-3">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                                                    {task.priority}
                                                </span>
                                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                                    {Object.keys(task.employeeStatuses || {}).length} Assignees
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 mb-6 line-clamp-2">{task.description}</p>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                            <FiCalendar className="text-gray-400 mr-2" />
                                            <div>
                                                <p className="text-xs text-gray-500">Created</p>
                                                <p className="text-sm font-medium">
                                                    {new Date(task.createdAt.seconds * 1000).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                            <FiClock className="text-gray-400 mr-2" />
                                            <div>
                                                <p className="text-xs text-gray-500">Deadline</p>
                                                <p className="text-sm font-medium">{task.deadline}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                            <FiFlag className="text-gray-400 mr-2" />
                                            <div>
                                                <p className="text-xs text-gray-500">Priority</p>
                                                <p className="text-sm font-medium">{task.priority}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                                            <FiUsers className="mr-2" />
                                            Employee Updates
                                        </h4>
                                        
                                        {Object.entries(task.employeeStatuses || {}).length === 0 ? (
                                            <motion.p 
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-gray-500 italic text-center py-4 bg-gray-50 rounded-lg"
                                            >
                                                No employees assigned to this task yet.
                                            </motion.p>
                                        ) : (
                                            <div className="grid gap-3">
                                                {Object.entries(task.employeeStatuses || {}).map(([employeeId, status]) => (
                                                    <motion.div
                                                        key={employeeId}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                                    {getStatusIcon(status.status)}
                                                                </div>
                                                                <div>
                                                                    <span className="font-medium text-gray-800 block">
                                                                        {employees[employeeId]?.name || 'Unknown Employee'}
                                                                    </span>
                                                                    <span className="text-sm text-gray-500">
                                                                        {employees[employeeId]?.email}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                                status.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                status.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                            }`}>
                                                                {status.status}
                                                            </span>
                                                        </div>
                                                        {status.description && (
                                                            <p className="text-gray-600 text-sm mt-2 pl-13">
                                                                {status.description}
                                                            </p>
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {!loading && tasks.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12 bg-white rounded-lg shadow-md"
                >
                    <FiFlag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Tasks Found</h3>
                    <p className="text-gray-600">Create a new task to get started.</p>
                </motion.div>
            )}
        </motion.div>
  )
}

export default Tasks