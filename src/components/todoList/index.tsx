import React, { useState, useContext, useEffect, useCallback } from "react";
import type { TodoAction } from "../../App";
import TodoContext from "../../context/TodoContext";
import { NotificationContext } from "../../context/notification";

interface Todo { id: string, title: string, isFinished: boolean }
interface TodoItemProps { todo: Todo, dispatch: React.Dispatch<TodoAction>, index: number, setNotification: (message: string) => void }

const TodoItem = React.memo(({ todo, dispatch, index, setNotification }: TodoItemProps) => {

	const handleDelete = useCallback(() => {
		setNotification('删除成功')
		dispatch({ type: 'delete', payload: todo.id })
	}, [todo.id])

	return (
		<tr key={todo.id}>
			<td>{index + 1}</td>
			<td>{todo.title}</td>
			<td>
				<input onChange={() => { setNotification('修改成功'), dispatch({ type: 'finish', payload: todo.id }) }} type="checkbox" checked={todo.isFinished} />
			</td>
			<td>
				<button onClick={handleDelete}>删除</button>
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

	useEffect(() => {
		// 空的 useEffect，保持组件结构
	}, [])

	useEffect(() => {
		function finalPrices(prices: number[]): number[] {
			let res: number[] = new Array(prices.length).fill(0)
			let temp: number[] = []
			let stack: number[] = []
			for (let i = 0; i < prices.length; i++) {
				const current = prices[i]
				while (stack.length && current <= prices[stack[stack.length - 1]]) {
					const topIndex = stack.pop()
					temp[topIndex || 0] = current
				}
				stack.push(i)
			}
			prices.forEach((item, index) => {
				let tempVal = item - temp[index]
				res[index] = tempVal >= 0 ? tempVal : item
			})
			return res
		}

		finalPrices([10, 1, 1, 6]
		)
	}, [])


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