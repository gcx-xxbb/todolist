import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input, Tag, Button, Empty, Spin, Pagination } from 'antd';
import { SearchOutlined, EyeOutlined, HeartOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import { articleApi, categoryApi, tagApi } from '../../services';
import dayjs from 'dayjs';
import './ArticleList.css';

const ArticleList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
  const fetchCountRef = useRef(0);

  useEffect(() => {
    console.log(1234);
    
    fetchCountRef.current = 0;
    
    const fetchData = async () => {
      if (fetchCountRef.current > 0) return;
      fetchCountRef.current++;
      
      await Promise.all([
        fetchArticles(),
        fetchCategories(),
        fetchTags()
      ]);
    };

    fetchData();
  }, [searchParams]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        status: 'published'
      };
      
      if (searchValue) params.search = searchValue;
      if (searchParams.get('category')) params.category = searchParams.get('category');
      if (searchParams.get('tag')) params.tag = searchParams.get('tag');

      const data = await articleApi.getArticles(params);
      setArticles(data.data.articles || []);
      setPagination(prev => ({
        ...prev,
        total: data.data.pagination?.total || 0
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getCategories();
      setCategories(data.data.categories || []);
    } catch (error) {}
  };

  const fetchTags = async () => {
    try {
      const data = await tagApi.getTags();
      setTags(data.data.tags || []);
    } catch (error) {}
  };

  const handleSearch = (value) => {
    setSearchValue(value);
    if (value.trim()) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
  };

  const handleCategoryFilter = (categoryId) => {
    if (categoryId) {
      setSearchParams({ category: categoryId });
    } else {
      setSearchParams({});
    }
  };

  const handlePageChange = (page, pageSize) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="article-list-page">
      <div className="list-header">
        <h1 className="page-title">文章</h1>
        <p className="page-subtitle">已按发布时间排序，分享思考与探索。</p>
        
        <div className="filter-bar">
          <Input.Search
            placeholder="搜索文章..."
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            onSearch={handleSearch}
            allowClear
            className="search-input"
          />
          
          <div className="category-filters">
            <Tag 
              onClick={() => handleCategoryFilter(null)}
              className={`category-tag ${!searchParams.get('category') ? 'active' : ''}`}
            >
              全部
            </Tag>
            {categories.slice(0, 8).map(cat => (
              <Tag 
                key={cat._id} 
                onClick={() => handleCategoryFilter(cat._id)}
                className={`category-tag ${searchParams.get('category') === cat._id ? 'active' : ''}`}
              >
                {cat.name}
              </Tag>
            ))}
          </div>

          <div className="tag-filters">
            {tags.slice(0, 12).map(tag => (
              <span key={tag._id} className="tag-item">{tag.name}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="article-list-container">
        {loading ? (
          <div className="loading-wrapper"><Spin size="large" /></div>
        ) : articles.length === 0 ? (
          <Empty description="暂无文章" />
        ) : (
          <div className="article-list">
            {articles.map((article, index) => (
              <div 
                key={article._id} 
                className="article-list-item"
                style={{ animationDelay: `${index * 0.03}s` }}
                onClick={() => navigate(`/article/${article._id}`)}
              >
                <div className="item-icon">
                  <FileTextOutlined />
                </div>
                <div className="item-content">
                  <h3 className="item-title">{article.title}</h3>
                  <p className="item-excerpt">
                    {article.content?.replace(/[#*`\[\]]/g, '').substring(0, 120)}...
                  </p>
                </div>
                <div className="item-meta">
                  {article.tags?.slice(0, 2).map(tag => (
                    <Tag key={tag._id} color="blue" size="small">{tag.name}</Tag>
                  ))}
                  <span className="meta-date">
                    <CalendarOutlined /> {dayjs(article.createdAt).format('YYYY-MM-DD')}
                  </span>
                  <span className="meta-views">
                    <EyeOutlined /> {article.views || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && pagination.total > pagination.pageSize && (
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onChange={handlePageChange}
            showSizeChanger={false}
            className="pagination"
          />
        )}
      </div>
    </div>
  );
};

export default ArticleList;