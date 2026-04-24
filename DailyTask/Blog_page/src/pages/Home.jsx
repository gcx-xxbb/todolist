import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Tag, Avatar, Typography } from 'antd';
import {
  ArrowRightOutlined,
  FileTextOutlined,
  GithubOutlined,
  MailOutlined,
  ZhihuOutlined,
  WeiboOutlined,
  TwitterOutlined,
  ReadOutlined,
  EyeOutlined,
  HeartOutlined
} from '@ant-design/icons';
import { articleApi } from '../services';
import dayjs from 'dayjs';
import './Home.css';

const { Title, Paragraph, Text } = Typography;

const techStack = [
  { name: 'React', icon: '⚛️' },
  { name: 'TypeScript', icon: '📘' },
  { name: 'Next.js', icon: '▲' },
  { name: 'Tailwind CSS', icon: '🎨' },
  { name: 'Node.js', icon: '🟢' },
  { name: 'MongoDB', icon: '🍃' },
  { name: 'Docker', icon: '🐳' },
  { name: 'Git', icon: '📦' }
];

const Home = () => {
  const navigate = useNavigate();
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedArticles();
  }, []);

  const fetchFeaturedArticles = async () => {
    try {
      const data = await articleApi.getArticles({ limit: 6, status: 'published', sort: '-views' });
      setFeaturedArticles(data.data.articles || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              你好，我是<span className="highlight">顾陈鑫</span>
            </h1>
            <p className="hero-subtitle animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              一名前端开发工程师
            </p>
            <p className="hero-description animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              专注于 React 全栈开发<br />
              热爱技术，乐于分享
            </p>
            <div className="hero-actions animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Button type="primary" size="large" icon={<ReadOutlined />} onClick={() => navigate('/article')}>
                阅读文章
              </Button>
              <Button size="large" ghost onClick={() => navigate('/about')}>
                了解更多
              </Button>
            </div>
          </div>
          <div className="hero-visual animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="hero-image-placeholder">
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 20L180 80L100 140L20 80Z" fill="var(--bg-tertiary)" stroke="var(--border-color)" strokeWidth="2"/>
                <path d="M60 120L140 180" stroke="var(--border-color)" strokeWidth="2"/>
                <circle cx="100" cy="80" r="30" fill="var(--accent)" opacity="0.2"/>
              </svg>
            </div>
          </div>
        </div>
        <div className="hero-gradient"></div>
      </section>

      <section className="section featured-section">
        <div className="section-header">
          <h2 className="section-title">精选文章</h2>
          <Button type="link" onClick={() => navigate('/article')}>
            查看全部 <ArrowRightOutlined />
          </Button>
        </div>

        <div className="article-grid">
          {loading ? (
            Array(6).fill(null).map((_, i) => (
              <Card key={i} className="article-card loading" />
            ))
          ) : (
            featuredArticles.map((article, index) => (
              <Card
                key={article._id}
                className="article-card"
                hoverable
                onClick={() => navigate(`/article/${article._id}`)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="article-cover">
                  <div className="cover-placeholder">
                    <FileTextOutlined style={{ fontSize: 32 }} />
                  </div>
                  {article.category && (
                    <Tag color="blue" className="home-category-tag">{article.category.name}</Tag>
                  )}
                </div>
                <div className="article-info">
                  <h3 className="article-title">{article.title}</h3>
                  <p className="article-excerpt">
                    {article.content?.replace(/[#*`\[\]]/g, '').substring(0, 80)}...
                  </p>
                  <div className="article-meta">
                    <span><EyeOutlined /> {article.views || 0}</span>
                    <span><HeartOutlined /> {article.likeCount || 0}</span>
                    <span>{dayjs(article.createdAt).format('MM-DD')}</span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </section>

      <section className="section tech-section">
        <h2 className="section-title">技术栈</h2>
        <div className="tech-grid">
          {techStack.map((tech, index) => (
            <div key={tech.name} className="tech-item" style={{ animationDelay: `${index * 0.03}s` }}>
              <span className="tech-icon">{tech.icon}</span>
              <span className="tech-name">{tech.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section about-section">
        <div className="about-container">
          <div className="about-right">
            <h2 className="section-title">关于我</h2>
            <Paragraph className="about-bio">
              热衷前端开发，专注于构建优雅的用户界面和流畅的交互体验。
              喜欢探索新技术，分享学习心得。
            </Paragraph>
            <div className="social-links">
              <a href="#" className="social-link"><GithubOutlined /></a>
              <a href="#" className="social-link"><MailOutlined /></a>
              <a href="#" className="social-link"><ZhihuOutlined /></a>
              <a href="#" className="social-link"><TwitterOutlined /></a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;