import { useState, useContext } from "react"
import { AuthContext } from "../../context/AuthContext"

const Login = () => {
	const [name, setName] = useState('')
	const [password, setPassword] = useState('')

	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('必须在AuthContext.Provider内使用！')
	}

	const { user, login, logout } = context
	return (
		<div className="log-page">
			<div className="log-form">
				<div className="log-form-item">
					<label htmlFor="name">用户名</label>
					<input onChange={e => { setName(e.target.value) }} type="text" id="name" defaultValue={user?.name} />
				</div>
				<div className="log-form-item">
					<label htmlFor="password">密码</label>
					<input onChange={e => setPassword(e.target.value)} type="password" id="password" />
				</div>
			</div>
			<button className="log-button" onClick={() => login(name, password)}>登录</button>
			<button className="log-button" onClick={logout}> 登出 </button>
		</div>
	)
}

export default Login