import { useState } from "react";
import { useTodoService } from "../../services/todoService";

import "./taskChanginModal.less";

/*
 * Компонент модлального окна для изменения задачи
 * @param {Object} changingTask - объект с изменяемым таском
 * @param {Function} close - Функция для закрытия модалки(меняет стейт, по которому происходит отрисовка, на null)
 * @param {Function} isNewTaskFailed - Функция, которая проверяет дедлайн.
 * @param {Array} todos - Массив со всеми тасками (стор)
 * @param {Function} setTodos - Функция для изменения стора с тасками
 * @returns {Object} объект с html-элементами
 */
const TaskCnangingModal = ({ changingTask, close, isNewTaskFailed, todos, setTodos }) => {
  const oldTask = changingTask[0];

  const [newTask, setNewTask] = useState({ ...oldTask });
  const { updateTask } = useTodoService();

  /*
   * Функция, которая вызывается при сабмите формы. Обновляет таск на сервере и меняет глобальный стор
   * @param {Object} e - объект события
   * @returns {Object} объект с html-элементами
   */
  const onSubmitHandler = (e) => {
    e.preventDefault();
    updateTask(oldTask.id, newTask)
      .then(
        setTodos(
          todos.map((task) => {
            if (task.id === oldTask.id) return newTask;
            return task;
          })
        )
      )
      .then(close());
  };

  return (
    <div className="taskChanging-modal">
      <div className="taskChanging-modal__wrapper">
        <h2 className="todo__form-title">Изменить задачу</h2>
        <button
          className="fa-solid fa-xmark failed-ico taskChanging-modal__close"
          onClick={() => close()}
        ></button>

        <form className="taskChanging-modal__form" onSubmit={(e) => onSubmitHandler(e)}>
          <div className="title">
            <label htmlFor="title">Заголовок</label>
            <input
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              value={newTask.title}
              className="todo__form-input"
              type="text"
              name="title"
              placeholder="Введите название"
              required
            />
          </div>

          <div className="description">
            <label htmlFor="description">Описание</label>
            <input
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              value={newTask.description}
              className="todo__form-input"
              type="text"
              name="description"
              placeholder="Опишите задачу"
              required
            />
          </div>

          <div className="date">
            <label htmlFor="date">Дедлайн</label>
            <input
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  date: e.target.value,
                  isFailed: isNewTaskFailed(e.target.value),
                })
              }
              value={newTask.date}
              className="todo__form-input"
              type="date"
              name="date"
              placeholder="Дедлайн"
              required
            />
          </div>

          <button className="todo__form-btn">Обновить</button>
        </form>
      </div>
    </div>
  );
};

export default TaskCnangingModal;
