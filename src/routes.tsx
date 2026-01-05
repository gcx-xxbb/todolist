import type { ReactElement, ReactNode } from 'react';

import App from './App';
import Login from './components/login';

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
];

export default routes;
