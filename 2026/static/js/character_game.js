// Переменные приложения
let characters = [];
let currentCharacterIndex = -1;
let usedHints = [];
let gameStats = {
    total: 0,
    guessed: 0,
    currentStreak: 0,
    bestStreak: 0,
    hintsUsed: 0,
    skipped: 0
};

// DOM элементы
const charactersContainer = document.getElementById('charactersContainer');
const loadCharactersBtn = document.getElementById('loadCharacters');
const resetGameBtn = document.getElementById('resetGame');
const rescanImagesBtn = document.getElementById('rescanImages');
const revealAllBtn = document.getElementById('revealAll');
const currentImage = document.getElementById('currentImage');
const guessInput = document.getElementById('guessInput');
const submitGuessBtn = document.getElementById('submitGuess');
const guessResult = document.getElementById('guessResult');
const requestHintBtn = document.getElementById('requestHint');
const hintsList = document.getElementById('hintsList');
const revealCharacterBtn = document.getElementById('revealCharacter');
const nextCharacterBtn = document.getElementById('nextCharacter');
const randomCharacterBtn = document.getElementById('randomCharacter');
const skipCharacterBtn = document.getElementById('skipCharacter');
const filterAllBtn = document.getElementById('filterAll');
const filterGuessedBtn = document.getElementById('filterGuessed');
const filterUnguessedBtn = document.getElementById('filterUnguessed');

// Элементы статистики и информации
const totalCharactersElement = document.getElementById('totalCharacters');
const guessedCharactersElement = document.getElementById('guessedCharacters');
const remainingCharactersElement = document.getElementById('remainingCharacters');
const bestStreakElement = document.getElementById('bestStreak');
const imageCategoryElement = document.getElementById('imageCategory');
const imageDifficultyElement = document.getElementById('imageDifficulty');
const gameProgressElement = document.getElementById('gameProgress');
const imageDescriptionElement = document.getElementById('imageDescription');
const statusPreviewElement = document.getElementById('statusPreview');
const statusOriginalElement = document.getElementById('statusOriginal');

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    createSnowflakes(50);
    setupEventListeners();
    updateStatsDisplay();
});

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

// Настройка обработчиков событий
function setupEventListeners() {
    // Основные кнопки
    if (loadCharactersBtn) {
        loadCharactersBtn.addEventListener('click', loadCharacters);
    }
    
    if (resetGameBtn) {
        resetGameBtn.addEventListener('click', resetGame);
    }
    
    if (rescanImagesBtn) {
        rescanImagesBtn.addEventListener('click', rescanImages);
    }
    
    if (revealAllBtn) {
        revealAllBtn.addEventListener('click', revealAllCharacters);
    }
    
    // Управление игрой
    if (requestHintBtn) {
        requestHintBtn.addEventListener('click', requestHint);
    }
    
    if (revealCharacterBtn) {
        revealCharacterBtn.addEventListener('click', revealCurrentCharacter);
    }
    
    if (nextCharacterBtn) {
        nextCharacterBtn.addEventListener('click', nextCharacter);
    }
    
    if (randomCharacterBtn) {
        randomCharacterBtn.addEventListener('click', selectRandomCharacter);
    }
    
    if (skipCharacterBtn) {
        skipCharacterBtn.addEventListener('click', skipCurrentCharacter);
    }
    
    // Фильтры
    if (filterAllBtn) {
        filterAllBtn.addEventListener('click', () => filterCharacters('all'));
    }
    
    if (filterGuessedBtn) {
        filterGuessedBtn.addEventListener('click', () => filterCharacters('guessed'));
    }
    
    if (filterUnguessedBtn) {
        filterUnguessedBtn.addEventListener('click', () => filterCharacters('unguessed'));
    }
    
    // Угадывание
    if (submitGuessBtn) {
        submitGuessBtn.addEventListener('click', submitGuess);
    }
    
    if (guessInput) {
        guessInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                submitGuess();
            }
        });
    }
}

