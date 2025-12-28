// quiz.js
class QuizGame {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.scores = { red: 0, blue: 0 };
        this.currentTeam = 'red';
        this.answeredQuestions = new Set();
        this.gameTime = 0;
        this.correctStreak = 0;
        this.timer = null;
        this.timeLeft = 30;
        
        this.initializeElements();
        this.loadQuestions();
        this.startGameTimer();
    }
    
    initializeElements() {
        // DOM элементы
        this.elements = {
            redScore: document.getElementById('redScore'),
            blueScore: document.getElementById('blueScore'),
            redTurnIndicator: document.getElementById('redTurnIndicator'),
            blueTurnIndicator: document.getElementById('blueTurnIndicator'),
            questionNumber: document.getElementById('questionNumber'),
            totalQuestions: document.getElementById('totalQuestions'),
            questionText: document.getElementById('questionText'),
            questionCategory: document.getElementById('questionCategory'),
            questionDifficulty: document.getElementById('questionDifficulty'),
            timeLeft: document.getElementById('timeLeft'),
            answeredQuestions: document.getElementById('answeredQuestions'),
            accuracyRate: document.getElementById('accuracyRate'),
            currentStreak: document.getElementById('currentStreak'),
            timePlayed: document.getElementById('timePlayed'),
            
            // Кнопки
            answerBtn: document.getElementById('answerBtn'),
            giveUpBtn: document.getElementById('giveUpBtn'),
            prevQuestionBtn: document.getElementById('prevQuestionBtn'),
            nextQuestionBtn: document.getElementById('nextQuestionBtn'),
            randomQuestionBtn: document.getElementById('randomQuestionBtn'),
            clearHistoryBtn: document.getElementById('clearHistoryBtn'),
            
            // Модальные окна
            answerModal: document.getElementById('answerModal'),
            giveUpModal: document.getElementById('giveUpModal'),
            modalCorrectAnswer: document.getElementById('modalCorrectAnswer'),
            giveUpCorrectAnswer: document.getElementById('giveUpCorrectAnswer'),
            
            // Кнопки в модальных окнах
            givePointToRed: document.getElementById('givePointToRed'),
            givePointToBlue: document.getElementById('givePointToBlue'),
            noPoints: document.getElementById('noPoints'),
            modalCloseBtn: document.getElementById('modalCloseBtn'),
            cancelGiveUp: document.getElementById('cancelGiveUp'),
            confirmGiveUp: document.getElementById('confirmGiveUp'),
            giveUpModalClose: document.getElementById('giveUpModalClose'),
            
            // Контейнеры
            historyContainer: document.getElementById('historyContainer')
        };
        
        // Назначаем обработчики событий
        this.setupEventListeners();
    }
    
    async loadQuestions() {
        try {
            const response = await fetch('/api/quiz/questions');
            if (response.ok) {
                const data = await response.json();
                this.questions = data.questions || [];
                this.elements.totalQuestions.textContent = this.questions.length;
                
                if (this.questions.length > 0) {
                    this.displayQuestion(this.currentQuestionIndex);
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки вопросов:', error);
            this.elements.questionText.textContent = 'Ошибка загрузки вопросов. Пожалуйста, обновите страницу.';
        }
    }
    
    displayQuestion(index) {
        if (index < 0 || index >= this.questions.length) return;
        
        const question = this.questions[index];
        this.currentQuestionIndex = index;
        
        // Обновляем интерфейс
        this.elements.questionNumber.textContent = index + 1;
        this.elements.questionText.textContent = question.question;
        this.elements.questionCategory.textContent = question.category || 'Общая тема';
        this.elements.questionDifficulty.textContent = this.getDifficultyText(question.difficulty);
        
        // Сбрасываем таймер
        this.resetTimer();
        
        // Обновляем индикатор текущей команды
        this.updateTeamIndicators();
    }
    
    getDifficultyText(difficulty) {
        const difficulties = {
            'easy': 'Легкая',
            'medium': 'Средняя',
            'hard': 'Сложная'
        };
        return difficulties[difficulty] || 'Средняя';
    }
    
    updateTeamIndicators() {
        if (this.currentTeam === 'red') {
            this.elements.redTurnIndicator.classList.remove('hidden');
            this.elements.blueTurnIndicator.classList.add('hidden');
        } else {
            this.elements.redTurnIndicator.classList.add('hidden');
            this.elements.blueTurnIndicator.classList.remove('hidden');
        }
    }
    
    updateScores() {
        this.elements.redScore.textContent = this.scores.red;
        this.elements.blueScore.textContent = this.scores.blue;
    }
    
    resetTimer() {
        if (this.timer) clearInterval(this.timer);
        this.timeLeft = 30;
        this.elements.timeLeft.textContent = this.timeLeft;
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.elements.timeLeft.textContent = this.timeLeft;
            
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                this.showTimeUpMessage();
            }
        }, 1000);
    }
    
    showTimeUpMessage() {
        this.showGiveUpModal();
    }
    
    showAnswerModal() {
        if (this.currentQuestionIndex < this.questions.length) {
            const question = this.questions[this.currentQuestionIndex];
            this.elements.modalCorrectAnswer.textContent = question.answer;
            this.elements.answerModal.classList.remove('hidden');
        }
    }
    
    showGiveUpModal() {
        if (this.currentQuestionIndex < this.questions.length) {
            const question = this.questions[this.currentQuestionIndex];
            this.elements.giveUpCorrectAnswer.textContent = question.answer;
            this.elements.giveUpModal.classList.remove('hidden');
        }
    }
    
    addPointsToTeam(team, points = 10) {
        this.scores[team] += points;
        this.updateScores();
        
        // Переключаем команду, если отмечено в чекбоксе
        const switchTurn = document.getElementById('switchTurnCheckbox').checked;
        if (switchTurn) {
            this.currentTeam = team === 'red' ? 'blue' : 'red';
            this.updateTeamIndicators();
        }
        
        this.closeAnswerModal();
        this.moveToNextQuestion();
    }
    
    closeAnswerModal() {
        this.elements.answerModal.classList.add('hidden');
        this.answeredQuestions.add(this.currentQuestionIndex);
        this.updateStats();
    }
    
    moveToNextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion(this.currentQuestionIndex);
        }
    }
    
    moveToPrevQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayQuestion(this.currentQuestionIndex);
        }
    }
    
    showRandomQuestion() {
        if (this.questions.length === 0) return;
        
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * this.questions.length);
        } while (this.answeredQuestions.has(randomIndex) && 
                 this.answeredQuestions.size < this.questions.length);
        
        this.currentQuestionIndex = randomIndex;
        this.displayQuestion(this.currentQuestionIndex);
    }
    
    updateStats() {
        const totalAnswered = this.answeredQuestions.size;
        const accuracy = totalAnswered > 0 ? 
            Math.round((this.correctStreak / totalAnswered) * 100) : 0;
        
        this.elements.answeredQuestions.textContent = totalAnswered;
        this.elements.accuracyRate.textContent = `${accuracy}%`;
        this.elements.currentStreak.textContent = this.correctStreak;
    }
    
    startGameTimer() {
        setInterval(() => {
            this.gameTime++;
            const minutes = Math.floor(this.gameTime / 60);
            const seconds = this.gameTime % 60;
            this.elements.timePlayed.textContent = 
                `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    setupEventListeners() {
        // Основные кнопки
        this.elements.answerBtn.addEventListener('click', () => this.showAnswerModal());
        this.elements.giveUpBtn.addEventListener('click', () => this.showGiveUpModal());
        this.elements.prevQuestionBtn.addEventListener('click', () => this.moveToPrevQuestion());
        this.elements.nextQuestionBtn.addEventListener('click', () => this.moveToNextQuestion());
        this.elements.randomQuestionBtn.addEventListener('click', () => this.showRandomQuestion());
        
        // Кнопки в модальном окне ответа
        this.elements.givePointToRed.addEventListener('click', () => {
            this.addPointsToTeam('red');
            this.correctStreak++;
        });
        
        this.elements.givePointToBlue.addEventListener('click', () => {
            this.addPointsToTeam('blue');
            this.correctStreak++;
        });
        
        this.elements.noPoints.addEventListener('click', () => {
            this.closeAnswerModal();
            this.moveToNextQuestion();
            this.correctStreak = 0;
        });
        
        this.elements.modalCloseBtn.addEventListener('click', () => {
            this.elements.answerModal.classList.add('hidden');
        });
        
        // Кнопки в модальном окне сдачи
        this.elements.confirmGiveUp.addEventListener('click', () => {
            this.elements.giveUpModal.classList.add('hidden');
            this.moveToNextQuestion();
            this.correctStreak = 0;
        });
        
        this.elements.cancelGiveUp.addEventListener('click', () => {
            this.elements.giveUpModal.classList.add('hidden');
        });
        
        this.elements.giveUpModalClose.addEventListener('click', () => {
            this.elements.giveUpModal.classList.add('hidden');
        });
        
        // Очистка истории
        this.elements.clearHistoryBtn.addEventListener('click', () => {
            this.answeredQuestions.clear();
            this.correctStreak = 0;
            this.updateStats();
        });
        
        // Закрытие модальных окон по клику на фон
        this.elements.answerModal.addEventListener('click', (e) => {
            if (e.target === this.elements.answerModal) {
                this.elements.answerModal.classList.add('hidden');
            }
        });
        
        this.elements.giveUpModal.addEventListener('click', (e) => {
            if (e.target === this.elements.giveUpModal) {
                this.elements.giveUpModal.classList.add('hidden');
            }
        });
        
        // Горячие клавиши
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                if (!this.elements.answerModal.classList.contains('hidden')) return;
                if (!this.elements.giveUpModal.classList.contains('hidden')) return;
                this.showAnswerModal();
            }
            
            if (e.key === 'ArrowRight') {
                this.moveToNextQuestion();
            }
            
            if (e.key === 'ArrowLeft') {
                this.moveToPrevQuestion();
            }
            
            if (e.key === 'r' || e.key === 'к') {
                this.showRandomQuestion();
            }
            
            if (e.key === 'Escape') {
                this.elements.answerModal.classList.add('hidden');
                this.elements.giveUpModal.classList.add('hidden');
            }
        });
    }
}

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new QuizGame();
});