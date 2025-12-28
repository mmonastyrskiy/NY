// Переменные приложения
let prizes = {};
let userSpins = 100000;
let userPrizes = [];
let isSpinning = false;
let wheelAngle = 0;
let wheelCanvas;
let wheelCtx;


// Расширенный список забавных имен (можно добавить больше)
const DISPLAY_NAMES = {
    // Призы из стандартного lottery.json

    "Мыло": "🧼 Снежный аромат чистоты (с ним даже грязь в праздник уходит)",
    "Крем для лица Чистая Линия": "❄️ Эликсир 'Морозная свежесть' для сияния как у Снегурочки",
    "Зубочистки": "🦷 Волшебные палочки для новогоднего пиршества",
    "Салфетки Влажные (детские)": "👶 Салфетки 'Анти-оливье' для самых маленьких гостей",
    "Крем для Лица Невская Косметика": "✨ Крем 'Зимнее сияние' от русской зимы",
    "Хлопушка": "🎉 Карнавальный выстрел радости (безопасный фейерверк)",
    "Мочалка": "🛁 Щётка для снежного человека (смывает старый год)",
    "Зубная паста Colgate Детская": "🦷 Паста 'Смех до слёз' (мятно-новогодняя)",
    "Набор наклеек Одень Девочку": "👗 Дизайнерский проект 'Наряди Снегурочку'",
    "Набор наклеек Сердечки": "💝 Сердечки 'Тёплые объятия' (клеятся на всё, что любишь)",
    "Брелок": "🔑 Хранитель ключей от новогоднего настроения",
    "Брошь": "🎀 Мини-украшение для праздничного настроения",
    "Значок Елочка": "🎄 Ёлка, которая всегда с тобой (даже летом)",
    "Серьги длинные новогодние": "✨ Сосульки-бриллианты для новогоднего бала",
    "Серьги гвоздики": "🔴 Ягодки рябины для морозного образа",
    "Браслеты": "💫 Магические обручи исполнения желаний",
    "Наклейки Машинки": "🚗 Гонки 'Деда Мороза против Снеговика'"

    
};

