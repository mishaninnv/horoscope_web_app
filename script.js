document.addEventListener("DOMContentLoaded", function () {
    const cityInput = document.getElementById("city");
    const suggestionsBox = document.getElementById("suggestions");
    let userCountry = null; // Будем хранить страну пользователя

    // Определяем страну пользователя
    fetch("https://ipapi.co/json/")
        .then(response => response.json())
        .then(data => {
            userCountry = data.country_code;
        })
        .catch(error => console.error("Не удалось определить страну:", error));

    cityInput.addEventListener("input", function () {
        const query = cityInput.value.trim();
        if (query.length < 3) {
            suggestionsBox.classList.add("hidden");
            return;
        }

        // Делаем запрос к OpenStreetMap с приоритетом страны пользователя
        let url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=10&q=${query}`;
        if (userCountry) {
            url += `&countrycodes=${userCountry}`;
        }

        fetch(url)
            .then(response => response.json())
            .then(data => {
                suggestionsBox.innerHTML = "";
                if (data.length === 0) {
                    suggestionsBox.classList.add("hidden");
                    return;
                }

                data.forEach(location => {
                    const li = document.createElement("li");
                    li.textContent = location.display_name;
                    li.addEventListener("click", () => {
                        cityInput.value = location.display_name;
                        suggestionsBox.classList.add("hidden");
                    });
                    suggestionsBox.appendChild(li);
                });

                suggestionsBox.classList.remove("hidden");
            })
            .catch(error => {
                console.error("Ошибка при получении городов:", error);
                suggestionsBox.classList.add("hidden");
            });
    });

    document.getElementById("submitButton").addEventListener("click", function () {
        const birthDate = document.getElementById("birthDate").value;
        const birthTime = document.getElementById("birthTime").value;
        const city = document.getElementById("city").value;
        const notifyTime = document.getElementById("notifyTime").value;

        const data = { birthDate, birthTime, city, notifyTime };
        window.Telegram.WebApp.sendData(JSON.stringify(data));
        window.Telegram.WebApp.close();
    });
});