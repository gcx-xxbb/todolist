import { Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, Space } from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  PlusOutlined,
  TagsOutlined,
  FolderOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts';

const { Header, Content } = Layout;

const { SubMenu } = Menu;

const AppLayout = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => navigate('/profile')}>
        个人资料
      </Menu.Item>
      <Menu.Item key="password" onClick={() => navigate('/change-password')}>
        修改密码
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: <Link to="/">首页</Link>,
    },
    ...(user?.role === 'admin'
      ? [
          {
            key: 'manage',
            label: '管理',
            children: [
              {
                key: 'category',
                icon: <FolderOutlined />,
                label: <Link to="/category/manage">分类管理</Link>,
              },
              {
                key: 'tag',
                icon: <TagsOutlined />,
                label: <Link to="/tag/manage">标签管理</Link>,
              },
            ],
          },
        ]
      : []),
  ];

  return (
    <Layout className="layout-container">
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
          <Link to="/" style={{ color: 'white' }}>
            博客系统
          </Link>
        </div>

        <Menu
          theme="dark"
          mode="horizontal"
          items={menuItems}
          style={{ flex: 1, marginLeft: 20 }}
        />

        <Space>
          {isAuthenticated ? (
            <>
              <Link to="/article/create">
                <Button type="primary" icon={<PlusOutlined />}>
                  写文章
                </Button>
              </Link>
              <Dropdown overlay={userMenu} placement="bottomRight">
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar icon={<UserOutlined />} src={user?.avatar} />
                  <span style={{ color: 'white' }}>{user?.username}</span>
                </Space>
              </Dropdown>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button type="text" style={{ color: 'white' }}>
                  登录
                </Button>
              </Link>
              <Link to="/register">
                <Button type="primary">注册</Button>
              </Link>
            </>
          )}
        </Space>
      </Header>

      <Content className="content-wrapper">{children}</Content>
    </Layout>
  );
};

export default AppLayout;
