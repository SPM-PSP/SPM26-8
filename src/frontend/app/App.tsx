import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useEffect } from 'react';
import { initializeSampleData } from './utils/initData';
import { AuthProvider } from './context/AuthContext';
import { DEFAULT_USER_ID, migrateLegacyDataToOwner } from './utils/authStorage';

export default function App() {
  useEffect(() => {
    migrateLegacyDataToOwner(DEFAULT_USER_ID);
    initializeSampleData(DEFAULT_USER_ID);
  }, []);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}