// Загрузка персонажей с сервера
async function loadCharacters() {
    try {
        loadCharactersBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Загрузка...';
        loadCharactersBtn.disabled = true;
        
        const response = await fetch('/api/images');
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        characters = await response.json();
        
        // Инициализируем состояние персонажей
        characters.forEach(character => {
            character.guessed = false;
            character.userGuess = '';
            character.hintsUsed = 0;
            character.skipped = false;
            character.currentHints = character.hints || [];
            character.availableHints = [...(character.hints || [])];
        });
        
        gameStats.total = characters.length;
        updateCharactersDisplay();
        updateStatsDisplay();
        
        // Выбираем случайного персонажа для начала
        if (characters.length > 0) {
            selectRandomCharacter();
        }
        
        loadCharactersBtn.innerHTML = `<i class="fas fa-users"></i> Загружено: ${characters.length}`;
        loadCharactersBtn.disabled = true;
        
    } catch (error) {
        console.error('Ошибка загрузки персонажей:', error);
        charactersContainer.innerHTML = `
            <div class="empty-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Ошибка загрузки персонажей: ${error.message}</p>
                <p>Проверьте, что сервер запущен и в папке images есть изображения</p>
            </div>
        `;
        loadCharactersBtn.innerHTML = '<i class="fas fa-folder-open"></i> Загрузить персонажей';
        loadCharactersBtn.disabled = false;
    }
}

// Повторное сканирование папки
async function rescanImages() {
    try {
        rescanImagesBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        rescanImagesBtn.disabled = true;
        
        const response = await fetch('/api/rescan/images');
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        const newCharacters = data.items;
        
        // Сохраняем состояние уже угаданных персонажей
        const oldCharactersState = new Map();
        characters.forEach(char => {
            oldCharactersState.set(char.filename, {
                guessed: char.guessed,
                userGuess: char.userGuess,
                hintsUsed: char.hintsUsed,
                skipped: char.skipped,
                availableHints: char.availableHints || []
            });
        });
        
        characters = newCharacters;
        
        // Восстанавливаем состояние
        characters.forEach(char => {
            const oldState = oldCharactersState.get(char.filename);
            if (oldState) {
                char.guessed = oldState.guessed;
                char.userGuess = oldState.userGuess;
                char.hintsUsed = oldState.hintsUsed;
                char.skipped = oldState.skipped;
                char.availableHints = oldState.availableHints;
            } else {
                char.guessed = false;
                char.userGuess = '';
                char.hintsUsed = 0;
                char.skipped = false;
                char.availableHints = char.hints || [];
            }
            char.currentHints = char.hints || [];
        });
        
        gameStats.total = characters.length;
        updateCharactersDisplay();
        updateStatsDisplay();
        
        // Обновляем текущего персонажа если нужно
        if (currentCharacterIndex >= 0 && currentCharacterIndex < characters.length) {
            loadCurrentCharacter();
        } else if (characters.length > 0) {
            selectRandomCharacter();
        } else {
            clearCurrentCharacter();
        }
        
        alert(`Обновлено! Найдено ${characters.length} персонажей.`);
        
    } catch (error) {
        console.error('Ошибка обновления списка персонажей:', error);
        alert(`Ошибка обновления: ${error.message}`);
    } finally {
        rescanImagesBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Обновить';
        rescanImagesBtn.disabled = false;
    }
}

// Сброс игры
function resetGame() {
    if (!confirm('Вы уверены, что хотите начать заново? Весь прогресс будет сброшен.')) {
        return;
    }
    
    characters.forEach(character => {
        character.guessed = false;
        character.userGuess = '';
        character.hintsUsed = 0;
        character.skipped = false;
        character.availableHints = character.hints || [];
    });
    
    gameStats.guessed = 0;
    gameStats.currentStreak = 0;
    gameStats.hintsUsed = 0;
    gameStats.skipped = 0;
    usedHints = [];
    
    updateCharactersDisplay();
    updateStatsDisplay();
    
    clearCurrentCharacter();
    
    loadCharactersBtn.innerHTML = '<i class="fas fa-folder-open"></i> Загрузить персонажей';
    loadCharactersBtn.disabled = false;
}

// Показать всех персонажей
function revealAllCharacters() {
    if (characters.length === 0) {
        alert('Сначала загрузите персонажей!');
        return;
    }
    
    characters.forEach(character => {
        character.guessed = true;
    });
    
    gameStats.guessed = characters.length;
    updateCharactersDisplay();
    updateStatsDisplay();
    
    // Обновляем текущего персонажа
    if (currentCharacterIndex >= 0) {
        loadCurrentCharacter();
    }
}

