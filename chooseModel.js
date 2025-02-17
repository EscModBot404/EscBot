const { getModels } = require('./Model_db');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const { getUserFilter, updateUserFilter,getUser } = require('./User_db');

 
const db = new sqlite3.Database('./models.db', (err) => {
    if (err) {
        console.error('Ошибка подключения к БД моделей:', err);
    } else {
        console.log('Подключено к базе данных моделей.');
    }
});

let modelSessions = {}; // Объект для отслеживания текущей модели для каждого пользователя

 
//     getModels((err, models) => {
//         if (err) {
//             bot.sendMessage(chatId, 'An error occurred while fetching models. Please try again later.');
//             console.error('Ошибка получения моделей:', err);
//             return;
//         }

//         if (models.length === 0) {
//             bot.sendMessage(chatId, 'No models are currently available.');
//             return;
//         }

//         // Инициализация сессии модели для пользователя
//         modelSessions[chatId] = {
//             models,
//             currentIndex: 0,
//         };

//         // Показать первую модель
//         showModel(bot, chatId);
//     });
// };
// const handleChooseModel = (bot, chatId) => {
//     getUser(chatId, (err, user) => {
//         if (err || !user || !user.location) {
//             bot.sendMessage(chatId, '❌ Unable to retrieve your location. Please update your information.');
//             return;
//         }

//         const userCity = user.location;

//         const query = `SELECT * FROM models WHERE city = ?`;
//         db.all(query, [userCity], (err, models) => {
//             if (err) {
//                 bot.sendMessage(chatId, '❌ An error occurred while fetching models.');
//                 console.error('Ошибка получения моделей:', err);
//                 return;
//             }

//             if (models.length === 0) {
//                 bot.sendMessage(chatId, `❌ No models available in ${userCity}.`);
//                 return;
//             }

//             modelSessions[chatId] = {
//                 models,
//                 currentIndex: 0
//             };

//             showModel(bot, chatId);
//         });
//     });
// };
const handleChooseModel = (bot, chatId) => {
    getUser(chatId, (err, user) => {
        if (err || !user || !user.location) {
            const message = user.language === 'ru' ? '❌ Не удалось получить вашу локацию. Пожалуйста, обновите информацию.' :
                            user.language === 'pl' ? '❌ Nie udało się pobrać Twojej lokalizacji. Zaktualizuj informacje.' :
                            '❌ Unable to retrieve your location. Please update your information.';
            bot.sendMessage(chatId, message);
            return;
        }

        const userCity = user.location;

        const query = `SELECT * FROM models WHERE city = ?`;
        db.all(query, [userCity], (err, models) => {
            if (err) {
                const errorMessage = user.language === 'ru' ? '❌ Произошла ошибка при получении моделей.' :
                                    user.language === 'pl' ? '❌ Wystąpił błąd podczas pobierania modeli.' :
                                    '❌ An error occurred while fetching models.';
                bot.sendMessage(chatId, errorMessage);
                console.error('Ошибка получения моделей:', err);
                return;
            }

            if (models.length === 0) {
                const noModelsMessage = user.language === 'ru' ? `❌ В ${userCity} нет доступных моделей.` :
                                        user.language === 'pl' ? `❌ W ${userCity} nie ma dostępnych modeli.` :
                                        `❌ No models available in ${userCity}.`;
                bot.sendMessage(chatId, noModelsMessage);
                return;
            }

            modelSessions[chatId] = {
                models,
                currentIndex: 0
            };

            showModel(bot, chatId);
        });
    });
};


// const showModel = (bot, chatId) => {    //перелистывание анкет без удаления
//     const session = modelSessions[chatId];

//     if (!session) {
//         bot.sendMessage(chatId, 'No models to display. Please try again.');
//         return;
//     }

//     const model = session.models[session.currentIndex];

//     const message = `
// <b>Name:</b> ${model.name}
// <b>City:</b> ${model.city}
// <b>Hair Color:</b> ${model.hair_color}
// <b>Skin Tone:</b> ${model.skin_tone}
// <b>Height:</b> ${model.height} cm
// <b>Weight:</b> ${model.weight} kg
// <b>Breast Size:</b> ${model.breast_size}
//     `;

