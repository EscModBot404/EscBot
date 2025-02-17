require('dotenv').config(); // Загрузка переменных из .env
const fs = require('fs');
const Telegram_Api = require('node-telegram-bot-api');
const { ensureUserExists, updateUser, getUser,getUserFilter } = require('./User_db');
const { handleChooseModel, handleModelNavigation } = require('./chooseModel');
const { getRandomModels } = require('./chooseModel');
const { startModelFilter, processFilterSelection,sendUserFilterTemplate } = require('./chooseModel');
const { findModelsByFilter,handleFilteredModelNavigation} = require('./chooseModel');
const { userInfo } = require('os');
const token = process.env.TELEGRAM_TOKEN;
const bot = new Telegram_Api(token, { polling: true });


const getUserLanguage = (chatId, callback) => {
    getUser(chatId, (err, user) => {
        if (err || !user) {
            callback('en'); // Дефолтный язык - английский
        } else {
            callback(user.language || 'en');
        }
    });
};

bot.setMyCommands([
    
    { command: '/manager',description: 'Communicate with our manager'},
    { command: '/myinfo', description: 'View/change info about you' },
    { command: '/choosemodel', description: 'Choose a model' },
    { command: '/changelocation', description: 'Change your location' },
    { command: '/changelanguage', description: 'Change your language' },
    { command: '/start', description: 'Start interacting with the bot' },
]);
 
