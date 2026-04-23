import React from 'react';
import { render, screen } from '@testing-library/react';

const SimpleComponent = () => <div data-testid="test-div">测试组件</div>;

describe('简单组件测试', () => {
  test('组件能正常渲染', () => {
    render(<SimpleComponent />);
    expect(screen.getByTestId('test-div')).toBeInTheDocument();
    expect(screen.getByText('测试组件')).toBeInTheDocument();
  });

  test('AuthContext 导出正常', () => {
    const context = require('../contexts/AuthContext');
    expect(context.AuthProvider).toBeDefined();
    expect(context.useAuth).toBeDefined();
  });

  test('services 导出正常', () => {
    const services = require('../services');
    expect(services.userApi).toBeDefined();
    expect(services.articleApi).toBeDefined();
    expect(services.commentApi).toBeDefined();
  });

  test('API 实例存在', () => {
    const api = require('../services/api').default;
    expect(api).toBeDefined();
    expect(api.interceptors).toBeDefined();
  });

  test('Login 组件文件存在', () => {
    const Login = require('../pages/user/Login').default;
    expect(Login).toBeDefined();
  });

  test('Register 组件文件存在', () => {
    const Register = require('../pages/user/Register').default;
    expect(Register).toBeDefined();
  });
});