// Кастомный слайдер для специальных предложений
document.addEventListener('DOMContentLoaded', function() {
    const slider = document.querySelector('.specials-slider');
    if (!slider) return;
    
    const wrapper = slider.querySelector('.slider-wrapper');
    const slides = slider.querySelectorAll('.special-slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const indicators = slider.querySelectorAll('.indicator');
    
    let currentSlide = 0;
    const totalSlides = slides.length;
    let isAnimating = false;
    let autoSlideInterval;
    
    // Устанавливаем начальные размеры
    function setupSlider() {
        wrapper.style.width = `${totalSlides * 100}%`;
        slides.forEach(slide => {
            slide.style.width = `${100 / totalSlides}%`;
        });
        updateSliderPosition();
    }
    
    // Обновляем позицию слайдера
    function updateSliderPosition() {
        wrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
        updateIndicators();
    }
    
    // Обновляем индикаторы
    function updateIndicators() {
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentSlide);
        });
    }
    
    // Переход к слайду
    function goToSlide(index, animate = true) {
        if (isAnimating || index < 0 || index >= totalSlides || index === currentSlide) return;
        
        isAnimating = true;
        if (animate) {
            wrapper.style.transition = 'transform 0.5s ease';
        } else {
            wrapper.style.transition = 'none';
        }
        
        currentSlide = index;
        updateSliderPosition();
        
        // Сбрасываем анимацию
        if (animate) {
            setTimeout(() => {
                isAnimating = false;
                wrapper.style.transition = '';
            }, 500);
        } else {
            isAnimating = false;
        }
    }
    
    // Следующий слайд
    function nextSlide() {
        const nextIndex = (currentSlide + 1) % totalSlides;
        goToSlide(nextIndex);
    }
    
    // Предыдущий слайд
    function prevSlide() {
        const prevIndex = (currentSlide - 1 + totalSlides) % totalSlides;
        goToSlide(prevIndex);
    }
    
    // Автопрокрутка
    function startAutoSlide() {
        stopAutoSlide();
        autoSlideInterval = setInterval(nextSlide, 5000);
    }
    
    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
        }
    }
    
    // Инициализация
    setupSlider();
    
    // Обработчики событий
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            stopAutoSlide();
            prevSlide();
            startAutoSlide();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            stopAutoSlide();
            nextSlide();
            startAutoSlide();
        });
    }
    
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            stopAutoSlide();
            goToSlide(index);
            startAutoSlide();
        });
    });
    
    // Свайп на мобильных
    let touchStartX = 0;
    let touchEndX = 0;
    
    slider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoSlide();
    });
    
    slider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoSlide();
    });
    
    function handleSwipe() {
        const swipeDistance = touchStartX - touchEndX;
        const threshold = 50;
        
        if (Math.abs(swipeDistance) < threshold) return;
        
        if (swipeDistance > 0) {
            nextSlide();
        } else {
            prevSlide();
        }
    }
    
    // Запускаем автопрокрутку
    startAutoSlide();
    
    // Останавливаем автопрокрутку при наведении
    slider.addEventListener('mouseenter', stopAutoSlide);
    slider.addEventListener('mouseleave', startAutoSlide);
    
    // Обработчик для кнопок заказа
    document.querySelectorAll('.slide-order-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const slideTitle = this.closest('.slide-info').querySelector('.slide-title').textContent;
            alert(`Вы выбрали: ${slideTitle}\nНаш менеджер свяжется с вами для подтверждения заказа.`);
        });
    });
});