// Обновление отображения списка персонажей
function updateCharactersDisplay(filter = 'all') {
    if (!charactersContainer) return;
    
    if (characters.length === 0) {
        charactersContainer.innerHTML = `
            <div class="empty-message">
                <i class="fas fa-user-friends"></i>
                <p>Нажмите "Загрузить персонажей", чтобы начать игру</p>
            </div>
        `;
        return;
    }
    
    // Фильтрация персонажей
    let filteredCharacters = characters;
    if (filter === 'guessed') {
        filteredCharacters = characters.filter(char => char.guessed);
    } else if (filter === 'unguessed') {
        filteredCharacters = characters.filter(char => !char.guessed);
    }
    
    // Подсчитываем статистику
    let guessedCount = 0;
    characters.forEach(char => {
        if (char.guessed) guessedCount++;
    });
    
    // Обновляем счетчики
    if (totalCharactersElement) totalCharactersElement.textContent = characters.length;
    if (guessedCharactersElement) guessedCharactersElement.textContent = guessedCount;
    if (remainingCharactersElement) remainingCharactersElement.textContent = characters.length - guessedCount;
    if (bestStreakElement) bestStreakElement.textContent = gameStats.bestStreak;
    if (gameProgressElement) gameProgressElement.textContent = `${guessedCount}/${characters.length}`;
    
    // Очищаем контейнер
    charactersContainer.innerHTML = '';
    
    // Добавляем персонажей
    filteredCharacters.forEach((character, index) => {
        const originalIndex = characters.findIndex(c => c.filename === character.filename);
        const isCurrent = originalIndex === currentCharacterIndex;
        
        const characterElement = document.createElement('div');
        characterElement.className = 'character-card';
        if (character.guessed) characterElement.classList.add('guessed');
        if (isCurrent) characterElement.classList.add('current');
        characterElement.dataset.index = originalIndex;
        
        // Определяем URL изображения (оригинал или превью)
        const imageUrl = character.guessed ? 
            `/api/images/original/${encodeURIComponent(character.filename)}` :
            `/api/images/preview/${encodeURIComponent(character.filename)}`;
        
        characterElement.innerHTML = `
            <div class="character-info">
                <div class="character-name ${character.guessed ? 'guessed' : ''}">
                    ${character.guessed ? character.title : 'Скрытый персонаж'}
                    ${character.guessed ? ' <i class="fas fa-check" style="color:#4CAF50"></i>' : ''}
                    ${isCurrent ? ' <i class="fas fa-crosshairs" style="color:#d4af37"></i>' : ''}
                </div>
                <div class="character-category">${character.category || 'Общее'}</div>
                ${character.guessed && character.description ? 
                    `<p style="color:#b0e0e6; font-size:0.9rem; margin-bottom:10px;">${character.description}</p>` : ''}
                <div class="character-hints">
                    ${character.guessed ? character.hints.map(hint => 
                        `<span class="hint-badge">${hint}</span>`
                    ).join('') : 
                    `<span style="color:#6a9fb5;">Подсказки скрыты</span>`}
                </div>
                <div class="character-controls">
                    <button class="btn-small select-character" data-index="${originalIndex}">
                        <i class="fas fa-crosshairs"></i> Выбрать
                    </button>
                    ${!character.guessed ? `
                        <button class="btn-small reveal-character" data-index="${originalIndex}">
                            <i class="fas fa-eye"></i> Открыть
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        charactersContainer.appendChild(characterElement);
    });
    
    // Добавляем обработчики для кнопок персонажей
    document.querySelectorAll('.select-character').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            selectCharacter(index);
        });
    });
    
    document.querySelectorAll('.reveal-character').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            revealCharacter(index);
        });
    });
}

// Фильтрация персонажей
function filterCharacters(filterType) {
    updateCharactersDisplay(filterType);
    
    // Обновляем активность кнопок фильтров
    if (filterAllBtn) filterAllBtn.classList.toggle('active', filterType === 'all');
    if (filterGuessedBtn) filterGuessedBtn.classList.toggle('active', filterType === 'guessed');
    if (filterUnguessedBtn) filterUnguessedBtn.classList.toggle('active', filterType === 'unguessed');
}

// Выбор персонажа для угадывания
function selectCharacter(index) {
    if (index < 0 || index >= characters.length) return;
    
    currentCharacterIndex = index;
    loadCurrentCharacter();
}

