import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';
import Category from '../pages/Category';
import Article from '../pages/Article';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/blog/:category',
    element: <Category />
  },
  {
    path: '/blog/:category/:slug',
    element: <Article />
  }
]);

export default router;