import urllib.parse
import os
import json
from flask import Flask, render_template, jsonify, send_file, request # pyright: ignore[reportMissingImports]
from mutagen.mp3 import MP3 # type: ignore
from mutagen.id3 import ID3 # type: ignore
import glob
import time
from PIL import Image # type: ignore
import mimetypes
import random
from datetime import datetime

app = Flask(__name__)

# Конфигурация
AUDIO_FOLDER = 'audio'
IMAGES_FOLDER = 'images'
ORIGINAL_FOLDER = os.path.join(IMAGES_FOLDER, 'original')
PREVIEW_FOLDER = os.path.join(IMAGES_FOLDER, 'preview')
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'mp3', 'jpg', 'jpeg', 'png', 'gif', 'webp',"jfif","avif"}
LOTTERY_FILE = os.path.join(UPLOAD_FOLDER, 'lottery.json')
QUIZ_FILE = os.path.join(UPLOAD_FOLDER, 'quiz.json')
UPLOAD_VIDEO_FOLDER = os.path.join(UPLOAD_FOLDER, 'video')
KARAOKE_JSON = os.path.join(UPLOAD_FOLDER, 'karaoke.json')


# Создаем папки если их нет
for folder in [AUDIO_FOLDER, IMAGES_FOLDER, UPLOAD_FOLDER,ORIGINAL_FOLDER,PREVIEW_FOLDER,UPLOAD_VIDEO_FOLDER]:
    os.makedirs(folder, exist_ok=True)


@app.route('/api/uploads/<filename>')
def get_uploaded_file(filename):
    """API для получения файлов из папки uploads"""
    try:
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        # Проверяем безопасность пути
        if not os.path.exists(filepath) or '..' in filename:
            return jsonify({'error': 'File not found or access denied'}), 404
        
        # Определяем MIME-тип по расширению
        if filename.endswith('.mp3'):
            mimetype = 'audio/mpeg'
        elif filename.endswith('.wav'):
            mimetype = 'audio/wav'
        elif filename.endswith('.ogg'):
            mimetype = 'audio/ogg'
        else:
            # Пытаемся угадать
            mimetype, _ = mimetypes.guess_type(filepath)
            if not mimetype:
                mimetype = 'application/octet-stream'
        
        # Устанавливаем правильные заголовки для аудио
        response = send_file(
            filepath,
            mimetype=mimetype,
            as_attachment=False,
            download_name=filename
        )
        
        # Добавляем заголовки для кэширования и частичного контента
        response.headers['Accept-Ranges'] = 'bytes'
        response.headers['Cache-Control'] = 'public, max-age=3600'
        
        return response
        
    except Exception as e:
        print(f"Ошибка получения файла {filename}: {e}")
        return jsonify({'error': str(e)}), 500
# Также добавьте функцию для создания демо-звуков
def create_demo_sounds():
    """Создание демо-звуков если их нет"""
    sounds = {
        'volcok.mp3': 'Звук вращения колеса',
        'win_sound.mp3': 'Звук выигрыша'
    }
    
    for filename, description in sounds.items():
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        if not os.path.exists(filepath):
            # Создаем простой текстовый файл как заглушку
            # В реальном приложении здесь будут настоящие MP3 файлы
            with open(filepath, 'w') as f:
                f.write(f"Демо-файл: {description}\n")
                f.write(f"В реальном приложении здесь будет MP3 файл\n")
            print(f"Создан демо-файл: {filename}")

@app.route('/fortune-wheel')
def fortune_wheel():
    """Страница игры 'Колесо фортуны'"""
    return render_template('fortune_wheel.html')

# app.py - добавьте эти маршруты

@app.route("/karaoke")
def karaoke():
    """Страница караоке"""
    return render_template('karaoke.html')

# API для караоке


@app.route("/api/karaoke/videos")
def karaoke_videos():
    """API для получения списка видео"""
    try:
        # Создаем папку для видео если её нет
        os.makedirs(UPLOAD_VIDEO_FOLDER, exist_ok=True)
        
        # Загружаем данные из JSON файла
        if os.path.exists(KARAOKE_JSON):
            with open(KARAOKE_JSON, 'r', encoding='utf-8') as f:
                videos_data = json.load(f)
        else:
            # Создаем примерный файл если его нет
            videos_data = []
            # Ищем видеофайлы в папке
            for filename in os.listdir(UPLOAD_VIDEO_FOLDER):
                if filename.lower().endswith(('.mp4', '.avi', '.mov', '.mkv', '.webm')):
                    videos_data.append({
                        "id": len(videos_data) + 1,
                        "filename": filename,
                        "title": filename.replace('.mp4', '').replace('_', ' ').title(),
                        "artist": "Неизвестен",
                        "genre": "Новогодняя",
                        "duration": 180,
                        "views": 0,
                        "likes": 0,
                        "added_date": datetime.now().isoformat()
                    })
            
            # Сохраняем примерный файл
            with open(KARAOKE_JSON, 'w', encoding='utf-8') as f:
                json.dump(videos_data, f, ensure_ascii=False, indent=2)
        
        return jsonify({
            "success": True,
            "videos": videos_data,
            "total": len(videos_data)
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Ошибка загрузки видео: {str(e)}",
            "videos": []
        }), 500

