import { useEffect, useState } from 'react';
import useAuthStore from '../stores/useAuthStore';

export default function AuthInitializer({ children }) {
  const [isInitialized, setIsInitialized] = useState(false);

  // Zustand hook must be called at the top level
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    let isMounted = true; // safety check for unmounted component

    const initializeAuth = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        if (isMounted) setIsInitialized(true);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false; // cleanup
    };
  }, [checkAuth]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
