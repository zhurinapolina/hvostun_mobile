# Набор для переноса интерфейса в рабочий код

Здесь всё, чтобы перенести мобильный интерфейс 1:1. Правила переноса — в [`../AGENTS.md`](../AGENTS.md).

## Что где

| Что | Где | Зачем |
|---|---|---|
| Эталоны экранов | `handoff/screens/*.html` | Каждый экран и каждое его состояние — отдельная страница: точная разметка, классы, тексты и стили, как в прототипе. Откройте в браузере — так должно выглядеть в продукте |
| Список эталонов | `handoff/screens/index.json` | id, название, раздел, файл и маршрут в прототипе — для автоматической обработки |
| Логика | `prototype/src/app.js` | Эталонная реализация поведения на чистом JS: переходы, состояния, проверки полей, анкета, портрет, план, рекомендации, результат, чат. Места, которые заменяет сервер, помечены «СЕРВЕР:» |
| Адаптив | `prototype/src/app.css` | Общие правила для всех экранов: размеры телефонов, клавиатура, безопасные зоны, прокрутка |
| Тексты анкеты | `prototype/src/cbarq-questions.json` | Разделы, описания, шкалы, 42 вопроса, свободные ответы |
| Данные и сервер | `docs/handoff.md` | Статусы пользователя, поля и проверки, тексты ошибок, правила маршрута рекомендаций, модель данных, запросы, аналитика |
| Запросы к серверу | `api/openapi.yaml`, `api/examples/*.json` | Описание запросов и готовые примеры ответов в тех же состояниях, что эталоны |
| Тексты рекомендаций и портрета | `prototype/src/recommendations.json`, `prototype/src/portrait.json` | Пять рекомендаций пилота и пример портрета; в продукте их присылает сервер |
| Токены и компоненты | `design-system/hvostun-design-system.md` | Цвета, шрифты, отступы, тени; раздел 12 — CSS токенов |
| Прототип целиком | `prototype/index.html` | Пройти весь путь руками и сравнить поведение |

## Как устроен эталон

Внутри каждого файла три блока стилей и разметка экрана:

1. «база страницы» — сброс отступов;
2. «общие правила адаптива» — копия `prototype/src/app.css`, одинаковая во всех эталонах (подключить в продукте один раз глобально; `#panel`, `#frame`, `#kbd` — оболочка прототипа для компьютера, в продукте не нужны);
3. «стили этого экрана» — только правила доски этого экрана, без слияния с другими экранами;
4. разметка экрана внутри `<div id="app">` — корневой блок `.ph`.

Основной эталон — 390 × 844. Для ключевых экранов есть эталоны на маленьком телефоне (`--320x568`), горизонтально (`--667x375`) и с открытой клавиатурой (`--kb`, серый блок внизу — место клавиатуры). Рамка телефона и `--sat`/`--sab` на `#app` — имитация устройства для снимка, в продукте отступы берутся из `env(safe-area-inset-*)`. На телефоне эталон занимает весь экран.

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
| [`home-d.html`](screens/home-d.html) | S3 · Главная D: анкета пройдена, портрет не собран | `s3` |
| [`home-e-new.html`](screens/home-e-new.html) | S3 · Главная E: выдана новая рекомендация | `s3` |
| [`home-e.html`](screens/home-e.html) | S3 · Главная E: рекомендация в работе | `s3` |
| [`home-f.html`](screens/home-f.html) | S3 · Главная F: маршрут пройден | `s3` |

### Профиль

| Эталон | Экран и состояние | Маршрут в прототипе |
|---|---|---|
| [`s4-empty.html`](screens/s4-empty.html) | S4 · Профиль: пустая форма | `s4` |
| [`s4-errors.html`](screens/s4-errors.html) | S4 · Профиль: все поля не заполнены | `s4` |
| [`s4-date-future.html`](screens/s4-date-future.html) | S4 · Профиль: дата в будущем | `s4` |
| [`s4-calendar.html`](screens/s4-calendar.html) | S4 · Профиль: выбор даты | `s4` |
| [`s4-filled.html`](screens/s4-filled.html) | S4 · Профиль: заполнено | `s4` |
| [`s4-saving.html`](screens/s4-saving.html) | S4 · Профиль: сохранение | `s4` |
| [`s4b-profile.html`](screens/s4b-profile.html) | S4b · Профиль: форма заполнена, анкеты ещё нет | `s4b` |
| [`s4b-portrait.html`](screens/s4b-portrait.html) | S4b · Профиль после анкеты: данные анкеты и портрет | `s4b` |

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