const pause = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
};
 
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    ensureUserExists(chatId);
    getUser(chatId, (err, user) => {
        if (err || !user) {
            bot.sendMessage(chatId, '❌ Ошибка при получении данных. Попробуйте позже.');
            return;
        }

        const userLanguage = user.language || 'en';

        if (user.step === 'name') {
            updateUser(chatId, 'name', text);
            updateUser(chatId, 'step', 'age');
            const askAge = userLanguage === 'ru' ? 'Сколько вам лет?' : userLanguage === 'pl' ? 'Ile masz lat?' : 'How old are you?';
            bot.sendMessage(chatId, askAge);
        } else if (user.step === 'age') {
            const age = parseInt(text, 10);
            if (isNaN(age) || age <= 0) {
               
                return;
            }
            updateUser(chatId, 'age', age);
            updateUser(chatId, 'step', 'location');
            const askLocation = userLanguage === 'ru' ? 'Где вы находитесь?' : userLanguage === 'pl' ? 'Gdzie jesteś?' : 'Where are you located?';
            bot.sendMessage(chatId, askLocation, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Warsaw', callback_data: 'location_Warsaw' }],
                        [{ text: 'Dubai', callback_data: 'location_Dubai' }],
                        [{ text: 'Milan', callback_data: 'location_Milan' }],
                    ]
                }
            });
        } else {
            return;
        }
    });
    getUserLanguage(chatId, async (userLanguage) => {
        let response;

        switch (text) {
            case '/start':
                response = userLanguage === 'ru' ? 'Привет! Как дела?' :
                           userLanguage === 'pl' ? 'Cześć! Jak się masz?' :
                           'Hello! How are you?';
                break;
            case '/myinfo':
                getUser(chatId, (err, row) => {
                    if (err) {
                        const errorMessage = userLanguage === 'ru' ? 'Произошла ошибка. Повторите позже.' :
                                             userLanguage === 'pl' ? 'Wystąpił błąd. Spróbuj ponownie później.' :
                                             'An error occurred. Please try again later.';
                        bot.sendMessage(chatId, errorMessage);
                        return;
                    }
                
                    const infoTitle = userLanguage === 'ru' ? 'Ваша информация' :
                                      userLanguage === 'pl' ? 'Twoje informacje' :
                                      'Your information';
                
                    const nameLabel = userLanguage === 'ru' ? 'Имя' :
                                      userLanguage === 'pl' ? 'Imię' :
                                      'Name';
                
                    const ageLabel = userLanguage === 'ru' ? 'Возраст' :
                                     userLanguage === 'pl' ? 'Wiek' :
                                     'Age';
                
                    const locationLabel = userLanguage === 'ru' ? 'Город' :
                                          userLanguage === 'pl' ? 'Miasto' :
                                          'Location';
                
                    const languageLabel = userLanguage === 'ru' ? 'Язык' :
                                          userLanguage === 'pl' ? 'Język' :
                                          'Language';
                
                    let response = `
                <b>${infoTitle}:</b>
                <b>${nameLabel}:</b> ${row.name || '-'}
                <b>${ageLabel}:</b> ${row.age || '-'}
                <b>${locationLabel}:</b> ${row.location || '-'}
                <b>${languageLabel}:</b> ${row.language || '-'}
                    `;
                
                    const updateButtonText = userLanguage === 'ru' ? 'Обновить информацию' :
                                             userLanguage === 'pl' ? 'Zaktualizuj informacje' :
                                             'Update Info';
                
                    bot.sendMessage(chatId, response, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: updateButtonText, callback_data: 'edit_info' }]
                            ]
                        }
                    });
                });
                
                return;
            case '/choosemodel':
                response = userLanguage === 'ru' ? 'Выберите способ выбора модели:' :
                userLanguage === 'pl' ? 'Wybierz metodę wyboru modelki:' :
                'Choose a model selection method:';
 
     const modelListText = userLanguage === 'ru' ? 'Список моделей' :
                           userLanguage === 'pl' ? 'Lista modelek' :
                           'Model List';
 
     const randomSelectionText = userLanguage === 'ru' ? 'Случайный выбор' :
                                 userLanguage === 'pl' ? 'Losowy wybór' :
                                 'Random Selection';
 
     const filterSelectionText = userLanguage === 'ru' ? 'Выбор по фильтру' :
                                 userLanguage === 'pl' ? 'Wybór według filtra' :
                                 'Filter Selection';
 
     bot.sendMessage(chatId, response, {
         reply_markup: {
             inline_keyboard: [
                 [{ text: modelListText, callback_data: 'choose_list' }],
                 [{ text: randomSelectionText, callback_data: 'choose_random' }],
                 [{ text: filterSelectionText, callback_data: 'choose_filter' }]
             ]
         }
     });
                return;
            case '/changelocation':
                response = userLanguage === 'ru' ? 'Выберите новый город:' :
                           userLanguage === 'pl' ? 'Wybierz nowe miasto:' :
                           'Please choose your new location:';
                bot.sendMessage(chatId, response, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Warsaw', callback_data: 'location_Warsaw' }],
                            [{ text: 'Dubai', callback_data: 'location_Dubai' }],
                            [{ text: 'Milan', callback_data: 'location_Milan' }],
                        ]
                    }
                });
                return;
            case '/changelanguage':
                response = userLanguage === 'ru' ? '🌍 На каком языке вы говорите?' :
                           userLanguage === 'pl' ? '🌍 Jaki język preferujesz?' :
                           '🌍 What language do you speak?';
                bot.sendMessage(chatId, response, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Русский', callback_data: 'language_ru' }],
                            [{ text: 'English', callback_data: 'language_en' }],
                            [{ text: 'Polski', callback_data: 'language_pl' }],
                        ]
                    }
                });
                return;
            case '/manager':
                response = userLanguage === 'ru' ? 'Скоро' :
                           userLanguage === 'pl' ? 'Wkrótce' :
                           'Soon';
                break;
            default:
                 return;
        }
        bot.sendMessage(chatId, response);
    });
});


bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    console.log(`Callback received: ${data}`);

    getUser(chatId, async (err, user) => {
        const userLanguage = user?.language || 'en';

        if (data.startsWith('location_')) {
            const location = data.split('_')[1];
            updateUser(chatId, 'location', location);
            updateUser(chatId, 'step', 'language');

            const locationMessage = userLanguage === 'ru' ? `Ваше местоположение обновлено: ${location}` :
                                    userLanguage === 'pl' ? `Twoja lokalizacja została zaktualizowana: ${location}` :
                                    `Your location has been updated to: ${location}`;
            
            await bot.sendMessage(chatId, locationMessage);
            
            const languageMessage = userLanguage === 'ru' ? '🌍 На каком языке вы говорите?' :
                                    userLanguage === 'pl' ? '🌍 Jaki język preferujesz?' :
                                    '🌍 What language do you speak?';
            
            await bot.sendMessage(chatId, languageMessage, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Русский', callback_data: 'language_ru' }],
                        [{ text: 'English', callback_data: 'language_en' }],
                        [{ text: 'Polski', callback_data: 'language_pl' }]
                    ]
                }
            });
        } else if (data.startsWith('language_')) {
            const languageMap = {
                language_ru: 'ru',
                language_en: 'en',
                language_pl: 'pl'
            };

            const language = languageMap[data] || 'en';  // По умолчанию английский

            updateUser(chatId, 'language', language);
            updateUser(chatId, 'step', null);
            console.log(`Language updated in DB for ${chatId}: ${language}`);

            const message = language === 'ru' ? '✅ Язык обновлен на: Русский' :
                            language === 'pl' ? '✅ Zaktualizowano język na: Polski' :
                            '✅ Language updated to: English';

            bot.sendMessage(chatId, message);
        } else if (data === 'edit_info') {
            updateUser(chatId, 'step', 'name');
            bot.sendMessage(chatId, userLanguage === 'ru' ? 'Пожалуйста, введите ваше имя:' : userLanguage === 'pl' ? 'Podaj swoje imię:' : 'Please provide your name:');
        } else if (data === 'choose_list') {
            handleChooseModel(bot, chatId);
        } else if (data === 'model_prev' || data === 'model_next') {
            handleModelNavigation(bot, callbackQuery);
        }else if (data === 'choose_random') {
            getRandomModels(bot, chatId);
            await pause(5000);
            response = userLanguage === 'ru' ? 'Выберите способ выбора модели:' :
            userLanguage === 'pl' ? 'Wybierz metodę wyboru modelki:' :
            'Choose a model selection method:';

 const modelListText = userLanguage === 'ru' ? 'Список моделей' :
                       userLanguage === 'pl' ? 'Lista modelek' :
                       'Model List';

 const randomSelectionText = userLanguage === 'ru' ? 'Случайный выбор' :
                             userLanguage === 'pl' ? 'Losowy wybór' :
                             'Random Selection';

 const filterSelectionText = userLanguage === 'ru' ? 'Выбор по фильтру' :
                             userLanguage === 'pl' ? 'Wybór według filtra' :
                             'Filter Selection';

 bot.sendMessage(chatId, response, {
     reply_markup: {
         inline_keyboard: [
             [{ text: modelListText, callback_data: 'choose_list' }],
             [{ text: randomSelectionText, callback_data: 'choose_random' }],
             [{ text: filterSelectionText, callback_data: 'choose_filter' }]
         ]
     }
 });
            
            
        } else if (data === 'choose_filter' || data === 'filter_completed') {
            sendUserFilterTemplate(bot, chatId);
        } else if (data === 'apply_filter') {
            getUserFilter(chatId, (err, filter) => {
                if (err || !filter || filter.height === '—') {
                    const noFilterMessage = userLanguage === 'ru' ? '❌ У вас нет сохраненного фильтра. Сначала создайте его.' :
                                            userLanguage === 'pl' ? '❌ Nie masz zapisanego filtra. Najpierw go utwórz.' :
                                            '❌ You have no saved filter. Please create one first.';
                    bot.sendMessage(chatId, noFilterMessage);
                } else {
                    console.log(`Фильтр найден, начинаем поиск моделей:`, filter);
                    findModelsByFilter(bot, chatId, filter);
                }
            });
        } else if (data === 'model_prev_filtered' || data === 'model_next_filtered') {
            handleFilteredModelNavigation(bot, callbackQuery);
        }else if (data === 'update_filter' || data === 'create_new_filter') {
            startModelFilter(bot, chatId);
        } else {
            processFilterSelection(bot, callbackQuery);
        }

        bot.answerCallbackQuery(callbackQuery.id);
    });
});


console.log('Bot is running...');



