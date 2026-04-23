import { useState, useEffect } from 'react';
import { Row, Col, Card, Input, Select, Spin, Empty, Tag, Pagination } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FileTextOutlined } from '@ant-design/icons';
import { articleApi, categoryApi, tagApi } from '../../services';

const { Search } = Input;

const ArticleList = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({ search: '', category: '', tag: '', status: 'published' });

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [pagination.page, filters]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const data = await articleApi.getArticles({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });
      setArticles(data.data.articles);
      setPagination(prev => ({ ...prev, total: data.data.pagination.total }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  return (
    <div>
      <Card className="filter-section">
        <div className="filter-row">
          <div className="search-wrapper">
            <Search placeholder="搜索文章..." onSearch={handleSearch} enterButton />
          </div>
          <div className="filter-item">
            <Select
              placeholder="选择分类"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('category', value)}
            >
              {categories.map(cat => (
                <Select.Option key={cat._id} value={cat._id}>{cat.name}</Select.Option>
              ))}
            </Select>
          </div>
          <div className="filter-item">
            <Select
              placeholder="选择标签"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('tag', value)}
            >
              {tags.map(tag => (
                <Select.Option key={tag._id} value={tag._id}>{tag.name}</Select.Option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="center-content">
          <Spin size="large" />
        </div>
      ) : articles.length === 0 ? (
        <Empty description="暂无文章" />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {articles.map(article => (
              <Col xs={24} sm={12} md={8} key={article._id}>
                <Card
                  className="article-card"
                  onClick={() => navigate(`/article/${article._id}`)}
                >
                  <div className="article-cover">
                    <FileTextOutlined />
                  </div>
                  <Card.Meta
                    title={article.title}
                    description={
                      <>
                        <div className="article-meta">
                          <Tag color="blue">{article.author?.username}</Tag>
                          <span>{article.likeCount} 点赞</span>
                          <span>{article.views} 阅读</span>
                        </div>
                        <div className="article-tags">
                          {article.tags?.map(tag => (
                            <Tag key={tag._id}>{tag.name}</Tag>
                          ))}
                        </div>
                      </>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Pagination
              current={pagination.page}
              pageSize={pagination.limit}
              total={pagination.total}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ArticleList;