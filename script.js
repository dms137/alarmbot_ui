// Перевіряємо, чи Telegram Web App ініціалізовано
if (window.Telegram && window.Telegram.WebApp) {
    // Встановлюємо тему оформлення, щоб вона відповідала месенджеру
    document.body.style.backgroundColor = window.Telegram.WebApp.backgroundColor;

    // Показуємо всі дані, які Telegram передав додатку
    const telegramData = window.Telegram.WebApp.initDataUnsafe;
    document.getElementById('telegramData').textContent = JSON.stringify(telegramData, null, 2);
} else {
    // Якщо додаток запущено не з Telegram, виводимо повідомлення
    document.getElementById('telegramData').textContent = "Цей додаток призначений для запуску в Telegram Web App.";
}