// ========== FUNNY_DISPLAY_NAMES - общий пул забавных имен ==========
const FUNNY_DISPLAY_NAMES = [
    "🚗 Порше Кайен (игрушечный)",
    "🏝️ Остров в океане (на карте)",
    "👑 Титул 'Король вечеринки'",
    "🎭 Роль в блокбастере (в массовке)",
    "🏆 Кубок чемпиона (из фольги)",
    "🤝 Рукопожатие президента",
    "🌕 Участок на Луне",
    "🎂 Торт размером с вас",
    "🏰 Замок в Шотландии",
    "🦄 Личный единорог",
    "⚡ Суперсила на день",
    "🧠 Гениальная идея",
    "🏅 Медаль героя",
    "🍫 Бесконечная шоколадка",
    "🕰️ Машина времени",
    "🎨 Картина гения",
    "🤖 Робот-помощник",
    "🚀 Полет в космос",
    "👽 Встреча с пришельцем",
    "🧚‍♀️ Исполнение желания",
    "🏖️ Отпуск на райском острове",
    "🥇 Золотая медаль",
    "🎸 Легендарная гитара",
    "👑 Корона монарха",
    "🏆 Кубок мира",
    "🛸 Собственное НЛО",
    "🍔 Бургер на 100 лет",
    "🌟 Звезда в небе",
    "🦸‍♂️ Плащ супергероя",
    "🏰 Ключи от города",
    "🎭 Главная роль в жизни",
    "🚁 Личный вертолет",
    "🎪 Цирк у вас дома",
    "🛌 Право на лень",
    "🧙‍♂️ Волшебная палочка",
    "🎮 Консоль будущего",
    "🍕 Пицца с золотом",
    "🧸 Волшебный медведь",
    "🎁 Сюрприз от Деда Мороза",
    "🎉 Право на праздник",
    "👑 Дворец из сладостей",
    "🚤 Личная яхта",
    "🦄 Скачки на единороге",
    "🎬 Голливудская карьера",
    "🎄 Живая новогодняя ёлка",
    "🎅 Персональный Дед Мороз",
    "❄️ Снег по заказу",
    "🦌 Сани с оленями",
    "🎆 Фейерверк имени вас",
    "🍾 Шампанское удачи",
    "🧦 Волшебный носок",
    "🔔 Колокольчик счастья",
    "🌟 Вифлеемская звезда",
    "🎁 Тайный подарок судьбы",
    "🐉 Дракон для охраны сокровищ",
    "🏹 Лук, стреляющий конфетами",
    "🛡️ Щит от понедельников",
    "🗡️ Меч-кладенец (пластиковый)",
    "🏰 Разрешение на строительство замка из песка",
    "🎪 Билет в детство (туда и обратно)",
    "🚂 Паровозик из Ромашково (игрушечный)",
    "🌌 Галактика в банке (светящаяся)",
    "🧊 Вечный лед (из холодильника)",
    "🔥 Огонь Прометея (зажигалка)",
    "💧 Вода из источника молодости (минералка)",
    "🌪️ Торнадо в бутылке",
    "🌈 Радуга в кармане (призматическая пленка)",
    "☁️ Облако для мечтаний (наполнитель для подушек)",
    "⭐ Падающая звезда для загадывания желаний",
    "🌙 Лунный камень (с пляжа)",
    "☀️ Лучи солнца в коробочке (лампа)",
    "❄️ Снежинка уникальной формы (пластиковая)",
    "💨 Ветер перемен (вентилятор)",
    "🌊 Волна вдохновения (акварельная краска)",
    "🔥 Искра гениальности (бенгальский огонь)",
    "🎪 Бродячий цирк в кармане",
    "🏰 Собственный замок (в Minecraft)",
    "🦄 Единорог для прогулок по радуге",
    "⚡ Молния в банке (не открывать)",
    "🧠 Мысли великих людей (в книге)",
    "🏅 Орден 'За победу над скукой'",
    "🍫 Шоколадный фонтан (миниатюрный)",
    "🕰️ Часы, которые идут назад (иногда)",
    "🎨 Шедевр искусства (раскраска)",
    "🤖 Личный ассистент (будильник)",
    "🚀 Билет на Марс (в один конец)",
    "👽 Зеленый друг для чаепитий",
    "🧚‍♀️ Пыльца фей для исполнения мечты",
    "🏖️ Песочные часы с пляжным песком",
    "🥇 Медаль 'Олимпийского чемпиона по дивану'",
    "🎸 Гитара, на которой играет ветер",
    "👑 Скипетр и держава (пластиковые)",
    "🏆 Приз зрительских симпатий",
    "🛸 Тарелка для полетов (обеденная)",
    "🍔 Пожизненная карта в фастфуд",
    "🌟 Созвездие в вашу честь (в приложении)",
    "🦸‍♂️ Костюм супергероя (пижама)",
    "🏰 Диплом 'Почетный гражданин Сказкограда'",
    "🎭 Билет в лучшую жизнь (метафорический)",
    "🚁 Воздушное такси (воздушный шар)"
];

// DOM элементы
const wheelCanvasElement = document.getElementById('wheelCanvas');
const spinButton = document.getElementById('spinButton');
const spinCountElement = document.getElementById('spinCount');
const userPrizesElement = document.getElementById('userPrizes');
const prizesGridElement = document.getElementById('prizesGrid');
const totalPrizesElement = document.getElementById('totalPrizes');
const totalSpinsElement = document.getElementById('totalSpins');
const totalWinnersElement = document.getElementById('totalWinners');
const remainingPrizesElement = document.getElementById('remainingPrizes');
const lastWinElement = document.getElementById('lastWin');
const prizeModal = document.getElementById('prizeModal');
const noSpinsModal = document.getElementById('noSpinsModal');
const prizeResultElement = document.getElementById('prizeResult');
const closeModalBtn = document.getElementById('closeModalBtn');
const closeNoSpinsBtn = document.getElementById('closeNoSpinsBtn');
const closeModal = document.getElementById('closeModal');
const closeNoSpinsModal = document.getElementById('closeNoSpinsModal');
const sharePrizeBtn = document.getElementById('sharePrize');
const toggleAdminBtn = document.getElementById('toggleAdmin');
const adminSection = document.querySelector('.admin-section');
const resetLotteryBtn = document.getElementById('resetLottery');
const addPrizeBtn = document.getElementById('addPrize');
const adminPasswordInput = document.getElementById('adminPassword');
const newPrizeNameInput = document.getElementById('newPrizeName');
const newPrizeCountInput = document.getElementById('newPrizeCount');

// Цвета для секторов колеса
const WHEEL_COLORS = [
    '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2',
    '#22a2ccff', '#EF476F', '#FFD166', '#06D6A0', '#118AB2',
    '#FF6B6B', '#4ECDC4', '#EF476F', '#22a2ccff'
];

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    createSnowflakes(50);
    initializeWheel();
    initializeAudio();
    loadPrizes();
    loadStats();
    loadUserData();
    setupEventListeners();
});


