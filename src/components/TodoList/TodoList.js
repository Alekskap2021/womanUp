import { useContext, useState } from "react";
import { useTodoService } from "../../services/todoService";
import { useStorService } from "../../services/storeService";

import { todosContext } from "../../context/todosContext";

import TaskCnangingModal from "../TaskChangingModal/TaskChangingModal";
import ChangingModalPortal from "../Portals/ChangingModalPortal";

import "./todoList.less";

/*
 * Функция, которая проверяет дедлайн.Вынесена отдельно и экспортирована, т.к понадобиться в компоненте формы, когда отправляем файл с дедлайном
 * @param {string} date - строка с датой
 * @returns {Boolean}  true, если срок выполнения истек, false - если время еще есть
 */
export const isTaskFaield = (date) => {
  if (new Date(date).getTime() + 24 * 60 * 60 * 1000 - 1 - new Date().getTime() < 0) {
    return true;
  } else {
    return false;
  }
};

/*
 * Компонент списков задач
 * @returns {Object} объект с html-элементами
 */
const TodoList = () => {
  /*Стейт для айди редактируемого таска*/
  const [taskChangingId, setTaskChangingId] = useState(null);

  const { todos, setTodos } = useContext(todosContext); /*Вытаскиваем список и метод из контекста*/
  const { deleteTask, updateTask } = useTodoService(); /*Вытаскиеваем методы по работе со списком*/
  const { deleteFiles } = useStorService(); /*Вытаскиеваем метод по работе с хранилищем*/

  /*
   * Функция для удаления таска из UI и БД
   * @param {string} id - строка с айди
   * @param {string} directory - строка с названием директории в Firebase
   * @param {Array} urls - массив с объекстами адресов к прикрепленным файлам
   */
  const onDeleteHandler = (id, directory, urls) => {
    //Отправляем запрос на удаление персонажа. И фильтруем стейт
    setTodos(todos.filter((task) => task.id !== id));
    deleteTask(id);

    //Проверяем, содержит ли таск файлы. Если да - удаляем их из хранилища Firebase
    if (urls) urls.forEach((url) => deleteFiles(directory, url.fileName));
  };

  /*
   * Функция для изменения статуса задачи.
   * @param {string} id - айди элемента, на котором происходят изменения
   */
  const isDoneHandler = (id) => {
    setTodos(
      todos.map((task) => {
        if (task.id === id) {
          task.isDone = !task.isDone;
          updateTask(id, task);
        }
        return task;
      })
    );
  };

  /*
   * Функция, генерирует список приклепленных файлов
   * @param {Array} urls - массив с объекстами адресов к прикрепленным файлам
   * @returns {Object} возвращает html-список с ссылками на файлы, если они были прикреплены
   */
  const createFileLinks = (urls) => {
    if (urls) {
      const filesLinks = urls.map((url) => (
        <li className="todo__file-link" key={url.url}>
          <i className="fa-solid fa-file"></i>
          <a href={url.url} download={url.fileName} target="_blank" rel="noreferrer">
            {url.fileName}
          </a>
        </li>
      ));

      return <ul className="todo__list-item__files">{filesLinks}</ul>;
    } else return null;
  };

  /*
   * Функция, которая регдерит список задач
   * @param {Array} arr - массив с объектами списков задач
   * @returns {Object} объект с html-элементами
   */
  const renderTodosList = (arr) => {
    const todoItems = arr.map(({ id, title, description, date, isDone, isFailed, urls }) => {
      //По флагам формируем классы "завершен" и "провален"
      const doneClass = isDone ? " done" : "";
      const failedClass = isFailed ? " failed" : "";

      return (
        <li className={`todo__list-item${doneClass}${failedClass}`} key={id}>
          <button className="done-btn" title="Сделано" onClick={() => isDoneHandler(id)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="M470.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L192 338.7 425.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
            </svg>
          </button>

          <i className="failed-ico fa-solid fa-xmark"></i>

          <div className="todo__list-item-text">
            <h2 className="todo__list-item__title">{title}</h2>
            <p className="todo__list-item__description">{description}</p>
            {createFileLinks(urls)}
            <span className="todo__list-item__date">Дедлайн: {date}</span>
          </div>

          <div className="todo__list-item-btns">
            <button
              className="fa-regular fa-pen-to-square"
              onClick={() => setTaskChangingId(id)}
            ></button>
            <button
              className="fa-solid fa-trash"
              title="Удалить"
              //Передаем в хендлер удаления айди, название директории(в нашем случае в БД каждая папка
              // с файлами называется по имени таска) и массив с адресами
              onClick={() => onDeleteHandler(id, title, urls)}
            ></button>
          </div>
        </li>
      );
    });

    //Условный рендеринг в зависимости от того, пуст список задач или нет
    if (arr.length > 0) {
      return <ul className="todo__list">{todoItems}</ul>;
    } else {
      return <h2>Список задач пуст</h2>;
    }
  };

  // Помещаем в переменную отрендеренные элементы при условии, что в глобальный стейт дошли данные.
  const todosList = todos ? renderTodosList(todos) : null;
  const changingTask = todos ? todos.filter((task) => task.id === taskChangingId) : null;

  return (
    <>
      {/* Показываем/скрываем модалку в зависимости от стейта setTaskChangingId*/}
      {todosList}
      {taskChangingId ? (
        <ChangingModalPortal>
          <TaskCnangingModal
            changingTask={changingTask}
            close={setTaskChangingId}
            todos={todos}
            setTodos={setTodos}
            isNewTaskFailed={isTaskFaield}
          />
        </ChangingModalPortal>
      ) : null}
    </>
  );
};

export default TodoList;
