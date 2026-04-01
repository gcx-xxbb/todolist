import express from 'express';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const mockData = [
  {
    id: 1001,
    name: '张伟',
    age: 28,
    tag: '前端',
    des: '资深前端开发工程师，擅长 React 和 Vue 框架。',
  },
  { id: 1002, name: '李娜', age: 32, tag: '产品', des: '产品经理，拥有 5 年 SaaS 平台管理经验。' },
  { id: 1003, name: '王强', age: 24, tag: '后端', des: '应届毕业生，主修计算机科学，热爱算法。' },
  { id: 1004, name: '刘洋', age: 45, tag: '后端', des: '公司技术总监，负责整体架构规划。' },
  { id: 1005, name: '陈静', age: 29, tag: '设计', des: 'UI/UX 设计师，追求极致的用户体验。' },
  {
    id: 1006,
    name: '杨帆',
    age: 35,
    tag: '后端',
    des: '后端开发工程师，精通 Java 和 Spring Boot。',
  },
  { id: 1007, name: '赵敏', age: 22, tag: '运营', des: '实习生，正在学习 Python 数据分析。' },
  {
    id: 1008,
    name: '黄志',
    age: 40,
    tag: '后端',
    des: '运维专家，擅长 Kubernetes 和 Docker 容器化。',
  },
  { id: 1009, name: '周杰', age: 27, tag: '前端', des: '全栈工程师，独立开发过多个上线项目。' },
  { id: 1010, name: '吴刚', age: 31, tag: '后端', des: '测试工程师，专注于自动化测试脚本编写。' },
  { id: 1011, name: '徐丽', age: 26, tag: '运营', des: '人力资源专员，负责技术团队招聘。' },
  { id: 1012, name: '孙明', age: 38, tag: '运营', des: '市场部经理，擅长品牌推广和公关。' },
  { id: 1013, name: '林涛', age: 23, tag: '前端', des: '初级前端，正在重构公司官网。' },
  { id: 1014, name: '何平', age: 50, tag: '产品', des: '外部顾问，提供企业数字化转型建议。' },
  { id: 1015, name: '高红', age: 33, tag: '运营', des: '财务主管，严谨细致，负责年度审计。' },
  { id: 1016, name: '郑宇', age: 25, tag: '前端', des: '移动端开发，专注于 iOS 平台应用。' },
  { id: 1017, name: '罗杰', age: 36, tag: '产品', des: '项目经理，PMP 认证，负责敏捷开发流程。' },
  { id: 1018, name: '梁艳', age: 30, tag: '运营', des: '运营专员，负责用户增长和社群维护。' },
  { id: 1019, name: '宋凯', age: 42, tag: '后端', des: '架构师，专注于高并发系统设计。' },
  { id: 1020, name: '谢婷', age: 21, tag: '设计', des: '大二学生，暑期社会实践参与者。' },
];

const filterDataByTag = tag => {
  if (!tag) return mockData;
  return mockData.filter(item => item.tag === tag);
};

const commonResponse = (code, detail) => {
  return { code, detail };
};

app.get('/data', (req, res) => {
  res.json(commonResponse(200, mockData));
});

app.post('/', (req, res) => {
  console.log('原始 Body:', JSON.stringify(req.body, null, 2));
  const { tag } = req.body;
  const resData = filterDataByTag(tag);
  res.json(commonResponse(200, resData));
});

app.listen(8888, () => {
  console.log('Server is running on port 8888');
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({ code: 500, message: '服务器错误' });
});