function getDisplayName(realPrize) {
    // Сначала проверяем мэппинг из DISPLAY_NAMES
    if (DISPLAY_NAMES[realPrize]) {
        return DISPLAY_NAMES[realPrize];
    }
    
    // Если нет в мэппинге, берем случайное забавное имя
    const randomIndex = Math.floor(Math.random() * FUNNY_DISPLAY_NAMES.length);
    return FUNNY_DISPLAY_NAMES[randomIndex];
}
function getDisplayNameForWheel(realPrize, index) {
    // Для колеса используем либо мэппинг, либо забавные имена по кругу
    if (DISPLAY_NAMES[realPrize]) {
        return DISPLAY_NAMES[realPrize];
    }
    console.log("Используем выдуманный приз");
    // Используем индекс для равномерного распределения
    const displayIndex = index % FUNNY_DISPLAY_NAMES.length;
    return FUNNY_DISPLAY_NAMES[displayIndex];
}


// Создание снежинок
function createSnowflakes(count) {
    const snowflakesContainer = document.querySelector('.snowflakes');
    if (!snowflakesContainer) return;
    
    for (let i = 0; i < count; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        
        const size = Math.random() * 10 + 5;
        const startX = Math.random() * 100;
        const duration = Math.random() * 10 + 10;
        const delay = Math.random() * 5;
        
        snowflake.style.width = `${size}px`;
        snowflake.style.height = `${size}px`;
        snowflake.style.left = `${startX}vw`;
        snowflake.style.top = '-20px';
        snowflake.style.opacity = Math.random() * 0.5 + 0.3;
        
        snowflake.animate([
            { transform: 'translateY(0) rotate(0deg)', opacity: snowflake.style.opacity },
            { transform: `translateY(100vh) rotate(${360 * 3}deg)`, opacity: 0.1 }
        ], {
            duration: duration * 1000,
            delay: delay * 1000,
            iterations: Infinity
        });
        
        snowflakesContainer.appendChild(snowflake);
    }
}

// Инициализация колеса
function initializeWheel() {
    if (!wheelCanvasElement) return;
    
    wheelCanvas = wheelCanvasElement;
    wheelCtx = wheelCanvas.getContext('2d');
    
    // Устанавливаем размеры canvas
    const dpi = window.devicePixelRatio;
    const style = getComputedStyle(wheelCanvas);
    
    wheelCanvas.width = parseInt(style.width) * dpi;
    wheelCanvas.height = parseInt(style.height) * dpi;
    wheelCtx.scale(dpi, dpi);
    
    // Рисуем начальное колесо
    drawWheel();
}

// Рисование колеса
function drawWheel() {
    if (!wheelCtx) return;
    
    const centerX = wheelCanvas.width / (2 * window.devicePixelRatio);
    const centerY = wheelCanvas.height / (2 * window.devicePixelRatio);
    const radius = Math.min(centerX, centerY) - 20;
    
    // Очищаем canvas
    wheelCtx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
    
    // Поворачиваем контекст
    wheelCtx.save();
    wheelCtx.translate(centerX, centerY);
    wheelCtx.rotate(wheelAngle * Math.PI / 180);
    wheelCtx.translate(-centerX, -centerY);
    
    // Рисуем сектора
    const prizeList = Object.keys(prizes);
    const totalPrizes = Object.values(prizes).reduce((a, b) => a + b, 0);
    const anglePerSection = 360 / Math.max(prizeList.length, 12);
    
    for (let i = 0; i < Math.max(prizeList.length, 12); i++) {
        const startAngle = i * anglePerSection;
        const endAngle = (i + 1) * anglePerSection;
        
        // Выбираем цвет
        const colorIndex = i % WHEEL_COLORS.length;
        
        // Рисуем сектор
        wheelCtx.beginPath();
        wheelCtx.moveTo(centerX, centerY);
        wheelCtx.arc(centerX, centerY, radius, 
                     startAngle * Math.PI / 180, 
                     endAngle * Math.PI / 180);
        wheelCtx.closePath();
        
        // Заливка
        wheelCtx.fillStyle = WHEEL_COLORS[colorIndex];
        wheelCtx.fill();
        
        // Обводка
        wheelCtx.strokeStyle = '#1a0b2e';
        wheelCtx.lineWidth = 2;
        wheelCtx.stroke();
        
        // Текст - используем забавное имя для отображения
        wheelCtx.save();
        wheelCtx.translate(centerX, centerY);
        wheelCtx.rotate((startAngle + anglePerSection / 2) * Math.PI / 180);
        wheelCtx.textAlign = 'right';
        wheelCtx.fillStyle = '#1a0b2e';
        wheelCtx.font = 'bold 12px Arial';
        
        const realPrizeName = prizeList[i] || 'Приз';
        const displayName = getDisplayNameForWheel(realPrizeName, i);
        const maxLength = 45;
        
        // Отображаем забавное имя (сокращаем если нужно)
        let displayText = displayName;
        if (displayText.length > maxLength) {
            displayText = displayText.substring(0, maxLength - 3) + '...';
        }
        
        wheelCtx.fillText(displayText, radius - 25, 5);
        wheelCtx.restore();
    }
    
    // Рисуем центральный круг (без изменений)
    wheelCtx.beginPath();
    wheelCtx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    wheelCtx.fillStyle = '#d4af37';
    wheelCtx.fill();
    wheelCtx.strokeStyle = '#1a0b2e';
    wheelCtx.lineWidth = 3;
    wheelCtx.stroke();
    
    // Восстанавливаем контекст
    wheelCtx.restore();
    
    // Анимация вращения
    if (isSpinning) {
        requestAnimationFrame(drawWheel);
    }
}
// Загрузка призов
async function loadPrizes() {
    try {
        const response = await fetch('/api/lottery/prizes');
        if (!response.ok) throw new Error('Ошибка загрузки призов');
        
        const data = await response.json();
        prizes = data.prizes;
        
        // Обновляем интерфейс
        updatePrizesDisplay();
        updateSpinCount();
        
        // Перерисовываем колесо
        drawWheel();
        
    } catch (error) {
        console.error('Ошибка загрузки призов:', error);
        prizes = {
            "Новогодний пряник": 5,
            "Подарочный сертификат": 3,
            "Билет в кино": 4
        };
        updatePrizesDisplay();
    }
}

