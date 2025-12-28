// Переменные приложения
let songs = [];
let currentLevel = "easy";
let levelDurations = { easy: 8, medium: 5, hard: 3, expert: 2 };
let currentAudio = null;
let currentSongIndex = -1;
let isPlayingFull = false;
let audioPlayerVisible = false;
let gameStats = {
    revealed: 0,
    guessed: 0,
    total: 0,
    bestStreak: 0,
    currentStreak: 0
};

// DOM элементы
const songsContainer = document.getElementById('songs-container');
const loadSongsBtn = document.getElementById('loadSongs');
const resetGameBtn = document.getElementById('resetGame');
const rescanBtn = document.getElementById('rescanBtn');
const guessAllBtn = document.getElementById('guessAll');
const levelButtons = document.querySelectorAll('.level-btn');
const audioPlayer = document.getElementById('audioPlayer');
const playerTitle = document.getElementById('player-title');
const playerArtist = document.getElementById('player-artist');
const playerTime = document.getElementById('player-time');
const playerProgress = document.getElementById('player-progress');
const playerPlayBtn = document.getElementById('player-play');
const playerPrevBtn = document.getElementById('player-prev');
const playerNextBtn = document.getElementById('player-next');
const playerCloseBtn = document.getElementById('player-close');

// Элементы статистики
const songCountElement = document.getElementById('song-count');
const foundSongsElement = document.getElementById('found-songs');
const revealedSongsElement = document.getElementById('revealed-songs');
const guessedSongsElement = document.getElementById('guessed-songs');
const currentLevelElement = document.getElementById('current-level');
const statsGuessedElement = document.getElementById('stats-guessed');
const bestStreakElement = document.getElementById('best-streak');

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    createSnowflakes(50);
    setupEventListeners();
    updateStatsDisplay();
});

// Создание снежинок
function createSnowflakes(count) {
    const snowflakesContainer = document.querySelector('.snowflakes');
    
    for (let i = 0; i < count; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        
        // Случайные параметры снежинки
        const size = Math.random() * 10 + 5;
        const startX = Math.random() * 100;
        const duration = Math.random() * 10 + 10;
        const delay = Math.random() * 5;
        
        snowflake.style.width = `${size}px`;
        snowflake.style.height = `${size}px`;
        snowflake.style.left = `${startX}vw`;
        snowflake.style.top = '-20px';
        snowflake.style.opacity = Math.random() * 0.5 + 0.3;
        
        // Анимация падения
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
    loadSongsBtn.addEventListener('click', loadSongs);
    resetGameBtn.addEventListener('click', resetGame);
    rescanBtn.addEventListener('click', rescanSongs);
    guessAllBtn.addEventListener('click', guessAllSongs);
    
    // Обработчики кнопок уровня сложности
    levelButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            levelButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentLevel = this.dataset.level;
            const duration = this.dataset.duration;
            currentLevelElement.textContent = `${this.textContent.split('\n')[0]} (${duration} сек)`;
            updateSongsDisplay();
        });
    });
    
    // Обработчики управления плеером
    playerPlayBtn.addEventListener('click', togglePlay);
    playerPrevBtn.addEventListener('click', playPrevSong);
    playerNextBtn.addEventListener('click', playNextSong);
    playerCloseBtn.addEventListener('click', closePlayer);
}

// Загрузка песен с сервера
async function loadSongs() {
    try {
        loadSongsBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Загрузка...';
        loadSongsBtn.disabled = true;
        
        const response = await fetch('/api/songs');
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        songs = await response.json();
        
        // Инициализируем состояние песен
        songs.forEach(song => {
            song.revealed = false;
            song.guessed = false;
            song.userGuess = '';
        });
        
        gameStats.total = songs.length;
        updateSongsDisplay();
        updateStatsDisplay();
        
        loadSongsBtn.innerHTML = `<i class="fas fa-check"></i> Загружено песен: ${songs.length}`;
        loadSongsBtn.disabled = true;
        
    } catch (error) {
        console.error('Ошибка загрузки песен:', error);
        songsContainer.innerHTML = `
            <div class="empty-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Ошибка загрузки песен: ${error.message}</p>
                <p>Проверьте, что сервер запущен и в папке audio есть MP3 файлы</p>
            </div>
        `;
        loadSongsBtn.innerHTML = '<i class="fas fa-folder-open"></i> Загрузить песни';
        loadSongsBtn.disabled = false;
    }
}

