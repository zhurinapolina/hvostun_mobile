# Набор для переноса интерфейса в рабочий код

Здесь всё, чтобы перенести мобильный интерфейс 1:1. Правила переноса — в [`../AGENTS.md`](../AGENTS.md).

## Что где

| Что | Где | Зачем |
|---|---|---|
| Эталоны экранов | `handoff/screens/*.html` | Каждый экран и каждое его состояние — отдельная страница: точная разметка, классы, тексты и стили, как в прототипе. Откройте в браузере — так должно выглядеть в продукте |
| Список эталонов | `handoff/screens/index.json` | id, название, раздел, файл и маршрут в прототипе — для автоматической обработки |
| Логика | `prototype/src/app.js` | Эталонная реализация поведения на чистом JS: переходы, состояния, проверки полей, анкета, чат |
| Адаптив | `prototype/src/app.css` | Общие правила для всех экранов: размеры телефонов, клавиатура, безопасные зоны, прокрутка |
| Тексты анкеты | `prototype/src/cbarq-questions.json` | Разделы, описания, шкалы, 42 вопроса, свободные ответы |
| Данные и сервер | `docs/handoff.md` | Статусы пользователя, поля и проверки, тексты ошибок, модель данных, запросы, аналитика |
| Токены и компоненты | `design-system/hvostun-design-system.md` | Цвета, шрифты, отступы, тени; раздел 12 — CSS токенов |
| Прототип целиком | `prototype/index.html` | Пройти весь путь руками и сравнить поведение |

## Как устроен эталон

Внутри каждого файла три блока стилей и разметка экрана:

1. «база страницы» — сброс отступов;
2. «общие правила адаптива» — копия `prototype/src/app.css`, одинаковая во всех эталонах (подключить в продукте один раз глобально; `#panel`, `#frame`, `#kbd` — оболочка прототипа для компьютера, в продукте не нужны);
3. «стили этого экрана» — только правила доски этого экрана, без слияния с другими экранами;
4. разметка экрана внутри `<div id="app">` — корневой блок `.ph`.

Ширина эталона 390 × 844, безопасные зоны iPhone заданы переменными `--sat: 47px` и `--sab: 34px` на `#app`. На телефоне эталон занимает весь экран.

Прокрутка внутри экранов настоящая: длинные формы и тексты можно прокрутить. Ползунок `.sb` в эталоне застыл в начальном положении; в продукте он двигается при прокрутке (функция `sbar` в `app.js`).

## Карта эталонов

### Вход

| Эталон | Экран и состояние | Маршрут в прототипе |
|---|---|---|
| [`s1-welcome.html`](screens/s1-welcome.html) | S1 · Приветствие | `s1` |
| [`s2-login.html`](screens/s2-login.html) | S2 · Вход | `s2` |
| [`s2-login-error.html`](screens/s2-login-error.html) | S2 · Ошибка входа (E2) | `s2` |
| [`s2-login-loading.html`](screens/s2-login-loading.html) | S2 · Вход: проверка | `s2` |

### Ошибки

| Эталон | Экран и состояние | Маршрут в прототипе |
|---|---|---|
| [`e6-unavailable.html`](screens/e6-unavailable.html) | E6 · Сервис временно недоступен | `e6` |

### Главная

| Эталон | Экран и состояние | Маршрут в прототипе |
|---|---|---|
| [`home-a.html`](screens/home-a.html) | S3 · Главная A: первый вход | `s3` |
| [`home-a2.html`](screens/home-a2.html) | S3 · Главная A2: профиль заполнен частично | `s3` |
| [`home-b.html`](screens/home-b.html) | S3 · Главная B: профиль готов | `s3` |
| [`home-c.html`](screens/home-c.html) | S3 · Главная C: анкета в процессе | `s3` |
| [`home-d.html`](screens/home-d.html) | S3 · Главная D: анкета пройдена | `s3` |

### Профиль

| Эталон | Экран и состояние | Маршрут в прототипе |
|---|---|---|
| [`s4-empty.html`](screens/s4-empty.html) | S4 · Профиль: пустая форма | `s4` |
| [`s4-errors.html`](screens/s4-errors.html) | S4 · Профиль: все поля не заполнены | `s4` |
| [`s4-date-future.html`](screens/s4-date-future.html) | S4 · Профиль: дата в будущем | `s4` |
| [`s4-calendar.html`](screens/s4-calendar.html) | S4 · Профиль: выбор даты | `s4` |
| [`s4-filled.html`](screens/s4-filled.html) | S4 · Профиль: заполнено | `s4` |
| [`s4-saving.html`](screens/s4-saving.html) | S4 · Профиль: сохранение | `s4` |
| [`s4b-first.html`](screens/s4b-first.html) | S4b · Вкладка «Профиль», первый заход | `s4b` |
| [`s4b-repeat.html`](screens/s4b-repeat.html) | S4b · Вкладка «Профиль», повторный заход | `s4b` |

### Анкета