// Выбор случайного персонажа
function selectRandomCharacter() {
    if (characters.length === 0) return;
    
    // Фильтруем неугаданных персонажей
    const unguessedCharacters = characters.filter(char => !char.guessed && !char.skipped);
    
    if (unguessedCharacters.length === 0) {
        // Все угаданы или пропущены, выбираем любого
        currentCharacterIndex = Math.floor(Math.random() * characters.length);
    } else {
        // Выбираем из неугаданных
        const randomIndex = Math.floor(Math.random() * unguessedCharacters.length);
        const selectedCharacter = unguessedCharacters[randomIndex];
        currentCharacterIndex = characters.findIndex(char => char.filename === selectedCharacter.filename);
    }
    
    loadCurrentCharacter();
}

// Загрузка текущего персонажа
function loadCurrentCharacter() {
    if (currentCharacterIndex < 0 || currentCharacterIndex >= characters.length) return;
    
    const character = characters[currentCharacterIndex];
    
    // Очищаем использованные подсказки для нового персонажа
    usedHints = [];
    updateHintsList();
    
    // Устанавливаем изображение (превью или оригинал)
    if (currentImage) {
        const imageUrl = character.guessed ? 
            `/api/images/original/${character.filename}` :
            `/api/images/preview/${character.filename}`;
        
        currentImage.src = imageUrl;
        currentImage.alt = character.title;
        
        // Обновляем статус изображения
        if (statusPreviewElement && statusOriginalElement) {
            if (character.guessed) {
                statusPreviewElement.classList.add('hidden');
                statusOriginalElement.classList.remove('hidden');
            } else {
                statusPreviewElement.classList.remove('hidden');
                statusOriginalElement.classList.add('hidden');
            }
        }
    }
    
    // Обновляем информацию
    if (imageCategoryElement) {
        imageCategoryElement.textContent = character.category || 'Общее';
    }
    
    if (imageDifficultyElement) {
        // Определяем сложность на основе количества подсказок
        const hintCount = character.hints ? character.hints.length : 0;
        let difficulty = 'Средняя';
        if (hintCount <= 2) difficulty = 'Сложная';
        if (hintCount >= 5) difficulty = 'Легкая';
        imageDifficultyElement.textContent = difficulty;
    }
    
    if (imageDescriptionElement) {
        if (character.guessed && character.description) {
            imageDescriptionElement.innerHTML = `<p>${character.description}</p>`;
        } else {
            imageDescriptionElement.innerHTML = '<p>Угадайте персонажа по изображению. Используйте подсказки!</p>';
        }
    }
    
    // Сбрасываем результат угадывания
    if (guessResult) {
        if (character.guessed) {
            guessResult.innerHTML = `
                <p><i class="fas fa-check-circle" style="color:#4CAF50; margin-right:10px;"></i>
                Вы уже угадали этого персонажа! Это "${character.title}"</p>
            `;
            guessResult.className = 'guess-result correct';
        } else {
            guessResult.innerHTML = '<p>Введите имя персонажа и нажмите "Проверить"</p>';
            guessResult.className = 'guess-result';
        }
    }
    
    if (guessInput) {
        guessInput.value = '';
        guessInput.focus();
        guessInput.disabled = character.guessed;
    }
    
    if (submitGuessBtn) {
        submitGuessBtn.disabled = character.guessed;
    }
    
    if (requestHintBtn) {
        requestHintBtn.disabled = character.guessed || 
            (character.availableHints && character.availableHints.length === 0);
    }
    
    // Обновляем отображение списка
    updateCharactersDisplay();
}

// Очистка текущего персонажа
function clearCurrentCharacter() {
    if (currentImage) {
        currentImage.src = '';
        currentCharacterIndex = -1;
    }
    
    if (statusPreviewElement && statusOriginalElement) {
        statusPreviewElement.classList.add('hidden');
        statusOriginalElement.classList.add('hidden');
    }
    
    if (imageCategoryElement) imageCategoryElement.textContent = 'Неизвестно';
    if (imageDifficultyElement) imageDifficultyElement.textContent = 'Нет данных';
    if (imageDescriptionElement) imageDescriptionElement.innerHTML = '<p>Загрузите персонажей, чтобы начать игру</p>';
    
    if (guessResult) {
        guessResult.innerHTML = '<p>Загрузите персонажей чтобы начать игру</p>';
        guessResult.className = 'guess-result';
    }
    
    if (guessInput) {
        guessInput.value = '';
        guessInput.disabled = true;
    }
    
    if (submitGuessBtn) {
        submitGuessBtn.disabled = true;
    }
    
    if (requestHintBtn) {
        requestHintBtn.disabled = true;
    }
    
    usedHints = [];
    updateHintsList();
}

