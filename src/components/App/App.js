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
  const { getTasks } = useTodoService(); /* Вытаскиваем метод молучения всех тасков */

  //При первой загрузке получаем список задач с сервера и устанавливаем их в стейт
  useEffect(() => {
    setLoading(true);
    getTasks()
      .then((res) => setTodos(res))
      .then(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="App">
      {/* Прокидываем стейт со списком задач и метод для их установки в дочерние компоненты */}
      <todosContext.Provider value={{ todos, setTodos }}>
        {loading ? <Spinner /> : <TodoList />}
        <TodoForm />
      </todosContext.Provider>
    </div>
  );
};

export default App;