### Портрет

| Эталон | Экран и состояние | Маршрут в прототипе |
|---|---|---|
| [`s8-building.html`](screens/s8-building.html) | S8 · Портрет собирается | `s8` |
| [`s8-ready.html`](screens/s8-ready.html) | S8 · Портрет готов | `s8` |
| [`s8-error.html`](screens/s8-error.html) | S8 · Портрет не собрался | `s8` |

### План

| Эталон | Экран и состояние | Маршрут в прототипе |
|---|---|---|
| [`s9-plan-new.html`](screens/s9-plan-new.html) | S9 · План: выдана первая рекомендация | `pl` |
| [`s9-plan-work.html`](screens/s9-plan-work.html) | S9 · План: рекомендация в работе | `pl` |
| [`s9-plan-mid.html`](screens/s9-plan-mid.html) | S9 · План: середина маршрута, есть пройденные и отложенная | `pl` |
| [`s9-plan-limit.html`](screens/s9-plan-limit.html) | S9 · План: обе отложенные использованы, подсказка о лимите | `pl` |
| [`s9-plan-returned.html`](screens/s9-plan-returned.html) | S9 · План: вернули отложенную, следующая ждёт | `pl` |
| [`s9-plan-done.html`](screens/s9-plan-done.html) | S9 · План: маршрут пройден | `pl` |
| [`s9-plan-done-returned.html`](screens/s9-plan-done-returned.html) | S9 · План: маршрут пройден, вернулись к отложенной | `pl` |

### Рекомендация

| Эталон | Экран и состояние | Маршрут в прототипе |
|---|---|---|
| [`s12-rec-new.html`](screens/s12-rec-new.html) | S12 · Рекомендация «Новая»: пункты видны, отметить нельзя | `rec` |
| [`s12-rec-new-limit.html`](screens/s12-rec-new-limit.html) | S12 · «Новая», лимит «Не подошла» исчерпан | `rec` |
| [`s12-rec-work.html`](screens/s12-rec-work.html) | S12 · Рекомендация «В работе»: часть пунктов отмечена | `rec` |
| [`s12-rec-work-why-open.html`](screens/s12-rec-work-why-open.html) | S12 · «В работе»: «Почему это важно» раскрыто | `rec` |
| [`s12-rec-work-all-checked.html`](screens/s12-rec-work-all-checked.html) | S12 · «В работе»: всё отмечено | `rec` |
| [`s12-rec-helped.html`](screens/s12-rec-helped.html) | S12 · Пройденная: «Помогла», результат можно изменить | `rec` |
| [`s12-rec-partial.html`](screens/s12-rec-partial.html) | S12 · Пройденная: «Помогла частично» | `rec` |
| [`s12-rec-notfit.html`](screens/s12-rec-notfit.html) | S12 · Отложенная: можно вернуть | `rec` |
| [`s12-rec-notfit-blocked.html`](screens/s12-rec-notfit-blocked.html) | S12 · Отложенная: вернуть нельзя, пока текущая в работе | `rec` |
| [`s12-rec-returned.html`](screens/s12-rec-returned.html) | S12 · Возвращённая в работу: «Отложить снова» | `rec` |
| [`s12-rec-last.html`](screens/s12-rec-last.html) | S12 · Последняя рекомендация маршрута | `rec` |

### Результат

