import { useState } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { NotificationContext } from '../../context/notification'
import Toast from '../toast'
import Header from '../Header'
import './index.css'
import { useNavigate } from 'react-router-dom'

const AppProvider = ({ children }: any) => {

	type User = {
		name: string
		password: string
	}

	const [user, setUser] = useState<User | null>(() => JSON.parse(localStorage.getItem('user') || 'null'))
	const [notification, setNotificationState] = useState<{ message: string; id: number } | null>(null)

	const navigate = useNavigate();

	const setNotification = (message: string) => {
		setNotificationState({ message, id: Date.now() })
	}
	const login = (name: string, password: string) => {
		setUser({ name, password })
		localStorage.setItem('user', JSON.stringify({ name, password }))
		let tempPermissions = ['all', 'todolist']
		localStorage.setItem('permissions', JSON.stringify(tempPermissions))
		setTimeout(() => {
			navigate('/')
		}, 500)
	}

	const logout = () => {
		setUser(null)
		localStorage.removeItem('user')
	}
	return (
		<AuthContext.Provider value={{ user, login, logout }}>
			<NotificationContext.Provider value={{ notification, setNotification }}>
				<Header />
				<Toast />
				<div className='container'>
					{children}
				</div>
			</NotificationContext.Provider>
		</AuthContext.Provider>
	)
}

export default AppProvider