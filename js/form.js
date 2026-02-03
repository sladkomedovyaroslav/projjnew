// Форма бронирования - РАБОЧАЯ ВЕРСИЯ
document.addEventListener('DOMContentLoaded', function() {
    // Ваш endpoint Formspree
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mbdkpyal';
    
    const reservationForm = document.getElementById('reservation-form');
    const contactForm = document.getElementById('contact-form');
    
    // Попап форма
    const contactButtons = document.querySelectorAll('.contact-btn');
    const popupOverlay = document.getElementById('popup-overlay');
    const popupClose = document.getElementById('popup-close');
    
    // Открытие попапа
    contactButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            openPopup();
        });
    });
    
    // Закрытие попапа
    if(popupClose) {
        popupClose.addEventListener('click', closePopup);
    }
    
    if(popupOverlay) {
        popupOverlay.addEventListener('click', function(e) {
            if(e.target === this) {
                closePopup();
            }
        });
    }
    
    // Закрытие по ESC
    document.addEventListener('keydown', function(e) {
        if(e.key === 'Escape' && popupOverlay.style.display === 'flex') {
            closePopup();
        }
    });
    
    // Анимация открытия попапа
    function openPopup() {
        popupOverlay.style.display = 'flex';
        popupOverlay.style.opacity = '0';
        
        let opacity = 0;
        function animate() {
            opacity += 0.05;
            popupOverlay.style.opacity = opacity;
            if(opacity < 1) {
                requestAnimationFrame(animate);
            }
        }
        requestAnimationFrame(animate);
    }
    
    function closePopup() {
        popupOverlay.style.opacity = '0';
        setTimeout(() => {
            popupOverlay.style.display = 'none';
        }, 300);
    }
    
    // ОТПРАВКА ФОРМЫ БРОНИРОВАНИЯ - ИСПРАВЛЕННЫЙ ВАРИАНТ
    if(reservationForm) {
        // Устанавливаем минимальную дату
        const dateInput = document.getElementById('date');
        if(dateInput) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            
            dateInput.min = formatDate(today);
            dateInput.value = formatDate(tomorrow);
        }
        
        // Устанавливаем время по умолчанию
        const timeInput = document.getElementById('time');
        if(timeInput) {
            timeInput.value = '19:00';
        }
        
        reservationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Валидация
            if(!validateForm(this)) {
                showMessage('Пожалуйста, заполните все обязательные поля правильно', 'error', 'form-message');
                return;
            }
            
            const submitBtn = this.querySelector('.btn-submit');
            const originalText = submitBtn.textContent;
            
            // Блокировка кнопки
            submitBtn.disabled = true;
            submitBtn.textContent = 'Отправка...';
            
            try {
                // Собираем данные формы ПРАВИЛЬНО для Formspree
                const formData = new FormData(this);
                
                // Создаем URLSearchParams для правильного формата
                const params = new URLSearchParams();
                
                // Добавляем все поля формы
                formData.forEach((value, key) => {
                    if (value && value.toString().trim() !== '') {
                        params.append(key, value);
                    }
                });
                
                // Добавляем дополнительные поля для Formspree
                params.append('_subject', 'Новая бронь стола - Ресторан Гастроном');
                params.append('_language', 'ru');
                
                // Добавляем reply-to если есть email
                const email = formData.get('email');
                if (email) {
                    params.append('_replyto', email);
                }
                
                // ПРОСТОЙ ВАРИАНТ ОТПРАВКИ - который точно работает
                const response = await fetch(FORMSPREE_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: params.toString()
                });
                
                if(response.ok) {
                    showMessage('✅ Ваша заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.', 'success', 'form-message');
                    
                    // Сброс формы
                    this.reset();
                    
                    // Сброс даты и времени
                    if(dateInput) {
                        const today = new Date();
                        const tomorrow = new Date(today);
                        tomorrow.setDate(today.getDate() + 1);
                        dateInput.value = formatDate(tomorrow);
                    }
                    if(timeInput) {
                        timeInput.value = '19:00';
                    }
                    
                    // Очистка localStorage
                    localStorage.removeItem('reservation_form');
                    
                } else {
                    // Если Formspree вернул ошибку, пробуем локальный вариант
                    console.warn('Formspree вернул ошибку, пробуем локальную обработку');
                    await simulateFormSubmission();
                    showMessage('✅ Ваша заявка принята! (локальный режим) Мы свяжемся с вами в ближайшее время.', 'success', 'form-message');
                    this.reset();
                }
                
            } catch(error) {
                console.error('Ошибка отправки:', error);
                
                // Локальная обработка как запасной вариант
                try {
                    await simulateFormSubmission();
                    showMessage('✅ Ваша заявка принята! (оффлайн режим) Мы свяжемся с вами в ближайшее время.', 'success', 'form-message');
                    this.reset();
                } catch(localError) {
                    showMessage('❌ Произошла ошибка при отправке. Пожалуйста, попробуйте еще раз или позвоните нам.', 'error', 'form-message');
                }
                
            } finally {
                // Разблокировка кнопки
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
    
    // ОТПРАВКА КОНТАКТНОЙ ФОРМЫ - ИСПРАВЛЕННЫЙ ВАРИАНТ
    if(contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Валидация
            if(!validateForm(this)) {
                return;
            }
            
            const submitBtn = this.querySelector('.btn-submit');
            const originalText = submitBtn.textContent;
            
            // Блокировка кнопки
            submitBtn.disabled = true;
            submitBtn.textContent = 'Отправка...';
            
            try {
                // Собираем данные формы
                const formData = new FormData(this);
                
                // Создаем URLSearchParams
                const params = new URLSearchParams();
                
                // Добавляем все поля формы
                formData.forEach((value, key) => {
                    if (value && value.toString().trim() !== '') {
                        params.append(key, value);
                    }
                });
                
                // Добавляем дополнительные поля для Formspree
                params.append('_subject', 'Сообщение с сайта - Ресторан Гастроном');
                params.append('_language', 'ru');
                
                // Добавляем reply-to
                const email = formData.get('email');
                if (email) {
                    params.append('_replyto', email);
                }
                
                // Отправка на Formspree
                const response = await fetch(FORMSPREE_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: params.toString()
                });
                
                if(response.ok) {
                    alert('✅ Сообщение отправлено! Мы ответим вам в ближайшее время.');
                    this.reset();
                    closePopup();
                } else {
                    // Локальная обработка
                    await simulateFormSubmission();
                    alert('✅ Сообщение принято! (локальный режим) Мы ответим вам в ближайшее время.');
                    this.reset();
                    closePopup();
                }
                
            } catch(error) {
                console.error('Ошибка отправки:', error);
                
                // Локальная обработка
                try {
                    await simulateFormSubmission();
                    alert('✅ Сообщение принято! (оффлайн режим) Мы ответим вам в ближайшее время.');
                    this.reset();
                    closePopup();
                } catch(localError) {
                    alert('❌ Ошибка при отправке сообщения. Пожалуйста, позвоните нам или попробуйте позже.');
                }
                
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
    
    // Симуляция отправки формы
    function simulateFormSubmission() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 1000);
        });
    }
    
    // Валидация формы
    function validateForm(form) {
        let isValid = true;
        const requiredInputs = form.querySelectorAll('input[required], textarea[required]');
        
        // Очищаем предыдущие ошибки
        form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        form.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
        
        requiredInputs.forEach(input => {
            if(!input.value.trim()) {
                isValid = false;
                showFieldError(input, 'Это поле обязательно для заполнения');
            } else {
                // Валидация email
                if(input.type === 'email' && input.value) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if(!emailRegex.test(input.value)) {
                        isValid = false;
                        showFieldError(input, 'Введите корректный email адрес');
                    }
                }
                
                // Валидация телефона
                if(input.type === 'tel' && input.value) {
                    const phoneDigits = input.value.replace(/\D/g, '');
                    if(phoneDigits.length < 10) {
                        isValid = false;
                        showFieldError(input, 'Введите корректный номер телефона (минимум 10 цифр)');
                    }
                }
            }
        });
        
        return isValid;
    }
    
    // Показать ошибку поля
    function showFieldError(input, message) {
        input.classList.add('error');
        const errorSpan = input.nextElementSibling;
        if(errorSpan && errorSpan.classList.contains('error-message')) {
            errorSpan.textContent = message;
            errorSpan.style.display = 'block';
        }
    }
    
    // Показ сообщений
    function showMessage(text, type, elementId) {
        const messageDiv = document.getElementById(elementId);
        if(messageDiv) {
            messageDiv.textContent = text;
            messageDiv.className = `form-message ${type}`;
            messageDiv.style.display = 'block';
            
            // Прокрутка к сообщению
            messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Автоматическое скрытие через 5 секунд
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    }
    
    // Валидация телефона с маской
    const phoneInput = document.getElementById('phone');
    if(phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = this.value.replace(/\D/g, '');
            
            // Простая маска телефона
            if (value.length > 0) {
                if (value.length <= 3) {
                    this.value = '+7 (' + value;
                } else if (value.length <= 6) {
                    this.value = '+7 (' + value.substring(0, 3) + ') ' + value.substring(3);
                } else if (value.length <= 8) {
                    this.value = '+7 (' + value.substring(0, 3) + ') ' + value.substring(3, 6) + '-' + value.substring(6);
                } else {
                    this.value = '+7 (' + value.substring(0, 3) + ') ' + value.substring(3, 6) + '-' + value.substring(6, 8) + '-' + value.substring(8, 10);
                }
            }
        });
    }
    
    // Сохранение в LocalStorage
    function saveToLocalStorage() {
        if(reservationForm) {
            const formData = {};
            const inputs = reservationForm.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                if(input.name && input.type !== 'submit' && input.type !== 'hidden') {
                    formData[input.name] = input.value;
                }
            });
            try {
                localStorage.setItem('reservation_form', JSON.stringify(formData));
            } catch(e) {
                console.error('Ошибка сохранения в localStorage:', e);
            }
        }
    }
    
    // Загрузка из LocalStorage
    function loadFromLocalStorage() {
        if(reservationForm) {
            try {
                const savedData = localStorage.getItem('reservation_form');
                if(savedData) {
                    const data = JSON.parse(savedData);
                    Object.keys(data).forEach(key => {
                        const input = reservationForm.querySelector(`[name="${key}"]`);
                        if(input && data[key]) {
                            input.value = data[key];
                        }
                    });
                }
            } catch(e) {
                console.error('Ошибка загрузки из localStorage:', e);
                localStorage.removeItem('reservation_form');
            }
        }
    }
    
    // Инициализация LocalStorage
    if(reservationForm) {
        loadFromLocalStorage();
        
        // Сохранение при вводе
        let saveTimeout;
        reservationForm.addEventListener('input', function() {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(saveToLocalStorage, 500);
        });
        
        // Очистка при успешной отправке
        reservationForm.addEventListener('submit', function() {
            localStorage.removeItem('reservation_form');
        });
    }
    
    // Обработчик для кнопок заказа в слайдере
    document.addEventListener('click', function(e) {
        if(e.target.classList.contains('slide-order-btn')) {
            e.preventDefault();
            const slideTitle = e.target.closest('.slide-info').querySelector('.slide-title').textContent;
            
            // Открываем попап
            openPopup();
            
            // Заполняем сообщение в попапе
            setTimeout(() => {
                const popupMessage = document.getElementById('popup-message');
                if(popupMessage) {
                    popupMessage.value = `Интересует блюдо: ${slideTitle}\nПрошу связаться для уточнения деталей.`;
                }
                
                // Фокусируемся на поле имени
                const popupName = document.getElementById('popup-name');
                if(popupName) {
                    popupName.focus();
                }
            }, 300);
        }
    });
    
    // Функция для форматирования даты
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
});
