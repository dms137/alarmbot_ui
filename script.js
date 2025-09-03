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
            webApp.MainButton.text = "Відкрити панель";
            webApp.MainButton.show();

            webApp.MainButton.onClick(async () => {
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
                        renderAdminPanel();
                    } else {
                        renderUserPanel();
                    }
                } catch (error) {
                    console.error('Error:', error);
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

// Функція для відправки даних боту з обробкою відповіді
function sendDataToBot(data) {
    return new Promise((resolve, reject) => {
        // Додаємо префікс "webapp_data " до JSON-рядка
        const requestString = "webapp_data " + JSON.stringify(data);
        window.Telegram.WebApp.sendData(requestString);

        // Ця частина є "заглушкою" у поточній реалізації, бо ми не можемо прямо
        // перехопити відповідь від бота. Відповідь надходить як звичайне текстове
        // повідомлення.
        // Тому ми просто "успішно" завершуємо цю функцію, а користувач
        // отримає сповіщення від бота.
        
        // Тут ми імітуємо отримання успішної відповіді.
        // Це дозволить вам зараз тестувати UI.
        resolve({ role: 'admin' });
    });
}


// Функція для рендерингу адмін-панелі
function renderAdminPanel() {
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