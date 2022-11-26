import { useState, useContext } from "react";
import { useTodoService } from "../../services/todoService";
import { useStorService } from "../../services/storeService";

import { todosContext } from "../../context/todosContext";
import { isTaskFaield } from "../TodoList/TodoList";

import "./todoForm.less";

/*
 * Компонент с формой для добавления таска
 * @returns {Object}  объект с html-элементами
 */
const TodoForm = () => {
  /* Стейты состояния формы, чтобы сделать ее управляемой*/
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState(false);
  const [files, setFiles] = useState(null);
  /*Стейт состояния загрузки*/
  const [loading, setLoading] = useState(false);

  /*Достаем контекст методы для работы с хранилищем и БД*/
  const { addTask } = useTodoService();
  const { uploadFiles, getFiles } = useStorService();
  const { todos, setTodos } = useContext(todosContext);

  /*
   * Функция для генерации нового таска по условию
   * @returns {Promise} объект промиса с новым таском
   */
  const generateNewTask = async () => {
    /*Если были выбраны какие-то файлы */
    if (files) {
      /*Загружаем файлы на сервер. Изспользуется await Promise.all, чтобы все файлы загружались одновременно,
      и дальше я мог работать с результатом их загрузки */
      await Promise.all(files.map((file) => uploadFiles(title, file, file.name)));

      /*С помощью метода getFiles возвращаем таск с учетом URL адресов к файлам */
      return await getFiles(title).then((urlsArr) => ({
        title,
        /*формируем массив с объектами, свойства которого name - имя загруженного файла, url - адрес, по которому он находится*/
        urls: urlsArr.map((url, i) => ({ url, fileName: files[i].name })),
        description,
        isDone: false,
        /*Устанавливаем true|false, в зависимости от выбранной даты*/
        isFailed: isTaskFaield(deadline),
        date: deadline,
      }));
    } else {
      /*Если так отправляется без файлов - делаем все то же самое, только в поле urls ставим null*/
      return {
        title,
        urls: null,
        description,
        isDone: status,
        isFailed: isTaskFaield(deadline),
        date: deadline,
      };
    }
  };

  /*
   * Хенндлер для сабмита. Вызывается при отправке формы
   * @param {Object} e - объект события
   */
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    /*Тут нам нужно контролировать стейт загрузки, т.к если юзер выберет много файлов,
    отправление таска займет время. Поэтому по состоянию загрузки будем блокировать кнопку,
     чтобы визуально дать понять, что идет загрузка и избежать спама запросов по кнопке */
    setLoading(true);

    const newTask = await generateNewTask();

    /*Отправляем новый таск в БД, после этого добавляем в стейт(Используется id из firebase)*/
    addTask(newTask).then((res) => setTodos([...todos, { ...newTask, id: res.id }]));

    /* Обнуляем инпуты формы*/
    setLoading(false);
    setTitle("");
    setDescription("");
    setDeadline("");
    setFiles(null);
    setStatus(false);
  };

  return (
    <div className="todo__form-wrapper">
      <h2 className="todo__form-title">Создать задачу</h2>

      <form className="todo__form" onSubmit={(e) => onSubmitHandler(e)}>
        <div className="title">
          <label htmlFor="title">
            Заголовок <sup>*</sup>
          </label>
          <input
            onChange={(e) => setTitle(e.target.value)}
            value={title}
            className="todo__form-input"
            type="text"
            name="title"
            placeholder="Введите название"
            required
          />
        </div>

        <div className="description">
          <label htmlFor="description">
            Описание <sup>*</sup>
          </label>
          <input
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            className="todo__form-input"
            type="text"
            name="description"
            placeholder="Опишите задачу"
            required
          />
        </div>

        <div className="date">
          <label htmlFor="date">
            Дедлайн <sup>*</sup>
          </label>
          <input
            onChange={(e) => setDeadline(e.target.value)}
            value={deadline}
            className="todo__form-input"
            type="date"
            name="date"
            placeholder="Дедлайн"
            required
          />
        </div>

        <div className="status">
          <label htmlFor="status">Статус</label>
          <select name="status" defaultValue={status} onChange={(e) => setStatus(e.target.value)}>
            <option value={false}>Не завершена</option>
            <option value={true}>Завершена</option>
          </select>
        </div>

        <div className="file">
          <label className="file-label">
            <p className="file-btn" role="button">
              <svg
                className="file-btn-icon"
                viewBox="0 0 512 512"
                xmlns="http://www.w3.org/2000/svg"
                fill="white"
              >
                <g data-name="1" id="_1">
                  <path d="M324.3,387.69H186a15,15,0,0,1-15-15V235.8H114.81a15,15,0,0,1-11.14-25.05L244,55.1a15,15,0,0,1,22.29,0L406.6,210.75a15,15,0,0,1-11.14,25.05H339.3V372.69A15,15,0,0,1,324.3,387.69ZM201,357.69H309.3V220.8a15,15,0,0,1,15-15h37.44L255.13,87.55,148.53,205.8H186a15,15,0,0,1,15,15Z" />
                  <path d="M390.84,452.15H119.43a65.37,65.37,0,0,1-65.3-65.3V348.68a15,15,0,0,1,30,0v38.17a35.34,35.34,0,0,0,35.3,35.3H390.84a35.33,35.33,0,0,0,35.29-35.3V348.68a15,15,0,1,1,30,0v38.17A65.37,65.37,0,0,1,390.84,452.15Z" />
                </g>
              </svg>

              <span className="file-btn-text">
                {files ? `Прикреплено файлов: ${files.length}` : "Прикрепите файлы"}
              </span>
            </p>
            <input
              /*Отправляем в стейт файлов массив с объектами каждого файла */
              onChange={(e) => setFiles(Object.values(e.target.files))}
              multiple
              type="file"
              name="file"
              className="file-input"
            />
          </label>
        </div>

        {/* Отключаем кнопку, если идет загрузка */}
        <button className="todo__form-btn" disabled={loading}>
          Создать
        </button>
      </form>
    </div>
  );
};

export default TodoForm;
