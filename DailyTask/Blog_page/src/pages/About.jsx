import { useState, useEffect } from 'react';
import { Avatar, Timeline, Typography } from 'antd';
import {
  GithubOutlined,
  MailOutlined,
  QqOutlined,
  WechatOutlined,
  GlobalOutlined,
  BookOutlined,
  RocketOutlined,
  ToolOutlined
} from '@ant-design/icons';
import './About.css';

const { Title, Paragraph, Text } = Typography;

const skills = [
  { name: 'React / Next.js', level: 90 },
  { name: 'Vue.js', level: 75 },
  { name: 'Node.js', level: 85 },
  { name: 'TypeScript', level: 80 },
  { name: 'MongoDB', level: 75 },
  { name: 'Docker', level: 70 }
];

const experiences = [
  {
    title: '前端开发工程师',
    company: '某互联网公司',
    period: '2022 - 至今',
    description: '负责公司核心产品的前端架构设计与开发，主导前端技术选型与性能优化。'
  },
  {
    title: '全栈开发工程师',
    company: '创业公司',
    period: '2020 - 2022',
    description: '独立完成多个项目的全栈开发，涵盖 Web 应用、小程序、移动端等。'
  },
  {
    title: '计算机科学学士',
    company: '某大学',
    period: '2016 - 2020',
    description: '主修前端技术与软件工程，连续三年获得奖学金。'
  }
];

const About = () => {
  const [visibleItems, setVisibleItems] = useState([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleItems((prev) => [...prev, entry.target.dataset.index]);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="hero-content">
          <Avatar size={140} className="about-avatar">
            顾
          </Avatar>
          <Title level={1} className="about-name">顾陈鑫</Title>
          <Text className="about-title">全栈开发工程师</Text>
          <div className="about-tags">
            <span className="tag">React</span>
            <span className="tag">Vue</span>
            <span className="tag">Node.js</span>
            <span className="tag">TypeScript</span>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2 className="section-title">
          <BookOutlined /> 关于我
        </h2>
        <Paragraph className="about-intro">
          热衷于前端开发，专注于构建优雅的用户界面和流畅的交互体验。
          对新技术充满好奇，喜欢探索并将其应用于实际项目中。
        </Paragraph>
        <Paragraph className="about-intro">
          拥有多年全栈开发经验，熟悉前端工程化、性能优化和用户体验设计。
          追求代码质量和可维护性，致力于打造高质量的 Web 应用。
        </Paragraph>
      </section>

      <section className="about-section">
        <h2 className="section-title">
          <ToolOutlined /> 技能栈
        </h2>
        <div className="skills-grid">
          {skills.map((skill, index) => (
            <div
              key={skill.name}
              className={`skill-item animate-on-scroll ${visibleItems.includes(String(index)) ? 'visible' : ''}`}
              data-index={index}
            >
              <div className="skill-header">
                <span className="skill-name">{skill.name}</span>
                <span className="skill-percent">{skill.level}%</span>
              </div>
              <div className="skill-bar">
                <div
                  className="skill-progress"
                  style={{ width: visibleItems.includes(String(index)) ? `${skill.level}%` : '0%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section">
        <h2 className="section-title">
          <RocketOutlined /> 项目经验
        </h2>
        <Timeline mode="left" className="experience-timeline">
          {experiences.map((exp, index) => (
            <Timeline.Item
              key={index}
              dot={<RocketOutlined className="timeline-icon" />}
              className={`animate-on-scroll ${visibleItems.includes(`exp-${index}`) ? 'visible' : ''}`}
              data-index={`exp-${index}`}
            >
              <div className="experience-card">
                <h3 className="experience-title">{exp.title}</h3>
                <Text className="experience-company">{exp.company}</Text>
                <Text className="experience-period">{exp.period}</Text>
                <Paragraph className="experience-desc">{exp.description}</Paragraph>
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      </section>

      <section className="about-section">
        <h2 className="section-title">
          <GlobalOutlined /> 联系方式
        </h2>
        <div className="contact-grid">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="contact-item">
            <GithubOutlined />
            <span>Github</span>
          </a>
          <a href="mailto:example@email.com" className="contact-item">
            <MailOutlined />
            <span>Email</span>
          </a>
          <a href="#" className="contact-item">
            <QqOutlined />
            <span>QQ</span>
          </a>
          <a href="#" className="contact-item">
            <WechatOutlined />
            <span>WeChat</span>
          </a>
        </div>
      </section>
    </div>
  );
};

export default About;