import type { ReactNode } from 'react';

import App from './App';
import Login from './components/login';
import Demo from './components/demo';

export interface AppRoute {
  path: string;
  element: ReactNode;
  permission?: string;
  children?: AppRoute[];
}

const routes: AppRoute[] = [
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/demo',
    element: <Demo />,
  },
];

export default routes;
