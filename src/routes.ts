import App from './App';
import Login from './components/login';

const routes = [
  {
    path: '/',
    element: App,
  },
  {
    path: '/login',
    element: Login,
  },
];

export default routes