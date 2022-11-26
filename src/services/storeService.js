import { storage } from "../firebase-config";
import { ref, deleteObject, uploadBytes, listAll, getDownloadURL } from "firebase/storage";

/*
 * Кастомный хук, который использует API Firebase и отдает методы по работе c удаленным хранилищем файлов
 * @returns {object} объект с методами по работе с хранилищем
 */
export const useStorService = () => {
  /*
   * Метод для удаления файлов. API для удаления все директории нет,
   * но Firebase сам удаляет пустые папки, так что это нам подходит
   * @param {string} directory - Строка с названием папки (Папки с файлами названы по заголовку задачи)
   * @param {string} fileName - Строка с именем файла
   * @returns {Promise} объект промиса
   */
  const deleteFiles = async (directory, fileName) => {
    const fileRefs = ref(storage, `${directory}/${fileName}`);
    return await deleteObject(fileRefs);
  };

  /*
   * Метод для загрузки файлов.
   * @param {string} directory - Строка с названием папки (Папки с файлами названы по заголовку задачи)
   * @param {Object} file - объект самого файла
   * @param {string} fileName - Строка с именем файла
   * @returns {Promise} объект промиса
   */
  const uploadFiles = async (directory, file, fileName) => {
    const filesRef = ref(storage, `${directory}/${fileName}`);
    return await uploadBytes(filesRef, file);
  };

  /*
   * Метод для получения URL адреса файлов.
   * @param {string} directory - Строка с названием папки (Папки с файлами названы по заголовку задачи)
   * @returns {Promise} объект промиса c массивом адресов
   */
  const getFiles = async (directory) => {
    const fileRefs = ref(storage, `${directory}/`);
    return await listAll(fileRefs).then((res) =>
      Promise.all(res.items.map((file) => getDownloadURL(file)))
    );
  };

  return { deleteFiles, uploadFiles, getFiles };
};