@app.route("/api/karaoke/stats")
def karaoke_stats():
    """API для получения статистики караоке"""
    try:
        if os.path.exists(KARAOKE_JSON):
            with open(KARAOKE_JSON, 'r', encoding='utf-8') as f:
                videos_data = json.load(f)
            
            total_plays = sum(video.get("views", 0) for video in videos_data)
            total_likes = sum(video.get("likes", 0) for video in videos_data)
            total_duration = sum(video.get("duration", 0) for video in videos_data)
            
            return jsonify({
                "success": True,
                "stats": {
                    "total_plays": total_plays,
                    "total_likes": total_likes,
                    "total_duration": total_duration,
                    "total_videos": len(videos_data)
                }
            })
        else:
            return jsonify({
                "success": True,
                "stats": {
                    "total_plays": 0,
                    "total_likes": 0,
                    "total_duration": 0,
                    "total_videos": 0
                }
            })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Ошибка получения статистики: {str(e)}"
        }), 500

@app.route("/api/karaoke/view", methods=["POST"])
def karaoke_view():
    """API для увеличения счетчика просмотров"""
    try:
        data = request.json
        video_id = data.get("video_id")
        
        if not video_id:
            return jsonify({"success": False, "error": "Не указан ID видео"}), 400
        
        if os.path.exists(KARAOKE_JSON):
            with open(KARAOKE_JSON, 'r', encoding='utf-8') as f:
                videos_data = json.load(f)
            
            # Находим видео и увеличиваем счетчик просмотров
            for video in videos_data:
                if video.get("id") == video_id:
                    video["views"] = video.get("views", 0) + 1
                    break
            
            # Сохраняем обновленные данные
            with open(KARAOKE_JSON, 'w', encoding='utf-8') as f:
                json.dump(videos_data, f, ensure_ascii=False, indent=2)
            
            return jsonify({"success": True})
        else:
            return jsonify({"success": False, "error": "Файл данных не найден"}), 404
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Ошибка обновления просмотров: {str(e)}"
        }), 500

@app.route("/api/karaoke/like", methods=["POST"])
def karaoke_like():
    """API для добавления лайка видео"""
    try:
        data = request.json
        video_id = data.get("video_id")
        
        if not video_id:
            return jsonify({"success": False, "error": "Не указан ID видео"}), 400
        
        if os.path.exists(KARAOKE_JSON):
            with open(KARAOKE_JSON, 'r', encoding='utf-8') as f:
                videos_data = json.load(f)
            
            # Находим видео и увеличиваем счетчик лайков
            for video in videos_data:
                if video.get("id") == video_id:
                    video["likes"] = video.get("likes", 0) + 1
                    current_likes = video["likes"]
                    break
            
            # Сохраняем обновленные данные
            with open(KARAOKE_JSON, 'w', encoding='utf-8') as f:
                json.dump(videos_data, f, ensure_ascii=False, indent=2)
            
            return jsonify({"success": True, "likes": current_likes})
        else:
            return jsonify({"success": False, "error": "Файл данных не найден"}), 404
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Ошибка добавления лайка: {str(e)}"
        }), 500

@app.route("/uploads/video/<filename>")
def serve_video(filename):
    """Отдача видеофайлов"""
    try:
        video_path = os.path.join(UPLOAD_VIDEO_FOLDER, filename)
        
        if os.path.exists(video_path):
            # Определяем MIME тип
            mime_type = 'video/mp4'
            if filename.endswith('.avi'):
                mime_type = 'video/x-msvideo'
            elif filename.endswith('.mov'):
                mime_type = 'video/quicktime'
            elif filename.endswith('.webm'):
                mime_type = 'video/webm'
            elif filename.endswith('.mkv'):
                mime_type = 'video/x-matroska'
            
            return send_file(video_path, mimetype=mime_type)
        else:
            return jsonify({"error": "Видео не найдено"}), 404
            
    except Exception as e:
        return jsonify({"error": f"Ошибка загрузки видео: {str(e)}"}), 500

@app.route('/quiz')
def quiz():
    """Страница игры 'Викторина'"""
    return render_template('quiz.html')