//     // Проверка на существование фото
//     if (fs.existsSync(model.photo_path)) {
//         bot.sendPhoto(chatId, fs.createReadStream(model.photo_path), {
//             caption: message,
//             parse_mode: 'HTML',
//             reply_markup: {
//                 inline_keyboard: [
//                     [
//                         { text: '⬅️ Previous', callback_data: 'model_prev' },
//                         { text: '➡️ Next', callback_data: 'model_next' }
//                     ]
//                 ]
//             }
//         }).then(sentMessage => {
//             modelSessions[chatId].lastMessageId = sentMessage.message_id;
//         });
//     } else {
//         // Если фото нет, просто отправляем текст
//         bot.sendMessage(chatId, message, {
//             parse_mode: 'HTML',
//             reply_markup: {
//                 inline_keyboard: [
//                     [
//                         { text: '⬅️ Previous', callback_data: 'model_prev' },
//                         { text: '➡️ Next', callback_data: 'model_next' }
//                     ]
//                 ]
//             }
//         }).then(sentMessage => {
//             modelSessions[chatId].lastMessageId = sentMessage.message_id;
//         });
//     }
// };
// const showModel = (bot, chatId) => {
//     const session = modelSessions[chatId];

//     if (!session) {
//         bot.sendMessage(chatId, 'No models to display. Please try again.');
//         return;
//     }

//     const model = session.models[session.currentIndex];

//     const message = `
// <b>Name:</b> ${model.name}
// <b>City:</b> ${model.city}
// <b>Hair Color:</b> ${model.hair_color}
// <b>Skin Tone:</b> ${model.skin_tone}
// <b>Height:</b> ${model.height} cm
// <b>Weight:</b> ${model.weight} kg
// <b>Breast Size:</b> ${model.breast_size}
//     `;

//     // Проверка на существование фото
//     if (fs.existsSync(model.photo_path)) {
//         bot.sendPhoto(chatId, fs.createReadStream(model.photo_path), {
//             caption: message,
//             parse_mode: 'HTML',
//             reply_markup: {
//                 inline_keyboard: [
//                     [
//                         { text: '⬅️ Previous', callback_data: 'model_prev' },
//                         { text: '➡️ Next', callback_data: 'model_next' }
//                     ]
//                 ]
//             }
//         }).then(async sentMessage => {
//             // Сохраняем ID нового сообщения
//             const newMessageId = sentMessage.message_id;

//             // Удаляем предыдущее сообщение, если оно есть
//             if (session.lastMessageId) {
//                 bot.deleteMessage(chatId, session.lastMessageId).catch(err => {
//                     console.error('Ошибка удаления предыдущего сообщения:', err);
//                 });
//             }
               
//             // Обновляем ID последнего сообщения
//             session.lastMessageId = newMessageId;
//         });
//     } else {
//         // Если фото нет, просто отправляем текст
//         bot.sendMessage(chatId, message, {
//             parse_mode: 'HTML',
//             reply_markup: {
//                 inline_keyboard: [
//                     [
//                         { text: '⬅️ Previous', callback_data: 'model_prev' },
//                         { text: '➡️ Next', callback_data: 'model_next' }
//                     ]
//                 ]
//             }
//         }).then(sentMessage => {
//             // Сохраняем ID нового сообщения
//             const newMessageId = sentMessage.message_id;

//             // Удаляем предыдущее сообщение, если оно есть
//             if (session.lastMessageId) {
//                 bot.deleteMessage(chatId, session.lastMessageId).catch(err => {
//                     console.error('Ошибка удаления предыдущего сообщения:', err);
//                 });
//             }

