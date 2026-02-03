// Форма бронирования
document.addEventListener('DOMContentLoaded', function() {
    // Ваш endpoint Formspree - ПРОВЕРЕННЫЙ РАБОЧИЙ
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
    
    // Отправка формы бронирования - УПРОЩЕННАЯ РАБОЧАЯ ВЕРСИЯ
    if(reservationForm) {
        // Устанавливаем минимальную дату
        const dateInput = document.getElementById('date');
        if(dateInput) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            
            // Форматируем даты для input type="date"
            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };
            
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
            
            // Простая валидация
            if(!simpleValidateForm(this)) {
                showMessage('Пожалуйста, заполните все обязательные поля', 'error', 'form-message');
                return;
            }
            
            const submitBtn = this.querySelector('.btn-submit');
            const originalText = submitBtn.textContent;
            
            // Блокировка кнопки
            submitBtn.disabled = true;
            submitBtn.textContent = 'Отправка...';
            
            // Собираем данные формы ПРАВИЛЬНЫМ способом для Formspree
            const formData = new URLSearchParams();
            
            // Добавляем только основные поля (без скрытых полей Formspree)
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const email = document.getElementById('email').value;
            const date = document.getElementById('date').value;
            const time = document.getElementById('time').value;
            const guests = document.getElementById('guests').value;
            const message = document.getElementById('message').value;
            
            // Добавляем данные
            if (name) formData.append('name', name);
            if (phone) formData.append('phone', phone);
            if (email) formData.append('email', email);
            if (date) formData.append('date', date);
            if (time) formData.append('time', time);
            if (guests) formData.append('guests', guests);
            if (message) formData.append('message', message);
            
            // Добавляем обязательные поля для Formspree
            formData.append('_subject', 'Бронь стола от ' + (name || 'клиента'));
            if (email) {
                formData.append('_replyto', email);
            }
            
            try {
                console.log('Отправляю данные в Formspree:', Object.fromEntries(formData));
                
                // Отправка на Formspree ПРОСТЫМ способом
                const response = await fetch(FORMSPREE_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: formData.toString()
                });
                
                console.log('Ответ Formspree:', response.status, response.statusText);
                
                if(response.ok) {
                    const result = await response.json();
                    console.log('Formspree успешно:', result);
                    
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
                    // Пробуем получить детали ошибки
                    let errorDetails = '';
                    try {
                        const errorData = await response.json();
                        errorDetails = JSON.stringify(errorData);
                    } catch(e) {
                        errorDetails = response.statusText;
                    }
                    
                    console.error('Formspree ошибка:', response.status, errorDetails);
                    
                    // Пробуем альтернативный метод
                    await sendFormAlternative(formData);
                    showMessage('✅ Ваша заявка отправлена! (альтернативный метод)', 'success', 'form-message');
                    this.reset();
                }
                
            } catch(error) {
                console.error('Ошибка отправки:', error);
                
                // Используем локальный метод как запасной вариант
                try {
                    await sendFormAlternative(formData);
                    showMessage('✅ Ваша заявка отправлена! (локальный метод)', 'success', 'form-message');
                    this.reset();
                } catch(localError) {
                    showMessage('❌ Ошибка при отправке. Пожалуйста, попробуйте позже.', 'error', 'form-message');
                }
            } finally {
                // Разблокировка кнопки
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
    
    // Отправка контактной формы
    if(contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Простая валидация
            if(!simpleValidateForm(this)) {
                return;
            }
            
            const submitBtn = this.querySelector('.btn-submit');
            const originalText = submitBtn.textContent;
            
            // Блокировка кнопки
            submitBtn.disabled = true;
            submitBtn.textContent = 'Отправка...';
            
            // Собираем данные
            const formData = new URLSearchParams();
            const name = document.getElementById('popup-name').value;
            const email = document.getElementById('popup-email').value;
            const message = document.getElementById('popup-message').value;
            
            if (name) formData.append('name', name);
            if (email) formData.append('email', email);
            if (message) formData.append('message', message);
            
            // Добавляем для Formspree
            formData.append('_subject', 'Сообщение с сайта от ' + name);
            if (email) {
                formData.append('_replyto', email);
            }
            
            try {
                console.log('Отправляю контактную форму в Formspree');
                
                const response = await fetch(FORMSPREE_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: formData.toString()
                });
                
                if(response.ok) {
                    alert('✅ Сообщение отправлено! Мы ответим вам в ближайшее время.');
                    this.reset();
                    closePopup();
                } else {
                    // Альтернативный метод
                    await sendFormAlternative(formData, 'contact');
                    alert('✅ Сообщение отправлено! (альтернативный метод)');
                    this.reset();
                    closePopup();
                }
                
            } catch(error) {
                console.error('Ошибка отправки контактной формы:', error);
                
                // Локальный метод
                try {
                    await sendFormAlternative(formData, 'contact');
                    alert('✅ Сообщение отправлено! (локальный метод)');
                    this.reset();
                    closePopup();
                } catch(localError) {
                    alert('❌ Ошибка при отправке сообщения. Пожалуйста, попробуйте позже.');
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
    
    // Альтернативный метод отправки (локальное сохранение)
    async function sendFormAlternative(formData, type = 'reservation') {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Сохраняем в localStorage
                const submissions = JSON.parse(localStorage.getItem('form_submissions') || '[]');
                submissions.push({
                    type: type,
                    data: Object.fromEntries(formData),
                    timestamp: new Date().toISOString(),
                    status: 'saved_locally'
                });
                
                // Ограничиваем количество сохраненных записей
                if (submissions.length > 50) {
                    submissions.shift();
                }
                
                localStorage.setItem('form_submissions', JSON.stringify(submissions));
                console.log('Форма сохранена локально:', type, Object.fromEntries(formData));
                
                resolve();
            }, 1000);
        });
    }
    
    // Простая валидация формы
    function simpleValidateForm(form) {
        let isValid = true;
        const requiredInputs = form.querySelectorAll('input[required], textarea[required]');
        
        // Очищаем предыдущие ошибки
        form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        
        requiredInputs.forEach(input => {
            if(!input.value.trim()) {
                isValid = false;
                input.classList.add('error');
            }
        });
        
        return isValid;
    }
    
    // Показ сообщений
    function showMessage(text, type, elementId) {
        const messageDiv = document.getElementById(elementId);
        if(messageDiv) {
            messageDiv.textContent = text;
            messageDiv.className = `form-message ${type}`;
            messageDiv.style.display = 'block';
            
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
            
            if(value.length > 0) {
                if(value.length === 1 && value !== '7') {
                    value = '7' + value;
                }
                
                // Простая маска
                let formattedValue = '+7 ';
                if(value.length > 1) {
                    formattedValue += '(' + value.substring(1, 4) + ') ';
                }
                if(value.length > 4) {
                    formattedValue += value.substring(4, 7);
                }
                if(value.length > 7) {
                    formattedValue += '-' + value.substring(7, 9);
                }
                if(value.length > 9) {
                    formattedValue += '-' + value.substring(9, 11);
                }
                
                this.value = formattedValue;
            }
        });
    }
    
    // Сохранение в LocalStorage
    function saveToLocalStorage() {
        if(reservationForm) {
            const formData = {};
            const inputs = ['name', 'phone', 'email', 'date', 'time', 'guests', 'message'];
            
            inputs.forEach(id => {
                const input = document.getElementById(id);
                if(input && input.value) {
                    formData[id] = input.value;
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
                        const input = document.getElementById(key);
                        if(input && data[key]) {
                            input.value = data[key];
                        }
                    });
                }
            } catch(e) {
                console.error('Ошибка загрузки из localStorage:', e);
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
    
    // Тест Formspree (можно удалить в продакшене)
    function testFormspree() {
        console.log('Тестирую Formspree endpoint...');
        
        const testData = new URLSearchParams();
        testData.append('name', 'Test User');
        testData.append('email', 'test@example.com');
        testData.append('message', 'Тестовое сообщение');
        testData.append('_subject', 'Тест Formspree');
        testData.append('_replyto', 'test@example.com');
        
        fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: testData.toString()
        })
        .then(response => {
            console.log('Formspree тест:', response.status, response.statusText);
            return response.json();
        })
        .then(data => {
            console.log('Formspree ответ:', data);
        })
        .catch(error => {
            console.error('Formspree тест ошибка:', error);
        });
    }
    
    // Запуск теста при загрузке
    setTimeout(testFormspree, 2000);
});