@app.route("/api/quiz/questions")
def quiz_questions():
    """API для получения всех вопросов (без ответов)"""
    try:
        if os.path.exists(QUIZ_FILE):
            with open(QUIZ_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Возвращаем только id и вопрос, без ответа
            questions_list = []
            for item in data:
                questions_list.append({
                    'id': item.get('id'),
                    'question': item.get('question'),
                    'answer':item.get('answer'),
                    'category':item.get('category'),
                    'difficulty':item.get('difficulty')
                })
                random.shuffle(questions_list)
            
            return jsonify({
                'success': True,
                'questions': questions_list,
                'total': len(questions_list)
            })
        else:
            return jsonify({
                'success': True,
                'questions': [],
                'total': 0,
                'message': 'Файл с вопросами не найден'
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Ошибка загрузки вопросов: {str(e)}',
            'questions': []
        }), 500
    



@app.route("/api/quiz/stats")
def quiz_stats():
    """API для получения статистики викторины"""
    try:
        quiz_file = os.path.join(UPLOAD_FOLDER, 'quiz.json')
        
        if os.path.exists(quiz_file):
            with open(quiz_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Подсчитываем вопросы по категориям и сложности
            categories = {}
            difficulties = {}
            total_questions = 0
            
            def process_questions(items):
                nonlocal total_questions
                for item in items:
                    if isinstance(item, dict):
                        total_questions += 1
                        category = item.get('category', 'Без категории')
                        difficulty = item.get('difficulty', 'Не указана')
                        
                        categories[category] = categories.get(category, 0) + 1
                        difficulties[difficulty] = difficulties.get(difficulty, 0) + 1
            
            if isinstance(data, list):
                process_questions(data)
            elif isinstance(data, dict) and 'questions' in data:
                process_questions(data['questions'])
            
            return jsonify({
                'success': True,
                'totalQuestions': total_questions,
                'categories': categories,
                'difficulties': difficulties
            })
        else:
            return jsonify({
                'success': True,
                'totalQuestions': 0,
                'categories': {},
                'difficulties': {}
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Ошибка получения статистики: {str(e)}'
        }), 500


@app.route("/api/quiz/check-answer", methods=['POST'])
def check_answer():
    """API для проверки ответа на вопрос"""
    try:
        data = request.json
        question_id = data.get('id')
        user_answer = data.get('answer')
        
        if not question_id or user_answer is None:
            return jsonify({
                'success': False,
                'error': 'Необходимо указать id вопроса и answer'
            }), 400
        
        if os.path.exists(QUIZ_FILE):
            with open(QUIZ_FILE, 'r', encoding='utf-8') as f:
                quiz_data = json.load(f)
            
            # Находим вопрос по ID
            correct_answer = None
            for item in quiz_data:
                if item.get('id') == question_id:
                    correct_answer = item.get('answer')
                    break
            
            if correct_answer is None:
                return jsonify({
                    'success': False,
                    'error': f'Вопрос с ID {question_id} не найден'
                }), 404
            
            # Проверяем ответ (без учета регистра и пробелов)
            is_correct = str(user_answer).strip().lower() == str(correct_answer).strip().lower()
            
            return jsonify({
                'success': True,
                'is_correct': is_correct,
                'correct_answer': correct_answer
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Файл с вопросами не найден'
            }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Ошибка проверки ответа: {str(e)}'
        }), 500



@app.route('/api/lottery/prizes')
def get_lottery_prizes():
    """API для получения списка призов"""
    try:
        if os.path.exists(LOTTERY_FILE):
            with open(LOTTERY_FILE, 'r', encoding='utf-8') as f:
                prizes = json.load(f)
        else:
            # Создаем демо-призы если файла нет
            prizes = create_demo_prizes()
        
        return jsonify({
            'prizes': prizes,
            'total': sum(prizes.values())
        })
    except Exception as e:
        print(f"Ошибка чтения файла призов: {e}")
        return jsonify({
            'prizes': create_demo_prizes(),
            'total': 10
        })

@app.route('/api/lottery/spin', methods=['POST'])
def spin_wheel():
    """API для вращения колеса"""
    try:
        data = request.json
        user_id = data.get('user_id', 'anonymous')
        
        # Загружаем призы
        if os.path.exists(LOTTERY_FILE):
            with open(LOTTERY_FILE, 'r', encoding='utf-8') as f:
                prizes = json.load(f)
        else:
            prizes = create_demo_prizes()
        
        # Проверяем есть ли призы
        if not prizes:
            return jsonify({
                'success': False,
                'message': 'Нет доступных призов'
            })
        
        # Выбираем случайный приз (взвешенная случайность)
        all_prizes = []
        for prize, count in prizes.items():
            all_prizes.extend([prize] * count)
        
        if not all_prizes:
            return jsonify({
                'success': False,
                'message': 'Все призы закончились'
            })
        
        selected_prize = random.choice(all_prizes)
        
        # Уменьшаем количество приза
        prizes[selected_prize] -= 1
        if prizes[selected_prize] <= 0:
            del prizes[selected_prize]
        
        # Сохраняем обновленный список
        with open(LOTTERY_FILE, 'w', encoding='utf-8') as f:
            json.dump(prizes, f, ensure_ascii=False, indent=2)
        
        # Логируем выигрыш
        log_prize_win(user_id, selected_prize)
        
        # Определяем угол для анимации
        prize_list = list(create_demo_prizes().keys())
        if selected_prize in prize_list:
            prize_index = prize_list.index(selected_prize)
            angle_per_section = 360 / len(prize_list)
            target_angle = 360 * 5 + (prize_index * angle_per_section) - (angle_per_section / 2)
        else:
            target_angle = 360 * 5 + random.randint(0, 359)
        
        return jsonify({
            'success': True,
            'prize': selected_prize,
            'target_angle': target_angle,
            'remaining_prizes': prizes,
            'message': 'Поздравляем с выигрышем!'
        })
        
    except Exception as e:
        print(f"Ошибка вращения колеса: {e}")
        return jsonify({
            'success': False,
            'message': f'Ошибка сервера: {str(e)}'
        }), 500

@app.route('/api/lottery/stats')
def get_lottery_stats():
    """API для получения статистики"""
    try:
        stats_file = os.path.join(UPLOAD_FOLDER, 'lottery_stats.json')
        if os.path.exists(stats_file):
            with open(stats_file, 'r', encoding='utf-8') as f:
                stats = json.load(f)
        else:
            stats = {
                'total_spins': 0,
                'total_winners': 0,
                'prizes_distributed': {},
                'last_win': None
            }
        
        # Получаем текущие призы
        if os.path.exists(LOTTERY_FILE):
            with open(LOTTERY_FILE, 'r', encoding='utf-8') as f:
                current_prizes = json.load(f)
        else:
            current_prizes = create_demo_prizes()
        
        return jsonify({
            'stats': stats,
            'current_prizes': current_prizes,
            'total_remaining': sum(current_prizes.values())
        })
    except Exception as e:
        print(f"Ошибка получения статистики: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/lottery/reset', methods=['POST'])
def reset_lottery():
    """API для сброса лотереи (административная функция)"""
    try:
        # Проверяем пароль (в реальном приложении нужна аутентификация)
        data = request.json
        password = data.get('password', '')
        
        if password != 'newyear2023':
            return jsonify({
                'success': False,
                'message': 'Неверный пароль'
            }), 403
        
        # Сбрасываем призы
        prizes = create_demo_prizes()
        with open(LOTTERY_FILE, 'w', encoding='utf-8') as f:
            json.dump(prizes, f, ensure_ascii=False, indent=2)
        
        # Сбрасываем статистику
        stats_file = os.path.join(UPLOAD_FOLDER, 'lottery_stats.json')
        stats = {
            'total_spins': 0,
            'total_winners': 0,
            'prizes_distributed': {},
            'last_win': None
        }
        with open(stats_file, 'w', encoding='utf-8') as f:
            json.dump(stats, f, ensure_ascii=False, indent=2)
        
        return jsonify({
            'success': True,
            'message': 'Лотерея сброшена',
            'prizes': prizes
        })
        
    except Exception as e:
        print(f"Ошибка сброса лотереи: {e}")
        return jsonify({
            'success': False,
            'message': f'Ошибка: {str(e)}'
        }), 500

def create_demo_prizes():
    """Создание демо-призов для лотереи"""
    return {
        "Новогодний пряник": 5,
        "Подарочный сертификат": 3,
        "Билет в кино": 4,
        "Книга с автографом": 2,
        "Фирменная кружка": 6,
        "Набор конфет": 8,
        "Ёлочная игрушка": 10,
        "Сувенирная лошадка": 7,
        "Плед для зимних вечеров": 1,
        "Годовой запас хорошего настроения": 1
    }

def log_prize_win(user_id, prize):
    """Логирование выигрыша приза"""
    try:
        stats_file = os.path.join(UPLOAD_FOLDER, 'lottery_stats.json')
        
        if os.path.exists(stats_file):
            with open(stats_file, 'r', encoding='utf-8') as f:
                stats = json.load(f)
        else:
            stats = {
                'total_spins': 0,
                'total_winners': 0,
                'prizes_distributed': {},
                'last_win': None
            }
        
        # Обновляем статистику
        stats['total_spins'] += 1
        stats['total_winners'] += 1
        stats['last_win'] = datetime.now().isoformat()
        
        if prize in stats['prizes_distributed']:
            stats['prizes_distributed'][prize] += 1
        else:
            stats['prizes_distributed'][prize] = 1
        
        # Сохраняем обновленную статистику
        with open(stats_file, 'w', encoding='utf-8') as f:
            json.dump(stats, f, ensure_ascii=False, indent=2)
            
    except Exception as e:
        print(f"Ошибка логирования приза: {e}")


def decode_filename(filename):
    """Декодирование имени файла из URL"""
    try:
        # Декодируем URL-encoded имя файла
        decoded = urllib.parse.unquote(filename)
        return decoded
    except:
        return filename

def get_safe_filename(filename):
    """Получение безопасного имени файла"""
    # Удаляем потенциально опасные символы
    import re
    safe_name = re.sub(r'[^\w\s\-\.]', '', filename)
    return safe_name

@app.route('/api/images/original/<path:filename>')
def get_original_image(filename):
    """API для получения оригинального изображения"""
    try:
        # Декодируем имя файла
        decoded_filename = decode_filename(filename)
        safe_filename = get_safe_filename(decoded_filename)
        
        # Ищем файл с учетом различных вариантов имени
        filepath = find_image_file(ORIGINAL_FOLDER, safe_filename)
        
        if not filepath:
            # Пробуем найти по имени без декодирования
            filepath = find_image_file(ORIGINAL_FOLDER, filename)
        
        if not filepath:
            return jsonify({'error': 'File not found', 'filename': filename}), 404
        
        # Определяем MIME-тип
        mimetype, _ = mimetypes.guess_type(filepath)
        if not mimetype:
            mimetype = 'application/octet-stream'
        
        return send_file(
            filepath,
            mimetype=mimetype,
            as_attachment=False,
            download_name=os.path.basename(filepath)
        )
        
    except Exception as e:
        print(f"Ошибка получения оригинального изображения {filename}: {e}")
        return jsonify({'error': str(e)}), 500
    

@app.route('/api/images/preview/<path:filename>')
def get_preview_image(filename):
    """API для получения превью изображения"""
    try:
        # Декодируем имя файла
        decoded_filename = decode_filename(filename)
        safe_filename = get_safe_filename(decoded_filename)
        
        # Сначала ищем превью
        filepath = find_image_file(PREVIEW_FOLDER, safe_filename)
        
        if not filepath:
            # Если превью нет, ищем оригинал
            filepath = find_image_file(ORIGINAL_FOLDER, safe_filename)
        
        if not filepath:
            # Пробуем найти по имени без декодирования
            filepath = find_image_file(PREVIEW_FOLDER, filename)
            if not filepath:
                filepath = find_image_file(ORIGINAL_FOLDER, filename)
        
        if not filepath:
            return jsonify({'error': 'File not found', 'filename': filename}), 404
        
        # Определяем MIME-тип
        mimetype, _ = mimetypes.guess_type(filepath)
        if not mimetype:
            mimetype = 'application/octet-stream'
        
        return send_file(
            filepath,
            mimetype=mimetype,
            as_attachment=False,
            download_name=os.path.basename(filepath)
        )
        
    except Exception as e:
        print(f"Ошибка получения превью изображения {filename}: {e}")
        return jsonify({'error': str(e)}), 500


def find_image_file(folder, filename):
    """Поиск файла изображения с учетом различных вариантов имени"""
    # Полный путь с исходным именем
    filepath = os.path.join(folder, filename)
    
    if os.path.exists(filepath):
        return filepath
    
    # Пробуем найти файл с таким же именем, но другим расширением
    name_without_ext = os.path.splitext(filename)[0]
    
    # Ищем все изображения в папке
    image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp',".jfif",".avif"]
    
    for ext in image_extensions:
        test_path = os.path.join(folder, name_without_ext + ext)
        if os.path.exists(test_path):
            return test_path
    
    # Ищем файлы, содержащие имя
    try:
        for file in os.listdir(folder):
            if name_without_ext.lower() in file.lower():
                return os.path.join(folder, file)
    except:
        pass
    
    return None

def allowed_file(filename):
    """Проверка расширения файла"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def get_image_metadata(filepath):
    """Получение метаданных изображения"""
    try:
        with Image.open(filepath) as img:
            width, height = img.size
            format_type = img.format
            mode = img.mode
            
        return {
            'filename': os.path.basename(filepath),
            'title': os.path.splitext(os.path.basename(filepath))[0],
            'width': width,
            'height': height,
            'format': format_type,
            'filesize': os.path.getsize(filepath),
            'last_modified': os.path.getmtime(filepath)
        }
    except Exception as e:
        print(f"Ошибка чтения изображения {filepath}: {e}")
        return {
            'filename': os.path.basename(filepath),
            'title': os.path.splitext(os.path.basename(filepath))[0],
            'width': 0,
            'height': 0,
            'format': 'unknown',
            'filesize': os.path.getsize(filepath),
            'last_modified': os.path.getmtime(filepath)
        }

def get_audio_metadata(filepath):
    """Получение метаданных MP3 файла"""
    try:
        audio = MP3(filepath, ID3=ID3)
        
        # Получаем длительность
        duration = int(audio.info.length)
        
        # Пытаемся получить теги
        title = os.path.splitext(os.path.basename(filepath))[0]  # По умолчанию - имя файла
        artist = "Неизвестный исполнитель"
        album = "Неизвестный альбом"
        year = ""
        
        if audio.tags:
            try:
                title = str(audio.tags.get('TIT2', title))
            except:
                pass
            try:
                artist = str(audio.tags.get('TPE1', artist))
            except:
                pass
            try:
                album = str(audio.tags.get('TALB', album))
            except:
                pass
            try:
                year = str(audio.tags.get('TDRC', year))
            except:
                pass
        
        return {
            'title': title,
            'artist': artist,
            'album': album,
            'year': year,
            'duration': duration,
            'filename': os.path.basename(filepath),
            'filesize': os.path.getsize(filepath),
            'last_modified': os.path.getmtime(filepath)
        }
    except Exception as e:
        print(f"Ошибка чтения метаданных {filepath}: {e}")
        # Возвращаем базовую информацию
        return {
            'title': os.path.splitext(os.path.basename(filepath))[0],
            'artist': "Неизвестно",
            'album': "Неизвестно",
            'year': "",
            'duration': 0,
            'filename': os.path.basename(filepath),
            'filesize': os.path.getsize(filepath),
            'last_modified': os.path.getmtime(filepath)
        }

def get_image_metadata(filepath):
    """Получение метаданных изображения"""
    try:
        with Image.open(filepath) as img:
            width, height = img.size
            format_type = img.format
            mode = img.mode
            
        return {
            'filename': os.path.basename(filepath),
            'title': os.path.splitext(os.path.basename(filepath))[0],
            'width': width,
            'height': height,
            'format': format_type,
            'filesize': os.path.getsize(filepath),
            'last_modified': os.path.getmtime(filepath)
        }
    except Exception as e:
        print(f"Ошибка чтения изображения {filepath}: {e}")
        return {
            'filename': os.path.basename(filepath),
            'title': os.path.splitext(os.path.basename(filepath))[0],
            'width': 0,
            'height': 0,
            'format': 'unknown',
            'filesize': os.path.getsize(filepath),
            'last_modified': os.path.getmtime(filepath)
        }

def scan_audio_folder():
    """Сканирование папки с аудиофайлами"""
    songs = []
    
    # Ищем все MP3 файлы
    mp3_files = glob.glob(os.path.join(AUDIO_FOLDER, '*.mp3'))
    
    if not mp3_files:
        print(f"В папке {AUDIO_FOLDER} нет MP3 файлов.")
        create_demo_files()
        mp3_files = glob.glob(os.path.join(AUDIO_FOLDER, '*.mp3'))
    
    for mp3_file in mp3_files:
        if allowed_file(mp3_file):
            metadata = get_audio_metadata(mp3_file)
            songs.append(metadata)
    
    # Сортируем по названию
    random.shuffle(songs)
    
    return songs

def scan_images_folder():
    """Сканирование папок с изображениями"""
    images = []
    
    # Ищем все файлы в папке original
    image_extensions = ['*.jpg', '*.jpeg', '*.png', '*.gif', '*.webp',"*.jfif","*.avif"]
    original_files = []
    
    for ext in image_extensions:
        original_files.extend(glob.glob(os.path.join(ORIGINAL_FOLDER, ext)))
    
    if not original_files:
        print(f"В папке {ORIGINAL_FOLDER} нет изображений.")
        create_demo_images()
        # Повторно ищем файлы
        for ext in image_extensions:
            original_files.extend(glob.glob(os.path.join(ORIGINAL_FOLDER, ext)))
    
    for original_file in original_files:
        if allowed_file(original_file):
            filename = os.path.basename(original_file)
            preview_file = os.path.join(PREVIEW_FOLDER, filename)
            
            # Проверяем есть ли превью
            has_preview = os.path.exists(preview_file)
            
            # Получаем метаданные оригинального изображения
            metadata = get_image_metadata(original_file)
            
            # Добавляем информацию о превью
            metadata['has_preview'] = has_preview
            
            # Проверяем наличие JSON файла с описанием
            json_file = os.path.join(IMAGES_FOLDER, 'characters.json')
            if os.path.exists(json_file):
                try:
                    with open(json_file, 'r', encoding='utf-8') as f:
                        characters_data = json.load(f)
                    
                    # Ищем описание для этого файла
                    base_name = os.path.splitext(filename)[0]
                    if base_name in characters_data:
                        metadata['description'] = characters_data[base_name].get('description', '')
                        metadata['hints'] = characters_data[base_name].get('hints', [])
                        metadata['category'] = characters_data[base_name].get('category', 'Общее')
                except Exception as e:
                    print(f"Ошибка чтения JSON файла: {e}")
                    metadata['description'] = ''
                    metadata['hints'] = []
                    metadata['category'] = 'Общее'
            else:
                metadata['description'] = ''
                metadata['hints'] = []
                metadata['category'] = 'Общее'
            
            images.append(metadata)
    
    # Сортируем по названию
    random.shuffle(images)
    
    return images

def create_demo_files():
    """Создание демо-файлов для тестирования"""
    demo_songs = [
        {
            'filename': 'Jingle Bells.mp3',
            'title': 'Jingle Bells',
            'artist': 'Christmas Orchestra',
            'duration': 131
        },
        {
            'filename': 'Last Christmas.mp3',
            'title': 'Last Christmas',
            'artist': 'Wham!',
            'duration': 264
        },
        {
            'filename': 'All I Want for Christmas Is You.mp3',
            'title': 'All I Want for Christmas Is You',
            'artist': 'Mariah Carey',
            'duration': 241
        }
    ]
    
    for song in demo_songs:
        filepath = os.path.join(AUDIO_FOLDER, song['filename'])
        with open(filepath, 'w') as f:
            f.write(f"Это демо-файл: {song['title']}\n")
            f.write(f"В реальном приложении здесь будет MP3 файл\n")
            f.write(f"Длительность: {song['duration']} секунд\n")
        
        os.utime(filepath, (time.time(), time.time()))

def create_demo_images():
    """Создание демо-изображений для тестирования"""
    demo_characters = [
        {
            'filename': 'mickey_mouse.jpg',
            'title': 'Микки Маус',
            'description': 'Знаменитый диснеевский персонаж, мышонок в красных шортах',
            'hints': ['Диснеевский персонаж', 'Мышонок', 'Красные шорты'],
            'category': 'Мультфильмы'
        },
        {
            'filename': 'snow_white.jpg',
            'title': 'Белоснежка',
            'description': 'Первая диснеевская принцесса, живет с семью гномами',
            'hints': ['Диснеевская принцесса', 'Живет с гномами', 'Яблоко'],
            'category': 'Мультфильмы'
        },
        {
            'filename': 'harry_potter.jpg',
            'title': 'Гарри Поттер',
            'description': 'Юный волшебник из Хогвартса, мальчик который выжил',
            'hints': ['Волшебник', 'Шрам на лбу', 'Очки'],
            'category': 'Фильмы'
        },
        {
            'filename': 'spider_man.jpg',
            'title': 'Человек-паук',
            'description': 'Супергерой из комиксов Marvel, дружелюбный сосед',
            'hints': ['Супергерой', 'Паутина', 'Красный костюм'],
            'category': 'Комиксы'
        }
    ]
    
    # Создаем JSON файл с описаниями
    characters_data = {}
    for character in demo_characters:
        characters_data[os.path.splitext(character['filename'])[0]] = {
            'description': character['description'],
            'hints': character['hints'],
            'category': character['category']
        }
    
    json_file = os.path.join(IMAGES_FOLDER, 'characters.json')
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(characters_data, f, ensure_ascii=False, indent=2)
    
    # Создаем демо-файлы
    for character in demo_characters:
        # Оригинальное изображение
        original_path = os.path.join(ORIGINAL_FOLDER, character['filename'])
        with open(original_path, 'w') as f:
            f.write(f"Оригинальное изображение: {character['title']}\n")
            f.write(f"Описание: {character['description']}\n")
            f.write(f"В реальном приложении здесь будет изображение в формате JPG/PNG\n")
        
        # Превью изображение
        preview_path = os.path.join(PREVIEW_FOLDER, character['filename'])
        with open(preview_path, 'w') as f:
            f.write(f"Превью изображение: {character['title']}\n")
            f.write(f"Это размытая/зашумленная версия оригинального изображения\n")
            f.write(f"Используется для угадывания персонажа\n")
        
        os.utime(original_path, (time.time(), time.time()))
        os.utime(preview_path, (time.time(), time.time()))


@app.route('/')
def index():
    """Главная страница с выбором конкурса"""
    return render_template('index.html')

@app.route('/music-game')
def music_game():
    """Страница игры 'Угадай мелодию'"""
    return render_template('music_game.html')

@app.route('/character-game')
def character_game():
    """Страница игры 'Отгадай персонажа'"""
    return render_template('character_game.html')

@app.route('/api/songs')
def get_songs():
    """API для получения списка песен"""
    songs = scan_audio_folder()
    return jsonify(songs)


@app.route('/api/audio/<filename>/preview')
def get_audio_preview(filename):
    """API для получения превью аудио (первые N секунд)"""
    # В реальном приложении здесь можно реализовать обрезку аудио
    # Для простоты возвращаем полный файл
    return get_audio_file(filename)


@app.route('/api/images')
def get_images():
    """API для получения списка изображений"""
    images = scan_images_folder()
    return jsonify(images)


"""
app.route('/api/images/original/<filename>')
def get_original_image(filename):
    filepath = os.path.join(ORIGINAL_FOLDER, filename)
    
    
    # Определяем MIME-тип
    mimetype, _ = mimetypes.guess_type(filepath)
    if not mimetype:
        mimetype = 'application/octet-stream'
    print(filepath)
    return send_file(
        filepath,
        mimetype=mimetype,
        as_attachment=False,
        download_name=filename
    )

@app.route('/api/images/preview/<filename>')
def get_preview_image(filename):
    """
"""API для получения превью изображения"""
"""
    filepath = os.path.join(PREVIEW_FOLDER, filename)
    
    # Проверяем безопасность пути
    if not os.path.exists(filepath):
        # Если превью нет, возвращаем оригинал
        return get_original_image(filename)
    
    if '..' in filename or not allowed_file(filename):
        return jsonify({'error': 'File not found or access denied'}), 404
    
    # Определяем MIME-тип
    mimetype, _ = mimetypes.guess_type(filepath)
    if not mimetype:
        mimetype = 'application/octet-stream'
    
    return send_file(
        filepath,
        mimetype=mimetype,
        as_attachment=False,
        download_name=filename
    )
"""

@app.route('/api/audio/<filename>')
def get_audio_file(filename):
    """API для получения аудиофайла"""
    filepath = os.path.join(AUDIO_FOLDER, filename)
    
    # Проверяем безопасность пути
    if not os.path.exists(filepath) or '..' in filename or not allowed_file(filename):
        return jsonify({'error': 'File not found or access denied'}), 404
    
    return send_file(
        filepath,
        mimetype='audio/mpeg',
        as_attachment=False,
        download_name=filename
    )

@app.route('/api/images/<filename>')
def get_image_file(filename):
    """API для получения изображения"""
    filepath = os.path.join(IMAGES_FOLDER, filename)
    
    if not os.path.exists(filepath):
        print("Does not exist")
    if ".." in filename or not allowed_file(filename):
        print("NOT ALLOWED")
    # Проверяем безопасность пути
    if not os.path.exists(filepath) or '..' in filename or not allowed_file(filename):
        return jsonify({'error': 'File not found or access denied'}), 404
    
    # Определяем MIME-тип
    mimetype, _ = mimetypes.guess_type(filepath)
    if not mimetype:
        mimetype = 'application/octet-stream'
    
    return send_file(
        filepath,
        mimetype=mimetype,
        as_attachment=False,
        download_name=filename
    )

@app.route('/api/upload/image', methods=['POST'])
def upload_image():
    """API для загрузки изображения"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = os.path.basename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        # Сохраняем файл
        file.save(filepath)
        
        return jsonify({
            'success': True,
            'filename': filename,
            'message': 'File uploaded successfully'
        })
    
    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/api/rescan/<folder_type>')
def rescan_folder(folder_type):
    """API для повторного сканирования папки"""
    if folder_type == 'audio':
        songs = scan_audio_folder()
        return jsonify({
            'message': f'Найдено {len(songs)} песен',
            'songs': songs,
            'type': 'audio'
        })
    elif folder_type == 'images':
        images = scan_images_folder()
        return jsonify({
            'message': f'Найдено {len(images)} изображений',
            'items': images,
            'type': 'images'
        })
    else:
        return jsonify({'error': 'Invalid folder type'}), 400

if __name__ == '__main__':
    # Создаем необходимые папки
    os.makedirs('static/css', exist_ok=True)
    os.makedirs('static/js', exist_ok=True)
    os.makedirs('templates', exist_ok=True)
    
    # Создаем демо-звуки если их нет
    create_demo_sounds()

    
    print("=" * 60)
    print("Сервер конкурсов запущен!")
    print(f"1. Добавьте MP3 файлы в папку '{AUDIO_FOLDER}' для игры 'Угадай мелодию'")
    print(f"2. Добавьте изображения в папки '{ORIGINAL_FOLDER}' и '{PREVIEW_FOLDER}'")
    print(f"3. Добавьте MP3 звуки в папку '{UPLOAD_FOLDER}' для колеса фортуны")
    print("Сервер доступен по адресу: http://localhost:5000")
    print("=" * 60)
    
    app.run(debug=True, host='127.0.0.1', port=5000)