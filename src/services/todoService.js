import { db } from "../firebase-config";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

// Кастомный хук, который использует API Firebase и отдает методы по работе со списком задач
export const useTodoService = () => {
  //Создаем ссылку на коллекцию
  const tasksCollectionRef = collection(db, "tasks");

  //Метод для получения всех тасков с БД
  const getTasks = async () => {
    const responce = await getDocs(tasksCollectionRef);
    return responce.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  };

  //Метод для добавления таска в БД
  const addTask = async (newTask) => await addDoc(tasksCollectionRef, newTask);

  //Метод для удаления таска из БД
  const deleteTask = async (id) => await deleteDoc(doc(db, "tasks", id));

  //Метод для обновления данных в таске в БД
  const updateTask = async (id, newTask) => await updateDoc(doc(db, "tasks", id), newTask);

  //Возвращаем методы для использвония в любом месте приложения
  return { getTasks, addTask, deleteTask, updateTask };
};