// Обновление списка подсказок
function updateHintsList() {
    if (!hintsList) return;
    
    if (currentCharacterIndex < 0) {
        hintsList.innerHTML = '<p>Выберите персонажа для получения подсказок</p>';
        return;
    }
    
    const character = characters[currentCharacterIndex];
    
    if (character.guessed) {
        // Показываем все подсказки для угаданного персонажа
        if (character.hints && character.hints.length > 0) {
            hintsList.innerHTML = character.hints.map(hint => 
                `<div class="hint-item"><i class="fas fa-lightbulb"></i> ${hint}</div>`
            ).join('');
        } else {
            hintsList.innerHTML = '<p>Для этого персонажа нет подсказок</p>';
        }
    } else if (usedHints.length > 0) {
        // Показываем использованные подсказки
        hintsList.innerHTML = usedHints.map(hint => 
            `<div class="hint-item"><i class="fas fa-lightbulb"></i> ${hint}</div>`
        ).join('');
    } else {
        hintsList.innerHTML = '<p>Нажмите "Новая подсказка" для получения подсказки</p>';
    }
}

// Запрос подсказки
function requestHint() {
    if (currentCharacterIndex < 0) {
        alert('Сначала выберите персонажа!');
        return;
    }
    
    const character = characters[currentCharacterIndex];
    
    if (character.guessed) {
        alert('Вы уже угадали этого персонажа!');
        return;
    }
    
    if (!character.availableHints || character.availableHints.length === 0) {
        alert('Больше нет доступных подсказок для этого персонажа');
        return;
    }
    
    // Выбираем случайную подсказку из доступных
    const hintIndex = Math.floor(Math.random() * character.availableHints.length);
    const hint = character.availableHints[hintIndex];
    
    // Добавляем подсказку в использованные
    usedHints.push(hint);
    character.availableHints.splice(hintIndex, 1);
    character.hintsUsed++;
    gameStats.hintsUsed++;
    
    // Обновляем отображение
    updateHintsList();
    
    // Обновляем доступность кнопки подсказки
    if (requestHintBtn && character.availableHints.length === 0) {
        requestHintBtn.disabled = true;
        requestHintBtn.innerHTML = '<i class="fas fa-question-circle"></i> Нет подсказок';
    }
}

// Показать текущего персонажа
function revealCurrentCharacter() {
    if (currentCharacterIndex < 0) {
        alert('Сначала выберите персонажа!');
        return;
    }
    
    const character = characters[currentCharacterIndex];
    
    if (character.guessed) {
        alert('Вы уже угадали этого персонажа!');
        return;
    }
    
    character.guessed = true;
    gameStats.guessed++;
    gameStats.currentStreak = 0; // Сбрасываем серию при подглядывании
    
    // Обновляем отображение
    updateCharactersDisplay();
    updateStatsDisplay();
    loadCurrentCharacter();
    
    alert(`Это "${character.title}"!`);
}

// Следующий персонаж
function nextCharacter() {
    if (characters.length === 0) {
        alert('Сначала загрузите персонажей!');
        return;
    }
    
    if (currentCharacterIndex < 0) {
        selectRandomCharacter();
        return;
    }
    
    // Ищем следующего неугаданного персонажа
    for (let i = 1; i <= characters.length; i++) {
        const nextIndex = (currentCharacterIndex + i) % characters.length;
        if (!characters[nextIndex].guessed) {
            selectCharacter(nextIndex);
            return;
        }
    }
    
    // Если все угаданы, выбираем любого
    selectRandomCharacter();
}

// Пропустить текущего персонажа
function skipCurrentCharacter() {
    if (currentCharacterIndex < 0) {
        alert('Сначала выберите персонажа!');
        return;
    }
    
    const character = characters[currentCharacterIndex];
    
    if (character.guessed) {
        alert('Вы уже угадали этого персонажа!');
        return;
    }
    
    character.skipped = true;
    gameStats.skipped++;
    gameStats.currentStreak = 0; // Сбрасываем серию при пропуске
    
    // Выбираем следующего персонажа
    nextCharacter();
    
    alert(`Персонаж "${character.title}" пропущен. Вы можете вернуться к нему позже.`);
}

