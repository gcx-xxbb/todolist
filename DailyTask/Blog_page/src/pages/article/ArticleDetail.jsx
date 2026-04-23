import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Spin, Tag, Button, message, Avatar, List, Input, Popconfirm, Row, Col } from 'antd';
import { LikeOutlined, EditOutlined, DeleteOutlined, UserOutlined, StarOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { articleApi, commentApi } from '../../services';
import { useAuth } from '../../contexts';
import dayjs from 'dayjs';

const { TextArea } = Input;

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const fetchCountRef = useRef(0);

  useEffect(() => {
    fetchCountRef.current = 0;

    const fetchData = async () => {
      if (fetchCountRef.current > 0) return;
      fetchCountRef.current++;

      await Promise.all([
        fetchArticle(),
        fetchComments(),
        fetchRelatedArticles()
      ]);
    };

    fetchData();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const data = await articleApi.getArticleById(id);
      setArticle(data.data.article);
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
      console.error(error);
    } finally {
      setCommentLoading(false);
    }
  };

  const fetchRelatedArticles = async () => {
    try {
      const data = await articleApi.getRelatedArticles(id);
      setRelatedArticles(data.data.articles || []);
    } catch (error) {
      console.error(error);
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
      message.success(data.data.isLiked ? '点赞成功' : '取消点赞');
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
      message.success(data.data.isFavorited ? '收藏成功' : '取消收藏');
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

  const handleDeleteComment = async (commentId) => {
    try {
      await commentApi.deleteComment(commentId);
      message.success('删除成功');
      fetchComments();
    } catch (error) {
      message.error(error.message);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
  }

  if (!article) {
    return null;
  }

  const isAuthor = user?._id === article.author?._id || user?.role === 'admin';

  return (
    <Row gutter={16}>
      <Col xs={24} lg={16}>
        <Card
          title={<h2 style={{ margin: 0 }}>{article.title}</h2>}
          extra={
            <div style={{ display: 'flex', gap: 8 }}>
              <Button icon={<LikeOutlined />} onClick={handleLike}>
                {article.likeCount || 0}
              </Button>
              <Button icon={<StarOutlined />} onClick={handleFavorite}>
                {article.favoriteCount || 0}
              </Button>
              {isAuthor && (
                <>
                  <Button icon={<EditOutlined />} onClick={() => navigate(`/article/edit/${article._id}`)} />
                  <Popconfirm title="确定删除?" onConfirm={handleDelete}>
                    <Button icon={<DeleteOutlined />} danger />
                  </Popconfirm>
                </>
              )}
            </div>
          }
        >
          <div style={{ marginBottom: 16 }}>
            <Avatar icon={<UserOutlined />} src={article.author?.avatar} />
            <span style={{ marginLeft: 8 }}>{article.author?.username}</span>
            <span style={{ marginLeft: 16, color: '#999' }}>{dayjs(article.createdAt).format('YYYY-MM-DD HH:mm')}</span>
            <span style={{ marginLeft: 16 }}>阅读 {article.views || 0}</span>
          </div>
          <div style={{ marginBottom: 16 }}>
            {article.tags?.map(tag => (
              <Tag key={tag._id} color="blue">{tag.name}</Tag>
            ))}
            {article.category && <Tag color="green">{article.category.name}</Tag>}
          </div>
          <div className="article-content">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>
        </Card>

        <Card title="评论" style={{ marginTop: 16 }} loading={commentLoading}>
          {isAuthenticated && (
            <div style={{ marginBottom: 16 }}>
              <TextArea
                rows={3}
                placeholder="发表你的评论..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
              />
              <Button type="primary" onClick={handleComment} loading={submitting} style={{ marginTop: 8 }}>
                发表评论
              </Button>
            </div>
          )}
          <List
            dataSource={comments}
            renderItem={(item) => (
              <List.Item
                actions={[
                  (user?._id === item.author?._id || user?.role === 'admin') && (
                    <Popconfirm key="delete" title="确定删除?" onConfirm={() => handleDeleteComment(item._id)}>
                      <Button type="link" danger size="small">删除</Button>
                    </Popconfirm>
                  )
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} src={item.author?.avatar} />}
                  title={item.author?.username}
                  description={dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}
                />
                <div>{item.content}</div>
              </List.Item>
            )}
          />
        </Card>
      </Col>

      <Col xs={24} lg={8}>
        <Card title="相关文章" loading={loading}>
          {relatedArticles.length > 0 ? (
            <List
              size="small"
              dataSource={relatedArticles}
              renderItem={(item) => (
                <List.Item
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/article/${item._id}`)}
                >
                  <List.Item.Meta
                    title={item.title}
                    description={`阅读 ${item.views || 0}`}
                  />
                </List.Item>
              )}
            />
          ) : (
            <div style={{ color: '#999', textAlign: 'center', padding: 20 }}>暂无相关文章</div>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default ArticleDetail;