// Повторное сканирование папки
async function rescanSongs() {
    try {
        rescanBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        rescanBtn.disabled = true;
        
        const response = await fetch('/api/rescan/audio');
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        songs = data.songs;
        
        // Сохраняем состояние уже открытых песен
        const oldSongsState = new Map();
        songs.forEach((song, index) => {
            const oldSong = songs.find(s => s.filename === song.filename);
            if (oldSong) {
                song.revealed = oldSong.revealed || false;
                song.guessed = oldSong.guessed || false;
                song.userGuess = oldSong.userGuess || '';
            } else {
                song.revealed = false;
                song.guessed = false;
                song.userGuess = '';
            }
        });
        
        gameStats.total = songs.length;
        updateSongsDisplay();
        updateStatsDisplay();
        
        alert(`Обновлено! Найдено ${songs.length} песен.`);
        
    } catch (error) {
        console.error('Ошибка обновления списка песен:', error);
        alert(`Ошибка обновления: ${error.message}`);
    } finally {
        rescanBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Обновить список';
        rescanBtn.disabled = false;
    }
}

// Сброс игры
function resetGame() {
    if (!confirm('Вы уверены, что хотите начать заново? Весь прогресс будет сброшен.')) {
        return;
    }
    
    songs.forEach(song => {
        song.revealed = false;
        song.guessed = false;
        song.userGuess = '';
    });
    
    gameStats.revealed = 0;
    gameStats.guessed = 0;
    gameStats.currentStreak = 0;
    
    updateSongsDisplay();
    updateStatsDisplay();
    
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    
    closePlayer();
    
    loadSongsBtn.innerHTML = '<i class="fas fa-folder-open"></i> Загрузить песни';
    loadSongsBtn.disabled = false;
}

// Попробовать угадать все песни
function guessAllSongs() {
    if (songs.length === 0) {
        alert('Сначала загрузите песни!');
        return;
    }
    
    const unrevealed = songs.filter(s => !s.revealed);
    if (unrevealed.length === 0) {
        alert('Все песни уже открыты!');
        return;
    }
    
    const guess = prompt(`Попробуйте угадать все ${unrevealed.length} скрытые песни. Введите через запятую названия, которые, как вы думаете, там есть:`);
    
    if (!guess) return;
    
    const guesses = guess.split(',').map(g => g.trim().toLowerCase());
    let correctCount = 0;
    
    unrevealed.forEach(song => {
        const songTitle = song.title.toLowerCase();
        if (guesses.some(g => songTitle.includes(g) || g.includes(songTitle))) {
            song.guessed = true;
            song.revealed = true;
            correctCount++;
            gameStats.currentStreak++;
        }
    });
    
    if (correctCount > 0) {
        gameStats.guessed += correctCount;
        gameStats.revealed += correctCount;
        
        if (gameStats.currentStreak > gameStats.bestStreak) {
            gameStats.bestStreak = gameStats.currentStreak;
        }
        
        alert(`Правильно! Вы угадали ${correctCount} из ${unrevealed.length} песен!`);
    } else {
        gameStats.currentStreak = 0;
        alert('К сожалению, вы не угадали ни одной песни. Попробуйте ещё!');
    }
    
    updateSongsDisplay();
    updateStatsDisplay();
}

