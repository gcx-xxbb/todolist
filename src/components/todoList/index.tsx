import { useState } from "react";

interface Todo { id: string, title: string, isFinished: boolean }
interface todoProps { todoList: Todo[], addTodo: (todo: Todo) => void, deleteTodo: (id: string) => void, finishTodo: (id: string) => void }
const TodoList = ({ todoList, addTodo, deleteTodo, finishTodo }: todoProps) => {

	const [show, setShow] = useState<boolean>(false)
	const [newTodo, setNewTodo] = useState<string>('')

	const handleAdd = () => {
		const newData = {
			id: crypto.randomUUID(),
			title: newTodo,
			isFinished: false
		}	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
		addTodo(newData)
		setNewTodo('')
		setShow(false)
	}

	return (
		<div className="todo-list">
			<table>
				<thead>
					<tr>
						<th>序号</th>
						<th>任务名称</th>
						<th>完成状态</th>
					</tr>
				</thead>
				<tbody>
					{todoList.map((todo, index) => (
						<tr key={todo.id}>
							<td>{index + 1}</td>
							<td>{todo.title}</td>
							<td><input onChange={() => finishTodo(todo.id)} type="checkbox" checked={todo.isFinished} /></td>
							<td><button onClick={() => deleteTodo(todo.id)}>删除</button></td>
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