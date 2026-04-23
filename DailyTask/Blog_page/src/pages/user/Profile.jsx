import { useState } from 'react';
import { Form, Input, Button, Card, message, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts';
import { userApi } from '../../services';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      const data = await userApi.updateMe(values);
      updateUser(data.data.user);
      message.success('更新成功');
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Card title="个人资料">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Avatar size={80} icon={<UserOutlined />} />
        </div>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            username: user?.username,
            email: user?.email,
            bio: user?.bio,
            avatar: user?.avatar
          }}
          onFinish={handleUpdate}
        >
          <Form.Item label="用户名" name="username">
            <Input />
          </Form.Item>

          <Form.Item label="邮箱" name="email">
            <Input disabled />
          </Form.Item>

          <Form.Item label="头像URL" name="avatar">
            <Input />
          </Form.Item>

          <Form.Item label="个人简介" name="bio">
            <Input.TextArea rows={4} maxLength={200} showCount />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              保存修改
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Profile;