| Эталон | Экран и состояние | Маршрут в прототипе |
|---|---|---|
| [`s13-result.html`](screens/s13-result.html) | S13 · Результат: ничего не выбрано, «Сохранить» неактивна | `rec` |
| [`s13-result-helped.html`](screens/s13-result-helped.html) | S13 · Результат: выбрано «Помогла», критерии раскрыты | `rec` |
| [`s13-result-notfit.html`](screens/s13-result-notfit.html) | S13 · Результат: «Не подошла», первая отложенная | `rec` |
| [`s13-result-notfit-second.html`](screens/s13-result-notfit-second.html) | S13 · Результат: «Не подошла», вторая отложенная | `rec` |
| [`s13-result-limit.html`](screens/s13-result-limit.html) | S13 · Результат: «Не подошла» недоступна | `rec` |
| [`s13-result-saving.html`](screens/s13-result-saving.html) | S13 · Результат: сохранение | `rec` |
| [`s13-result-edit.html`](screens/s13-result-edit.html) | S13 · Изменение результата у пройденной | `rec` |
| [`s13-confirm-next.html`](screens/s13-confirm-next.html) | S13 · Подтверждение: открыта следующая рекомендация | `rec` |
| [`s13-confirm-notfit.html`](screens/s13-confirm-notfit.html) | S13 · Подтверждение после «Не подошла» с комментарием | `rec` |
| [`s13-confirm-back.html`](screens/s13-confirm-back.html) | S13 · Подтверждение: возвращаемся к текущей рекомендации | `rec` |
| [`s14-final.html`](screens/s14-final.html) | S14 · Маршрут пройден | `s14` |

### Чат

| Эталон | Экран и состояние | Маршрут в прототипе |
|---|---|---|
| [`chat-empty.html`](screens/chat-empty.html) | S10 · Чат: первое открытие | `chat` |
| [`chat-all-states.html`](screens/chat-all-states.html) | S10 · Чат: все типы сообщений и ошибок | `chat` |
| [`chat-feedback.html`](screens/chat-feedback.html) | S10 · Чат: отзыв «Неполезно» | `chat` |

## Эталоны на других размерах

### Главная

| Эталон | Экран и состояние | Маршрут в прототипе |
|---|---|---|
| [`home-b--320x568.html`](screens/home-b--320x568.html) | S3 · Главная B: профиль готов · маленький телефон 320 × 568 | `s3` |
| [`home-b--667x375.html`](screens/home-b--667x375.html) | S3 · Главная B: профиль готов · горизонтально 667 × 375 | `s3` |
| [`home-e--320x568.html`](screens/home-e--320x568.html) | S3 · Главная E: рекомендация в работе · маленький телефон 320 × 568 | `s3` |
| [`home-e--667x375.html`](screens/home-e--667x375.html) | S3 · Главная E: рекомендация в работе · горизонтально 667 × 375 | `s3` |
| [`home-f--320x568.html`](screens/home-f--320x568.html) | S3 · Главная F: маршрут пройден · маленький телефон 320 × 568 | `s3` |
| [`home-f--667x375.html`](screens/home-f--667x375.html) | S3 · Главная F: маршрут пройден · горизонтально 667 × 375 | `s3` |

### Профиль

| Эталон | Экран и состояние | Маршрут в прототипе |
|---|---|---|
| [`s4-filled--320x568.html`](screens/s4-filled--320x568.html) | S4 · Профиль: заполнено · маленький телефон 320 × 568 | `s4` |
| [`s4-filled--667x375.html`](screens/s4-filled--667x375.html) | S4 · Профиль: заполнено · горизонтально 667 × 375 | `s4` |
| [`s4-filled--kb.html`](screens/s4-filled--kb.html) | S4 · Профиль: заполнено · 390 × 844, открыта клавиатура | `s4` |
| [`s4b-portrait--320x568.html`](screens/s4b-portrait--320x568.html) | S4b · Профиль после анкеты: данные анкеты и портрет · маленький телефон 320 × 568 | `s4b` |
| [`s4b-portrait--667x375.html`](screens/s4b-portrait--667x375.html) | S4b · Профиль после анкеты: данные анкеты и портрет · горизонтально 667 × 375 | `s4b` |

### Анкета