// Загрузка статистики
async function loadStats() {
    try {
        const response = await fetch('/api/lottery/stats');
        if (!response.ok) throw new Error('Ошибка загрузки статистики');
        
        const data = await response.json();
        
        // Обновляем интерфейс
        if (totalSpinsElement) {
            totalSpinsElement.textContent = data.stats.total_spins;
        }
        
        if (totalWinnersElement) {
            totalWinnersElement.textContent = data.stats.total_winners;
        }
        
        if (remainingPrizesElement) {
            remainingPrizesElement.textContent = data.total_remaining;
        }
        
        if (lastWinElement && data.stats.last_win) {
            const date = new Date(data.stats.last_win);
            lastWinElement.textContent = date.toLocaleString('ru-RU');
        }
        
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
    }
}

// Загрузка данных пользователя
function loadUserData() {
    try {
        const savedSpins = localStorage.getItem('fortuneWheelSpins');
        const savedPrizes = localStorage.getItem('fortuneWheelPrizes');
        const lastReset = localStorage.getItem('fortuneWheelLastReset');
        
        // Проверяем сброс на новый день
        const today = new Date().toDateString();
        if (lastReset !== today) {
            userSpins = 10000;
            localStorage.setItem('fortuneWheelLastReset', today);
        } else if (savedSpins) {
            userSpins = parseInt(savedSpins);
        }
        
        if (savedPrizes) {
            userPrizes = JSON.parse(savedPrizes);
            updateUserPrizes();
        }
        
        updateSpinCount();
        
    } catch (error) {
        console.error('Ошибка загрузки данных пользователя:', error);
        userSpins = 10000;
        userPrizes = [];
    }
}

// Сохранение данных пользователя
function saveUserData() {
    try {
        localStorage.setItem('fortuneWheelSpins', userSpins.toString());
        localStorage.setItem('fortuneWheelPrizes', JSON.stringify(userPrizes));
        localStorage.setItem('fortuneWheelLastReset', new Date().toDateString());
    } catch (error) {
        console.error('Ошибка сохранения данных пользователя:', error);
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Кнопка вращения
    if (spinButton) {
        spinButton.addEventListener('click', spinWheel);
    }
    
    // Модальные окна
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => prizeModal.style.display = 'none');
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', () => prizeModal.style.display = 'none');
    }
    
    if (closeNoSpinsBtn) {
        closeNoSpinsBtn.addEventListener('click', () => noSpinsModal.style.display = 'none');
    }
    
    if (closeNoSpinsModal) {
        closeNoSpinsModal.addEventListener('click', () => noSpinsModal.style.display = 'none');
    }
    
    // Закрытие модальных окон при клике вне их
    window.addEventListener('click', (e) => {
        if (e.target === prizeModal) prizeModal.style.display = 'none';
        if (e.target === noSpinsModal) noSpinsModal.style.display = 'none';
    });
    
    // Кнопка поделиться
    if (sharePrizeBtn) {
        sharePrizeBtn.addEventListener('click', sharePrize);
    }
    
    // Администрирование
    if (toggleAdminBtn) {
        toggleAdminBtn.addEventListener('click', () => {
            adminSection.classList.toggle('hidden');
        });
    }
    
    if (resetLotteryBtn) {
        resetLotteryBtn.addEventListener('click', resetLottery);
    }
    
    if (addPrizeBtn) {
        addPrizeBtn.addEventListener('click', addPrize);
    }
}

