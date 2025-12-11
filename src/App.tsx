import { useEffect, useState } from 'react'
import './App.css'
import TodoList from './components/todoList'

function App() {
  const [date, setDate] = useState<Date>(new Date())

  useEffect(() => {
    setInterval(() => {
      setDate(new Date())
    }, 1000)
  }, [])

  return (
    <>
      <h3>Hello,Typescript</h3>
      <p>{date.toLocaleString()}</p>
      <TodoList />
    </>
  )
}

export default App
