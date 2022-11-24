import { useContext, useState } from "react";
import { useTodoService } from "../../services/todoService";

import { todosContext } from "../../context/todosContext";

import { storage } from "../../firebase-config";
import { ref, deleteObject } from "firebase/storage";

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
  const [loading, setLoading] = useState(false); /*Создаем стейт загрузки*/
  const { todos, setTodos } = useContext(todosContext); /*Вытаскиваем список и метод из контекста*/
  const { deleteTask, updateTask } = useTodoService(); /*Вытаскиеваем методы по работе со списком*/

  /*
   * Функция для удаления таска из UI и БД
   * @param {string} id - строка с айди
   * @param {string} directory - строка с названием директории в Firebase
   * @param {Array} urls - массив с объекстами адресов к прикрепленным файлам
   */
  const onDeleteHandler = (id, directory, urls) => {
    setLoading(true);
    console.log(urls);

    //Массив промисов здесь для того, чтобы контроллировать состояние загрузки.
    //Если в таске много файлов, то его удаление займет некоторое время, поэтому
    //нам нужно отключать кнопку "удалить", пока идет запрос.
    const promises = [];

    //Отправляем запрос на удаление персонажа. После ответа фильтруем и устанавливаем стейт
    promises.push(deleteTask(id).then(() => setTodos(todos.filter((task) => task.id !== id))));

    //Проверяем, содержит ли таск файлы. Если да - удаляем их из хранилища Firebase
    if (urls) {
      urls.forEach((url) => {
        const fileRefs = ref(storage, `${directory}/${url.fileName}`);
        promises.push(deleteObject(fileRefs));
      });
    }

    //Когда все промисы завершатся, возвращаем загрузку в false
    Promise.all(promises).then(() => setLoading(false));
  };

  /*
   * Функция для отслеживания внесенных изменений.
   * @param {string} id - айди элемента, на котором происходят изменения
   * @param {string} prop - имя свойства, которое изменяется
   * @param {string} value - новое значечние
   */
  const onChangeHandler = (id, prop, value) => {
    const newTask = todos.map((task) => {
      //Находим в глобальном стейте тот таск, который меняет юзер
      if (task.id === id) {
        //Меняем свойство, на котором происходит событие на новое значение
        task[prop] = value;

        //Если меняется поле с датой, проверяем, есть ли время на выполнение таска или он уже "просрочен"
        if (prop === "date") {
          task.isFailed = isTaskFaield(value);
        }

        //Отправляем изменения на сервер
        updateTask(id, task);
      }
      return task;
    });

    //Устанавливаем в глоб. стейт обновленный таск
    setTodos(newTask);
  };

  /*
   * Функция, которая возвращает html-список с ссылками на файлы, если они были прикреплены
   * @param {Array} urls - массив с объекстами адресов к прикрепленным файлам
   * @returns {Object} объект с html-элементами
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

      return <ul className="todo__list-item-files">{filesLinks}</ul>;
    } else return null;
  };

  /*
   * Функция, которая регдерит список задач
   * @param {Array} arr - массив с объекстами списков задач
   * @returns {Object} объект с html-элементами
   */
  const renderTodosList = (arr) => {
    const todoItems = arr.map(({ id, title, description, date, isDone, isFailed, urls }) => {
      //По флагам формируем классы "завершен" и "провален"
      const doneClass = isDone ? " done" : "";
      const failedClass = isFailed ? " failed" : "";

      return (
        <li className={`todo__list-item${doneClass}${failedClass}`} key={id}>
          <div className="todo__list-item-text">
            <input
              className="todo__list-item-title"
              value={title}
              //Передаем в хендлер айди, свойство, которое нужно поменять и новое значение
              onChange={(e) => onChangeHandler(id, "title", e.target.value)}
            />
            <textarea
              className="todo__list-item-description"
              value={description}
              onChange={(e) => onChangeHandler(id, "description", e.target.value)}
            />
            {/* Отрисовываем список файлов при наличии */}
            {createFileLinks(urls)}
            Дедлайн:
            <input
              className="todo__list-item-date"
              value={date}
              type="date"
              onChange={(e) => onChangeHandler(id, "date", e.target.value)}
            />
          </div>

          <div className="todo__list-item-btns">
            <button
              className="fa-regular fa-circle-check"
              title="Сделано"
              onClick={() => onChangeHandler(id, "isDone", !isDone)}
            ></button>
            <button
              className="fa-solid fa-trash"
              title="Удалить"
              disabled={loading}
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

  return <>{todosList}</>;
};

export default TodoList;
