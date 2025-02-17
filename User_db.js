const sqlite3 = require('sqlite3').verbose();

// Инициализация базы данных
const db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err);
    } else {
        console.log('User-База данных подключена.');
    }
});

// Создание таблицы пользователей (с учётом filter_settings)
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            telegram_id TEXT UNIQUE NOT NULL,
            name TEXT,
            age INTEGER,
            location TEXT,
            language TEXT,
            step TEXT,
            filter_settings TEXT DEFAULT NULL
        )
    `, (err) => {
        if (err) {
            console.error('Ошибка создания таблицы пользователей:', err);
        } else {
            console.log('Таблица пользователей успешно создана.');
        }
    });

    // Проверяем, есть ли колонка filter_settings
    db.all("PRAGMA table_info(users)", (err, rows) => {
        if (err) {
            console.error("Ошибка проверки структуры таблицы:", err);
            return;
        }
        
        console.log("Структура таблицы users:", rows);

        // Проверяем, что rows - это массив и он не пуст
        if (Array.isArray(rows) && rows.length > 0) {
            const columnExists = rows.some(row => row.name === "filter_settings");

            if (!columnExists) {
                db.run(`ALTER TABLE users ADD COLUMN filter_settings TEXT DEFAULT NULL`, (err) => {
                    if (err) {
                        console.error("Ошибка добавления колонки filter_settings:", err);
                    } else {
                        console.log("Колонка filter_settings добавлена в таблицу users.");
                    }
                });
            } else {
                console.log("Колонка filter_settings уже существует.");
            }
        } else {
            console.error("Ошибка: Не удалось получить данные о колонках таблицы users.");
        }
    });
});

// Функция для создания записи пользователя
function ensureUserExists(chatId) {
    db.run(
        `INSERT OR IGNORE INTO users (telegram_id) VALUES (?)`,
        [chatId],
        (err) => {
            if (err) console.error('Ошибка добавления пользователя:', err);
        }
    );
}

// Функция для обновления данных пользователя
function updateUser(chatId, field, value) {
    const query = `UPDATE users SET ${field} = ? WHERE telegram_id = ?`;
    db.run(query, [value, chatId], (err) => {
        if (err) console.error(`Ошибка обновления ${field}:`, err);
    });
}

// Функция для получения данных пользователя
function getUser(chatId, callback) {
    db.get(`SELECT * FROM users WHERE telegram_id = ?`, [chatId], (err, row) => {
        if (err) {
            console.error('Ошибка получения данных пользователя:', err);
            callback(err, null);
        } else {
            callback(null, row);
        }
    });
}

// Функция для сохранения фильтра пользователя
const updateUserFilter = (chatId, filter) => {
    const filterString = JSON.stringify(filter);
    const query = `UPDATE users SET filter_settings = ? WHERE telegram_id = ?`;

    db.run(query, [filterString, chatId], (err) => {
        if (err) {
            console.error(`Ошибка сохранения фильтра:`, err);
        } else {
            console.log(`Фильтр для пользователя ${chatId} сохранен: ${filterString}`);
        }
    });
};


// Функция для получения сохраненного фильтра пользователя
const getUserFilter = (chatId, callback) => {
    const query = `SELECT filter_settings FROM users WHERE telegram_id = ?`;

    db.get(query, [chatId], (err, row) => {
        if (err) {
            console.error('Ошибка получения фильтра:', err);
            callback(err, null);
        } else {
            if (row && row.filter_settings) {
                try {
                    const filter = JSON.parse(row.filter_settings);
                    console.log(`Загружен фильтр для пользователя ${chatId}:`, filter);
                    callback(null, filter);
                } catch (parseError) {
                    console.error('Ошибка парсинга фильтра:', parseError);
                    callback(parseError, null);
                }
            } else {
                console.log(`Фильтр не найден для пользователя ${chatId}`);
                callback(null, null);
            }
        }
    });
};


module.exports = {
    ensureUserExists,
    updateUser,
    getUser,
    updateUserFilter,
    getUserFilter,
};