// Вращение колеса
async function spinWheel() {
    if (isSpinning || userSpins <= 0) return;
    
    if (userSpins <= 0) {
        noSpinsModal.style.display = 'flex';
        return;
    }
    playSpinSound();
    
    // Уменьшаем количество круток
    userSpins--;
    updateSpinCount();
    saveUserData();
    
    // Блокируем кнопку
    isSpinning = true;
    spinButton.disabled = true;
    spinButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Крутится...';
    
    try {
        // Отправляем запрос на вращение
        const response = await fetch('/api/lottery/spin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: getUserId(),
                timestamp: new Date().toISOString()
            })
        });
        
        if (!response.ok) throw new Error('Ошибка вращения колеса');
        
        const result = await response.json();
        
        if (result.success) {
            // Анимация вращения
            console.log('Вращаем на: ',result.target_angle);
            await animateWheel(result.target_angle);

            playWinSound();
            
            // Показываем приз
            showPrize(result.prize);
            
            // Добавляем приз пользователю
            userPrizes.push({
                prize: result.prize,
                date: new Date().toISOString()
            });
            updateUserPrizes();
            saveUserData();
            
            // Обновляем статистику
            loadStats();
            loadPrizes();
            
        } else {
            alert(result.message || 'Ошибка при вращении колеса');
            stopAllSounds();
        }
        
    } catch (error) {
        console.error('Ошибка вращения колеса:', error);
        alert('Произошла ошибка при вращении колеса. Попробуйте еще раз.');
        stopAllSounds();
        
        // Симулируем выигрыш для демонстрации
        const demoPrizes = Object.keys(prizes);
        if (demoPrizes.length > 0) {
            const randomPrize = demoPrizes[Math.floor(Math.random() * demoPrizes.length)];
            await animateWheel(360 * 5 + Math.random() * 360);
            playWinSound();
            showPrize(randomPrize);
            
            userPrizes.push({
                prize: randomPrize,
                date: new Date().toISOString()
            });
            updateUserPrizes();
            saveUserData();
        }
    } finally {
        // Разблокируем кнопку
        isSpinning = false;
        spinButton.disabled = userSpins <= 0;
        spinButton.innerHTML = '<i class="fas fa-redo"></i><span>Крутить колесо!</span>';
    }
}


let spinSound;
let winSound;
let isAudioEnabled = true;

// Инициализация аудио
    function initializeAudio() {
    console.log('Инициализация аудио...');
    
    spinSound = document.getElementById('spinSound');
    winSound = document.getElementById('winSound');
    
    console.log('Найден spinSound:', !!spinSound);
    console.log('Найден winSound:', !!winSound);
    
    if (!spinSound || !winSound) {
        console.error('❌ Аудио элементы не найдены!');
        console.log('Ищем все audio элементы:', document.querySelectorAll('audio'));
        console.log('Текущий HTML:', document.body.innerHTML.substring(0, 1000));
        isAudioEnabled = false;
        return;
    }
    
    console.log('spinSound src:', spinSound.src);
    console.log('winSound src:', winSound.src);
    
    // Настройка громкости
    spinSound.volume = 0.7;
    winSound.volume = 0.8;
    
    // Добавляем обработчики событий для отладки
    spinSound.addEventListener('loadeddata', () => {
        console.log('✅ spinSound загружен, readyState:', spinSound.readyState);
    });
    
    winSound.addEventListener('loadeddata', () => {
        console.log('✅ winSound загружен, readyState:', winSound.readyState);
    });
    
    spinSound.addEventListener('error', (e) => {
        console.error('❌ Ошибка spinSound:', e);
        console.log('spinSound error details:', spinSound.error);
    });
    
    winSound.addEventListener('error', (e) => {
        console.error('❌ Ошибка winSound:', e);
        console.log('winSound error details:', winSound.error);
    });
    
    spinSound.addEventListener('canplay', () => {
        console.log('🎵 spinSound готов к воспроизведению');
    });
    
    winSound.addEventListener('canplay', () => {
        console.log('🎵 winSound готов к воспроизведению');
    });
    
    // Предзагрузка
    spinSound.load();
    winSound.load();
    
    // Проверка через 2 секунды
    setTimeout(() => {
        console.log('Статус через 2 секунды:');
        console.log('- spinSound.readyState:', spinSound.readyState);
        console.log('- winSound.readyState:', winSound.readyState);
        console.log('- spinSound.networkState:', spinSound.networkState);
        console.log('- winSound.networkState:', winSound.networkState);
    }, 2000);
    
    // Сохранение настроек звука
    const savedAudioSetting = localStorage.getItem('fortuneWheelAudioEnabled');
    if (savedAudioSetting !== null) {
        isAudioEnabled = savedAudioSetting === 'true';
    } else {
        isAudioEnabled = true;
        localStorage.setItem('fortuneWheelAudioEnabled', 'true');
    }
    
    console.log('Звук включен:', isAudioEnabled);
    
    // Создаем кнопку управления звуком
    createAudioControl();
}


