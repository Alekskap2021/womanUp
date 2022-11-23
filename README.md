# О проекте

Приложение "Список задач". Cоздано при помощи cra по следующему тестовому заданию:

Написать todo-лист.
Функционал:

- создание, просмотр, редактирование (изменение полей или то, что задача выполнена) и удаление задачи
- возможность прикрепления файлов к записи
- поля в задаче: заголовок, описание, дата завершения, прикрепленные файлы
- если дата завершения истекла или задача выполнена, это должно быть визуально отмечено

- откомментировать код в JSDoc и выложить на gitlab.

Нужно обязательно:

- написать код самому, а не скопировать с stackoverflow;
- использовать React;
- использовать компоненты как функции, а не как классы;
- использовать хуки;
- ? использовать github для “выкладки”.

Желательно:

- использовать dayjs для работы с датами // Не увидел смысла затягивать библиотеку и читать ее доку ради одной строчки кода

* использовать firebase.google.com как Back-end;
* ? использовать firebase.google.com или now.sh как хостинг клиенской части;
* использовать less, если потребуется писать стили;
* постараться не использовать никаких библиотек, кроме необходимых для общения с Back-end.

Не требуется делать супер-красивый UI и функции не описанные в задании.

P.s Строки, помеченные как "?" Были мной не поняты. Пояснений я не получил, поэтому разрешил себе выполнить их так, как понял я.

### `npm start`

Запускает приложение в режиме разработки

### Проблемы проекта

### UX|UI

Есть несколько моментов по части UX|UI. Например, при добавлении тяжелого таска и отправки формы, после загрузки компонент списка задач какое-то время перерендеривается и новой задачи мы не видим и прочие моменты.

##### Как можно решить?

    - Добавить спиннеры, неактивные классы элементов и проч.

##### Почему я этого не сделал?

    - В ТЗ разрешено не заморачиваться над этим

### Проблема с запросом на изменение компонента

Когда мы изменяем какую-то задачу, на каждый условный чих(ввести 1 символ) мы отправляем запрос на сервер. Не совсем оптимизировано, можно сделать лучше. Но в рамках небольшого тестового это небольшие нагрузки

##### Как можно решить?

    1.Добавить какую-нибудь галочку, только при нажатии на которую данные будут отсылаться. Если фокус с таска уходит, а галочка не прожата - восстанавливаются старые значения
    2.Через debounce. Слышал что-то про задержку на нажатия клавиш в n ms. Подробностей не знаю, но уверен, что можно решить и так

##### Почему я этого не сделал?

    - Обнаружил проблему на финальном тесте. Сроки поджимали, поэтому решил предоставить рабочее решение и не рефакторить все заного.

### Рефакторинг

Я уверен, что некоторых местах код можно написать лаконичнее, красивее и читабельнее. Например в компоненте формы из ф-ии onSubmitHandler можно вынести логику создания таска в отдельную функцию.

##### Как можно решить?

- Мне бы помог хороший code rewiev и обратная связь

##### Почему не я этого не сделал?

- Пытался писать красиво, минималистично и понятно сразу. Насколько у меня это вышло - судить вам.