| Эталон | Экран и состояние | Маршрут в прототипе |
|---|---|---|
| [`s7-intro-form--320x568.html`](screens/s7-intro-form--320x568.html) | S7 · Раздел 1 «Введение»: форма (собака из приюта) · маленький телефон 320 × 568 | `aq:vv` |
| [`s7-intro-form--667x375.html`](screens/s7-intro-form--667x375.html) | S7 · Раздел 1 «Введение»: форма (собака из приюта) · горизонтально 667 × 375 | `aq:vv` |
| [`s7-intro-form--kb.html`](screens/s7-intro-form--kb.html) | S7 · Раздел 1 «Введение»: форма (собака из приюта) · 390 × 844, открыта клавиатура | `aq:vv` |
| [`s7-section-4-intro--320x568.html`](screens/s7-section-4-intro--320x568.html) | S7 · Вступление раздела 4 · маленький телефон 320 × 568 | `aq:in:4` |
| [`s7-section-4-intro--667x375.html`](screens/s7-section-4-intro--667x375.html) | S7 · Вступление раздела 4 · горизонтально 667 × 375 | `aq:in:4` |
| [`s7-question-long-x--320x568.html`](screens/s7-question-long-x--320x568.html) | S7 · Длинный вопрос, выбрано «Не наблюдалось» · маленький телефон 320 × 568 | `aq:q:16` |
| [`s7-question-long-x--667x375.html`](screens/s7-question-long-x--667x375.html) | S7 · Длинный вопрос, выбрано «Не наблюдалось» · горизонтально 667 × 375 | `aq:q:16` |
| [`s7-free-answer-filled--320x568.html`](screens/s7-free-answer-filled--320x568.html) | S7 · Свободный ответ: заполнено · маленький телефон 320 × 568 | `aq:fr:3` |
| [`s7-free-answer-filled--kb.html`](screens/s7-free-answer-filled--kb.html) | S7 · Свободный ответ: заполнено · 390 × 844, открыта клавиатура | `aq:fr:3` |
| [`s7-break-8--320x568.html`](screens/s7-break-8--320x568.html) | S7 · Перебивка после раздела 8 · маленький телефон 320 × 568 | `aq:pb:8` |
| [`s7-break-8--667x375.html`](screens/s7-break-8--667x375.html) | S7 · Перебивка после раздела 8 · горизонтально 667 × 375 | `aq:pb:8` |

### Чат

| Эталон | Экран и состояние | Маршрут в прототипе |
|---|---|---|
| [`chat-all-states--320x568.html`](screens/chat-all-states--320x568.html) | S10 · Чат: все типы сообщений и ошибок · маленький телефон 320 × 568 | `chat` |
| [`chat-all-states--667x375.html`](screens/chat-all-states--667x375.html) | S10 · Чат: все типы сообщений и ошибок · горизонтально 667 × 375 | `chat` |
| [`chat-all-states--kb.html`](screens/chat-all-states--kb.html) | S10 · Чат: все типы сообщений и ошибок · 390 × 844, открыта клавиатура | `chat` |

### Вход

| Эталон | Экран и состояние | Маршрут в прототипе |
|---|---|---|
| [`s2-login--320x568.html`](screens/s2-login--320x568.html) | S2 · Вход · маленький телефон 320 × 568 | `s2` |
| [`s2-login--kb.html`](screens/s2-login--kb.html) | S2 · Вход · 390 × 844, открыта клавиатура | `s2` |

### Портрет

| Эталон | Экран и состояние | Маршрут в прототипе |
|---|---|---|
| [`s8-ready--320x568.html`](screens/s8-ready--320x568.html) | S8 · Портрет готов · маленький телефон 320 × 568 | `s8` |
| [`s8-ready--667x375.html`](screens/s8-ready--667x375.html) | S8 · Портрет готов · горизонтально 667 × 375 | `s8` |

### План

| Эталон | Экран и состояние | Маршрут в прототипе |
|---|---|---|
| [`s9-plan-mid--320x568.html`](screens/s9-plan-mid--320x568.html) | S9 · План: середина маршрута, есть пройденные и отложенная · маленький телефон 320 × 568 | `pl` |
| [`s9-plan-mid--667x375.html`](screens/s9-plan-mid--667x375.html) | S9 · План: середина маршрута, есть пройденные и отложенная · горизонтально 667 × 375 | `pl` |

### Рекомендация

| Эталон | Экран и состояние | Маршрут в прототипе |
|---|---|---|
| [`s12-rec-work--320x568.html`](screens/s12-rec-work--320x568.html) | S12 · Рекомендация «В работе»: часть пунктов отмечена · маленький телефон 320 × 568 | `rec` |
| [`s12-rec-work--667x375.html`](screens/s12-rec-work--667x375.html) | S12 · Рекомендация «В работе»: часть пунктов отмечена · горизонтально 667 × 375 | `rec` |

### Результат

