# TODO App

## Стек
- **Frontend**: React (JS), MobX, React Router, Axios, Dayjs, SCSS (Vite)
- **Backend**: Node.js (TypeScript), Express, Knex, PostgreSQL, JWT, bcrypt, OpenAPI (валидация), Helmet/CORS/Morgan
- **База**: PostgreSQL
- **Основные правила**:
  - Авторизация обязательна (JWT)
  - Пароли хранятся **в хэше** (bcrypt)
  - Иерархия пользователей: поле `manager_id`
  - Нельзя менять **атрибуты** задач, созданных **руководителем** пользователя (кроме **статуса**)
  - Ответственным можно назначать **только подчиненного** текущего пользователя
  - Список задач отсортирован по `updated_at desc`

## Запуск локально (npm)

### 1) PostgreSQL
Создайте БД `todo` и пользователя/пароль `todo/todo` (или измените `.env` на бэкенде).

### 2) Backend
```bash
cd apps/server
cp .env.example .env
npm install
npm run knex:migrate
npm run knex:seed
npm run dev
# API: http://localhost:4000
# Swagger UI: http://localhost:4000/docs
```

### 3) Frontend
```bash
cd ../../apps/web
cp .env.example .env
npm install
npm run dev
# UI: http://localhost:5173
```

### Тестовые пользователи
- boss / boss123 — руководитель
- user1 / user123 — подчиненный
- user2 / user123 — подчиненный