//             // Обновляем ID последнего сообщения
//             session.lastMessageId = newMessageId;
//         });
//     }
// };
const showModel = (bot, chatId) => {
    getUser(chatId, (err, user) => {
        if (err || !user) {
            bot.sendMessage(chatId, '❌ Ошибка при получении данных пользователя.');
            return;
        }

        const userLanguage = user.language || 'en';

        const session = modelSessions[chatId];

        if (!session) {
            const noModelsMessage = userLanguage === 'ru' ? 'Нет моделей для показа. Попробуйте снова.' :
                                    userLanguage === 'pl' ? 'Brak modeli do wyświetlenia. Spróbuj ponownie.' :
                                    'No models to display. Please try again.';
            bot.sendMessage(chatId, noModelsMessage);
            return;
        }

        const model = session.models[session.currentIndex];

        const message = `
<b>${userLanguage === 'ru' ? 'Имя' : userLanguage === 'pl' ? 'Imię' : 'Name'}:</b> ${model.name}
<b>${userLanguage === 'ru' ? 'Город' : userLanguage === 'pl' ? 'Miasto' : 'City'}:</b> ${model.city}
<b>${userLanguage === 'ru' ? 'Цвет волос' : userLanguage === 'pl' ? 'Kolor włosów' : 'Hair Color'}:</b> ${model.hair_color}
<b>${userLanguage === 'ru' ? 'Тон кожи' : userLanguage === 'pl' ? 'Odcień skóry' : 'Skin Tone'}:</b> ${model.skin_tone}
<b>${userLanguage === 'ru' ? 'Рост' : userLanguage === 'pl' ? 'Wzrost' : 'Height'}:</b> ${model.height} cm
<b>${userLanguage === 'ru' ? 'Вес' : userLanguage === 'pl' ? 'Waga' : 'Weight'}:</b> ${model.weight} kg
<b>${userLanguage === 'ru' ? 'Размер груди' : userLanguage === 'pl' ? 'Rozmiar biustu' : 'Breast Size'}:</b> ${model.breast_size}
        `;

        const prevButton = userLanguage === 'ru' ? '⬅️ Предыдущая' : userLanguage === 'pl' ? '⬅️ Poprzednia' : '⬅️ Previous';
        const nextButton = userLanguage === 'ru' ? '➡️ Следующая' : userLanguage === 'pl' ? '➡️ Następna' : '➡️ Next';

        // Проверка на существование фото
        if (fs.existsSync(model.photo_path)) {
            bot.sendPhoto(chatId, fs.createReadStream(model.photo_path), {
                caption: message,
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: prevButton, callback_data: 'model_prev' },
                            { text: nextButton, callback_data: 'model_next' }
                        ]
                    ]
                }
            }).then(async sentMessage => {
                const newMessageId = sentMessage.message_id;

                if (session.lastMessageId) {
                    bot.deleteMessage(chatId, session.lastMessageId).catch(err => {
                        console.error('Ошибка удаления предыдущего сообщения:', err);
                    });
                }

                session.lastMessageId = newMessageId;
            });
        } else {
            bot.sendMessage(chatId, message, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: prevButton, callback_data: 'model_prev' },
                            { text: nextButton, callback_data: 'model_next' }
                        ]
                    ]
                }
            }).then(sentMessage => {
                const newMessageId = sentMessage.message_id;

                if (session.lastMessageId) {
                    bot.deleteMessage(chatId, session.lastMessageId).catch(err => {
                        console.error('Ошибка удаления предыдущего сообщения:', err);
                    });
                }

                session.lastMessageId = newMessageId;
            });
        }
    });
};


const handleModelNavigation = (bot, callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    const session = modelSessions[chatId];

    if (!session) {
        bot.sendMessage(chatId, 'No models to navigate. Please try again.');
        return;
    }

    if (data === 'model_prev') {
        session.currentIndex = (session.currentIndex - 1 + session.models.length) % session.models.length;
    } else if (data === 'model_next') {
        session.currentIndex = (session.currentIndex + 1) % session.models.length;
    }

    showModel(bot, chatId);

    bot.answerCallbackQuery(callbackQuery.id);
};

 
// const getRandomModels = (bot, chatId) => {
//     getUser(chatId, (err, user) => {
//         if (err || !user || !user.location) {
//             bot.sendMessage(chatId, '❌ Unable to retrieve your location. Please update your information.');
//             return;
//         }

//         const userCity = user.location;

//         const query = `SELECT * FROM models WHERE city = ?`;
//         db.all(query, [userCity], (err, models) => {
//             if (err) {
//                 bot.sendMessage(chatId, '❌ An error occurred while fetching models.');
//                 console.error('Ошибка получения моделей:', err);
//                 return;
//             }

//             if (models.length < 3) {
//                 bot.sendMessage(chatId, `❌ Not enough models in ${userCity} to show random selection.`);
//                 return;
//             }

//             // Выбираем 3 случайные уникальные модели
//             const uniqueModels = [];
//             const usedIndexes = new Set();

//             while (uniqueModels.length < 3) {
//                 const randomIndex = Math.floor(Math.random() * models.length);
//                 if (!usedIndexes.has(randomIndex)) {
//                     usedIndexes.add(randomIndex);
//                     uniqueModels.push(models[randomIndex]);
//                 }
//             }

