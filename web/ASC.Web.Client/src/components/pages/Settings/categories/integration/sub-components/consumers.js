export const consumers = [
    {
        name: "Amazon",
        description: "Подключите Amazon AWS S3 для резервного копирования и хранения данных портала.",
        innerDescription: "Добавив Amazon AWS S3, вы сможете использовать его для создания резервных копий портала, чтобы предотвратить потерю данных. Также используйте его для хранения данных и статического содержимого портала.",
        tokens: ["Ключ доступа S3", "Секретный ключ доступа S3"]
    },
    {
        name: "Mail.ru",
        description: "Подключите приложение для входа на портал по учетной записи Mail.ru.",
        innerDescription: "Добавив приложение сервиса Mail.ru Вы сможете на странице своего профиля подключить вход на портал используя аккаунт Mail.ru.",
        tokens: ["ID", "Секретный ключ"]
    },
    {
        name: "Telegram",
        description: "Подключите аккаунт Telegram для получения оповещений портала через Telegram.",
        innerDescription: "",
        tokens: ["Токен бота", "Имя бота"]
    }
]