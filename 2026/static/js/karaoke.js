// karaoke.js

class KaraokePlayer {
    constructor() {
        this.videos = [];
        this.currentVideo = null;
        this.currentIndex = -1;
        this.playQueue = [];
        this.isPlaying = false;
        this.isLooping = false;
        this.volume = 1.0;
        this.stats = {
            totalPlays: 0,
            totalLikes: 0,
            totalDuration: 0
        };
        
        this.initializeElements();
        this.loadVideos();
        this.loadStats();
        this.setupEventListeners();
        this.createSnowflakes(50);
    }
    
    initializeElements() {
        // DOM элементы
        this.elements = {
            // Поиск и фильтры
            searchInput: document.getElementById('searchInput'),
            searchButton: document.getElementById('searchButton'),
            filterButtons: document.querySelectorAll('.filter-btn'),
            sortSelect: document.getElementById('sortSelect'),
            refreshVideos: document.getElementById('refreshVideos'),
            
            // Статистика
            totalSongs: document.getElementById('totalSongs'),
            totalPlays: document.getElementById('totalPlays'),
            topSong: document.getElementById('topSong'),
            totalDuration: document.getElementById('totalDuration'),
            
            // Сетка видео
            videosGrid: document.getElementById('videosGrid'),
            emptyVideos: document.getElementById('emptyVideos'),
            
            // Проигрыватель
            playerSection: document.getElementById('playerSection'),
            karaokeVideo: document.getElementById('karaokeVideo'),
            playerOverlay: document.getElementById('playerOverlay'),
            playOverlayBtn: document.getElementById('playOverlayBtn'),
            playerTitle: document.getElementById('playerTitle'),
            playerArtist: document.getElementById('playerArtist'),
            playerDuration: document.getElementById('playerDuration'),
            playerViews: document.getElementById('playerViews'),
            playerDate: document.getElementById('playerDate'),
            
            // Элементы управления
            playPauseBtn: document.getElementById('playPauseBtn'),
            prevSongBtn: document.getElementById('prevSongBtn'),
            nextSongBtn: document.getElementById('nextSongBtn'),
            fullscreenBtn: document.getElementById('fullscreenBtn'),
            loopBtn: document.getElementById('loopBtn'),
            volumeSlider: document.getElementById('volumeSlider'),
            progressBar: document.getElementById('progressBar'),
            currentTime: document.getElementById('currentTime'),
            totalTime: document.getElementById('totalTime'),
            
            // Действия
            likeBtn: document.getElementById('likeBtn'),
            lyricsBtn: document.getElementById('lyricsBtn'),
            shareBtn: document.getElementById('shareBtn'),
            addToQueueBtn: document.getElementById('addToQueueBtn'),
            
            // Очередь
            queueList: document.getElementById('queueList'),
            clearQueueBtn: document.getElementById('clearQueueBtn'),
            shuffleQueueBtn: document.getElementById('shuffleQueueBtn'),
            
            // Модальные окна
            closePlayerBtn: document.getElementById('closePlayerBtn'),
            lyricsModal: document.getElementById('lyricsModal'),
            closeLyricsBtn: document.getElementById('closeLyricsBtn'),
            lyricsTitle: document.getElementById('lyricsTitle'),
            lyricsContent: document.getElementById('lyricsContent')
        };
        
        // Инициализация видео элемента
        this.videoElement = this.elements.karaokeVideo;
    }
    
