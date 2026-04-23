import { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, TreeSelect, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { categoryApi } from '../../services';
import { useAuth } from '../../contexts';

const CategoryManage = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
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
      await fetchCategories();
    };

    fetchData();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryApi.getCategories();
      setCategories(data.data.categories || []);
    } catch (error) {
      message.error('获取分类失败');
    } finally {
      setLoading(false);
    }
  };

  const buildTreeData = (cats, parentId = null, level = 0) => {
    return cats
      .filter(cat => {
        const catParentId = cat.parent?._id || cat.parent;
        return catParentId === parentId;
      })
      .map(cat => ({
        value: cat._id,
        title: `${'　'.repeat(level)}${level > 0 ? '└─ ' : ''}${cat.name}`,
        children: buildTreeData(cats, cat._id, level + 1)
      }));
  };

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingId(record._id);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      parent: record.parent?._id || record.parent || null,
      order: record.order || 0
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await categoryApi.deleteCategory(id);
      message.success('删除成功');
      fetchCategories();
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        await categoryApi.updateCategory(editingId, values);
        message.success('更新成功');
      } else {
        await categoryApi.createCategory(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchCategories();
    } catch (error) {
      message.error(error.message);
    }
  };

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: '排序', dataIndex: 'order', key: 'order' },
    { title: '文章数', dataIndex: 'articleCount', key: 'articleCount' },
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
          添加分类
        </Button>
      </div>
      <Table columns={columns} dataSource={categories} rowKey="_id" loading={loading} />

      <Modal
        title={editingId ? '编辑分类' : '添加分类'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input />
          </Form.Item>
          <Form.Item name="parent" label="父分类">
            <TreeSelect
              treeData={buildTreeData(categories)}
              placeholder="选择父分类（不选则为顶级）"
              allowClear
              treeDefaultExpandAll
            />
          </Form.Item>
          <Form.Item name="order" label="排序">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManage;