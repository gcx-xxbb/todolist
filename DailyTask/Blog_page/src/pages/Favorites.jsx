import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Empty, Spin, Pagination, Button, Tag } from 'antd';
import { FileTextOutlined, CalendarOutlined, EyeOutlined, StarFilled } from '@ant-design/icons';
import { articleApi } from '../services';
import { useAuth } from '../contexts';
import dayjs from 'dayjs';
import './Favorites.css';

const Favorites = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const fetchCountRef = useRef(0);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchCountRef.current = 0;
    const fetchData = async () => {
      if (fetchCountRef.current > 0) return;
      fetchCountRef.current++;
      await fetchFavorites();
    };

    fetchData();
  }, [isAuthenticated, pagination.current]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const data = await articleApi.getMyFavorites({
        page: pagination.current,
        limit: pagination.pageSize
      });
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

  const handlePageChange = (page, pageSize) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="favorites-page">
      <div className="page-header">
        <h1 className="page-title">
          <StarFilled style={{ color: 'var(--accent)', marginRight: 12 }} />
          我的收藏
        </h1>
        <p className="page-subtitle">收藏的文章会在这里显示</p>
      </div>

      <div className="favorites-container">
        {loading ? (
          <div className="loading-wrapper"><Spin size="large" /></div>
        ) : articles.length === 0 ? (
          <Empty description="暂无收藏文章" className="empty-state" />
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

export default Favorites;