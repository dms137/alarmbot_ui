// Перевіряємо, чи Telegram Web App ініціалізовано
if (window.Telegram && window.Telegram.WebApp) {
    const webApp = window.Telegram.WebApp;
    webApp.ready();

    // Задаємо колір фону, щоб він відповідав темі Telegram
    document.body.style.backgroundColor = webApp.themeParams.bg_color || '#f0f0f0';
    document.body.style.color = webApp.themeParams.text_color || '#333';

 // Додаткова перевірка наявності даних про користувача
 if (webApp.initDataUnsafe && webApp.initDataUnsafe.user) {
    // Ми будемо використовувати MainButton, щоб ініціювати відправку даних
    if (webApp.MainButton) {
        webApp.MainButton.text = "Відправити запит";
        webApp.MainButton.show();
        
        webApp.MainButton.onClick(async () => {
            // Ховаємо кнопку, щоб уникнути повторних натискань
            webApp.MainButton.hide(); 
            
            // Вмикаємо індикатор завантаження
            webApp.MainButton.showProgress();

            try {
                const userId = webApp.initDataUnsafe.user.id;
                const requestData = {
                    action: "check_user_role",
                    userId: userId
                };
                const responseData = await sendDataToBot(requestData);
                
                if (responseData.role === 'admin') {
                    renderAdminPanel(responseData);
                } else {
                    renderUserPanel();
                }
            } catch (error) {
                console.error('Error fetching data from bot:', error);
                document.body.innerHTML = `
                    <h1>Помилка підключення</h1>
                    <p>Наразі бот не працює. Спробуйте пізніше або зв'яжіться з адміністратором.</p>
                    <p>Деталі помилки: ${error.message}</p>
                `;
            } finally {
                // Вимикаємо індикатор завантаження
                webApp.MainButton.hideProgress();
            }
        });
    }
} else {
    document.body.innerHTML = `
        <h1>Помилка</h1>
        <p>Не вдалося отримати дані про користувача. Переконайтеся, що ви відкрили додаток зсередини Telegram.</p>
    `;
}
} else {
document.body.innerHTML = `
    <h1>Помилка</h1>
    <p>Цей додаток призначений для запуску в Telegram Web App.</p>
`;
}

// Функція для завантаження даних та рендерингу
async function loadAndRenderContent() {
    const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
    const requestData = {
        action: "check_user_role",
        userId: userId
    };

    try {
        // Відправляємо запит на бекенд і очікуємо відповідь.
        // Ми використаємо нову, доопрацьовану функцію sendDataToBot
        const responseData = await sendDataToBot(requestData);

        // Перевіряємо роль і малюємо інтерфейс
        if (responseData.role === 'admin') {
            renderAdminPanel(responseData);
        } else {
            renderUserPanel();
        }

    } catch (error) {
        console.error('Error fetching data from bot:', error);
        // Повідомляємо користувача про помилку
        document.body.innerHTML = `
            <h1>Помилка підключення</h1>
            <p>Наразі бот не працює. Спробуйте пізніше або зв'яжіться з адміністратором.</p>
            <p>Деталі помилки: ${error.message}</p>
        `;
    }
}

// Функція для відправки даних боту з обробкою відповіді
function sendDataToBot(data) {
    return new Promise((resolve, reject) => {
        // Додаємо префікс "webapp_data " до JSON-рядка
        const requestString = "webapp_data " + JSON.stringify(data);
        window.Telegram.WebApp.sendData(requestString);

        // Встановлюємо тайм-аут для очікування відповіді
        const timeout = setTimeout(() => {
            window.Telegram.WebApp.offEvent('onEvent', onEventCallback);
            reject(new Error("Не отримано відповідь від бота."));
        }, 15000); // 15 секунд

        // Ця функція буде викликана, коли бот надішле відповідь
        const onEventCallback = (eventName) => {
            if (eventName === 'onSendData') {
                // Telegram Web App API не надає прямого способу отримати відповідь.
                // Зазвичай, бекенд бота надсилає повідомлення назад користувачеві.
                // Для нашої моделі, ми будемо вважати, що отримали відповідь.
                // Ми виправимо це на наступному кроці, коли будемо писати бекенд.
                clearTimeout(timeout);
                // Тимчасова заглушка для успішного сценарію
                resolve({ role: 'admin' });
            }
        };

        // Підписуємося на події Telegram Web App
        window.Telegram.WebApp.onEvent('onEvent', onEventCallback);
    });
}

// Функція для рендерингу адмін-панелі
function renderAdminPanel(data) {
    document.body.innerHTML = `
        <h1>Адмін-панель</h1>
        <p>Ваша роль: Адміністратор</p>
        
        <hr>
        
        <h2>Налаштування користувача</h2>
        <p>Керуйте своїми особистими налаштуваннями, як звичайний користувач.</p>
        <button onclick="handleUserAction('set_location')">Оновити локацію</button>
        <button onclick="handleUserAction('unsubscribe')">Відписатися</button>

        <hr>

        <h2>Адміністративні функції</h2>
        <p>Керування системою.</p>
        <button onclick="handleAdminAction('get_unverified_locations')">Отримати неперевірені локації</button>
        <button onclick="handleAdminAction('get_all_users')">Список користувачів</button>

        <div id="results"></div>
    `;
}

// Функція для рендерингу панелі звичайного користувача
function renderUserPanel() {
    document.body.innerHTML = `
        <h1>Панель користувача</h1>
        <p>Вітаємо! Керуйте своїми налаштуваннями:</p>
        <button onclick="handleUserAction('set_location')">Оновити локацію</button>
        <button onclick="handleUserAction('unsubscribe')">Відписатися</button>
    `;
}

// Обробник для дій користувача
function handleUserAction(action) {
    alert(`Користувацька дія: ${action}. Реалізуємо на наступних кроках.`);
}

// Обробник для дій адміністратора
function handleAdminAction(action) {
    alert(`Адміністративна дія: ${action}. Реалізуємо на наступних кроках.`);
}