// Создание кнопки управления звуком
function createAudioControl() {
    // Проверяем, есть ли уже кнопка
    if (document.getElementById('audioControl')) return;
    
    const audioControl = document.createElement('button');
    audioControl.id = 'audioControl';
    audioControl.className = 'audio-control-btn';
    audioControl.innerHTML = isAudioEnabled ? 
        '<i class="fas fa-volume-up"></i>' : 
        '<i class="fas fa-volume-mute"></i>';
    audioControl.title = isAudioEnabled ? 'Выключить звук' : 'Включить звук';
    
    // Позиционируем кнопку
    audioControl.style.position = 'fixed';
    audioControl.style.bottom = '20px';
    audioControl.style.right = '20px';
    audioControl.style.zIndex = '1000';
    audioControl.style.width = '50px';
    audioControl.style.height = '50px';
    audioControl.style.borderRadius = '50%';
    audioControl.style.background = 'linear-gradient(to bottom, #d4af37, #b8941f)';
    audioControl.style.color = '#1a0b2e';
    audioControl.style.border = 'none';
    audioControl.style.fontSize = '1.5rem';
    audioControl.style.cursor = 'pointer';
    audioControl.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
    audioControl.style.transition = 'all 0.3s';
    
    audioControl.addEventListener('click', toggleAudio);
    audioControl.addEventListener('mouseenter', () => {
        audioControl.style.transform = 'scale(1.1)';
        audioControl.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.4)';
    });
    audioControl.addEventListener('mouseleave', () => {
        audioControl.style.transform = 'scale(1)';
        audioControl.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
    });
    
    document.body.appendChild(audioControl);
}

// Включение/выключение звука
function toggleAudio() {
    isAudioEnabled = !isAudioEnabled;
    
    const audioControl = document.getElementById('audioControl');
    if (audioControl) {
        audioControl.innerHTML = isAudioEnabled ? 
            '<i class="fas fa-volume-up"></i>' : 
            '<i class="fas fa-volume-mute"></i>';
        audioControl.title = isAudioEnabled ? 'Выключить звук' : 'Включить звук';
    }
    
    // Сохраняем настройку
    localStorage.setItem('fortuneWheelAudioEnabled', isAudioEnabled.toString());
    
    // Если выключаем звук, останавливаем все воспроизведение
    if (!isAudioEnabled) {
        stopAllSounds();
    }
}

// Воспроизведение звука вращения
function playSpinSound() {
    if (!isAudioEnabled || !spinSound) return;
    
    try {
        // Останавливаем предыдущее воспроизведение
        spinSound.pause();
        spinSound.currentTime = 0;
        
        // Начинаем воспроизведение
        spinSound.play().catch(error => {
            console.warn('Не удалось воспроизвести звук вращения:', error);
        });
    } catch (error) {
        console.warn('Ошибка воспроизведения звука вращения:', error);
    }
}

// Воспроизведение звука выигрыша
function playWinSound() {
    if (!isAudioEnabled || !winSound) return;
    
    try {
        // Останавливаем звук вращения
        if (spinSound) {
            spinSound.pause();
            spinSound.currentTime = 0;
        }
        
        // Начинаем воспроизведение звука выигрыша
        winSound.currentTime = 0;
        winSound.play().catch(error => {
            console.warn('Не удалось воспроизвести звук выигрыша:', error);
        });
    } catch (error) {
        console.warn('Ошибка воспроизведения звука выигрыша:', error);
    }
}

// Остановка всех звуков
function stopAllSounds() {
    if (spinSound) {
        spinSound.pause();
        spinSound.currentTime = 0;
    }
    
    if (winSound) {
        winSound.pause();
        winSound.currentTime = 0;
    }
}