//             // Отправляем каждую модель пользователю
//             uniqueModels.forEach((model) => {
//                 const message = `
// <b>Name:</b> ${model.name}
// <b>City:</b> ${model.city}
// <b>Hair Color:</b> ${model.hair_color}
// <b>Skin Tone:</b> ${model.skin_tone}
// <b>Height:</b> ${model.height} cm
// <b>Weight:</b> ${model.weight} kg
// <b>Breast Size:</b> ${model.breast_size}
//                 `;

//                 let photo = fs.existsSync(model.photo_path) ? fs.createReadStream(model.photo_path) : 'https://via.placeholder.com/300';

//                 bot.sendPhoto(chatId, photo, {
//                     caption: message,
//                     parse_mode: 'HTML'
//                 });
//             });
//         });
//     });
// };

const getRandomModels = (bot, chatId) => {
    getUser(chatId, (err, user) => {
        if (err || !user || !user.location) {
            const errorMessage = user.language === 'ru' ? '❌ Не удалось получить ваше местоположение. Пожалуйста, обновите информацию.' :
                                 user.language === 'pl' ? '❌ Nie można pobrać Twojej lokalizacji. Zaktualizuj swoje informacje.' :
                                 '❌ Unable to retrieve your location. Please update your information.';
            bot.sendMessage(chatId, errorMessage);
            return;
        }

        const userCity = user.location;

        const query = `SELECT * FROM models WHERE city = ?`;
        db.all(query, [userCity], (err, models) => {
            if (err) {
                const fetchError = user.language === 'ru' ? '❌ Произошла ошибка при загрузке моделей.' :
                                  user.language === 'pl' ? '❌ Wystąpił błąd podczas pobierania modelek.' :
                                  '❌ An error occurred while fetching models.';
                bot.sendMessage(chatId, fetchError);
                console.error('Ошибка получения моделей:', err);
                return;
            }

            if (models.length < 3) {
                const notEnoughModels = user.language === 'ru' ? `❌ В ${userCity} недостаточно моделей для случайного выбора.` :
                                       user.language === 'pl' ? `❌ W ${userCity} jest za mało modelek, aby pokazać losowy wybór.` :
                                       `❌ Not enough models in ${userCity} to show random selection.`;
                bot.sendMessage(chatId, notEnoughModels);
                return;
            }

            // Выбираем 3 случайные уникальные модели
            const uniqueModels = [];
            const usedIndexes = new Set();

            while (uniqueModels.length < 3) {
                const randomIndex = Math.floor(Math.random() * models.length);
                if (!usedIndexes.has(randomIndex)) {
                    usedIndexes.add(randomIndex);
                    uniqueModels.push(models[randomIndex]);
                }
            }

            // Отправляем каждую модель пользователю
            uniqueModels.forEach((model) => {
                const modelInfo = user.language === 'ru' ? 
                    `<b>Имя:</b> ${model.name}\n<b>Город:</b> ${model.city}\n<b>Цвет волос:</b> ${model.hair_color}\n<b>Оттенок кожи:</b> ${model.skin_tone}\n<b>Рост:</b> ${model.height} см\n<b>Вес:</b> ${model.weight} кг\n<b>Размер груди:</b> ${model.breast_size}` :
                    user.language === 'pl' ? 
                    `<b>Imię:</b> ${model.name}\n<b>Miasto:</b> ${model.city}\n<b>Kolor włosów:</b> ${model.hair_color}\n<b>Odcień skóry:</b> ${model.skin_tone}\n<b>Wzrost:</b> ${model.height} cm\n<b>Waga:</b> ${model.weight} kg\n<b>Rozmiar biustu:</b> ${model.breast_size}` :
                    `<b>Name:</b> ${model.name}\n<b>City:</b> ${model.city}\n<b>Hair Color:</b> ${model.hair_color}\n<b>Skin Tone:</b> ${model.skin_tone}\n<b>Height:</b> ${model.height} cm\n<b>Weight:</b> ${model.weight} kg\n<b>Breast Size:</b> ${model.breast_size}`;

                let photo = fs.existsSync(model.photo_path) ? fs.createReadStream(model.photo_path) : 'https://via.placeholder.com/300';

                bot.sendPhoto(chatId, photo, {
                    caption: modelInfo,
                    parse_mode: 'HTML'
                });
            });
        });
    });
};

let filterSessions = {}; // Объект для хранения выбора пользователя

