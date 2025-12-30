import './index.css'
import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { Link, useNavigate } from 'react-router'
const Header = () => {
	const context = useContext(AuthContext)
	const navigate = useNavigate();
	if (!context) {
		throw new Error('必须在AuthContext.Provider内使用！')
	}
	const { user, logout } = context

	return (
		<div className="header">
			<div className="logo">TodoList</div>
			{user?.name ? <div className="user" onClick={() => {
				logout()
				setTimeout(() => {
					navigate('/login')
				}, 500)
			}}>{user.name}</div> : <div className="login">
				<Link to="/login">登录</Link>
			</div>}
		</div>
	)
}

export default Header