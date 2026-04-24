import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Button, Card, Select, message, Spin } from 'antd';
import { articleApi, categoryApi, tagApi } from '../../services';

const { TextArea } = Input;

const ArticleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [form] = Form.useForm();
  const isEditMode = Boolean(id);
  const fetchCountRef = useRef(0);

  useEffect(() => {
    fetchCountRef.current = 0;

    const fetchData = async () => {
      if (fetchCountRef.current > 0) return;
      fetchCountRef.current++;

      await Promise.all([
        fetchCategories(),
        fetchTags(),
        isEditMode ? fetchArticle() : Promise.resolve()
      ]);
    };

    fetchData();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getCategories();
      setCategories(data.data.categories);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTags = async () => {
    try {
      const data = await tagApi.getTags();
      setTags(data.data.tags);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchArticle = async () => {
    setInitialLoading(true);
    try {
      const data = await articleApi.getArticleById(id);
      const article = data.data.article;
      form.setFieldsValue({
        title: article.title,
        content: article.content,
        category: article.category?._id,
        tags: article.tags?.map(t => t._id)
      });
    } catch (error) {
      message.error('获取文章失败');
      navigate('/');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (isEditMode) {
        await articleApi.updateArticle(id, { ...values, status: 'published' });
        message.success('文章更新成功');
      } else {
        await articleApi.createArticle({ ...values, status: 'published' });
        message.success('文章创建成功');
      }
      navigate('/');
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
  }

  return (
    <Card title={isEditMode ? '编辑文章' : '创建文章'}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item label="标题" name="title" rules={[{ required: true, message: '请输入标题' }]}>
          <Input placeholder="请输入文章标题" />
        </Form.Item>

        <Form.Item label="内容" name="content" rules={[{ required: true, message: '请输入内容' }]}>
          <TextArea rows={10} placeholder="请输入文章内容（支持 Markdown 格式）" />
        </Form.Item>

        <Form.Item label="分类" name="category">
          <Select placeholder="选择分类" allowClear showSearch filterOption={(input, option) =>
            option.children.toLowerCase().includes(input.toLowerCase())
          }>
            {categories.map(cat => (
              <Select.Option key={cat._id} value={cat._id}>{cat.name}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="标签" name="tags">
          <Select
            mode="multiple"
            placeholder="选择标签"
            allowClear
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
            notFoundContent={<span style={{ color: '#999' }}>暂无数据</span>}
          >
            {tags.map(tag => (
              <Select.Option key={tag._id} value={tag._id}>{tag.name}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} size="large">
            {isEditMode ? '保存修改' : '发布文章'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ArticleForm;