const startModelFilter = (bot, chatId) => {
    getUser(chatId, (err, user) => {
        if (err || !user) {
            bot.sendMessage(chatId, '❌ Ошибка получения данных. Попробуйте позже.');
            return;
        }

        const userLanguage = user.language || 'en';

        filterSessions[chatId] = { height: '—', weight: '—', breast_size: '—', hair_color: '—' };

        const selectHeightMessage = userLanguage === 'ru' ? 'Выберите диапазон роста:' :
                                    userLanguage === 'pl' ? 'Wybierz zakres wzrostu:' :
                                    'Select the height range:';

        bot.sendMessage(chatId, selectHeightMessage, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: userLanguage === 'ru' ? '150-160 см' : userLanguage === 'pl' ? '150-160 cm' : '150-160 cm', callback_data: 'height_150_160' }],
                    [{ text: userLanguage === 'ru' ? '161-170 см' : userLanguage === 'pl' ? '161-170 cm' : '161-170 cm', callback_data: 'height_161_170' }],
                    [{ text: userLanguage === 'ru' ? '171-180 см' : userLanguage === 'pl' ? '171-180 cm' : '171-180 cm', callback_data: 'height_171_180' }],
                    [{ text: userLanguage === 'ru' ? '181+ см' : userLanguage === 'pl' ? '181+ cm' : '181+ cm', callback_data: 'height_181_200' }]
                ]
            }
        });
    });
};



const processFilterSelection = (bot, callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    if (!filterSessions[chatId]) {
        filterSessions[chatId] = { height: '—', weight: '—', breast_size: '—', hair_color: '—' };
    }

    if (data.startsWith('height_')) {
        const heightRange = data.split('_').slice(1).join('-');  // Преобразуем в "161-170"
        filterSessions[chatId].height = heightRange;
        askWeight(bot, chatId);
    } else if (data.startsWith('weight_')) {
        const weightRange = data.split('_').slice(1).join('-');  // Преобразуем в "51-60"
        filterSessions[chatId].weight = weightRange;
        askBreastSize(bot, chatId);
    } else if (data.startsWith('breast_')) {
        filterSessions[chatId].breast_size = data.split('_')[1];
        askHairColor(bot, chatId);
    } else if (data.startsWith('hair_')) {
        filterSessions[chatId].hair_color = data.split('_')[1];

        // Сохранение фильтра
        updateUserFilter(chatId, filterSessions[chatId]);

        // Отображение сохранённого фильтра
        sendUserFilterTemplate(bot, chatId);
    }
};

const askWeight = (bot, chatId) => {
    getUser(chatId, (err, user) => {
        if (err || !user) {
            bot.sendMessage(chatId, '❌ Ошибка получения данных. Попробуйте позже.');
            return;
        }

        const userLanguage = user.language || 'en';

        const selectWeightMessage = userLanguage === 'ru' ? 'Выберите диапазон веса:' :
                                    userLanguage === 'pl' ? 'Wybierz zakres wagi:' :
                                    'Select the weight range:';

        bot.sendMessage(chatId, selectWeightMessage, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '40-50 kg', callback_data: 'weight_40_50' }],
                    [{ text: '51-60 kg', callback_data: 'weight_51_60' }],
                    [{ text: '61-70 kg', callback_data: 'weight_61_70' }],
                    [{ text: '71+ kg', callback_data: 'weight_71_100' }]
                ]
            }
        });
    });
};

// Вопрос о размере груди
const askBreastSize = (bot, chatId) => {
    getUser(chatId, (err, user) => {
        if (err || !user) {
            bot.sendMessage(chatId, '❌ Ошибка получения данных. Попробуйте позже.');
            return;
        }

        const userLanguage = user.language || 'en';

        const selectBreastSizeMessage = userLanguage === 'ru' ? 'Выберите размер груди:' :
                                        userLanguage === 'pl' ? 'Wybierz rozmiar biustu:' :
                                        'Select breast size:';

        bot.sendMessage(chatId, selectBreastSizeMessage, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'A', callback_data: 'breast_A' }],
                    [{ text: 'B', callback_data: 'breast_B' }],
                    [{ text: 'C', callback_data: 'breast_C' }],
                    [{ text: 'D+', callback_data: 'breast_D' }]
                ]
            }
        });
    });
};

