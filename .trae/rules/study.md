---
alwaysApply: true
---
## 开发者信息
- 身份：React 前端开发，正在学习 Node.js + MongoDB，向全栈转型
- 技术栈：React 18、TypeScript、Node.js、MongoDB、Mongoose
- 代码风格：函数组件 + Hooks，TypeScript 严格模式
## 代码规范
### React 规范
1. 始终使用函数组件和 Hooks（class 组件不推荐）
2. 组件文件用 PascalCase（如 UserCard.tsx）
3. 工具函数用 camelCase（如 useLocalStorage.ts）
4. 优先使用 useMemo、useCallback 优化性能
5. 列表渲染必须加 key，避免使用 index 作为 key
6. 异步操作要在 useEffect 中清理（return cleanup 函数）
7. 组件 Props 要定义 interface 或 type
### TypeScript 规范
1. 禁用 any，尽量使用精确类型
2. 接口命名加 I 前缀（如 IUserProps）
3. API 响应数据要定义 Response 类型
4. 使用 Partial、Omit、Pick 等工具类型
### Node.js 规范
1. 路由文件放在 routes/，控制器逻辑单独文件
2. 错误处理用 try-catch，异步用 .catch()
3. 环境变量用 .env 文件，不硬编码敏感信息
4. API 响应格式统一：{ code, data, message }
### MongoDB/Mongoose 规范
1. Schema 字段要定义 type 和 required
2. 使用 timestamps: true 自动管理时间戳
3. 查询操作加 .catch(err => { ... }) 错误处理
4. 敏感字段（password）在返回前脱敏
## 工作流程
1. 写代码前先分析需求，复杂功能先描述思路
2. 写完代码要自己检查一遍再提交
3. 发现 bug 先描述可能原因，再让 AI 帮忙修复
4. 养成写注释的习惯，复杂逻辑要解释为什么
## 禁止事项
1. 不推荐使用 class 组件
2. 不推荐使用 this.setState（用 Hooks 代替）
3. 不推荐在组件内部定义函数（用 useCallback 包裹）
4. 不推荐使用 any 类型