// Обновление отображения списка песен
function updateSongsDisplay() {
    if (songs.length === 0) {
        songsContainer.innerHTML = `
            <div class="empty-message">
                <i class="fas fa-music"></i>
                <p>Нажмите "Загрузить песни", чтобы начать игру</p>
            </div>
        `;
        return;
    }
    
    songsContainer.innerHTML = '';
    
    // Подсчитываем статистику
    let revealedCount = 0;
    let guessedCount = 0;
    
    songs.forEach((song, index) => {
        if (song.revealed) revealedCount++;
        if (song.guessed) guessedCount++;
        
        const songElement = document.createElement('div');
        songElement.className = 'song-item';
        if (song.revealed) songElement.classList.add('revealed');
        if (song.guessed) songElement.classList.add('guessed');
        songElement.dataset.index = index;
        
        const durationFormatted = formatDuration(song.duration);
        const filesizeFormatted = formatFileSize(song.filesize);
        
        songElement.innerHTML = `
            <div class="song-info">
                <div class="song-title ${song.revealed ? '' : 'hidden'}">
                    ${song.revealed ? song.title : 'Скрытая мелодия'}
                    ${song.guessed ? ' <i class="fas fa-check" style="color:#4CAF50"></i>' : ''}
                </div>
                <div class="song-details">
                    <span><i class="fas fa-user"></i> ${song.revealed ? song.artist : "Сначала угадай)"}</span>
                    <span><i class="fas fa-clock"></i> ${durationFormatted}</span>
                    <span><i class="fas fa-hdd"></i> ${filesizeFormatted}</span>
                </div>
            </div>
            <div class="song-controls">
                <button class="btn btn-play play-preview" data-index="${index}">
                    <i class="fas fa-play-circle"></i> Проиграть ${levelDurations[currentLevel]} сек
                </button>
                ${!song.revealed ? `
                    <button class="btn btn-reveal reveal-song" data-index="${index}">
                        <i class="fas fa-eye"></i> Открыть
                    </button>
                    <button class="btn btn-guess guess-song" data-index="${index}">
                        <i class="fas fa-lightbulb"></i> Угадать
                    </button>
                ` : `
                    <button class="btn btn-play play-full" data-index="${index}">
                        <i class="fas fa-play"></i> Полностью
                    </button>
                `}
            </div>
        `;
        
        songsContainer.appendChild(songElement);
    });
    
    // Обновляем счетчики в заголовке
    foundSongsElement.textContent = songs.length;
    revealedSongsElement.textContent = revealedCount;
    guessedSongsElement.textContent = guessedCount;
    
    // Добавляем обработчики для кнопок песен
    document.querySelectorAll('.play-preview').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            playPreview(index);
        });
    });
    
    document.querySelectorAll('.play-full').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            playFullSong(index);
        });
    });
    
    document.querySelectorAll('.reveal-song').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            revealSong(index);
        });
    });
    
    document.querySelectorAll('.guess-song').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            guessSong(index);
        });
    });
}

// Проигрывание превью (отрывок)
async function playPreview(index) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    
    const song = songs[index];
    currentSongIndex = index;
    isPlayingFull = false;
    
    // Показываем плеер
    playerTitle.textContent = `Отрывок: ?????????`;
    playerArtist.textContent = 'Слушайте внимательно...';
    showPlayer();
    
    // Создаем аудио элемент
    currentAudio = new Audio(`/api/audio/${encodeURIComponent(song.filename)}/preview`);
    
    // Устанавливаем громкость
    currentAudio.volume = 0.8;
    
    // Обновляем прогресс
    currentAudio.addEventListener('timeupdate', function() {
        const currentTime = currentAudio.currentTime;
        const duration = Math.min(levelDurations[currentLevel], currentAudio.duration || levelDurations[currentLevel]);
        const progress = (currentTime / duration) * 100;
        
        playerProgress.style.width = `${progress}%`;
        playerTime.textContent = `${formatDuration(currentTime)} / ${formatDuration(duration)}`;
        
        // Автоматически останавливаем через N секунд для превью
        if (!isPlayingFull && currentTime >= levelDurations[currentLevel]) {
            currentAudio.pause();
            playerPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    });
    
    // Обработчик окончания воспроизведения
    currentAudio.addEventListener('ended', function() {
        playerPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
    });
    
    // Начинаем воспроизведение
    try {
        await currentAudio.play();
        playerPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } catch (error) {
        console.error('Ошибка воспроизведения:', error);
        alert('Не удалось воспроизвести аудио. Проверьте, поддерживает ли браузер формат MP3.');
    }
}

