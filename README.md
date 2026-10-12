# VDJ Inspector

Аналитика библиотеки VirtualDJ в браузере. История читается из папки `History` (файлы `.m3u` с датой в имени) и из старого `tracklist.txt`. Библиотека — это `database.xml`.

Файлы и настройки остаются в этом браузере. На сервер они не отправляются.

## Сборка (один раз, нужен Node.js)

```bash
npm install
npm run build
```

После сборки появляется папка `dist` (статическая SPA).

## Запуск без Node.js (после сборки)

Дважды щёлкните **serve-static.bat**.  
Он поднимает локальный статический сервер на PowerShell и открывает браузер. Node.js не нужен.

Импорт: `database.xml` и папка `History`. На Windows она обычно в `%LOCALAPPDATA%\VirtualDJ\History`.

## Разработка

```bash
npm install
npm run dev
```
