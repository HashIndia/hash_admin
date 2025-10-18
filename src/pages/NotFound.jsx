import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="relative">
              <div className="text-[200px] sm:text-[300px] font-bold text-gray-200 leading-none select-none">
                404
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-hash-purple rounded-full flex items-center justify-center shadow-lg">
                  <Search className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Page Not Found
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-2">
              Oops! The page you're looking for doesn't exist.
            </p>
            <p className="text-gray-500 max-w-md mx-auto">
              It might have been moved, deleted, or you entered the wrong URL. 
              Let's get you back on track.
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="min-w-[160px]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            
            <Link to="/">
              <Button className="min-w-[160px] bg-hash-purple hover:bg-hash-purple/90">
                <Home className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </motion.div>

          {/* Helpful Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-12 pt-8 border-t border-gray-200"
          >
            <p className="text-sm text-gray-500 mb-4">Maybe you were looking for:</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link 
                to="/" 
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Dashboard
              </Link>
              <Link 
                to="/inventory" 
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Inventory
              </Link>
              <Link 
                to="/orders" 
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Orders
              </Link>
              <Link 
                to="/customers" 
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Customers
              </Link>
              <Link 
                to="/broadcast" 
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Broadcast
              </Link>
              <Link 
                to="/analytics" 
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Analytics
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;