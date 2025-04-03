document.addEventListener("DOMContentLoaded", function () {
    const config = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        physics: { // Добавляем физику
            default: "arcade",
            arcade: {
                gravity: { y: 0 }
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        },
        scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        backgroundColor: "#000000"
    };

    const game = new Phaser.Game(config);

    let birthDate, birthTime, birthPlace, currentLocation, notifyTime;
    let inputs = {};
    let submitButton, errorText;

    function preload() {
        this.load.image("bg", "assets/bg.png");
        this.load.image("star", "assets/star.png");
        this.load.on("filecomplete", (key) => console.log(`Файл загружен: ${key}`));
        this.load.on("loaderror", (file) => console.error(`Ошибка загрузки: ${file.key}`));
    }

    function create() {
        // Фон
        const bg = this.add.image(game.config.width / 2, game.config.height / 2, "bg")
            .setDisplaySize(game.config.width, game.config.height);
        if (!this.textures.exists("bg")) {
            console.warn("Фон не загружен, используется запасной цвет");
        }

        // Текст заголовка
        this.add.text(game.config.width / 2, 50, "Введите данные", {
            fontSize: "24px",
            color: "#fff"
        }).setOrigin(0.5).setDepth(1);

        // Поля ввода
        inputs.birthDate = this.add.dom(game.config.width / 2, 150, "input", {
            type: "date",
            style: "width: 200px; padding: 5px; font-size: 16px; border-radius: 5px;"
        }).setDepth(1);
        inputs.birthTime = this.add.dom(game.config.width / 2, 220, "input", {
            type: "time",
            style: "width: 200px; padding: 5px; font-size: 16px; border-radius: 5px;"
        }).setDepth(1);
        inputs.birthPlace = this.add.dom(game.config.width / 2, 290, "input", {
            type: "text",
            placeholder: "Место рождения",
            style: "width: 200px; padding: 5px; font-size: 16px; border-radius: 5px;"
        }).setDepth(1).node;
        inputs.notifyTime = this.add.dom(game.config.width / 2, 430, "input", {
            type: "time",
            style: "width: 200px; padding: 5px; font-size: 16px; border-radius: 5px;"
        }).setDepth(1);
        inputs.currentLocation = this.add.dom(game.config.width / 2, 360, "input", {
            type: "text",
            placeholder: "Текущее местоположение",
            style: "width: 200px; padding: 5px; font-size: 16px; border-radius: 5px;"
        }).setVisible(false).setDepth(1).node;

        // Кнопка отправки
        submitButton = this.add.text(game.config.width / 2, 500, "Отправить", {
            fontSize: "24px",
            color: "#fff",
            backgroundColor: "#4CAF50",
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive()
            .on("pointerdown", submitData.bind(this))
            .on("pointerover", () => submitButton.setStyle({ backgroundColor: "#45a049" }))
            .on("pointerout", () => submitButton.setStyle({ backgroundColor: "#4CAF50" }))
            .setDepth(1);

        // Текст для ошибок
        errorText = this.add.text(game.config.width / 2, 550, "", {
            fontSize: "16px",
            color: "#ff0000"
        }).setOrigin(0.5).setVisible(false).setDepth(1);

        // Интерактивные звёзды
        const stars = this.physics.add.group();
        for (let i = 0; i < 5; i++) {
            stars.create(Math.random() * game.config.width, Math.random() * game.config.height, "star")
                .setScale(0.5).setVelocity(Math.random() * 100 - 50, Math.random() * 100 - 50)
                .setDepth(0);
        }

        // Автозаполнение
        setupAutocomplete(inputs.birthPlace, ["Москва, Россия", "Киев, Украина", "Минск, Беларусь"]);
        setupAutocomplete(inputs.currentLocation, ["Москва, Россия", "Киев, Украина", "Минск, Беларусь"]);

        // Геолокация
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    currentLocation = `${position.coords.latitude}, ${position.coords.longitude}`;
                },
                () => {
                    inputs.currentLocation.setVisible(true);
                }
            );
        } else {
            inputs.currentLocation.setVisible(true);
        }
    }

    function update() {}

    function submitData() {
        birthDate = inputs.birthDate.node.value;
        birthTime = inputs.birthTime.node.value;
        birthPlace = inputs.birthPlace.value;
        notifyTime = inputs.notifyTime.node.value;
        currentLocation = currentLocation || inputs.currentLocation.value;

        if (!birthDate || !birthTime || !birthPlace || !notifyTime || (!currentLocation && !inputs.currentLocation.visible)) {
            errorText.setText("Заполните все поля!").setVisible(true);
            return;
        }

        errorText.setVisible(false);
        const data = { birthDate, birthTime, birthPlace, currentLocation, notifyTime };
        window.Telegram.WebApp.sendData(JSON.stringify(data));
        window.Telegram.WebApp.close();
    }

    function setupAutocomplete(input, suggestions) {
        const datalist = document.createElement("datalist");
        datalist.id = input.id ? input.id + "_list" : "autocomplete_list_" + Math.random();
        suggestions.forEach(suggestion => {
            const option = document.createElement("option");
            option.value = suggestion;
            datalist.appendChild(option);
        });
        document.body.appendChild(datalist);
        input.setAttribute("list", datalist.id);
    }
});