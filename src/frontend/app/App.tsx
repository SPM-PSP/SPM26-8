import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useEffect } from 'react';
import { initializeSampleData } from './utils/initData';

export default function App() {
  useEffect(() => {
    initializeSampleData();
  }, []);

  return <RouterProvider router={router} />;
}