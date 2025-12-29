import { useState, useContext } from "react";
import ThemeContext from "../../context/ThemeContext";

function GrandParent() {
	const [theme, setTheme] = useState('dark');
	return (
		<ThemeContext.Provider value={{ theme, setTheme }}>
			<Parent />
		</ThemeContext.Provider>
	)
}

function Parent() {
	return (
		<div>
			<Child />
		</div>
	)
}

function Child() {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error('必须在ThemeContext.Provider内使用！');
	}
	const { theme, setTheme } = context;
	return (
		<div>
			<button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Change Theme</button>
			<div style={{ backgroundColor: theme === 'dark' ? 'black' : 'pink', width: '400px', height: '400px' }}></div>
		</div>
	)
}

export default GrandParent;