import { useState, useEffect } from "react";
import { useTodoService } from "../../services/todoService";

import { todosContext } from "../../context/todosContext";

import TodoList from "../TodoList/TodoList";
import TodoForm from "../TodoForm/TodoForm";

import Spinner from "../spinner/Spinner";

import "./App.less";

const App = () => {
  const [loading, setLoading] = useState(false);
  const [todos, setTodos] = useState(null);
  const { getTasks } = useTodoService();

  useEffect(() => {
    setLoading(true);
    getTasks()
      .then((res) => setTodos(res))
      .then(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="App">
      <todosContext.Provider value={{ todos, setTodos }}>
        {loading ? <Spinner /> : <TodoList />}
        <TodoForm />
      </todosContext.Provider>
    </div>
  );
};

export default App;
