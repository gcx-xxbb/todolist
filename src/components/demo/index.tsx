import { useEffect, useState, useReducer } from "react"
import type { ActionDispatch, Reducer } from "react"

interface Data {
	result: number
}

interface Action {
	type: 'add' | 'minus'
	num: number
}

function reducer(state: Data, action: Action) {
	switch (action.type) {
		case 'add':
			return {
				result: state.result + action.num
			}
		case 'minus':
			return {
				result: state.result - action.num
			}
		default:
			return state;
	}
}
const Demo = () => {
	const [res, dispatch] = useReducer(reducer, { result: 0 });

	return (
		<div>
			{res.result}
			<button onClick={() => {
				dispatch({ type: 'add', num: 1 });
				console.log(res.result);
			}}>测试</button>
			<button onClick={() => {
				dispatch({ type: 'minus', num: 1 });
			}}>减法</button>
		</div>
	)
}

export default Demo