import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts';
import { AppLayout } from './components';
import { Login, Register, Profile, ChangePassword } from './pages/user';
import { ArticleList, ArticleDetail, ArticleForm } from './pages/article';
import { CategoryManage } from './pages/category';
import { TagManage } from './pages/tag';

const App = () => {
  return (
    <AuthProvider>
      <AppLayout>
        <Routes>
          <Route path="/" element={<ArticleList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/article/create" element={<ArticleForm />} />
          <Route path="/article/edit/:id" element={<ArticleForm />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/category/manage" element={<CategoryManage />} />
          <Route path="/tag/manage" element={<TagManage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </AuthProvider>
  );
};

export default App;