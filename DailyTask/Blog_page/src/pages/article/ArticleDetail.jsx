import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Spin, Tag, Button, message, Avatar, List, Input, Popconfirm } from 'antd';
import {
  LikeOutlined,
  LikeFilled,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  StarOutlined,
  StarFilled,
  CalendarOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import oneDark from 'react-syntax-highlighter/dist/esm/styles/prism/one-dark';
import { articleApi, commentApi } from '../../services';
import { useAuth } from '../../contexts';
import dayjs from 'dayjs';
import './ArticleDetail.css';

const { TextArea } = Input;

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const contentRef = useRef(null);
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [tocItems, setTocItems] = useState([]);
  const [activeTocId, setActiveTocId] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const fetchCountRef = useRef(0);

  useEffect(() => {
    fetchCountRef.current = 0;
    const fetchData = async () => {
      if (fetchCountRef.current > 0) return;
      fetchCountRef.current++;
      await Promise.all([fetchArticle(), fetchComments(), fetchRelatedArticles()]);
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (article?.likes && user?._id) {
      setIsLiked(article.likes.includes(user._id));
    }
    if (article?.favorites && user?._id) {
      setIsFavorited(article.favorites.includes(user._id));
    }
    if (!user?._id) {
      setIsLiked(false);
      setIsFavorited(false);
    }
  }, [user?._id, article?.likes, article?.favorites]);

  useEffect(() => {
    if (article?.content) {
      extractHeadings();
    }
  }, [article?.content]);

  useEffect(() => {
    if (!tocItems.length) return; 

    const handleScroll = () => {
      const headings = document.querySelectorAll('.article-content h2, .article-content h3');
      let currentId = '';

      headings.forEach(heading => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 100) {
          currentId = heading.id;
        }
      });

      setActiveTocId(currentId);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tocItems.length]);

  const extractHeadings = () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = article.content || '';
    const headings = Array.from(tempDiv.querySelectorAll('h2, h3')).map((h, index) => ({
      id: `heading-${index}`,
      text: h.textContent.replace(/^#\s*/, ''),
      level: h.tagName === 'H2' ? 2 : 3,
    }));
    setTocItems(headings);
  };

  const fetchArticle = async () => {
    try {
      const data = await articleApi.getArticleById(id);
      const articleData = data.data.article;
      setArticle(articleData);
      if (user?._id) {
        setIsLiked(articleData.likes?.includes(user._id));
        setIsFavorited(articleData.favorites?.includes(user._id));
      }
    } catch (error) {
      message.error('获取文章失败');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    setCommentLoading(true);
    try {
      const data = await commentApi.getCommentsByArticle(id);
      setComments(data.data.comments);
    } catch (error) {
    } finally {
      setCommentLoading(false);
    }
  };

  const fetchRelatedArticles = async () => {
    try {
      const data = await articleApi.getRelatedArticles(id);
      setRelatedArticles(data.data.articles || []);
    } catch (error) {}
  };

  const scrollToHeading = id => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      return;
    }
    try {
      const data = await articleApi.likeArticle(id);
      setArticle(prev => ({ ...prev, likeCount: data.data.likeCount }));
      setIsLiked(data.data.isLiked);
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      return;
    }
    try {
      const data = await articleApi.favoriteArticle(id);
      setArticle(prev => ({ ...prev, favoriteCount: data.data.favoriteCount }));
      setIsFavorited(data.data.isFavorited);
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleDelete = async () => {
    try {
      await articleApi.deleteArticle(id);
      message.success('删除成功');
      navigate('/');
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleComment = async () => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      return;
    }
    if (!commentContent.trim()) {
      message.warning('请输入评论内容');
      return;
    }
    setSubmitting(true);
    try {
      await commentApi.createComment({ content: commentContent, article: id });
      setCommentContent('');
      message.success('评论成功');
      fetchComments();
    } catch (error) {
      message.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async commentId => {
    try {
      await commentApi.deleteComment(commentId);
      message.success('删除成功');
      fetchComments();
    } catch (error) {
      message.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="detail-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!article) return null;

  const isAuthor = user?._id === article.author?._id || user?.role === 'admin';

  return (
    <div className="article-detail-page">
      <div className="detail-header">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/article')}
          className="back-btn">
          返回列表
        </Button>

        <div className="header-info">
          <h1 className="article-title">{article.title}</h1>
          <div className="meta-row">
            <span className="meta-item">
              <Avatar
                size={24}
                src={article.author?.avatar}
                style={{ backgroundColor: 'var(--accent)' }}>
                {article.author?.username?.[0]}
              </Avatar>
              {article.author?.username}
            </span>
            <span className="meta-item">
              <CalendarOutlined /> {dayjs(article.createdAt).format('YYYY-MM-DD')}
            </span>
            <span className="meta-item">
              <EyeOutlined /> {article.views || 0}
            </span>
          </div>
          <div className="tag-row">
            {article.tags?.map(tag => (
              <Tag key={tag._id}>{tag.name}</Tag>
            ))}
            {article.category && <Tag color="blue">{article.category.name}</Tag>}
          </div>
          <div className="action-bar">
            <Button
              type={isLiked ? 'primary' : 'default'}
              icon={isLiked ? <LikeFilled /> : <LikeOutlined />}
              onClick={handleLike}>
              {article.likeCount || 0}
            </Button>
            <Button
              type={isFavorited ? 'primary' : 'default'}
              icon={isFavorited ? <StarFilled /> : <StarOutlined />}
              onClick={handleFavorite}>
              {article.favoriteCount || 0}
            </Button>
            {isAuthor && (
              <>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/article/edit/${article._id}`)}
                />
                <Popconfirm title="确定删除?" onConfirm={handleDelete}>
                  <Button icon={<DeleteOutlined />} danger />
                </Popconfirm>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="detail-body">
        <div className="content-area" ref={contentRef}>
          <div className="article-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  if (!inline && match) {
                    return (
                      <SyntaxHighlighter
                        language={match[1]}
                        PreTag="div"
                        style={oneDark}
                        customStyle={{ margin: '20px 0', borderRadius: '8px', fontSize: '14px' }}
                        showLineNumbers
                        {...props}>
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    );
                  }
                  return (
                    <code
                      style={{
                        backgroundColor: 'var(--code-bg)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.9em',
                        color: '#e06c75',
                      }}
                      {...props}>
                      {children}
                    </code>
                  );
                },
                table({ children }) {
                  return <table>{children}</table>;
                },
                th({ children }) {
                  return <th>{children}</th>;
                },
                td({ children }) {
                  return <td>{children}</td>;
                },
              }}>
              {article.content}
            </ReactMarkdown>
          </div>
        </div>

        {tocItems.length > 0 && (
          <aside className="toc-sidebar">
            <div className="toc-title">目录</div>
            <nav className="toc-nav">
              {tocItems.map((item, index) => (
                <a
                  key={index}
                  href={`#heading-${index}`}
                  className={`toc-item ${activeTocId === `heading-${index}` ? 'active' : ''}`}
                  style={{ paddingLeft: `${(item.level - 2) * 12 + 16}px` }}
                  onClick={e => {
                    e.preventDefault();
                    scrollToHeading(`heading-${index}`);
                  }}>
                  {item.text}
                </a>
              ))}
            </nav>
          </aside>
        )}

        <aside className="related-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">相关文章</h3>
            <div className="related-list">
              {relatedArticles.map(item => (
                <div
                  key={item._id}
                  className="related-item"
                  onClick={() => navigate(`/article/${item._id}`)}>
                  <h4>{item.title}</h4>
                  <p>阅读 {item.views || 0}</p>
                </div>
              ))}
              {relatedArticles.length === 0 && <p className="empty-text">暂无相关文章</p>}
            </div>
          </div>
        </aside>
      </div>

      <section className="comments-section">
        <h2 className="section-heading">评论</h2>
        {isAuthenticated && (
          <div className="comment-form">
            <TextArea
              rows={3}
              placeholder="发表你的评论..."
              value={commentContent}
              onChange={e => setCommentContent(e.target.value)}
            />
            <Button type="primary" onClick={handleComment} loading={submitting}>
              发表评论
            </Button>
          </div>
        )}
        <List
          dataSource={comments}
          loading={commentLoading}
          renderItem={item => (
            <List.Item
              actions={[
                (user?._id === item.author?._id || user?.role === 'admin') && (
                  <Popconfirm
                    key="delete"
                    title="确定删除?"
                    onConfirm={() => handleDeleteComment(item._id)}>
                    <Button type="link" danger size="small">
                      删除
                    </Button>
                  </Popconfirm>
                ),
              ].filter(Boolean)}>
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} src={item.author?.avatar} />}
                title={item.author?.username}
                description={dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}
              />
              <div className="comment-content">{item.content}</div>
            </List.Item>
          )}
        />
      </section>
    </div>
  );
};

export default ArticleDetail;