// Проверка догадки
function submitGuess() {
    if (currentCharacterIndex < 0) {
        alert('Сначала выберите персонажа!');
        return;
    }
    
    const guess = guessInput ? guessInput.value.trim() : '';
    if (!guess) {
        alert('Введите ваш вариант!');
        return;
    }
    
    const character = characters[currentCharacterIndex];
    
    if (character.guessed) {
        alert('Вы уже угадали этого персонажа!');
        return;
    }
    
    const normalizedGuess = guess.toLowerCase();
    const normalizedTitle = character.title.toLowerCase();
    
    // Простая проверка
    let isCorrect = false;
    
    if (normalizedGuess === normalizedTitle) {
        isCorrect = true;
    } else if (normalizedTitle.includes(normalizedGuess) && normalizedGuess.length >= 3) {
        isCorrect = true;
    } else if (normalizedGuess.includes(normalizedTitle) && normalizedTitle.length >= 3) {
        isCorrect = true;
    }
    
    // Проверка по синонимам (можно расширить)
    const synonyms = {
        'микки маус': ['микки', 'маус', 'мышонок'],
        'белоснежка': ['снежка', 'принцесса'],
        'гарри поттер': ['гарри', 'поттер', 'волшебник'],
        'человек-паук': ['паук', 'спайдермен', 'питер паркер']
    };
    
    if (!isCorrect && synonyms[normalizedTitle]) {
        if (synonyms[normalizedTitle].some(synonym => normalizedGuess.includes(synonym))) {
            isCorrect = true;
        }
    }
    
    // Обработка результата
    if (isCorrect) {
        character.guessed = true;
        character.userGuess = guess;
        
        gameStats.guessed++;
        gameStats.currentStreak++;
        
        if (gameStats.currentStreak > gameStats.bestStreak) {
            gameStats.bestStreak = gameStats.currentStreak;
        }
        
        if (guessResult) {
            guessResult.innerHTML = `
                <p><i class="fas fa-check-circle" style="color:#4CAF50; margin-right:10px;"></i>
                Правильно! Это "${character.title}"!</p>
            `;
            guessResult.className = 'guess-result correct';
        }
        
        // Обновляем отображение
        updateCharactersDisplay();
        updateStatsDisplay();
        loadCurrentCharacter();
        
        // Автоматически переходим к следующему персонажу через 2 секунды
        setTimeout(() => {
            if (characters.some(char => !char.guessed)) {
                nextCharacter();
            } else {
                alert('Поздравляем! Вы отгадали всех персонажей!');
            }
        }, 2000);
        
    } else {
        gameStats.currentStreak = 0;
        
        if (guessResult) {
            guessResult.innerHTML = `
                <p><i class="fas fa-times-circle" style="color:#f44336; margin-right:10px;"></i>
                Неправильно. Попробуйте ещё!</p>
            `;
            guessResult.className = 'guess-result incorrect';
        }
        
        updateStatsDisplay();
    }
    
    // Очищаем поле ввода
    if (guessInput) {
        guessInput.value = '';
    }
}

// Открытие персонажа
function revealCharacter(index) {
    if (characters[index].guessed) return;
    
    characters[index].guessed = true;
    gameStats.guessed++;
    gameStats.currentStreak = 0; // Сбрасываем серию
    
    updateCharactersDisplay();
    updateStatsDisplay();
    
    // Если открыли текущего персонажа, обновляем его отображение
    if (index === currentCharacterIndex) {
        loadCurrentCharacter();
    }
}

// Обновление отображения статистики
function updateStatsDisplay() {
    const guessedCount = characters.filter(char => char.guessed).length;
    const totalCount = characters.length;
    const progress = totalCount > 0 ? Math.round((guessedCount / totalCount) * 100) : 0;
    
    if (gameProgressElement) {
        gameProgressElement.textContent = `${guessedCount}/${totalCount} (${progress}%)`;
    }
}

// Форматирование размера файла
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' Б';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' КБ';
    else return (bytes / 1048576).toFixed(1) + ' МБ';
}

// Экспортируем функции для отладки
if (typeof window !== 'undefined') {
    window.characterGame = {
        loadCharacters,
        resetGame,
        selectRandomCharacter,
        submitGuess,
        requestHint,
        revealCurrentCharacter,
        nextCharacter,
        skipCurrentCharacter
    };
}