// Калькулятор стоимости заказа
document.addEventListener('DOMContentLoaded', function() {
    // Элементы калькулятора
    const checkboxes = document.querySelectorAll('.calculator-item input[type="checkbox"]');
    const orderList = document.getElementById('order-list');
    const totalPriceElement = document.getElementById('total-price');
    const discountAmountElement = document.getElementById('discount-amount');
    const finalPriceElement = document.getElementById('final-price');
    const btnOrder = document.getElementById('btn-order');
    const btnClear = document.getElementById('btn-clear');
    
    // Переменные для хранения данных
    let selectedItems = [];
    let totalPrice = 0;
    let discount = 0;
    let finalPrice = 0;
    
    // Порог для скидки
    const DISCOUNT_THRESHOLD = 3000;
    const DISCOUNT_PERCENTAGE = 10;
    
    // Инициализация калькулятора
    function initCalculator() {
        // Загружаем сохраненный заказ из localStorage
        loadSavedOrder();
        
        // Обновляем отображение
        updateOrderDisplay();
        updatePriceDisplay();
        
        // Обработчики событий
        setupEventListeners();
    }
    
    // Настройка обработчиков событий
    function setupEventListeners() {
        // Обработчики для чекбоксов
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', handleCheckboxChange);
        });
        
        // Кнопка "Заказать выбранное"
        if (btnOrder) {
            btnOrder.addEventListener('click', handleOrder);
        }
        
        // Кнопка "Очистить заказ"
        if (btnClear) {
            btnClear.addEventListener('click', clearOrder);
        }
    }
    
    // Обработчик изменения чекбокса
    function handleCheckboxChange(e) {
        const checkbox = e.target;
        const price = parseInt(checkbox.value);
        const name = checkbox.dataset.name;
        
        if (checkbox.checked) {
            // Добавляем товар в заказ
            addItemToOrder(name, price);
        } else {
            // Удаляем товар из заказа
            removeItemFromOrder(name);
        }
        
        // Обновляем отображение
        updateOrderDisplay();
        updatePriceDisplay();
        
        // Сохраняем заказ в localStorage
        saveOrder();
    }
    
    // Добавить товар в заказ
    function addItemToOrder(name, price) {
        selectedItems.push({
            name: name,
            price: price,
            id: Date.now() + Math.random() // Уникальный ID
        });
    }
    
    // Удалить товар из заказа
    function removeItemFromOrder(name) {
        selectedItems = selectedItems.filter(item => item.name !== name);
    }
    
    // Обновить отображение списка заказа
    function updateOrderDisplay() {
        if (!orderList) return;
        
        // Очищаем список
        orderList.innerHTML = '';
        
        if (selectedItems.length === 0) {
            // Показываем сообщение о пустом заказе
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'Выберите блюда из меню';
            orderList.appendChild(emptyMessage);
            return;
        }
        
        // Добавляем выбранные товары
        selectedItems.forEach(item => {
            const orderItem = document.createElement('div');
            orderItem.className = 'order-item';
            orderItem.dataset.id = item.id;
            
            orderItem.innerHTML = `
                <span class="order-item-name">${item.name}</span>
                <span class="order-item-price">${formatPrice(item.price)}</span>
            `;
            
            orderList.appendChild(orderItem);
        });
    }
    
    // Обновить отображение цен
    function updatePriceDisplay() {
        // Рассчитываем общую сумму
        totalPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);
        
        // Рассчитываем скидку
        discount = totalPrice >= DISCOUNT_THRESHOLD 
            ? Math.round(totalPrice * DISCOUNT_PERCENTAGE / 100)
            : 0;
        
        // Рассчитываем итоговую сумму
        finalPrice = totalPrice - discount;
        
        // Обновляем элементы DOM
        if (totalPriceElement) {
            totalPriceElement.textContent = formatPrice(totalPrice);
            totalPriceElement.classList.add('price-updated');
            setTimeout(() => totalPriceElement.classList.remove('price-updated'), 500);
        }
        
        if (discountAmountElement) {
            discountAmountElement.textContent = formatPrice(discount);
            discountAmountElement.style.display = discount > 0 ? 'block' : 'none';
        }
        
        if (finalPriceElement) {
            finalPriceElement.textContent = formatPrice(finalPrice);
            finalPriceElement.classList.add('price-updated');
            setTimeout(() => finalPriceElement.classList.remove('price-updated'), 500);
        }
        
        // Показываем/скрываем строку со скидкой
        const discountRow = document.querySelector('.discount-row');
        if (discountRow) {
            discountRow.style.display = discount > 0 ? 'flex' : 'none';
        }
    }
    
    // Обработчик кнопки "Заказать выбранное"
    function handleOrder() {
        if (selectedItems.length === 0) {
            alert('Пожалуйста, выберите блюда для заказа!');
            return;
        }
        
        // Формируем сообщение для заказа
        let orderMessage = 'Хочу заказать:\n\n';
        selectedItems.forEach(item => {
            orderMessage += `• ${item.name} - ${formatPrice(item.price)}\n`;
        });
        
        orderMessage += `\nОбщая сумма: ${formatPrice(totalPrice)}`;
        
        if (discount > 0) {
            orderMessage += `\nСкидка ${DISCOUNT_PERCENTAGE}%: -${formatPrice(discount)}`;
            orderMessage += `\nИтого к оплате: ${formatPrice(finalPrice)}`;
        }
        
        orderMessage += `\n\nПожалуйста, свяжитесь со мной для подтверждения заказа.`;
        
        // Открываем попап с предзаполненным сообщением
        openOrderPopup(orderMessage);
    }
    
    // Открыть попап с заказом
    function openOrderPopup(orderMessage) {
        const popupOverlay = document.getElementById('popup-overlay');
        const contactForm = document.getElementById('contact-form');
        
        if (popupOverlay && contactForm) {
            // Заполняем сообщение в попапе
            const messageField = document.getElementById('popup-message');
            if (messageField) {
                messageField.value = orderMessage;
            }
            
            // Открываем попап
            popupOverlay.style.display = 'flex';
            popupOverlay.style.opacity = '0';
            
            let opacity = 0;
            function animate() {
                opacity += 0.05;
                popupOverlay.style.opacity = opacity;
                if (opacity < 1) {
                    requestAnimationFrame(animate);
                }
            }
            requestAnimationFrame(animate);
            
            // Фокусируемся на поле имени
            const popupName = document.getElementById('popup-name');
            if (popupName) {
                setTimeout(() => popupName.focus(), 500);
            }
        } else {
            // Если попап не найден, показываем alert
            alert(`Заказ оформлен!\n\n${orderMessage}\n\nНаш менеджер свяжется с вами для подтверждения.`);
        }
    }
    
    // Очистить заказ
    function clearOrder() {
        if (selectedItems.length === 0) return;
        
        if (confirm('Вы уверены, что хотите очистить заказ?')) {
            // Снимаем все чекбоксы
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            
            // Очищаем массив заказа
            selectedItems = [];
            
            // Обновляем отображение
            updateOrderDisplay();
            updatePriceDisplay();
            
            // Очищаем localStorage
            localStorage.removeItem('restaurant_order');
            
            // Анимация очистки
            if (orderList) {
                orderList.classList.add('clearing');
                setTimeout(() => orderList.classList.remove('clearing'), 300);
            }
        }
    }
    
    // Сохранить заказ в localStorage
    function saveOrder() {
        try {
            const orderData = {
                items: selectedItems,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('restaurant_order', JSON.stringify(orderData));
        } catch (e) {
            console.error('Ошибка сохранения заказа:', e);
        }
    }
    
    // Загрузить сохраненный заказ из localStorage
    function loadSavedOrder() {
        try {
            const savedOrder = localStorage.getItem('restaurant_order');
            if (savedOrder) {
                const orderData = JSON.parse(savedOrder);
                
                // Проверяем, не устарел ли заказ (больше 1 дня)
                const savedTime = new Date(orderData.timestamp);
                const currentTime = new Date();
                const hoursDiff = Math.abs(currentTime - savedTime) / 36e5;
                
                if (hoursDiff < 24) { // 24 часа
                    selectedItems = orderData.items || [];
                    
                    // Устанавливаем чекбоксы
                    selectedItems.forEach(item => {
                        const checkbox = Array.from(checkboxes).find(
                            cb => cb.dataset.name === item.name
                        );
                        if (checkbox) {
                            checkbox.checked = true;
                        }
                    });
                } else {
                    // Удаляем устаревший заказ
                    localStorage.removeItem('restaurant_order');
                }
            }
        } catch (e) {
            console.error('Ошибка загрузки заказа:', e);
            localStorage.removeItem('restaurant_order');
        }
    }
    
    // Форматирование цены
    function formatPrice(price) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price).replace('RUB', '₽');
    }
    
    // Инициализация при загрузке
    initCalculator();
});