// Вопрос о цвете волос
const askHairColor = (bot, chatId) => {
    getUser(chatId, (err, user) => {
        if (err || !user) {
            bot.sendMessage(chatId, '❌ Ошибка получения данных. Попробуйте позже.');
            return;
        }

        const userLanguage = user.language || 'en';

        const selectHairColorMessage = userLanguage === 'ru' ? 'Выберите цвет волос:' :
                                        userLanguage === 'pl' ? 'Wybierz kolor włosów:' :
                                        'Select hair color:';

        bot.sendMessage(chatId, selectHairColorMessage, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: userLanguage === 'ru' ? 'Блондин' : userLanguage === 'pl' ? 'Blond' : 'Blonde', callback_data: 'hair_Blonde' }],
                    [{ text: userLanguage === 'ru' ? 'Брюнет' : userLanguage === 'pl' ? 'Brunet' : 'Brunette', callback_data: 'hair_Brunette' }],
                    [{ text: userLanguage === 'ru' ? 'Чёрный' : userLanguage === 'pl' ? 'Czarny' : 'Black', callback_data: 'hair_Black' }],
                    [{ text: userLanguage === 'ru' ? 'Рыжий' : userLanguage === 'pl' ? 'Rudy' : 'Red', callback_data: 'hair_Red' }]
                ]
            }
        });
    });
};


function getRangeText(value, type) {
    if (type === 'height') {
        if (value >= 150 && value <= 160) return '150-160';
        if (value >= 161 && value <= 170) return '161-170';
        if (value >= 171 && value <= 180) return '171-180';
        if (value >= 181) return '181+';
    }

    if (type === 'weight') {
        if (value >= 40 && value <= 50) return '40-50';
        if (value >= 51 && value <= 60) return '51-60';
        if (value >= 61 && value <= 70) return '61-70';
        if (value >= 71) return '71+';
    }

    return value.toString();  // Если значение не попало в диапазон, возвращаем его как есть
}

function sendUserFilterTemplate(bot, chatId) {
    getUser(chatId, (err, user) => {
        if (err || !user) {
            bot.sendMessage(chatId, '❌ Ошибка получения данных. Попробуйте позже.');
            return;
        }

        const userLanguage = user.language || 'en';

        getUserFilter(chatId, (err, filter) => {
            if (err || !filter) {
                filter = { height: '—', weight: '—', breast_size: '—', hair_color: '—' };
            }

            // Преобразование диапазонов в текст
            const heightRange = getRangeText(parseInt(filter.height), 'height');
            const weightRange = getRangeText(parseInt(filter.weight), 'weight');

            const message = userLanguage === 'ru' ? `
📌 *Ваш текущий фильтр:*
*Диапазон роста:* ${heightRange}
*Диапазон веса:* ${weightRange}
*Размер груди:* ${filter.breast_size}
*Цвет волос:* ${filter.hair_color}
            ` : userLanguage === 'pl' ? `
📌 *Twój aktualny filtr:*
*Zakres wzrostu:* ${heightRange}
*Zakres wagi:* ${weightRange}
*Rozmiar biustu:* ${filter.breast_size}
*Kolor włosów:* ${filter.hair_color}
            ` : `
📌 *Your current filter:*
*Height Range:* ${heightRange}
*Weight Range:* ${weightRange}
*Breast Size:* ${filter.breast_size}
*Hair Color:* ${filter.hair_color}
            `;

            const searchButton = userLanguage === 'ru' ? '🔍 Искать по этому фильтру' :
                                userLanguage === 'pl' ? '🔍 Szukaj z tym filtrem' :
                                '🔍 Search with this filter';

            const updateButton = userLanguage === 'ru' ? '✏️ Обновить/Заполнить фильтр' :
                                userLanguage === 'pl' ? '✏️ Zaktualizuj/Uzupełnij filtr' :
                                '✏️ Update/Fill Filter';

            bot.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: searchButton, callback_data: 'apply_filter' }],
                        [{ text: updateButton, callback_data: 'update_filter' }]
                    ]
                }
            });
        });
    });
}




 
//     console.log('🔍 Начинаем поиск моделей с фильтром:', filter);

//     // Преобразуем диапазоны роста и веса с учетом реальных диапазонов
//     const [heightMin, heightMax] = parseRange(filter.height, 150, 200);
//     const [weightMin, weightMax] = parseRange(filter.weight, 40, 100);

//     console.log(`📏 Диапазон роста: ${heightMin}-${heightMax}, Диапазон веса: ${weightMin}-${weightMax}`);

