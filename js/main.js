// Меню ресторана
const menuData = {
    starters: [
        { name: "Брускетта с томатами", price: "450 ₽", desc: "Свежие томаты, базилик, оливковое масло" },
        { name: "Карпаччо из говядины", price: "690 ₽", desc: "Тонко нарезанная говядина с пармезаном" },
        { name: "Тартар из тунца", price: "780 ₽", desc: "С авокадо и кунжутным соусом" }
    ],
    main: [
        { name: "Стейк Рибай", price: "1850 ₽", desc: "350г, с овощами гриль" },
        { name: "Лосось на гриле", price: "1250 ₽", desc: "С лимонным соусом и рисом" },
        { name: "Паста Карбонара", price: "890 ₽", desc: "По традиционному рецепту" }
    ],
    desserts: [
        { name: "Тирамису", price: "550 ₽", desc: "Классический итальянский десерт" },
        { name: "Чизкейк Нью-Йорк", price: "480 ₽", desc: "С ягодным соусом" },
        { name: "Шоколадный фондан", price: "520 ₽", desc: "С ванильным мороженым" }
    ],
    drinks: [
        { name: "Мохито", price: "450 ₽", desc: "Классический освежающий коктейль" },
        { name: "Негрони", price: "580 ₽", desc: "Классика итальянского аперитива" },
        { name: "Домашний лимонад", price: "320 ₽", desc: "С мятой и имбирем" }
    ]
};

// Функция отображения меню
function displayMenu(category) {
    const menuItemsContainer = document.getElementById('menu-items');
    const items = menuData[category];
    
    let html = '';
    items.forEach(item => {
        html += `
            <div class="menu-item fade-in">
                <h3>${item.name}</h3>
                <p class="price">${item.price}</p>
                <p class="description">${item.desc}</p>
            </div>
        `;
    });
    
    menuItemsContainer.innerHTML = html;
    
    // Обновляем активную кнопку категории
    document.querySelectorAll('.menu-category').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
}

// Инициализация меню при загрузке
document.addEventListener('DOMContentLoaded', function() {
    displayMenu('starters');
    
    // Обработчики для кнопок категорий
    document.querySelectorAll('.menu-category').forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            displayMenu(category);
        });
    });
    
    // Плавная прокрутка для якорей
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if(this.getAttribute('href') === '#') return;
            
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Мобильное меню
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');
    const mobileDropdown = document.querySelector('.dropdown-toggle');
    
    if(mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });
        
        if(mobileMenuClose) {
            mobileMenuClose.addEventListener('click', function() {
                mobileMenuBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.classList.remove('no-scroll');
            });
        }
        
        // Закрытие меню при клике на ссылку
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                if(!this.classList.contains('dropdown-toggle')) {
                    mobileMenuBtn.classList.remove('active');
                    mobileMenu.classList.remove('active');
                    document.body.classList.remove('no-scroll');
                }
            });
        });
        
        // Мобильное выпадающее меню
        if(mobileDropdown) {
            mobileDropdown.addEventListener('click', function(e) {
                e.preventDefault();
                const submenu = this.nextElementSibling;
                submenu.classList.toggle('active');
            });
        }
    }
    
    // Десктопное выпадающее меню
    const dropdowns = document.querySelectorAll('.menu-dropdown');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('mouseenter', function() {
            const submenu = this.querySelector('.dropdown');
            submenu.style.display = 'block';
            setTimeout(() => {
                submenu.style.opacity = '1';
                submenu.style.transform = 'translateY(0)';
            }, 10);
        });
        
        dropdown.addEventListener('mouseleave', function() {
            const submenu = this.querySelector('.dropdown');
            submenu.style.opacity = '0';
            submenu.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                submenu.style.display = 'none';
            }, 300);
        });
    });
    
    // Фиксированная навигация при скролле
    const navbar = document.querySelector('.navbar');
    if(navbar) {
        window.addEventListener('scroll', function() {
            if(window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
});