| Эталон | Экран и состояние | Маршрут в прототипе |
|---|---|---|
| [`s13-result-helped--320x568.html`](screens/s13-result-helped--320x568.html) | S13 · Результат: выбрано «Помогла», критерии раскрыты · маленький телефон 320 × 568 | `rec` |
| [`s13-result-helped--667x375.html`](screens/s13-result-helped--667x375.html) | S13 · Результат: выбрано «Помогла», критерии раскрыты · горизонтально 667 × 375 | `rec` |
| [`s13-result-helped--kb.html`](screens/s13-result-helped--kb.html) | S13 · Результат: выбрано «Помогла», критерии раскрыты · 390 × 844, открыта клавиатура | `rec` |
| [`s13-confirm-next--320x568.html`](screens/s13-confirm-next--320x568.html) | S13 · Подтверждение: открыта следующая рекомендация · маленький телефон 320 × 568 | `rec` |
| [`s13-confirm-next--667x375.html`](screens/s13-confirm-next--667x375.html) | S13 · Подтверждение: открыта следующая рекомендация · горизонтально 667 × 375 | `rec` |
| [`s14-final--320x568.html`](screens/s14-final--320x568.html) | S14 · Маршрут пройден · маленький телефон 320 × 568 | `s14` |
| [`s14-final--667x375.html`](screens/s14-final--667x375.html) | S14 · Маршрут пройден · горизонтально 667 × 375 | `s14` |

Экраны анкеты, которых нет в списке (остальные вопросы, вступления и свободные ответы), строятся из тех же шаблонов и данных `cbarq-questions.json` — так же, как в `app.js` (функция `anketa`). Рекомендации 2–5 строятся из того же шаблона, что первая, и текстов `recommendations.json`.

Состояния загрузки и ошибок загрузки для профиля, плана, рекомендации и шторки результата есть только на досках (`mockups/V-M-S4b-portret`, `V-M-S9-plan`, `V-M-S12-1`, `V-M-S13-S14`): прототип не ходит на сервер и их не показывает. Разметку и стили этих состояний брать с досок.

Экраны анкеты, которых нет в списке (остальные вопросы, вступления и свободные ответы), строятся из тех же шаблонов и данных `cbarq-questions.json` — так же, как в `app.js` (функция `anketa`). Рекомендации 2–5 строятся из того же шаблона, что первая, и текстов `recommendations.json`.

Состояния загрузки и ошибок загрузки для профиля, плана, рекомендации и шторки результата есть только на досках (`mockups/V-M-S4b-portret`, `V-M-S9-plan`, `V-M-S12-1`, `V-M-S13-S14`): прототип не ходит на сервер и их не показывает. Разметку и стили этих состояний брать с досок.

Экраны анкеты, которых нет в списке (остальные вопросы, вступления и свободные ответы), строятся из тех же шаблонов и данных `cbarq-questions.json` — так же, как в `app.js` (функция `anketa`). Рекомендации 2–5 строятся из того же шаблона, что первая, и текстов `recommendations.json`.

Состояния загрузки и ошибок загрузки для профиля, плана, рекомендации и шторки результата есть только на досках (`mockups/V-M-S4b-portret`, `V-M-S9-plan`, `V-M-S12-1`, `V-M-S13-S14`): прототип не ходит на сервер и их не показывает. Разметку и стили этих состояний брать с досок.

Экраны анкеты, которых нет в списке (остальные вопросы, вступления и свободные ответы), строятся из тех же шаблонов и данных `cbarq-questions.json` — так же, как в `app.js` (функция `anketa`). Рекомендации 2–5 строятся из того же шаблона, что первая, и текстов `recommendations.json`.

Состояния загрузки и ошибок загрузки для профиля, плана, рекомендации и шторки результата есть только на досках (`mockups/V-M-S4b-portret`, `V-M-S9-plan`, `V-M-S12-1`, `V-M-S13-S14`): прототип не ходит на сервер и их не показывает. Разметку и стили этих состояний брать с досок.

## Как пересобрать эталоны

Если макеты поменялись: пересобрать прототип (`python3 prototype/src/build_proto.py`), затем `node tools/export_screens.mjs`. Скрипт открывает прототип в Chrome без окна, сохраняет каждый экран и состояние в `handoff/screens` и обновляет карту в этом файле. Нужны Node 22+ и Google Chrome; ничего устанавливать не надо.
