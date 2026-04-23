import { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { tagApi } from '../../services';
import { useAuth } from '../../contexts';

const TagManage = () => {
  const { user } = useAuth();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();
  const fetchCountRef = useRef(0);

  useEffect(() => {
    fetchCountRef.current = 0;

    const fetchData = async () => {
      if (fetchCountRef.current > 0) return;
      fetchCountRef.current++;
      await fetchTags();
    };

    fetchData();
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const data = await tagApi.getTags();
      setTags(data.data.tags || []);
    } catch (error) {
      message.error('获取标签失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingId(record._id);
    form.setFieldsValue({ name: record.name });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await tagApi.deleteTag(id);
      message.success('删除成功');
      fetchTags();
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        await tagApi.updateTag(editingId, values);
        message.success('更新成功');
      } else {
        await tagApi.createTag(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchTags();
    } catch (error) {
      message.error(error.message);
    }
  };

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    { title: '使用次数', dataIndex: 'articleCount', key: 'articleCount' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record._id)}>
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      )
    }
  ];

  if (user?.role !== 'admin') {
    return <div>您没有权限访问此页面</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加标签
        </Button>
      </div>
      <Table columns={columns} dataSource={tags} rowKey="_id" loading={loading} />

      <Modal
        title={editingId ? '编辑标签' : '添加标签'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TagManage;