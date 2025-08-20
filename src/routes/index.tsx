import { createBrowserRouter } from 'react-router-dom';

// project import
import MainRoutes from './mainRoutes';
import LoginRoutes from './loginRoutes';

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter([LoginRoutes, MainRoutes], { basename: import.meta.env.VITE_APP_BASE_NAME });

export default router;
