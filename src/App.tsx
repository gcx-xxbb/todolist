import { useEffect, useReducer, useState, useContext } from 'react'
import './App.css'
import TodoList from './components/todoList'
import useCounter from './hooks/useCounter'
import useLocalStorage from './hooks/useLocalStorage'
import TodoContext from './context/TodoContext'
import { AuthContext } from './context/AuthContext'
export interface Todo { id: string, title: string, isFinished: boolean }

export type TodoAction = { type: 'add', payload: Todo } | { type: 'delete', payload: string } | { type: 'finish', payload: string }

function App() {
  const [date, setDate] = useState<Date>(new Date())
  const [todoList, setTodoList] = useLocalStorage<Todo[]>('todoList', [])
  const { count, increment } = useCounter(0)

  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('App 必须在 AuthContext.Provider 内使用！');
  }
  const { user } = context;



  const reducer = (todos: Todo[], action: TodoAction): Todo[] => {
    switch (action.type) {
      case 'add':
        const addData = [...todos, action.payload]
        return addData
      case 'delete':
        return todos.filter(todo => todo.id !== action.payload)
      case 'finish':
        return todos.map(todo => todo.id === action.payload ? { ...todo, isFinished: !todo.isFinished } : todo)
      default:
        return todos
    }
  }

  const [todos, dispatch] = useReducer(reducer, todoList)

  const mockData = () => {
    const todos: Todo[] = [
      { id: '1', title: '用 Vite 创建 react-ts 项目', isFinished: true },
      { id: '2', title: '动态修改App内容', isFinished: true },
      { id: '3', title: '写一个TodoList组件', isFinished: false },
      { id: '4', title: '加“添加待办”功能', isFinished: false },
      { id: '5', title: '加“删除”按钮', isFinished: false },
      { id: '6', title: '部署到 Vercel（免费+3分钟）', isFinished: false },
      { id: '7', title: '复盘：截图部署链接，发朋友圈/语雀：“Week 1 done!”', isFinished: false },
      { id: '8', title: '定义 Task 类型：{ id: string; text: string; done: boolean }', isFinished: false },
      { id: '9', title: '把 TodoList 的 props 和 todos 用 TS 类型标注', isFinished: false },
      { id: '10', title: '写一个 mock API 函数，返回 Promise<Task[]>', isFinished: false },
      { id: '11', title: '用 useEffect 模拟加载数据（代替硬编码）', isFinished: false },
      { id: '12', title: '尝试写一个泛型 Hook：useLocalStorage<T>(key, initialValue)', isFinished: false },
      { id: '13', title: '修复所有 any，开启 strict: true（可选）', isFinished: false },
      { id: '14', title: '✅ 发一条笔记：“TS 让我的代码更自信了”', isFinished: false },
      { id: '15', title: '用 useReducer 重构 Todo 状态逻辑', isFinished: false },
      { id: '16', title: '用 createContext + useContext 抽离状态', isFinished: false },
      { id: '17', title: '自定义 Hook：useDebounce(value, delay)（用于搜索防抖）', isFinished: false },
      { id: '18', title: '自定义 Hook：useLocalStorage（持久化 Todo）', isFinished: false },
      { id: '19', title: '对比：如果用 Zustand 怎么写？（只看文档，不实现）', isFinished: false },
      { id: '20', title: '给项目加“清空已完成”按钮（测试状态更新）', isFinished: false },
      { id: '21', title: '✅ 录屏 30 秒演示你的 App，发到 GitHub README', isFinished: false },
      { id: '22', title: '用 React.memo 包裹 TodoItem 组件', isFinished: false },
      { id: '23', title: '用 useCallback 包装删除函数', isFinished: false },
      { id: '24', title: '用 useMemo 缓存过滤后的列表', isFinished: false },
      { id: '25', title: '用 Chrome Lighthouse 跑分（记录分数）', isFinished: false },
      { id: '26', title: '懒加载一个“设置”页面（React.lazy + Suspense）', isFinished: false },
      { id: '27', title: '优化后再次跑 Lighthouse，对比提升', isFinished: false },
      { id: '28', title: '✅ 在 README 写：“性能从 XX 分 → YY 分”', isFinished: false },
      { id: '29', title: '安装 ESLint + Prettier（用社区推荐配置）', isFinished: false },
      { id: '30', title: '配置保存自动格式化（VS Code 插件）', isFinished: false },
      { id: '31', title: '安装 Husky + lint-staged（提交前自动检查）', isFinished: false },
      { id: '32', title: '写第一个测试：render(<App />) 是否包含 “Hello”', isFinished: false },
      { id: '33', title: '测试“添加任务”功能（RTL + fireEvent）', isFinished: false },
      { id: '34', title: '配置 GitHub Actions 自动跑测试（可选）', isFinished: false },
      { id: '35', title: '✅ commit 信息用 feat: add todo list 格式', isFinished: false },
    ]
    return Promise.resolve(todos)
  }

  useEffect(() => {
    setInterval(() => {
      setDate(new Date())
    }, 1000)
  }, [])

  useEffect(() => {
    setTodoList(todos)
  }, [todos, setTodoList])

  return (
    <TodoContext.Provider value={{ todos, dispatch }}>
      <h3>Hello,Typescript</h3>
      <p>{date.toLocaleString()}</p>
      {user?.name && <TodoList />}
      <button onClick={increment}>{count}</button >
    </TodoContext.Provider>
  )
}

export default App
