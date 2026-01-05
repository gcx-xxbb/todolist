import React, { useState, useContext, useEffect } from "react";
import type { TodoAction } from "../../App";
import TodoContext from "../../context/TodoContext";
import { NotificationContext } from "../../context/notification";

interface Todo { id: string, title: string, isFinished: boolean }
interface todoProps { todoList: Todo[], dispatch: React.Dispatch<TodoAction> }
interface TodoItemProps { todo: Todo, dispatch: React.Dispatch<TodoAction>, index: number, setNotification: (message: string) => void }

const TodoItem = React.memo(({ todo, dispatch, index, setNotification }: TodoItemProps) => {
	return (
		<tr key={todo.id}>
			<td>{index + 1}</td>
			<td>{todo.title}</td>
			<td>
				<input onChange={() => { setNotification('修改成功'), dispatch({ type: 'finish', payload: todo.id }) }} type="checkbox" checked={todo.isFinished} />
			</td>
			<td>
				<button onClick={() => { setNotification('删除成功'), dispatch({ type: 'delete', payload: todo.id }) }
				}>删除</button>
			</td>
		</tr>
	)
})

const TodoList = () => {

	const [show, setShow] = useState<boolean>(false)
	const [newTodo, setNewTodo] = useState<string>('')
	const context = useContext(TodoContext)
	const notificationContext = useContext(NotificationContext)

	if (!context) {
		throw new Error('TodoList 必须在 TodoContext.Provider 内使用！');
	}

	if (!notificationContext) {
		throw new Error('TodoList 必须在 NotificationContext.Provider 内使用！');
	}

	const { todos, dispatch } = context;
	const { setNotification } = notificationContext;

	const handleAdd = () => {
		const newData = {
			id: crypto.randomUUID(),
			title: newTodo,
			isFinished: false
		}
		dispatch({ type: 'add', payload: newData })
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
					{todos.map((todo, index) => (
						< TodoItem key={todo.id} todo={todo} dispatch={dispatch} index={index} setNotification={setNotification} />
					))}
				</tbody>
			</table>
			<button onClick={() => setShow(!show)}>添加待办</button>
			<button onClick={() => dispatch({ type: 'clear' })}>清空已完成</button>
			{show && (<div>
				<label>待办事项：</label>
				<input type="text" onChange={(e) => setNewTodo(e.target.value)} />
				<button onClick={handleAdd}>添加</button>
			</div>)}
		</div>
	);
}

export default TodoList;