//     const query = `
//         SELECT * FROM models 
//         WHERE 
//             height BETWEEN ? AND ? 
//             AND weight BETWEEN ? AND ? 
//             AND (breast_size = ? OR ? = '—') 
//             AND (hair_color = ? OR ? = '—')
//     `;

//     const params = [
//         heightMin, heightMax,
//         weightMin, weightMax,
//         filter.breast_size, filter.breast_size,
//         filter.hair_color, filter.hair_color
//     ];

//     console.log('📡 Выполняем SQL-запрос:', query, params);

//     db.all(query, params, (err, models) => {
//         if (err) {
//             console.error('❌ Ошибка поиска моделей:', err);
//             bot.sendMessage(chatId, '❌ An error occurred while searching for models.');
//             return;
//         }

//         if (models.length === 0) {
//             console.log('❌ Модели не найдены по заданным фильтрам.');
//             bot.sendMessage(chatId, '❌ No models found matching your filter.');
//             return;
//         }

//         console.log(`✅ Найдено моделей: ${models.length}`);

//         modelSessions[chatId] = {
//             models,
//             currentIndex: 0
//         };

//         showFilteredModel(bot, chatId);
//     });
// };
const findModelsByFilter = (bot, chatId, filter) => {
    getUser(chatId, (err, user) => {
        if (err || !user || !user.location) {
            bot.sendMessage(chatId, '❌ Unable to retrieve your location. Please update your information.');
            return;
        }

        const userCity = user.location;

        const heightRange = filter.height.split('-').map(Number);
        const weightRange = filter.weight.split('-').map(Number);

        if (!heightRange.length || !weightRange.length) {
            bot.sendMessage(chatId, '❌ Invalid filter parameters. Please update your filter.');
            return;
        }

        const query = `
            SELECT * FROM models 
            WHERE 
                height BETWEEN ? AND ? 
                AND weight BETWEEN ? AND ? 
                AND (breast_size = ? OR ? = '-') 
                AND (hair_color = ? OR ? = '-') 
                AND city = ?
        `;

        const params = [
            heightRange[0], heightRange[1], 
            weightRange[0], weightRange[1], 
            filter.breast_size, filter.breast_size,
            filter.hair_color, filter.hair_color,
            userCity
        ];

        console.log('🔍 Выполняем SQL-запрос для поиска моделей в городе:', userCity);
        console.log(query);
        console.log('Параметры:', params);

        db.all(query, params, (err, models) => {
            if (err) {
                console.error('Ошибка поиска моделей:', err);
                bot.sendMessage(chatId, '❌ An error occurred while searching for models.');
                return;
            }

            if (models.length === 0) {
                bot.sendMessage(chatId, `❌ No models found in ${userCity} matching your filter.Change your filter!`);
                return;
            }

            modelSessions[chatId] = {
                models,
                currentIndex: 0
            };

            showFilteredModel(bot, chatId);
        });
    });
};
function parseRange(rangeStr, defaultMin, defaultMax) {
    if (rangeStr.includes('-')) {
        const [min, max] = rangeStr.split('-').map(Number);
        return [min || defaultMin, max || defaultMax];
    } else {
        const value = Number(rangeStr) || defaultMin;
        // Если указано одно значение, создаем диапазон +/-5 см или кг для охвата небольшого разброса
        return [value - 5, value + 5];
    }
}

