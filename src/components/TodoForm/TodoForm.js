import { useState, useContext, useRef } from "react";
import { useTodoService } from "../../services/todoService";

import { todosContext } from "../../context/todosContext";
import { isTaskFaield } from "../TodoList/TodoList";

import { storage } from "../../firebase-config";
import { ref, uploadBytes, listAll, getDownloadURL } from "firebase/storage";

import "./todoForm.less";

const TodoForm = () => {
  //Стейты состояния формы, чтобы сделать ее управляемой
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [files, setFiles] = useState(null);
  //
  const [loading, setLoading] = useState(false); /*Стейт состояния загрузки*/

  //Достаем метод отправки таска в БД и контекст
  const { addTask } = useTodoService();
  const { todos, setTodos } = useContext(todosContext);

  //Создаем реф. Он нужен, чтобы обнулить данные с input file при сабмите
  //т.к у него нет аттрибута value
  const inputFilesRef = useRef();

  //Функция для загрузки файлов с инпута в хранилище Firebase
  const uploadFiles = (directory, file) => {
    const filesRef = ref(storage, `${directory}/${file.name}`);

    return uploadBytes(filesRef, file);
  };

  //Хенндлер для сабмита. Вызывается при отправке формы
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    //Тут нам нужно контролировать стейт загрузки, т.к если юзер выберет много файлов,
    //отправление таска займет время. Поэтому по состоянию загрузки будем блокировать кнопку,
    // чтобы визуально дать понять, что идет загрузка и избежать спама запросов по кнопке
    setLoading(true);

    //Если были выбраны какие-то файлы
    if (files) {
      //Формируем путь в хранилище. Названию таска соответсвует одноименная папка с прикрепленными файлами внутри
      //Это нужно для того, чтобы получать файлы каждого таска при их рендере
      const fileRefs = ref(storage, `${title}/`);

      //Загружаем файлы на сервер. Изспользуется await Promise.all, чтобы все файлы загружались одновременно
      //и дальше я мог работать с результатом их загрузки
      await Promise.all(files.map((file) => uploadFiles(title, file)));

      //С помощью API Firebase получаем файлы из хранилища по ссылке, которую создали выше
      listAll(fileRefs)
        //   С помощью API Firebase отдаем дальше в чейнинг массив с URL адресами к нашим файлам
        .then((res) => Promise.all(res.items.map((file) => getDownloadURL(file))))
        .then((urlsArr) => {
          //Формируем новый таск
          const newTask = {
            title,
            //формируем массив с объектами, свойства которого name - имя загруженного файла, url - адрес, по которому он находится
            urls: urlsArr.map((url, i) => ({ url, fileName: files[i].name })),
            description,
            isDone: false,
            isFailed:
              isTaskFaield(deadline) /*Устанавливаем true|false, в зависимости от выбранной даты*/,
            date: deadline,
          };
          //Отправляем новый таск в БД, после этого добавляем в стейт(Используется id из firebase)
          addTask(newTask).then((res) => setTodos([...todos, { ...newTask, id: res.id }]));
        });
    } else {
      /*Если так отправляется без файлов*/
      //Делаем все то же самое, только в поле urls ставим null
      const newTask = {
        title,
        urls: null,
        description,
        isDone: false,
        isFailed: isTaskFaield(deadline),
        date: deadline,
      };
      addTask(newTask).then((res) => setTodos([...todos, { ...newTask, id: res.id }]));
    }

    //Обнуляем инпуты формы
    setLoading(false);
    setTitle("");
    setDescription("");
    setDeadline("");
    setFiles(null);
    if (inputFilesRef.current) {
      inputFilesRef.current.value = "";
    }
    //
  };

  return (
    <div className="todo__form-wrapper">
      <h2 className="todo__form-title">Добавьте задачу</h2>

      <form className="todo__form" onSubmit={(e) => onSubmitHandler(e)}>
        <div className="title">
          <label htmlFor="title">Название задачи</label>
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
          <label htmlFor="description">Описание задачи</label>
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
          <label htmlFor="date">Укажите дедлайн</label>
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

        <div className="file">
          <label htmlFor="file">Прикрепите файл</label>
          <input
            //Отправляем в стейт файлов массив с объектами каждого файла
            onChange={(e) => setFiles(Object.values(e.target.files))}
            className="todo__form-input"
            ref={inputFilesRef}
            multiple
            type="file"
            name="file"
          />
        </div>

        {/* Отключаем кнопку, если идет загрузка */}
        <button className="todo__form-btn" disabled={loading}>
          Добавить
        </button>
      </form>
    </div>
  );
};

export default TodoForm;
