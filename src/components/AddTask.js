'use client'
import { useState } from 'react';
import { db } from '@/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertCircle, FiCheckCircle, FiClock, FiFlag, FiUsers } from 'react-icons/fi';
import { Check } from 'lucide-react';

const AddTask = ({employees}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [assignedEmployees, setAssignedEmployees] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedEmployeesEmails, setSelectedEmployeesEmails] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const currentUser = JSON.parse(localStorage.getItem('user'));

    try {
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      if (assignedEmployees.length === 0) {
        throw new Error('Please assign the task to at least one employee');
      }
      const taskRef = await addDoc(collection(db, 'tasks'), {
        title,
        description,
        deadline,
        priority,
        status: 'pending',
        assignedTo: assignedEmployees,
        createdBy: currentUser.uid,
        createdByEmail: currentUser.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const taskDetails = {
        title,
        description,
        deadline,
        priority
      };

      const emailResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails: selectedEmployeesEmails,
          taskDetails: taskDetails,
        }),
      });

      if (!emailResponse.ok) {
        console.warn('Failed to send some notification emails');
      }

      setSuccess('Task added successfully and notifications sent!!');

      // Reset form
      setTitle('');
      setDescription('');
      setDeadline('');
      setPriority('medium');
      setAssignedEmployees([]);
      setSelectedEmployeesEmails([]);
      
    } catch (error) {
      console.error('Error adding task:', error);
      setError(error.message || 'Failed to add task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleEmployee = (id) => {
    setAssignedEmployees(prev => {
      const isSelected = prev.includes(id);
      if (isSelected) {
        const newAssigned = prev.filter(empId => empId !== id);
        setSelectedEmployeesEmails(prevEmails => 
          prevEmails.filter(email => email !== employees[id].email)
        );
        return newAssigned;
      } else {
        const newAssigned = [...prev, id];
        setSelectedEmployeesEmails(prevEmails => 
          Array.from(new Set([...prevEmails, employees[id].email]))
        );
        return newAssigned;
      }
    });
  };

  const selectAllEmployees = () => {
    if (assignedEmployees.length === Object.keys(employees).length) {
      setAssignedEmployees([]);
      setSelectedEmployeesEmails([]);
    } else {
      const allIds = Object.keys(employees);
      const allEmails = Array.from(new Set(Object.values(employees).map(emp => emp.email)));
      setAssignedEmployees(allIds);
      setSelectedEmployeesEmails(allEmails);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg"
    >
      <motion.h2 
        initial={{ x: -20 }}
        animate={{ x: 0 }}
        className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2"
      >
        Add New Task
      </motion.h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            placeholder="Enter task title"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            placeholder="Enter task description"
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiClock className="inline mr-2 text-blue-500" />
              Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiFlag className="inline mr-2 text-blue-500" />
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FiUsers className="inline mr-2 text-blue-500" />
            Assign to ({assignedEmployees.length} selected)
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-4 py-2 text-left border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {assignedEmployees.length === 0 
                ? "Select employees" 
                : `${assignedEmployees.length} employee(s) selected`}
            </button>
            
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                <div className="p-2 border-b border-gray-200">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={assignedEmployees.length === Object.keys(employees).length}
                      onChange={selectAllEmployees}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span>Select All</span>
                  </label>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {employees && Object.entries(employees).map(([id, employee]) => (
                    <label key={id} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={assignedEmployees.includes(id)}
                        onChange={() => toggleEmployee(id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2">{employee.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 transition-all duration-200"
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block mr-2"
            >
              ⭮
            </motion.div>
          ) : null}
          {loading ? 'Adding Task...' : 'Add Task'}
        </motion.button>
      </form>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 rounded-md bg-red-50 border border-red-200"
          >
            <div className="flex items-center text-red-600">
              <FiAlertCircle className="mr-2" />
              {error}
            </div>
          </motion.div>
        )}
        
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 rounded-md bg-green-50 border border-green-200"
          >
            <div className="flex items-center text-green-600">
              <FiCheckCircle className="mr-2" />
              {success}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AddTask;