    createSnowflakes(count) {
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
    
    async loadVideos() {
        try {
            const response = await fetch('/api/karaoke/videos');
            if (!response.ok) throw new Error('Ошибка загрузки видео');
            
            const data = await response.json();
            if (data.success) {
                this.videos = data.videos;
                this.displayVideos();
                this.updateStats();
            } else {
                console.error('Ошибка:', data.error);
            }
        } catch (error) {
            console.error('Ошибка загрузки видео:', error);
            this.showErrorMessage('Не удалось загрузить список песен');
        }
    }
    
    async loadStats() {
        try {
            const response = await fetch('/api/karaoke/stats');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.stats = data.stats;
                    this.updateStatsDisplay();
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
        }
    }
    
    displayVideos() {
        if (!this.elements.videosGrid) return;
        
        if (this.videos.length === 0) {
            this.elements.videosGrid.innerHTML = '';
            this.elements.emptyVideos.classList.remove('hidden');
            return;
        }
        
        this.elements.emptyVideos.classList.add('hidden');
        
        // Сортируем видео
        const sortedVideos = this.sortVideos([...this.videos]);
        
        // Очищаем сетку
        this.elements.videosGrid.innerHTML = '';
        
        // Создаем карточки видео
        sortedVideos.forEach((video, index) => {
            const videoCard = this.createVideoCard(video, index);
            this.elements.videosGrid.appendChild(videoCard);
        });
    }
    
    createVideoCard(video, index) {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.dataset.id = video.id;
        
        const duration = video.duration ? this.formatDuration(video.duration) : 'Неизвестно';
        const views = video.views || 0;
        const likes = video.likes || 0;
        
        card.innerHTML = `
            <div class="video-thumbnail">
                <i class="fas fa-music"></i>
            </div>
            <div class="video-info">
                <h3 class="video-title">${video.title || video.filename}</h3>
                <div class="video-meta">
                    ${video.artist ? `<div><i class="fas fa-user"></i> ${video.artist}</div>` : ''}
                    ${video.genre ? `<div><i class="fas fa-tag"></i> ${video.genre}</div>` : ''}
                    <div><i class="fas fa-clock"></i> ${duration}</div>
                </div>
                <div class="video-actions">
                    <button class="btn btn-play" data-id="${video.id}">
                        <i class="fas fa-play"></i> Воспроизвести
                    </button>
                    <div class="video-stats">
                        <span><i class="fas fa-eye"></i> ${views}</span>
                        <span><i class="fas fa-heart"></i> ${likes}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Обработчик клика на карточку
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.btn-play')) {
                this.playVideo(video.id);
            }
        });
        
        // Обработчик кнопки воспроизведения
        const playBtn = card.querySelector('.btn-play');
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.playVideo(video.id);
        });
        
        return card;
    }
    
    sortVideos(videos) {
        const sortBy = this.elements.sortSelect.value;
        
        switch (sortBy) {
            case 'title':
                return videos.sort((a, b) => 
                    (a.title || a.filename).localeCompare(b.title || b.filename)
                );
            case 'title_desc':
                return videos.sort((a, b) => 
                    (b.title || b.filename).localeCompare(a.title || a.filename)
                );
            case 'popular':
                return videos.sort((a, b) => 
                    (b.views || 0) - (a.views || 0)
                );
            case 'newest':
                return videos.sort((a, b) => 
                    new Date(b.added_date || 0) - new Date(a.added_date || 0)
                );
            case 'duration':
                return videos.sort((a, b) => 
                    (a.duration || 0) - (b.duration || 0)
                );
            default:
                return videos;
        }
    }
    
    async playVideo(videoId) {
        const video = this.videos.find(v => v.id == videoId);
        if (!video) return;
        
        this.currentVideo = video;
        this.currentIndex = this.videos.findIndex(v => v.id == videoId);
        
        // Показываем проигрыватель
        this.elements.playerSection.classList.remove('hidden');
        
        // Обновляем информацию о видео
        this.elements.playerTitle.textContent = video.title || video.filename;
        this.elements.playerArtist.textContent = video.artist || 'Неизвестен';
        this.elements.playerDuration.textContent = video.duration ? 
            this.formatDuration(video.duration) : 'Неизвестно';
        this.elements.playerViews.textContent = video.views || 0;
        this.elements.playerDate.textContent = video.added_date ? 
            new Date(video.added_date).toLocaleDateString('ru-RU') : '-';
        
        // Устанавливаем источник видео
        const videoUrl = `/uploads/video/${video.filename}`;
        this.videoElement.src = videoUrl;
        
        // Загружаем видео
        try {
            await this.videoElement.load();
            
            // Обновляем длительность
            this.videoElement.addEventListener('loadedmetadata', () => {
                this.elements.totalTime.textContent = this.formatDuration(this.videoElement.duration);
                this.elements.progressBar.max = Math.floor(this.videoElement.duration);
            });
            
            // Запускаем воспроизведение
            this.videoElement.play().then(() => {
                this.isPlaying = true;
                this.updatePlayButton();
                this.hideOverlay();
                
                // Увеличиваем счетчик просмотров
                this.incrementViewCount(videoId);
            }).catch(error => {
                console.warn('Автовоспроизведение заблокировано:', error);
                this.showOverlay();
            });
            
        } catch (error) {
            console.error('Ошибка загрузки видео:', error);
            this.showErrorMessage('Не удалось загрузить видео');
        }
        
        // Обновляем очередь
        this.updateQueueDisplay();
    }
    
    showOverlay() {
        this.elements.playerOverlay.classList.remove('hidden');
    }
    
    hideOverlay() {
        this.elements.playerOverlay.classList.add('hidden');
    }
    
    playPause() {
        if (this.videoElement.paused) {
            this.videoElement.play();
            this.isPlaying = true;
        } else {
            this.videoElement.pause();
            this.isPlaying = false;
        }
        this.updatePlayButton();
    }
    
    updatePlayButton() {
        const icon = this.isPlaying ? 'fa-pause' : 'fa-play';
        this.elements.playPauseBtn.innerHTML = `<i class="fas ${icon}"></i>`;
    }
    
    nextSong() {
        if (this.playQueue.length > 0) {
            const nextId = this.playQueue.shift();
            this.playVideo(nextId);
        } else if (this.currentIndex < this.videos.length - 1) {
            const nextVideo = this.videos[this.currentIndex + 1];
            this.playVideo(nextVideo.id);
        }
    }
    
    prevSong() {
        if (this.currentIndex > 0) {
            const prevVideo = this.videos[this.currentIndex - 1];
            this.playVideo(prevVideo.id);
        }
    }
    
    toggleLoop() {
        this.isLooping = !this.isLooping;
        this.videoElement.loop = this.isLooping;
        
        const loopBtn = this.elements.loopBtn;
        if (this.isLooping) {
            loopBtn.style.color = '#d4af37';
            loopBtn.title = 'Повтор выключен';
        } else {
            loopBtn.style.color = '';
            loopBtn.title = 'Повтор включен';
        }
    }
    
    updateProgress() {
        if (!this.videoElement.duration) return;
        
        const current = this.videoElement.currentTime;
        const duration = this.videoElement.duration;
        const progress = (current / duration) * 100;
        
        this.elements.currentTime.textContent = this.formatDuration(current);
        this.elements.progressBar.value = current;
        this.elements.progressBar.max = Math.floor(duration);
    }
    
    seekVideo() {
        const seekTime = this.elements.progressBar.value;
        this.videoElement.currentTime = seekTime;
    }
    
    updateVolume() {
        const volume = this.elements.volumeSlider.value / 100;
        this.videoElement.volume = volume;
        this.volume = volume;
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            if (this.videoElement.requestFullscreen) {
                this.videoElement.requestFullscreen();
            } else if (this.videoElement.webkitRequestFullscreen) {
                this.videoElement.webkitRequestFullscreen();
            } else if (this.videoElement.msRequestFullscreen) {
                this.videoElement.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }
    
    addToQueue() {
        if (!this.currentVideo) return;
        
        if (!this.playQueue.includes(this.currentVideo.id)) {
            this.playQueue.push(this.currentVideo.id);
            this.updateQueueDisplay();
            this.showNotification('Песня добавлена в очередь');
        } else {
            this.showNotification('Песня уже в очереди');
        }
    }
    
    clearQueue() {
        this.playQueue = [];
        this.updateQueueDisplay();
        this.showNotification('Очередь очищена');
    }
    
    shuffleQueue() {
        for (let i = this.playQueue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.playQueue[i], this.playQueue[j]] = [this.playQueue[j], this.playQueue[i]];
        }
        this.updateQueueDisplay();
        this.showNotification('Очередь перемешана');
    }
    
    updateQueueDisplay() {
        if (!this.elements.queueList) return;
        
        if (this.playQueue.length === 0) {
            this.elements.queueList.innerHTML = `
                <div class="empty-queue">
                    <i class="fas fa-music"></i>
                    <p>Очередь пуста. Добавьте песни для воспроизведения!</p>
                </div>
            `;
            return;
        }
        
        let queueHTML = '';
        
        this.playQueue.forEach((videoId, index) => {
            const video = this.videos.find(v => v.id == videoId);
            if (!video) return;
            
            const isCurrent = this.currentVideo && this.currentVideo.id == videoId;
            
            queueHTML += `
                <div class="queue-item ${isCurrent ? 'playing' : ''}" data-id="${videoId}">
                    <div class="queue-number">${index + 1}</div>
                    <div class="queue-item-info">
                        <div class="queue-item-title">${video.title || video.filename}</div>
                        <div class="queue-item-artist">${video.artist || 'Неизвестен'}</div>
                    </div>
                    <div class="queue-item-actions">
                        <button class="queue-btn play-queue-btn" data-id="${videoId}">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="queue-btn remove-queue-btn" data-id="${videoId}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        this.elements.queueList.innerHTML = queueHTML;
        
        // Добавляем обработчики для кнопок в очереди
        this.elements.queueList.querySelectorAll('.play-queue-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const videoId = btn.dataset.id;
                this.playVideo(videoId);
            });
        });
        
        this.elements.queueList.querySelectorAll('.remove-queue-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const videoId = btn.dataset.id;
                this.removeFromQueue(videoId);
            });
        });
        
        this.elements.queueList.querySelectorAll('.queue-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.queue-btn')) {
                    const videoId = item.dataset.id;
                    this.playVideo(videoId);
                }
            });
        });
    }
    
    removeFromQueue(videoId) {
        this.playQueue = this.playQueue.filter(id => id != videoId);
        this.updateQueueDisplay();
        this.showNotification('Песня удалена из очереди');
    }
    
    async toggleLike() {
        if (!this.currentVideo) return;
        
        try {
            const response = await fetch('/api/karaoke/like', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    video_id: this.currentVideo.id
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.currentVideo.likes = data.likes;
                    this.elements.likeBtn.innerHTML = `
                        <i class="fas fa-heart"></i> Нравится (${data.likes})
                    `;
                    this.showNotification('Спасибо за ваш голос!');
                }
            }
        } catch (error) {
            console.error('Ошибка оценки:', error);
        }
    }
    
    async showLyrics() {
        if (!this.currentVideo) return;
        
        this.elements.lyricsTitle.textContent = this.currentVideo.title || this.currentVideo.filename;
        this.elements.lyricsContent.textContent = 'Загрузка текста...';
        this.elements.lyricsModal.classList.remove('hidden');
        
        try {
            // Здесь можно загрузить текст песни из API
            // Пока используем заглушку
            const lyrics = this.currentVideo.lyrics || 
                'Текст песни пока недоступен.\n\nПриносим извинения за неудобства.';
            
            this.elements.lyricsContent.textContent = lyrics;
        } catch (error) {
            console.error('Ошибка загрузки текста:', error);
            this.elements.lyricsContent.textContent = 'Не удалось загрузить текст песни.';
        }
    }
    
    shareSong() {
        if (!this.currentVideo) return;
        
        const songTitle = this.currentVideo.title || this.currentVideo.filename;
        const shareText = `🎵 Слушаю "${songTitle}" в новогоднем караоке! 🎄\nПрисоединяйся!`;
        const shareUrl = window.location.href;
        
        if (navigator.share) {
            navigator.share({
                title: songTitle,
                text: shareText,
                url: shareUrl
            });
        } else {
            navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => {
                this.showNotification('Ссылка скопирована в буфер обмена!');
            });
        }
    }
    
    searchVideos() {
        const searchTerm = this.elements.searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            this.displayVideos();
            return;
        }
        
        const filteredVideos = this.videos.filter(video => {
            const title = (video.title || video.filename).toLowerCase();
            const artist = (video.artist || '').toLowerCase();
            const genre = (video.genre || '').toLowerCase();
            
            return title.includes(searchTerm) || 
                   artist.includes(searchTerm) || 
                   genre.includes(searchTerm);
        });
        
        this.displayFilteredVideos(filteredVideos);
    }
    
    displayFilteredVideos(filteredVideos) {
        if (!this.elements.videosGrid) return;
        
        if (filteredVideos.length === 0) {
            this.elements.videosGrid.innerHTML = '';
            this.elements.emptyVideos.classList.remove('hidden');
            return;
        }
        
        this.elements.emptyVideos.classList.add('hidden');
        this.elements.videosGrid.innerHTML = '';
        
        filteredVideos.forEach((video, index) => {
            const videoCard = this.createVideoCard(video, index);
            this.elements.videosGrid.appendChild(videoCard);
        });
    }
    
    filterVideos(category) {
        let filteredVideos = [...this.videos];
        
        if (category !== 'all') {
            filteredVideos = filteredVideos.filter(video => {
                if (category === 'newyear') {
                    const title = (video.title || video.filename).toLowerCase();
                    return title.includes('новый') || 
                           title.includes('новогод') || 
                           title.includes('ёлка') ||
                           (video.genre || '').toLowerCase().includes('новогод');
                } else if (category === 'popular') {
                    return (video.views || 0) > 100;
                } else if (category === 'slow') {
                    return (video.genre || '').toLowerCase().includes('лири') ||
                           (video.genre || '').toLowerCase().includes('роман') ||
                           (video.genre || '').toLowerCase().includes('балла');
                } else if (category === 'fast') {
                    return (video.genre || '').toLowerCase().includes('танц') ||
                           (video.genre || '').toLowerCase().includes('энерг') ||
                           (video.genre || '').toLowerCase().includes('поп');
                }
                return true;
            });
        }
        
        this.displayFilteredVideos(filteredVideos);
    }
    
    async incrementViewCount(videoId) {
        try {
            await fetch('/api/karaoke/view', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ video_id: videoId })
            });
            
            // Обновляем локально
            const video = this.videos.find(v => v.id == videoId);
            if (video) {
                video.views = (video.views || 0) + 1;
                this.stats.totalPlays++;
                this.updateStatsDisplay();
            }
        } catch (error) {
            console.error('Ошибка обновления счетчика просмотров:', error);
        }
    }
    
    updateStats() {
        this.elements.totalSongs.textContent = this.videos.length;
        
        const totalDuration = this.videos.reduce((sum, video) => 
            sum + (video.duration || 0), 0
        );
        this.elements.totalDuration.textContent = this.formatDuration(totalDuration);
        
        // Находим самую популярную песню
        let topVideo = null;
        let maxViews = -1;
        
        this.videos.forEach(video => {
            const views = video.views || 0;
            if (views > maxViews) {
                maxViews = views;
                topVideo = video;
            }
        });
        
        this.elements.topSong.textContent = topVideo ? 
            (topVideo.title || topVideo.filename).substring(0, 20) + '...' : '-';
    }
    
    updateStatsDisplay() {
        this.elements.totalPlays.textContent = this.stats.totalPlays;
    }
    
    formatDuration(seconds) {
        if (!seconds) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
    
    showNotification(message) {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.background = 'linear-gradient(to right, #d4af37, #b8941f)';
        notification.style.color = '#1a0b2e';
        notification.style.padding = '15px 25px';
        notification.style.borderRadius = '10px';
        notification.style.zIndex = '1000';
        notification.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
        notification.style.fontWeight = 'bold';
        notification.style.animation = 'slideIn 0.3s ease-out';
        
        document.body.appendChild(notification);
        
        // Удаляем уведомление через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
        
        // Добавляем CSS анимации
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    showErrorMessage(message) {
        this.elements.videosGrid.innerHTML = `
            <div class="error-message" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #ff6b6b;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 20px;"></i>
                <h3 style="margin-bottom: 15px; color: #ff6b6b;">Ошибка загрузки</h3>
                <p>${message}</p>
                <button class="btn" onclick="karaoke.loadVideos()" style="margin-top: 20px;">
                    <i class="fas fa-sync-alt"></i> Попробовать снова
                </button>
            </div>
        `;
    }
    
    setupEventListeners() {
        // Поиск
        this.elements.searchButton.addEventListener('click', () => this.searchVideos());
        this.elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchVideos();
        });
        
        // Фильтры
        this.elements.filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.elements.filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterVideos(btn.dataset.filter);
            });
        });
        
        // Сортировка
        this.elements.sortSelect.addEventListener('change', () => this.displayVideos());
        
        // Обновление видео
        this.elements.refreshVideos.addEventListener('click', () => this.loadVideos());
        
        // Видео элементы
        this.videoElement.addEventListener('timeupdate', () => this.updateProgress());
        this.videoElement.addEventListener('ended', () => {
            this.isPlaying = false;
            this.updatePlayButton();
            this.nextSong();
        });
        
        // Кнопки проигрывателя
        this.elements.playPauseBtn.addEventListener('click', () => this.playPause());
        this.elements.playOverlayBtn.addEventListener('click', () => {
            this.videoElement.play();
            this.isPlaying = true;
            this.updatePlayButton();
            this.hideOverlay();
        });
        this.elements.prevSongBtn.addEventListener('click', () => this.prevSong());
        this.elements.nextSongBtn.addEventListener('click', () => this.nextSong());
        this.elements.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        this.elements.loopBtn.addEventListener('click', () => this.toggleLoop());
        
        // Ползунки
        this.elements.volumeSlider.addEventListener('input', () => this.updateVolume());
        this.elements.progressBar.addEventListener('input', () => this.seekVideo());
        
        // Действия
        this.elements.likeBtn.addEventListener('click', () => this.toggleLike());
        this.elements.lyricsBtn.addEventListener('click', () => this.showLyrics());
        this.elements.shareBtn.addEventListener('click', () => this.shareSong());
        this.elements.addToQueueBtn.addEventListener('click', () => this.addToQueue());
        
        // Очередь
        this.elements.clearQueueBtn.addEventListener('click', () => this.clearQueue());
        this.elements.shuffleQueueBtn.addEventListener('click', () => this.shuffleQueue());
        
        // Закрытие проигрывателя
        this.elements.closePlayerBtn.addEventListener('click', () => {
            this.elements.playerSection.classList.add('hidden');
            this.videoElement.pause();
            this.isPlaying = false;
            this.updatePlayButton();
        });
        
        // Модальное окно текста
        this.elements.closeLyricsBtn.addEventListener('click', () => {
            this.elements.lyricsModal.classList.add('hidden');
        });
        
        // Закрытие модальных окон по клику вне их
        window.addEventListener('click', (e) => {
            if (e.target === this.elements.lyricsModal) {
                this.elements.lyricsModal.classList.add('hidden');
            }
        });
        
        // Горячие клавиши
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch (e.key.toLowerCase()) {
                case ' ':
                    e.preventDefault();
                    if (this.videoElement) this.playPause();
                    break;
                case 'arrowright':
                    if (this.videoElement) this.videoElement.currentTime += 10;
                    break;
                case 'arrowleft':
                    if (this.videoElement) this.videoElement.currentTime -= 10;
                    break;
                case 'arrowup':
                    if (this.videoElement) {
                        this.videoElement.volume = Math.min(1, this.videoElement.volume + 0.1);
                        this.elements.volumeSlider.value = this.videoElement.volume * 100;
                    }
                    break;
                case 'arrowdown':
                    if (this.videoElement) {
                        this.videoElement.volume = Math.max(0, this.videoElement.volume - 0.1);
                        this.elements.volumeSlider.value = this.videoElement.volume * 100;
                    }
                    break;
                case 'f':
                    this.toggleFullscreen();
                    break;
                case 'l':
                    this.toggleLoop();
                    break;
                case 'escape':
                    this.elements.playerSection.classList.add('hidden');
                    this.elements.lyricsModal.classList.add('hidden');
                    break;
            }
        });
    }
}

// Инициализация при загрузке страницы
let karaoke;

document.addEventListener('DOMContentLoaded', () => {
    karaoke = new KaraokePlayer();
    
    // Экспортируем для глобального доступа (для отладки)
    window.karaoke = karaoke;
});