| Эталон | Экран и состояние | Маршрут в прототипе |
|---|---|---|
| [`s5-survey-start.html`](screens/s5-survey-start.html) | S5 · Анкета: вход | `s5` |
| [`s7-intro-form.html`](screens/s7-intro-form.html) | S7 · Раздел 1 «Введение»: форма (собака из приюта) | `aq:vv` |
| [`s7-intro-form-not-shelter.html`](screens/s7-intro-form-not-shelter.html) | S7 · «Введение»: собака не из приюта — без вопроса о сроке в приюте | `aq:vv` |
| [`s7-intro-form-errors.html`](screens/s7-intro-form-errors.html) | S7 · «Введение»: не заполнены обязательные поля | `aq:vv` |
| [`s7-intro-form-filled.html`](screens/s7-intro-form-filled.html) | S7 · «Введение»: заполнено | `aq:vv` |
| [`s7-break-1.html`](screens/s7-break-1.html) | S7 · Перебивка после раздела 1 | `aq:pb:1` |
| [`s7-break-2.html`](screens/s7-break-2.html) | S7 · Перебивка после раздела 2 | `aq:pb:2` |
| [`s7-break-3.html`](screens/s7-break-3.html) | S7 · Перебивка после раздела 3 | `aq:pb:3` |
| [`s7-break-4.html`](screens/s7-break-4.html) | S7 · Перебивка после раздела 4 | `aq:pb:4` |
| [`s7-break-5.html`](screens/s7-break-5.html) | S7 · Перебивка после раздела 5 | `aq:pb:5` |
| [`s7-break-6.html`](screens/s7-break-6.html) | S7 · Перебивка после раздела 6 | `aq:pb:6` |
| [`s7-break-7.html`](screens/s7-break-7.html) | S7 · Перебивка после раздела 7 | `aq:pb:7` |
| [`s7-break-8.html`](screens/s7-break-8.html) | S7 · Перебивка после раздела 8 | `aq:pb:8` |
| [`s7-section-2-intro.html`](screens/s7-section-2-intro.html) | S7 · Вступление раздела 2 | `aq:in:2` |
| [`s7-section-3-intro.html`](screens/s7-section-3-intro.html) | S7 · Вступление раздела 3 | `aq:in:3` |
| [`s7-section-4-intro.html`](screens/s7-section-4-intro.html) | S7 · Вступление раздела 4 | `aq:in:4` |
| [`s7-section-5-intro.html`](screens/s7-section-5-intro.html) | S7 · Вступление раздела 5 | `aq:in:5` |
| [`s7-section-6-intro.html`](screens/s7-section-6-intro.html) | S7 · Вступление раздела 6 | `aq:in:6` |
| [`s7-section-7-intro.html`](screens/s7-section-7-intro.html) | S7 · Вступление раздела 7 | `aq:in:7` |
| [`s7-section-8-intro.html`](screens/s7-section-8-intro.html) | S7 · Вступление раздела 8 | `aq:in:8` |
| [`s7-question.html`](screens/s7-question.html) | S7 · Вопрос: ответ не выбран, «Далее» неактивна | `aq:q:1` |
| [`s7-question-selected.html`](screens/s7-question-selected.html) | S7 · Вопрос: ответ выбран | `aq:q:2` |
| [`s7-question-long-x.html`](screens/s7-question-long-x.html) | S7 · Длинный вопрос, выбрано «Не наблюдалось» | `aq:q:16` |
| [`s7-question-frequency.html`](screens/s7-question-frequency.html) | S7 · Вопрос со шкалой частоты | `aq:q:22` |
| [`s7-question-optional.html`](screens/s7-question-optional.html) | S7 · Необязательный вопрос («Дрессируемость»): «Далее» активна | `aq:q:27` |
| [`s7-free-answer.html`](screens/s7-free-answer.html) | S7 · Свободный ответ в конце раздела | `aq:fr:2` |
| [`s7-free-answer-filled.html`](screens/s7-free-answer-filled.html) | S7 · Свободный ответ: заполнено | `aq:fr:3` |

### План

| Эталон | Экран и состояние | Маршрут в прототипе |
|---|---|---|
| [`s9-plan-stub.html`](screens/s9-plan-stub.html) | S9 · План: заглушка «Сервис в разработке» | `s9` |

### Чат

| Эталон | Экран и состояние | Маршрут в прототипе |
|---|---|---|
| [`chat-empty.html`](screens/chat-empty.html) | S10 · Чат: первое открытие | `chat` |
| [`chat-all-states.html`](screens/chat-all-states.html) | S10 · Чат: все типы сообщений и ошибок | `chat` |
| [`chat-feedback.html`](screens/chat-feedback.html) | S10 · Чат: отзыв «Неполезно» | `chat` |

Экраны анкеты, которых нет в списке (остальные вопросы, вступления и свободные ответы), строятся из тех же шаблонов и данных `cbarq-questions.json` — так же, как в `app.js` (функция `anketa`).

## Как пересобрать эталоны

Если макеты поменялись: пересобрать прототип (`prototype/src/build_proto.py`), затем подключить `tools/export_screens.js` к `prototype/index.html`, запустить `python3 tools/receiver.py handoff/screens` и вызвать в консоли браузера `await __exportScreens()`.