// Проигрывание полной версии песни
async function playFullSong(index) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    
    const song = songs[index];
    currentSongIndex = index;
    isPlayingFull = true;
    
    // Показываем плеер
    playerTitle.textContent = song.title;
    playerArtist.textContent = song.artist;
    showPlayer();
    
    // Создаем аудио элемент
    currentAudio = new Audio(`/api/audio/${encodeURIComponent(song.filename)}`);
    
    // Устанавливаем громкость
    currentAudio.volume = 0.8;
    
    // Обновляем прогресс
    currentAudio.addEventListener('timeupdate', function() {
        const currentTime = currentAudio.currentTime;
        const duration = currentAudio.duration || song.duration;
        const progress = (currentTime / duration) * 100;
        
        playerProgress.style.width = `${progress}%`;
        playerTime.textContent = `${formatDuration(currentTime)} / ${formatDuration(duration)}`;
    });
    
    // Обработчик окончания воспроизведения
    currentAudio.addEventListener('ended', function() {
        playerPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
    });
    
    // Начинаем воспроизведение
    try {
        await currentAudio.play();
        playerPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } catch (error) {
        console.error('Ошибка воспроизведения:', error);
        alert('Не удалось воспроизвести аудио. Проверьте, поддерживает ли браузер формат MP3.');
    }
}

// Переключение воспроизведения
function togglePlay() {
    if (!currentAudio) return;
    
    if (currentAudio.paused) {
        currentAudio.play();
        playerPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        currentAudio.pause();
        playerPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

// Открытие названия песни
function revealSong(index) {
    if (songs[index].revealed) return;
    
    songs[index].revealed = true;
    gameStats.revealed++;
    updateSongsDisplay();
    updateStatsDisplay();
}

// Попытка угадать песню
function guessSong(index) {
    if (songs[index].revealed) return;
    
    const guess = prompt('Попробуйте угадать название этой песни:');
    if (!guess) return;
    
    const song = songs[index];
    const normalizedGuess = guess.trim().toLowerCase();
    const normalizedTitle = song.title.toLowerCase();
    
    // Простая проверка (можно улучшить)
    if (normalizedGuess === normalizedTitle || 
        normalizedTitle.includes(normalizedGuess) || 
        normalizedGuess.includes(normalizedTitle)) {
        
        song.revealed = true;
        song.guessed = true;
        song.userGuess = guess;
        
        gameStats.revealed++;
        gameStats.guessed++;
        gameStats.currentStreak++;
        
        if (gameStats.currentStreak > gameStats.bestStreak) {
            gameStats.bestStreak = gameStats.currentStreak;
        }
        
        alert(`Правильно! Это "${song.title}"!`);
    } else {
        gameStats.currentStreak = 0;
        alert(`К сожалению, это не "${guess}". Попробуйте ещё!`);
    }
    
    updateSongsDisplay();
    updateStatsDisplay();
}

// Воспроизведение предыдущей песни
function playPrevSong() {
    if (currentSongIndex <= 0) return;
    currentSongIndex--;
    
    if (isPlayingFull) {
        playFullSong(currentSongIndex);
    } else {
        playPreview(currentSongIndex);
    }
}

// Воспроизведение следующей песни
function playNextSong() {
    if (currentSongIndex >= songs.length - 1) return;
    currentSongIndex++;
    
    if (isPlayingFull) {
        playFullSong(currentSongIndex);
    } else {
        playPreview(currentSongIndex);
    }
}

// Показать аудиоплеер
function showPlayer() {
    audioPlayer.classList.add('show');
    audioPlayerVisible = true;
}

// Скрыть аудиоплеер
function closePlayer() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    
    audioPlayer.classList.remove('show');
    audioPlayerVisible = false;
    playerPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
    playerProgress.style.width = '0%';
    playerTime.textContent = '0:00 / 0:00';
}

// Обновление отображения статистики
function updateStatsDisplay() {
    songCountElement.textContent = songs.length;
    currentLevelElement.textContent = `${document.querySelector('.level-btn.active').textContent.split('\n')[0]} (${levelDurations[currentLevel]} сек)`;
    statsGuessedElement.textContent = `${gameStats.guessed} из ${gameStats.total}`;
    bestStreakElement.textContent = gameStats.bestStreak;
}

// Форматирование длительности в MM:SS
function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Форматирование размера файла
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' Б';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' КБ';
    else return (bytes / 1048576).toFixed(1) + ' МБ';
}
async function updateLotteryStats() {
    try {
        const response = await fetch('/api/lottery/prizes');
        if (response.ok) {
            const data = await response.json();
            document.getElementById('lottery-count').textContent = `${data.total} призов`;
        }
    } catch (error) {
        ('Не удалось загрузить статистику лотереи:', error);
    }
}