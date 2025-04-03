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
    let country = "";
    let region = "";
    let city = "";
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

            <label>Страна рождения:</label>
            <input type="text" id="country" placeholder="Начните вводить страну..." oninput="searchLocation(this.value, 'country')">
            <ul id="country-results"></ul>

            <div id="region-container" style="display: none;">
                <label>Регион:</label>
                <input type="text" id="region" placeholder="Выберите регион" oninput="searchLocation(this.value, 'region')">
                <ul id="region-results"></ul>
            </div>

            <div id="city-container" style="display: none;">
                <label>Город:</label>
                <input type="text" id="city" placeholder="Выберите город" oninput="searchLocation(this.value, 'city')">
                <ul id="city-results"></ul>
            </div>

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
            country = document.getElementById("country").value;
            region = document.getElementById("region").value;
            city = document.getElementById("city").value;
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
        const data = { birthDate, birthTime, country, region, city, currentLocation, notifyTime };
        window.Telegram.WebApp.sendData(JSON.stringify(data));
        window.Telegram.WebApp.close();
    }
});

// Универсальный поиск для стран, регионов и городов
function searchLocation(query, type) {
    if (query.length < 3) return;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
        .then(response => response.json())
        .then(data => {
            const resultsContainer = document.getElementById(`${type}-results`);
            resultsContainer.innerHTML = "";

            data.forEach(location => {
                const li = document.createElement("li");
                li.textContent = location.display_name;
                li.addEventListener("click", () => {
                    document.getElementById(type).value = location.display_name;
                    resultsContainer.innerHTML = ""; // Закрываем выпадающий список

                    // Показываем следующие поля
                    if (type === "country") {
                        document.getElementById("region-container").style.display = "block";
                        document.getElementById("region").value = "";
                        document.getElementById("city-container").style.display = "none";
                    }
                    if (type === "region") {
                        document.getElementById("city-container").style.display = "block";
                        document.getElementById("city").value = "";
                    }
                });
                resultsContainer.appendChild(li);
            });
        });
}