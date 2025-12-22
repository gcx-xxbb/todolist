import { useEffect, useState } from 'react'
import './App.css'
import TodoList from './components/todoList'
import useCounter from './hooks/useCounter'
import useLocalStorage from './hooks/useLocalStorage'

interface Todo { id: string, title: string, isFinished: boolean }


function App() {
  const [date, setDate] = useState<Date>(new Date())
  const [todoList, setTodoList] = useLocalStorage<Todo[]>('todoList', [])
  const { count, increment } = useCounter(0)

  const addTodo = (newTodo: Todo) => {
    setTodoList([...todoList, newTodo])
  }

  const deleteTodo = (id: string) => {
    setTodoList(todoList.filter(todo => todo.id !== id))
  }

  const finishTodo = (id: string) => {
    setTodoList(todoList.map(todo => todo.id === id ? { ...todo, isFinished: !todo.isFinished } : todo))
  }

  const mockData = () => {
    const todos: Todo[] = [
      { id: '1', title: '用 Vite 创建 react-ts 项目', isFinished: true },
      { id: '2', title: '动态修改App内容', isFinished: true },
      { id: '3', title: '写一个TodoList组件', isFinished: false },
      { id: '4', title: '加“添加待办”功能', isFinished: false },
      { id: '5', title: '加“删除”按钮', isFinished: false },
      { id: '6', title: '部署到 Vercel（免费+3分钟）', isFinished: false },
      { id: '7', title: '复盘：截图部署链接，发朋友圈/语雀：“Week 1 done!”', isFinished: false },
    ]
    return Promise.resolve(todos)
  }

  useEffect(() => {
    setInterval(() => {
      setDate(new Date())
    }, 1000)
  }, [])



  useEffect(() => {
    mockData().then(res => {
      setTodoList(res)
    })
  }, [])

  return (
    <>
      <h3>Hello,Typescript</h3>
      <p>{date.toLocaleString()}</p>
      <TodoList todoList={todoList} addTodo={addTodo} deleteTodo={deleteTodo} finishTodo={finishTodo} />
      <button onClick={increment}>{count}</button >
    </>
  )
}

export default App
