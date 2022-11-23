import { db } from "../firebase-config";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

/*
 * Кастомный хук, который использует API Firebase и отдает методы по работе со списком задач
 * @returns {object} объект с методами по работе с БД
 */
export const useTodoService = () => {
  const tasksCollectionRef = collection(db, "tasks");

  /*
   * Метод для получения всех тасков с БД
   * @returns {Promise} объект промиса
   */
  const getTasks = async () => {
    const responce = await getDocs(tasksCollectionRef);
    return responce.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  };

  /*
   * Метод для добавления таска в БД
   * @param {object} newTask - объект с новым таском
   * @returns {Promise} объект промиса
   */
  const addTask = async (newTask) => await addDoc(tasksCollectionRef, newTask);

  /*
   * Метод для удаления таска из БД
   * @param {string} id - строка с айди
   * @returns {Promise} объект промиса
   */
  const deleteTask = async (id) => await deleteDoc(doc(db, "tasks", id));

  /*
   * Метод для обновления данных в таске в БД
   * @param {string} id - строка с айди
   * @param {object} newTask - объект с новым таском
   * @returns {Promise} объект промиса
   */
  const updateTask = async (id, newTask) => await updateDoc(doc(db, "tasks", id), newTask);

  return { getTasks, addTask, deleteTask, updateTask };
};
