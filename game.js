document.addEventListener("DOMContentLoaded", function () {
    const game = new Phaser.Game({
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        scene: {
            preload: preload,
            create: create,
        }
    });

    let birthDate = "";
    let birthTime = "";
    let birthPlace = "";
    let currentLocation = "";
    let notifyTime = "";

    function preload() {
        this.load.image("bg", "assets/bg.png");
    }

    function create() {
        this.add.image(game.config.width / 2, game.config.height / 2, "bg")
            .setDisplaySize(game.config.width, game.config.height);

        const formContainer = document.createElement("div");
        formContainer.id = "form-container";

        formContainer.innerHTML = `
            <label>Дата рождения:</label>
            <input type="date" id="birthDate">
            
            <label>Время рождения:</label>
            <input type="time" id="birthTime">
            
            <label>Место рождения:</label>
            <input type="text" id="birthPlace" placeholder="Город, страна">
            
            <label>Ваше текущее местоположение:</label>
            <input type="text" id="currentLocation" placeholder="Определяется автоматически" disabled>
            
            <label>Удобное время уведомлений:</label>
            <input type="time" id="notifyTime">
            
            <button id="submitButton">Отправить</button>
        `;

        document.body.appendChild(formContainer);

        document.getElementById("submitButton").addEventListener("click", function () {
            birthDate = document.getElementById("birthDate").value;
            birthTime = document.getElementById("birthTime").value;
            birthPlace = document.getElementById("birthPlace").value;
            notifyTime = document.getElementById("notifyTime").value;

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    currentLocation = `${position.coords.latitude}, ${position.coords.longitude}`;
                    sendToTelegram();
                }, () => {
                    currentLocation = "Не удалось определить";
                    sendToTelegram();
                });
            } else {
                currentLocation = "Геолокация не поддерживается";
                sendToTelegram();
            }
        });
    }

    function sendToTelegram() {
        const data = { birthDate, birthTime, birthPlace, currentLocation, notifyTime };
        window.Telegram.WebApp.sendData(JSON.stringify(data));
        window.Telegram.WebApp.close();
    }
});