import { useEffect, useState } from "react";

interface Todo { id: number, title: string, isFinished: boolean }
const TodoList = () => {

	const [todos, setTodos] = useState<Todo[]>([]);
	const [show, setShow] = useState<boolean>(false)
	const [newTodo, setNewTodo] = useState<string>('' as any)

	useEffect(() => {
		setTimeout(() => {
			const todoList = [
				{ id: 1, title: '用 Vite 创建 react-ts 项目', isFinished: true },
				{ id: 2, title: '动态修改App内容', isFinished: true },
				{ id: 3, title: '写一个TodoList组件', isFinished: false },
				{ id: 4, title: '加“添加待办”功能', isFinished: false },
				{ id: 5, title: '加“删除”按钮', isFinished: false },
				{ id: 6, title: '部署到 Vercel（免费+3分钟）', isFinished: false },
				{ id: 7, title: '复盘：截图部署链接，发朋友圈/语雀：“Week 1 done!”', isFinished: false },
			]
			setTodos(todoList)
		}, 1000)
	}, [])

	const finishTodo = (id: number) => {
		setTodos(todos.map(todo => todo.id === id ? { ...todo, isFinished: !todo.isFinished } : todo))
	}

	const handleAdd = () => {
		const newData = {
			id: todos.length + 1,
			title: newTodo,
			isFinished: false
		}
		setTodos([...todos, newData])
		setNewTodo('')
		setShow(false)
	}

	const handleDelete = (id: number) => {
		setTodos(todos.filter(todo => todo.id !== id))
	}

	return (
		<div className="todo-list">
			<table>
				<thead>
					<tr>
						<th>ID</th>
						<th>任务名称</th>
						<th>完成状态</th>
					</tr>
				</thead>
				<tbody>
					{todos.map((todo) => (
						<tr key={todo.id}>
							<td>{todo.id}</td>
							<td>{todo.title}</td>
							<td><input onChange={() => finishTodo(todo.id)} type="checkbox" checked={todo.isFinished} /></td>
							<td><button onClick={() => handleDelete(todo.id)}>删除</button></td>
						</tr>
					))}
				</tbody>
			</table>
			<button onClick={() => setShow(!show)}>添加待办</button>
			{show && (<div>
				<label>待办事项：</label>
				<input type="text" onChange={(e) => setNewTodo(e.target.value)} />
				<button onClick={handleAdd}>添加</button>
			</div>)}
		</div>
	);
}

export default TodoList;