import './index.css'
import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { Link, useNavigate, useLocation } from 'react-router-dom'
const Header = () => {
	const context = useContext(AuthContext)
	const navigate = useNavigate();
	const location = useLocation();
	if (!context) {
		throw new Error('必须在AuthContext.Provider内使用！')
	}
	const { user, logout } = context

	// 在demo页面不显示Header
	if (location.pathname === '/demo') {
		return null;
	}

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