const mongoose = require('mongoose');

require('dotenv').config({ path: './.env' });

const Category = require('../src/models/Category');
const Tag = require('../src/models/Tag');

const toSlug = (str) => str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\u4e00-\u9fa5-]/g, '');

const categories = [
  { name: '前端开发', slug: 'frontend', description: '前端技术文章', order: 1 },
  { name: '后端开发', slug: 'backend', description: '后端技术文章', order: 2 },
  { name: '数据库', slug: 'database', description: '数据库相关技术', order: 3 },
  { name: '云服务与DevOps', slug: 'devops', description: '云服务、容器化、自动化部署', order: 4 },
  { name: '移动开发', slug: 'mobile', description: '移动端开发技术', order: 5 },
  { name: '人工智能', slug: 'ai', description: 'AI、机器学习相关内容', order: 6 },
  { name: '项目实战', slug: 'projects', description: '项目实战经验分享', order: 7 }
];

const subCategories = [
  { name: 'React / Next.js', slug: 'react-nextjs', parent: '前端开发', description: 'React及其生态相关', order: 1 },
  { name: 'Vue.js', slug: 'vuejs', parent: '前端开发', description: 'Vue技术栈', order: 2 },
  { name: 'CSS / Tailwind', slug: 'css-tailwind', parent: '前端开发', description: '样式与CSS框架', order: 3 },
  { name: '前端工程化', slug: 'frontend-engineering', parent: '前端开发', description: '构建工具、CI/CD等', order: 4 },
  { name: 'Node.js', slug: 'nodejs', parent: '后端开发', description: 'Node.js后端开发', order: 1 },
  { name: 'Python / Django', slug: 'python-django', parent: '后端开发', description: 'Python技术栈', order: 2 },
  { name: 'Go', slug: 'golang', parent: '后端开发', description: 'Go语言开发', order: 3 },
  { name: 'API 设计', slug: 'api-design', parent: '后端开发', description: 'RESTful、GraphQL等', order: 4 },
  { name: 'MySQL', slug: 'mysql', parent: '数据库', description: 'MySQL数据库', order: 1 },
  { name: 'MongoDB', slug: 'mongodb', parent: '数据库', description: 'MongoDB数据库', order: 2 },
  { name: 'Redis', slug: 'redis', parent: '数据库', description: 'Redis缓存', order: 3 },
  { name: 'Docker', slug: 'docker', parent: '云服务与DevOps', description: '容器化技术', order: 1 },
  { name: 'Kubernetes', slug: 'kubernetes', parent: '云服务与DevOps', description: '容器编排', order: 2 },
  { name: 'CI/CD', slug: 'ci-cd', parent: '云服务与DevOps', description: '持续集成部署', order: 3 },
  { name: 'Linux', slug: 'linux', parent: '云服务与DevOps', description: 'Linux系统', order: 4 },
  { name: 'React Native', slug: 'react-native', parent: '移动开发', description: 'React Native开发', order: 1 },
  { name: 'Flutter', slug: 'flutter', parent: '移动开发', description: 'Flutter开发', order: 2 },
  { name: '小程序', slug: 'mini-program', parent: '移动开发', description: '微信小程序等', order: 3 },
  { name: '机器学习', slug: 'machine-learning', parent: '人工智能', description: '机器学习基础', order: 1 },
  { name: '深度学习', slug: 'deep-learning', parent: '人工智能', description: '深度学习模型', order: 2 },
  { name: 'LLM / GPT', slug: 'llm-gpt', parent: '人工智能', description: '大语言模型', order: 3 },
  { name: '项目复盘', slug: 'project-review', parent: '项目实战', description: '项目经验总结', order: 1 },
  { name: '架构设计', slug: 'architecture', parent: '项目实战', description: '系统架构设计', order: 2 }
];

const tags = [
  'react', 'vue', 'nextjs', 'nuxt', 'typescript', 'javascript',
  'css', 'tailwind', 'ant-design', 'material-ui', 'sass',
  'nodejs', 'express', 'nestjs', 'django', 'flask', 'fastapi',
  'python', 'go', 'rust', 'java',
  'mysql', 'mongodb', 'redis', 'postgresql',
  'docker', 'kubernetes', 'jenkins', 'github-actions', 'nginx',
  'aws', 'azure', 'gcp', 'vercel', 'heroku',
  'git', 'vscode', 'webpack', 'vite', 'npm', 'yarn',
  'openai', 'chatgpt', 'tensorflow', 'pytorch', 'langchain',
  'react-native', 'flutter', 'uniapp', 'weixin',
  'linux', 'bash', 'websocket', 'graphql', 'restful', 'jwt'
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blog');
    console.log('MongoDB connected');

    await Tag.deleteMany({});
    await Category.deleteMany({});
    console.log('Cleared existing data');

    const createdCategories = {};

    for (const cat of categories) {
      const category = await Category.create({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        order: cat.order
      });
      createdCategories[cat.name] = category._id;
      console.log(`Created category: ${cat.name}`);
    }

    for (const subCat of subCategories) {
      const parentId = createdCategories[subCat.parent];
      await Category.create({
        name: subCat.name,
        slug: subCat.slug,
        description: subCat.description,
        order: subCat.order,
        parent: parentId
      });
      console.log(`Created sub-category: ${subCat.name}`);
    }

    const tagDocs = tags.map(name => ({ name, slug: toSlug(name) }));
    await Tag.insertMany(tagDocs);
    console.log(`Created ${tags.length} tags`);

    console.log('\n=== Seed completed ===');
    console.log(`Categories: ${categories.length + subCategories.length}`);
    console.log(`Tags: ${tags.length}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();