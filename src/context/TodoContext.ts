import { createContext } from 'react';
import type { TodoAction, Todo } from '../App';

interface TodoContextType {
  todos: Todo[];
  dispatch: React.Dispatch<TodoAction>;
}

const TodoContext = createContext<TodoContextType | null>(null);

export default TodoContext;
