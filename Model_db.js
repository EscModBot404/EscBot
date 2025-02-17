const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Инициализация базы данных
const db = new sqlite3.Database('./models.db', (err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных моделей:', err);
    } else {
        console.log('Model-База данных моделей подключена.');
    }
});

// Создание таблицы моделей, если она не существует
const createModelsTable = () => {
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS models (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                city TEXT NOT NULL,
                photo_path TEXT NOT NULL,
                hair_color TEXT,
                skin_tone TEXT,
                height INTEGER,
                weight INTEGER,
                breast_size TEXT
            )
        `, (err) => {
            if (err) {
                console.error('Ошибка создания таблицы моделей:', err);
            } else {
                console.log('Таблица моделей успешно создана или уже существует.');
            }
        });
    });
};

// Функция для добавления моделей (если их нет)
const addModels = () => {
    // const models = [
    //     { name: 'Anna', city: 'Warsaw', photo_path: path.join(__dirname, 'Ph-Mod', 'test.jpg'), hair_color: 'Brunette', skin_tone: 'Fair', height: 164, weight: 57, breast_size: 'B' },
    //     { name: 'Maria', city: 'Warsaw', photo_path: path.join(__dirname, 'Ph-Mod', 'test.jpg'), hair_color: 'Brunette', skin_tone: 'Olive', height: 168, weight: 55, breast_size: 'B' },
    //     { name: 'Sophia', city: 'Warsaw', photo_path: path.join(__dirname, 'Ph-Mod', 'test.jpg'), hair_color: 'Black', skin_tone: 'Dark', height: 180, weight: 65, breast_size: 'C' },
    //     { name: 'Isabella', city: 'Warsaw', photo_path: path.join(__dirname, 'Ph-Mod', 'test.jpg'), hair_color: 'Black', skin_tone: 'Fair', height: 179, weight: 66, breast_size: 'C' },
    //     { name: 'Emily', city: 'Milan', photo_path: path.join(__dirname, 'Ph-Mod', 'test.jpg'), hair_color: 'Red', skin_tone: 'Tan', height: 172, weight: 60, breast_size: 'A' },
    //     { name: 'Olivia', city: 'Milan', photo_path: path.join(__dirname, 'Ph-Mod', 'test.jpg'), hair_color: 'Red', skin_tone: 'Olive', height: 175, weight: 59, breast_size: 'B' },
    //     { name: 'Sonya', city: 'Milan', photo_path: path.join(__dirname, 'Ph-Mod', 'test.jpg'), hair_color: 'Red', skin_tone: 'Fair', height: 159, weight: 52, breast_size: 'A' },
    //     { name: 'Mia', city: 'Dubai', photo_path: path.join(__dirname, 'Ph-Mod', 'test.jpg'), hair_color: 'Blonde', skin_tone: 'Light', height: 172, weight: 57, breast_size: 'B' },
    //     { name: 'Charlotte', city: 'Dubai', photo_path: path.join(__dirname, 'Ph-Mod', 'test.jpg'), hair_color: 'Brunette', skin_tone: 'Pale', height: 156, weight: 46, breast_size: 'C' }
    // ];
    const models = [
        { name: 'Anna', city: 'Warsaw', photo_path: path.join(__dirname,  'test.jpg'), hair_color: 'Brunette', skin_tone: 'Fair', height: 164, weight: 57, breast_size: 'B' },
        { name: 'Maria', city: 'Warsaw', photo_path: path.join(__dirname,  'test.jpg'), hair_color: 'Brunette', skin_tone: 'Olive', height: 168, weight: 55, breast_size: 'B' },
        { name: 'Sophia', city: 'Warsaw', photo_path: path.join(__dirname,  'test.jpg'), hair_color: 'Black', skin_tone: 'Dark', height: 180, weight: 65, breast_size: 'C' },
        { name: 'Isabella', city: 'Warsaw', photo_path: path.join(__dirname, 'test.jpg'), hair_color: 'Black', skin_tone: 'Fair', height: 179, weight: 66, breast_size: 'C' },
        { name: 'Emily', city: 'Milan', photo_path: path.join(__dirname,  'test.jpg'), hair_color: 'Red', skin_tone: 'Tan', height: 172, weight: 60, breast_size: 'A' },
        { name: 'Olivia', city: 'Milan', photo_path: path.join(__dirname,'test.jpg'), hair_color: 'Red', skin_tone: 'Olive', height: 175, weight: 59, breast_size: 'B' },
        { name: 'Sonya', city: 'Milan', photo_path: path.join(__dirname, 'test.jpg'), hair_color: 'Red', skin_tone: 'Fair', height: 159, weight: 52, breast_size: 'A' },
        { name: 'Mia', city: 'Dubai', photo_path: path.join(__dirname,  'test.jpg'), hair_color: 'Blonde', skin_tone: 'Light', height: 172, weight: 57, breast_size: 'B' },
        { name: 'Charlotte', city: 'Dubai', photo_path: path.join(__dirname, 'test.jpg'), hair_color: 'Brunette', skin_tone: 'Pale', height: 156, weight: 46, breast_size: 'C' }
    ];

    models.forEach((model) => {
        db.get(`SELECT COUNT(*) as count FROM models WHERE name = ?`, [model.name], (err, row) => {
            if (err) {
                console.error(`Ошибка проверки модели "${model.name}":`, err);
                return;
            }

            if (row.count === 0) {
                const query = `INSERT INTO models (name, city, photo_path, hair_color, skin_tone, height, weight, breast_size) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                const params = [model.name, model.city, model.photo_path, model.hair_color, model.skin_tone, model.height, model.weight, model.breast_size];

                db.run(query, params, (err) => {
                    if (err) {
                        console.error(`Ошибка добавления модели "${model.name}":`, err);
                    } else {
                        console.log(`Модель "${model.name}" успешно добавлена.`);
                    }
                });
            } else {
                console.log(`Модель "${model.name}" уже существует, пропускаем добавление.`);
            }
        });
    });
};

// Функция для получения всех моделей
const getModels = (callback) => {
    db.all(`SELECT * FROM models`, (err, rows) => {
        if (err) {
            console.error('Ошибка получения моделей:', err);
            callback(err, null);
        } else {
            callback(null, rows);
        }
    });
};

// Функция для получения модели по ID
const getModelById = (id, callback) => {
    db.get(`SELECT * FROM models WHERE id = ?`, [id], (err, row) => {
        if (err) {
            console.error('Ошибка получения модели по ID:', err);
            callback(err, null);
        } else {
            callback(null, row);
        }
    });
};

// Экспорт функций
module.exports = {
    createModelsTable,
    addModels,
    getModels,
    getModelById,
};

// Создаем таблицу, если её нет, и добавляем модели
createModelsTable();
addModels();