// Анимация вращения колеса
function animateWheel(targetAngle) {
    return new Promise((resolve) => {
        const startAngle = wheelAngle;
        const spinDuration = 5000; // 5 секунд
        const startTime = Date.now();
        
        function animate() {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / spinDuration, 1);
            
            // Используем easing функцию для плавного замедления
            const easeOut = 1 - Math.pow(1 - progress, 3);
            wheelAngle = startAngle + (targetAngle - startAngle) * easeOut;
            
            drawWheel();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                resolve();
            }
        }
        
        animate();
    });
}

// Показ выигранного приза
function showPrize(realPrize) {
    if (!prizeResultElement || !prizeModal) return;
    
    // Генерируем забавное имя для отображения
    const displayName = getDisplayName(realPrize);
    
    // Обновляем содержимое модального окна
    prizeResultElement.innerHTML = `
        <h4>${displayName}</h4>
        <div class="real-prize-info">
            <p><strong>Реальный приз:</strong> ${realPrize}</p>
            <p class="prize-description">${getPrizeDescription(realPrize)}</p>
        </div>
        <p>🎉 Поздравляем с выигрышем! 🎉</p>
    `;
    
    // Показываем модальное окно
    prizeModal.style.display = 'flex';
    
    // Запускаем конфетти
    createConfetti();
}
function getPrizeDescription(prize) {
    const descriptions = {
    };
    
    return descriptions[prize] || "Отличный приз для создания праздничного настроения!";
}


// Создание конфетти
function createConfetti() {
    const confettiContainer = document.querySelector('.confetti');
    if (!confettiContainer) return;
    
    // Очищаем старые конфетти
    confettiContainer.innerHTML = '';
    
    // Создаем новые конфетти
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'absolute';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.background = WHEEL_COLORS[Math.floor(Math.random() * WHEEL_COLORS.length)];
        confetti.style.borderRadius = '50%';
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.top = `${Math.random() * 100}%`;
        
        // Анимация
        confetti.animate([
            { transform: 'translateY(-100px) rotate(0deg)', opacity: 1 },
            { transform: `translateY(100px) rotate(${360 * 2}deg)`, opacity: 0 }
        ], {
            duration: 1000 + Math.random() * 1000,
            delay: Math.random() * 500,
            easing: 'cubic-bezier(0.1, 0.8, 0.2, 1)'
        });
        
        confettiContainer.appendChild(confetti);
    }
}

// Обновление отображения призов
function updatePrizesDisplay() {
    if (!prizesGridElement || !totalPrizesElement) return;
    
    const prizeEntries = Object.entries(prizes);
    const total = prizeEntries.reduce((sum, [_, count]) => sum + count, 0);
    
    // Обновляем общее количество
    totalPrizesElement.textContent = total;
    
    // Сортируем призы по количеству
    prizeEntries.sort((a, b) => b[1] - a[1]);
    
    // Очищаем и обновляем сетку
    prizesGridElement.innerHTML = '';
    
    prizeEntries.forEach(([realPrize, count], index) => {
        const prizeCard = document.createElement('div');
        prizeCard.className = 'prize-card';
        if (index < 3) prizeCard.classList.add('popular');
        
        // Используем забавное имя для отображения
        const displayName = getDisplayName(realPrize);
        
        prizeCard.innerHTML = `
            <div class="prize-icon">
                ${getEmojiFromPrize(displayName)}
            </div>
            <div class="prize-name">${displayName}</div>
            <div class="real-prize-name">
                <small>${realPrize}</small>
            </div>
            <div class="prize-count">
                <i class="fas fa-box-open"></i>
                <span>Осталось: ${count} шт.</span>
            </div>
        `;
        
        prizesGridElement.appendChild(prizeCard);
    });
    
    // Если призов нет
    if (prizeEntries.length === 0) {
        prizesGridElement.innerHTML = `
            <div class="loading" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <i class="fas fa-box-open" style="font-size: 3rem; color: #8ac6d1; margin-bottom: 20px;"></i>
                <p style="color: #8ac6d1; font-size: 1.2rem;">Призы закончились. Ожидайте пополнения!</p>
            </div>
        `;
    }
}

