import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import App from './App';
import './index.css';

const AntdConfig = ({ children }) => {
  const { isDark } = useTheme();

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#3b82f6',
          borderRadius: 8,
          colorBgContainer: isDark ? '#161922' : '#ffffff',
          colorBgElevated: isDark ? '#1c1f2e' : '#ffffff',
          colorBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
          colorText: isDark ? '#e6e6e6' : '#1f2937',
          colorTextSecondary: isDark ? '#9ca3af' : '#6b7280',
        },
        components: {
          Layout: {
            headerBg: isDark ? 'rgba(15, 17, 21, 0.85)' : 'rgba(255, 255, 255, 0.85)',
            bodyBg: isDark ? '#0f1115' : '#ffffff',
            siderBg: isDark ? '#151821' : '#f9fafb',
          }
        }
      }}
    >
      {children}
    </ConfigProvider>
  );
};

const AppWrapper = () => {
  return (
    <ThemeProvider>
      <AntdConfig>
        <App />
      </AntdConfig>
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  </React.StrictMode>
);