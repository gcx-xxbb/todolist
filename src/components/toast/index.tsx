import { useContext, useState, useEffect } from "react"
import { NotificationContext } from "../../context/notification"

const Toast = () => {
	const [show, setShow] = useState(false)
	const context = useContext(NotificationContext)
	if (!context) {
		throw new Error('必须在NotificationContext.Provider内使用！');
	}
	const { notification } = context

	useEffect(() => {
		if (notification) {
			setShow(true)
			setTimeout(() => {
				setShow(false)
			}, 3000)
		}
	}, [notification?.id])

	return (
		<>
			<div style={{ display: show ? 'block' : 'none' }}>{notification?.message}</div>
		</>
	)
}

export default Toast