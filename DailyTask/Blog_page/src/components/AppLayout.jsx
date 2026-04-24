import { useState } from 'react';
import { Layout, Avatar, Dropdown, Button, Tooltip, Input } from 'antd';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  FileTextOutlined,
  UserOutlined,
  SearchOutlined,
  GithubOutlined,
  LogoutOutlined,
  EditOutlined,
  TagOutlined,
  AppstoreOutlined,
  SunOutlined,
  MoonOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts';
import { useTheme } from '../contexts/ThemeContext';
import './AppLayout.css';

const { Header, Content, Footer } = Layout;

const AppLayout = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const isAdmin = user?.role === 'admin';

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: '首页' },
    { key: '/article', icon: <FileTextOutlined />, label: '文章' },
  ];

  if (isAdmin) {
    menuItems.push(
      { key: '/tag/manage', icon: <TagOutlined />, label: '标签' },
      { key: '/category/manage', icon: <AppstoreOutlined />, label: '分类' },
    );
  }

  const userMenuItems = isAuthenticated
    ? [
        { key: 'profile', label: '个人中心', icon: <UserOutlined /> },
        { key: 'create', label: '写文章', icon: <EditOutlined /> },
        { key: 'favorites', label: '我的收藏', icon: <StarOutlined /> },
        { type: 'divider' },
        { key: 'logout', label: '退出登录', icon: <LogoutOutlined /> },
      ]: [{ key: 'login', label: '登录', icon: <UserOutlined /> }]

  const handleSearch = value => {
    if (value.trim()) {
      navigate(`/article?search=${encodeURIComponent(value)}`);
      setSearchOpen(false);
      setSearchValue('');
    }
  };

  const handleMenuClick = ({ key }) => {
    switch (key) {
      case 'profile':
        navigate('/profile');
        break;
      case 'create':
        navigate('/article/create');
        break;
      case 'favorites':
        navigate('/favorites');
        break;
      case 'logout':
        logout();
        navigate('/');
        break;
      case 'login':
        navigate('/login');
        break;
      default:
        break;
    }
  };

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <div className="header-content">
          <div className="logo" onClick={() => navigate('/')}>
            <span className="logo-text">LOGO</span>
          </div>

          <nav className="nav-menu">
            {menuItems.map(item => (
              <Link
                key={item.key}
                to={item.key}
                className={`nav-item ${location.pathname === item.key ? 'active' : ''}`}>
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <Tooltip title={isDark ? '切换到亮色模式' : '切换到暗色模式'}>
              <Button
                type="text"
                icon={isDark ? <SunOutlined /> : <MoonOutlined />}
                onClick={toggleTheme}
                className="theme-toggle-btn"
                aria-label={isDark ? '切换到亮色模式' : '切换到暗色模式'}
              />
            </Tooltip>

            <Button
              type="text"
              icon={<SearchOutlined />}
              onClick={() => setSearchOpen(true)}
              className="search-btn"
            />

            {isAuthenticated ? (
              <Dropdown
                menu={{ items: userMenuItems, onClick: handleMenuClick }}
                placement="bottomRight">
                <div className="user-avatar">
                  <Avatar size={32} src={user?.avatar} style={{ backgroundColor: 'var(--accent)' }}>
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                  <span className="username">{user?.username}</span>
                </div>
              </Dropdown>
            ) : (
              <Button type="primary" onClick={() => navigate('/login')} size="small">
                登录
              </Button>
            )}
          </div>
        </div>
      </Header>

      {searchOpen && (
        <div className="search-overlay" onClick={() => setSearchOpen(false)}>
          <div className="search-modal" onClick={e => e.stopPropagation()}>
            <Input.Search
              placeholder="搜索文章、标签..."
              enterButton="搜索"
              value={searchValue}
              onChange={setSearchValue}
              onSearch={handleSearch}
              autoFocus
              size="large"
              className="search-input"
              allowClear
            />
            <div className="search-hints">
              <p>快捷键提示：按 ESC 关闭</p>
            </div>
          </div>
        </div>
      )}

      <Content className="main-content">
        <div className="content-wrapper animate-fade-in-up">
          <Outlet />
        </div>
      </Content>

      <Footer className="app-footer">
        <div className="footer-content">
          <div className="footer-links">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <GithubOutlined />
            </a>
          </div>
          <div className="footer-copyright">
            © {new Date().getFullYear()} Blog. All rights reserved.
          </div>
        </div>
      </Footer>
    </Layout>
  );
};

export default AppLayout;
