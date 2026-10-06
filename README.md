# Лабораторная работа №5

## Node.js: файловая система, CLI, потоки и Worker Threads

### Предметная область

В качестве предметной области используется система контроля сварочных процессов БРУ.

Основная сущность лабораторной работы — датчики:

- РСП-БРУ-01
- СМСО-БРУ-01
- МРСП-БРУ-01
- МРСП-БРУ-02
- МРСП-БРУ-03

Для работы с большим объёмом данных используются существующие отзывы из предыдущего проекта.

---

## Архитектура проекта

```text
lab5-node/
│
├── app.js
├── package.json
├── README.md
│
├── data/
│   ├── index.json
│   ├── sensors/
│   │   ├── 1.json
│   │   ├── 2.json
│   │   └── ...
│   ├── backup/
│   └── large-reviews.jsonl
│
├── src/
│   ├── cli/
│   │   ├── commands.js
│   │   └── search.js
│   │
│   ├── fs/
│   │   ├── sensorRepository.js
│   │   ├── indexRepository.js
│   │   └── backup.js
│   │
│   ├── streams/
│   │   ├── read.js
│   │   ├── write.js
│   │   ├── transform.js
│   │   └── benchmark.js
│   │
│   └── workers/
│       ├── statistics.js
│       └── statisticsWorker.js
│
└── experiments/
    └── event-loop.js
```

---

## Хранение данных

Каждый датчик хранится в отдельном JSON-файле:

```text
data/sensors/99.json
```

Индекс `data/index.json` содержит список ID датчиков:

```json
[
  "1",
  "2",
  "3",
  "4",
  "99"
]
```

Основной поток данных:

```text
CLI
 ↓
commands.js
 ↓
sensorRepository.js / indexRepository.js
 ↓
JSON-файлы
```

---

## CLI

Поддерживаются команды:

```text
create
read
update
delete
list
search
```

Примеры:

```powershell
node app.js create 101 "Тестовый датчик"
node app.js read 101
node app.js update 101 "Обновленный датчик"
node app.js delete 101
node app.js list
node app.js search
```

Интерактивный поиск выполняется с использованием `readline` и `stdin`.

---

## Файловая система

Для работы с файловой системой используется встроенный модуль:

```js
node:fs/promises
```

Реализованы:

- создание датчика;
- чтение датчика;
- обновление датчика;
- удаление датчика;
- проверка существования;
- чтение и изменение индекса;
- создание резервной копии;
- переименование датчика.

Для формирования путей используется:

```js
node:path
```

---

## Обработка ошибок

Используются собственные коды результата:

```text
0 — успешное выполнение
1 — неверные аргументы
2 — объект или файл не найден
3 — некорректный JSON
4 — ошибка файловой системы
```

Обрабатываются следующие отрицательные сценарии:

1. отсутствующий датчик;
2. создание датчика с уже существующим ID;
3. обновление отсутствующего датчика;
4. удаление отсутствующего датчика;
5. ID содержит недопустимые символы;
6. отсутствуют аргументы CLI;
7. некорректный JSON;
8. уже существующий файл при операциях с данными.

---

## Event Loop

Файл:

```text
experiments/event-loop.js
```

Код содержит:

```js
console.log('A')

setTimeout(() => {
    console.log('B')
}, 0)

Promise.resolve().then(() => {
    console.log('C')
})

console.log('D')
```

Результат выполнения:

```text
A
D
C
B
```

Сначала выполняется синхронный код (`A`, `D`), затем обработчик Promise, после этого callback `setTimeout`.

---

## Streams

Для демонстрации потоковой обработки используется большой файл:

```text
data/large-reviews.jsonl
```

Файл содержит 100000 существующих отзывов в формате JSON Lines.

Используются:

- `Readable` через `fs.createReadStream`;
- `Transform` для обработки данных;
- `Writable` через `fs.createWriteStream`;
- `pipeline()` для объединения потоков.

Схема:

```text
large-reviews.jsonl
        ↓
Readable
        ↓
Transform
        ↓
Writable
        ↓
large-reviews-output.jsonl
```

### Сравнение способов чтения

Полученные результаты:

| Метод | Время |
|---|---:|
| `fs.readFile` | 245.01 мс |
| `fs.readFileSync` | 294.46 мс |
| Stream | 1179.43 мс |

Измерение памяти выполняется по разнице RSS между двумя замерами. Такая дельта может быть отрицательной из-за работы сборщика мусора, поэтому она не является точным показателем пикового потребления памяти.

Главное преимущество Stream — обработка данных чанками без необходимости загружать весь файл в память одновременно.

---

## Worker Threads

Для CPU-нагруженного вычисления используются:

```text
src/workers/statistics.js
src/workers/statisticsWorker.js
```

Основной поток и Worker выполняют одинаковое вычисление над 5000 отзывами.

Результат:

```text
Главный поток:
1298.27 мс

Worker:
1385.62 мс
```

Полученный результат вычисления одинаков:

```text
563705493
```

Во время работы Worker главный поток продолжает отвечать:

```text
Главный поток продолжает отвечать...
```

Это показывает отличие CPU-bound задач от обычных операций файлового ввода-вывода.

### Worker Threads и асинхронный ввод-вывод

Асинхронное чтение файла позволяет не блокировать выполнение JavaScript-кода на время ожидания файловой системы.

Worker Thread используется для отдельного выполнения CPU-heavy вычислений.

То есть:

```text
async fs operation → ожидание внешней операции

Worker Thread → отдельный поток для CPU-вычисления
```

### Worker Threads и child_process.spawn

`Worker Threads` используются для запуска JavaScript-кода в отдельном потоке внутри процесса Node.js и позволяют обмениваться данными через `postMessage`.

`child_process.spawn` создаёт отдельный процесс операционной системы. Это более тяжёлая изоляция и используется, например, для запуска внешних программ или отдельных процессов.

---

## Индивидуальное мини-задание

Реализован интерактивный поиск датчиков по названию без учёта регистра.

Пример:

```text
Введите название датчика для поиска: рсп
```

В результате выводятся датчики, название которых содержит введённую последовательность символов.

---

## Проверка работы

Основные команды:

```powershell
node app.js list
node app.js create 101 "Тестовый датчик"
node app.js read 101
node app.js update 101 "Обновленный датчик"
node app.js search
node app.js delete 101
```

Эксперимент Event Loop:

```powershell
node .\experiments\event-loop.js
```

Benchmark потоков:

```powershell
node .\src\streams\benchmark.js
```

Worker Threads:

```powershell
node .\src\workers\statistics.js
```

Резервное копирование:

```powershell
node -e "const { backupSensorById } = require('./src/fs/backup'); backupSensorById('99').then(console.log)"
```

Переименование:

```powershell
node -e "const { renameSensorById } = require('./src/fs/backup'); renameSensorById('99','100').then(console.log)"
```

---

## Итог

В лабораторной работе были изучены и реализованы:

- работа Node.js с файловой системой;
- хранение объектов в JSON;
- CRUD-операции;
- CLI через `process.argv`;
- интерактивный ввод через `readline`;
- обработка ошибок;
- Event Loop;
- Readable, Transform и Writable Streams;
- сравнение способов чтения большого файла;
- Worker Threads для CPU-bound вычислений;
- создание резервных копий;
- переименование файлов и объектов.