// Обновленные вспомогательные функции:
function getEmojiFromPrize(prizeName) {
    // Ищем эмодзи в начале строки
    const emojiMatch = prizeName.match(/^[\p{Emoji}]/u);
    if (emojiMatch) {
        return `<span style="font-size: 2rem;">${emojiMatch[0]}</span>`;
    }
    
    // Если нет эмодзи, используем соответствующий иконку
    if (prizeName.includes('🚗') || prizeName.includes('машина') || prizeName.includes('Порше')) {
        return '<i class="fas fa-car"></i>';
    } else if (prizeName.includes('🍪') || prizeName.includes('пряник') || prizeName.includes('сладость')) {
        return '<i class="fas fa-cookie-bite"></i>';
    } else if (prizeName.includes('👑') || prizeName.includes('титул') || prizeName.includes('король')) {
        return '<i class="fas fa-crown"></i>';
    } else if (prizeName.includes('🏆') || prizeName.includes('кубок') || prizeName.includes('медаль')) {
        return '<i class="fas fa-trophy"></i>';
    } else if (prizeName.includes('🎁') || prizeName.includes('подарок') || prizeName.includes('сюрприз')) {
        return '<i class="fas fa-gift"></i>';
    }
    
    return '<i class="fas fa-gift"></i>';
}

// Обновление счетчика круток
function updateSpinCount() {
    if (spinCountElement) {
        spinCountElement.textContent = userSpins;
    }
    
    if (spinButton) {
        spinButton.disabled = userSpins <= 0 || isSpinning;
        
        if (userSpins <= 0) {
            spinButton.innerHTML = '<i class="fas fa-clock"></i><span>Крутки закончились</span>';
        }
    }
}

// Обновление списка призов пользователя
function updateUserPrizes() {
    if (!userPrizesElement) return;
    
    if (userPrizes.length === 0) {
        userPrizesElement.innerHTML = '<p>У вас пока нет призов. Покрутите колесо!</p>';
        return;
    }
    
    // Показываем последние 5 призов
    const recentPrizes = userPrizes.slice(-5).reverse();
    
    userPrizesElement.innerHTML = recentPrizes.map(item => `
        <div class="prize-item">
            <i class="fas fa-gift"></i>
            <div>
                <strong>${item.prize}</strong>
                <div style="font-size: 0.8rem; color: #8ac6d1;">
                    ${new Date(item.date).toLocaleDateString('ru-RU')}
                </div>
            </div>
        </div>
    `).join('');
}

// Получение ID пользователя
function getUserId() {
    let userId = localStorage.getItem('fortuneWheelUserId');
    if (!userId) {
        userId = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('fortuneWheelUserId', userId);
    }
    return userId;
}

// Поделиться призом
function sharePrize() {
    const lastPrize = userPrizes[userPrizes.length - 1];
    if (!lastPrize) return;
    
    const shareText = `🎉 Я выиграл(а) "${lastPrize.prize}" в новогодней лотерее! 🎄\nПопробуй и ты свою удачу!`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Новогодний выигрыш!',
            text: shareText,
            url: window.location.href
        });
    } else {
        // Копируем в буфер обмена
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Текст скопирован в буфер обмена! Поделитесь им в соцсетях!');
        });
    }
}

// Сброс лотереи (админ)
async function resetLottery() {
    const password = adminPasswordInput.value;
    if (!password) {
        alert('Введите пароль администратора');
        return;
    }
    
    try {
        const response = await fetch('/api/lottery/reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password: password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Лотерея успешно сброшена!');
            adminPasswordInput.value = '';
            loadPrizes();
            loadStats();
        } else {
            alert(result.message || 'Ошибка сброса лотереи');
        }
        
    } catch (error) {
        console.error('Ошибка сброса лотереи:', error);
        alert('Произошла ошибка при сбросе лотереи');
    }
}

// Добавление приза (админ)
async function addPrize() {
    const prizeName = newPrizeNameInput.value.trim();
    const prizeCount = parseInt(newPrizeCountInput.value);
    
    if (!prizeName) {
        alert('Введите название приза');
        return;
    }
    
    if (!prizeCount || prizeCount < 1) {
        alert('Введите корректное количество призов');
        return;
    }
    
    try {
        // В реальном приложении здесь будет API endpoint
        // Для демо просто добавляем локально
        if (prizes[prizeName]) {
            prizes[prizeName] += prizeCount;
        } else {
            prizes[prizeName] = prizeCount;
        }
        
        // Обновляем интерфейс
        updatePrizesDisplay();
        drawWheel();
        
        // Очищаем поля
        newPrizeNameInput.value = '';
        newPrizeCountInput.value = '1';
        
        alert(`Приз "${prizeName}" (${prizeCount} шт.) успешно добавлен!`);
        
    } catch (error) {
        console.error('Ошибка добавления приза:', error);
        alert('Произошла ошибка при добавлении приза');
    }
}

// Экспортируем функции для отладки
if (typeof window !== 'undefined') {
    window.fortuneWheel = {
        spinWheel,
        loadPrizes,
        loadStats,
        resetLottery,
        addPrize
    };
}