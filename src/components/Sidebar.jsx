import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Megaphone,
  X,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';
import useAuthStore from '../stores/useAuthStore';

const Sidebar = ({ mobile = false, onClose }) => {
  const location = useLocation();
  const logout = useAuthStore(state => state.logout);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Broadcast', href: '/broadcast', icon: Megaphone },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  ];

  const handleLogout = () => {
    logout();
    if (mobile && onClose) onClose();
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden">
            <img 
              src="/hash-logo.jpg" 
              alt="Hash Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center space-x-2">
            <img 
              src="/hash-logo-text.jpg" 
              alt="Hash" 
              className="h-6 object-contain"
            />
            <span className="text-sm font-medium text-gray-600">Admin</span>
          </div>
        </div>
        {mobile && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href ||
                          (item.href !== '/' && location.pathname.startsWith(item.href));
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={mobile ? onClose : undefined}
              className={({ isActive: linkActive }) => {
                const active = isActive || linkActive;
                return `relative flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-hash-purple/10 text-hash-purple border border-hash-purple/20'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`;
              }}
            >
              {({ isActive: linkActive }) => {
                const active = isActive || linkActive;
                return (
                  <>
                    {active && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 bg-hash-purple/10 rounded-lg border border-hash-purple/20"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <item.icon className={`relative w-5 h-5 mr-3 ${
                      active ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <span className="relative">{item.name}</span>
                  </>
                );
              }}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <NavLink
          to="/settings"
          onClick={mobile ? onClose : undefined}
          className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <Settings className="w-5 h-5 mr-3 text-gray-400" />
          Settings
        </NavLink>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;