const showFilteredModel = (bot, chatId) => {
    getUser(chatId, (err, user) => {
        if (err || !user) {
            bot.sendMessage(chatId, '❌ Ошибка получения данных. Попробуйте позже.');
            return;
        }

        const userLanguage = user.language || 'en';
        const session = modelSessions[chatId];

        if (!session || session.models.length === 0) {
            console.log('❌ Нет доступных моделей для отображения.');
            const noModelsMessage = userLanguage === 'ru' ? '❌ Нет доступных моделей. Попробуйте позже.' :
                                    userLanguage === 'pl' ? '❌ Brak dostępnych modeli. Spróbuj ponownie później.' :
                                    '❌ No models available. Please try again.';
            bot.sendMessage(chatId, noModelsMessage);
            return;
        }

        const model = session.models[session.currentIndex];

        const message = userLanguage === 'ru' ? `
<b>Имя:</b> ${model.name}
<b>Город:</b> ${model.city}
<b>Цвет волос:</b> ${model.hair_color}
<b>Оттенок кожи:</b> ${model.skin_tone}
<b>Рост:</b> ${model.height} см
<b>Вес:</b> ${model.weight} кг
<b>Размер груди:</b> ${model.breast_size}
        ` : userLanguage === 'pl' ? `
<b>Imię:</b> ${model.name}
<b>Miasto:</b> ${model.city}
<b>Kolor włosów:</b> ${model.hair_color}
<b>Odcień skóry:</b> ${model.skin_tone}
<b>Wzrost:</b> ${model.height} cm
<b>Waga:</b> ${model.weight} kg
<b>Rozmiar biustu:</b> ${model.breast_size}
        ` : `
<b>Name:</b> ${model.name}
<b>City:</b> ${model.city}
<b>Hair Color:</b> ${model.hair_color}
<b>Skin Tone:</b> ${model.skin_tone}
<b>Height:</b> ${model.height} cm
<b>Weight:</b> ${model.weight} kg
<b>Breast Size:</b> ${model.breast_size}
        `;

        let photo;
        if (fs.existsSync(model.photo_path) && model.photo_path !== '') {
            photo = fs.createReadStream(model.photo_path);
        } else {
            photo = 'https://via.placeholder.com/300';  // Заглушка, если фото не найдено
            console.warn(`⚠️ Фото модели не найдено: ${model.photo_path}`);
        }

        console.log(`📸 Отправка фото модели: ${model.name}`);

        const prevButton = userLanguage === 'ru' ? '⬅️ Предыдущая' :
                           userLanguage === 'pl' ? '⬅️ Poprzednia' :
                           '⬅️ Previous';

        const nextButton = userLanguage === 'ru' ? '➡️ Следующая' :
                           userLanguage === 'pl' ? '➡️ Następna' :
                           '➡️ Next';

        bot.sendPhoto(chatId, photo, {
            caption: message,
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: prevButton, callback_data: 'model_prev_filtered' },
                        { text: nextButton, callback_data: 'model_next_filtered' }
                    ]
                ]
            }
        });
    });
};


const handleFilteredModelNavigation = (bot, callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    getUser(chatId, (err, user) => {
        if (err || !user) {
            bot.sendMessage(chatId, '❌ Ошибка получения данных. Попробуйте позже.');
            return;
        }

        const userLanguage = user.language || 'en';
        const session = modelSessions[chatId];

        if (!session) {
            const noModelsMessage = userLanguage === 'ru' ? '❌ Нет доступных отфильтрованных моделей.' :
                                    userLanguage === 'pl' ? '❌ Brak dostępnych przefiltrowanych modeli.' :
                                    '❌ No filtered models available.';
            bot.sendMessage(chatId, noModelsMessage);
            return;
        }

        if (data === 'model_prev_filtered') {
            session.currentIndex = (session.currentIndex - 1 + session.models.length) % session.models.length;
        } else if (data === 'model_next_filtered') {
            if (session.currentIndex + 1 >= session.models.length) {
                const noMoreModelsMessage = userLanguage === 'ru' ? '⚠️ Нет больше моделей, соответствующих вашему фильтру.' :
                                            userLanguage === 'pl' ? '⚠️ Brak więcej modeli pasujących do twojego filtra.' :
                                            '⚠️ No more models matching your filter.';

                const changeFilterText = userLanguage === 'ru' ? '✏️ Изменить фильтры' :
                                         userLanguage === 'pl' ? '✏️ Zmień filtry' :
                                         '✏️ Change Filters';

                const viewAllText = userLanguage === 'ru' ? '📋 Просмотреть все модели' :
                                    userLanguage === 'pl' ? '📋 Zobacz wszystkie modele' :
                                    '📋 View All Models';

                bot.sendMessage(chatId, noMoreModelsMessage, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: changeFilterText, callback_data: 'update_filter' }],
                            [{ text: viewAllText, callback_data: 'choose_list' }]
                        ]
                    }
                });
                return;  // Прекращаем дальнейшее выполнение
            }

            session.currentIndex = (session.currentIndex + 1) % session.models.length;
        }

        showFilteredModel(bot, chatId);
        bot.answerCallbackQuery(callbackQuery.id);
    });
};



module.exports = {
    handleChooseModel,
    handleModelNavigation,
    getRandomModels,
    startModelFilter,
    processFilterSelection,
    sendUserFilterTemplate,
    showFilteredModel,
    findModelsByFilter,
    handleFilteredModelNavigation
};
 
