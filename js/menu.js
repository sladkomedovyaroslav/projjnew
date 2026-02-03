// Мобильное меню
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const body = document.body;
    
    if(mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            body.classList.toggle('no-scroll');
        });
        
        // Закрытие меню при клике на ссылку
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
                body.classList.remove('no-scroll');
            });
        });
        
        // Мобильное выпадающее меню
        const mobileDropdown = document.querySelector('.mobile-dropdown');
        if(mobileDropdown) {
            const dropdownLink = mobileDropdown.querySelector('a');
            const submenu = mobileDropdown.querySelector('.mobile-submenu');
            
            dropdownLink.addEventListener('click', function(e) {
                e.preventDefault();
                submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
            });
        }
    }
    
    // Десктопное выпадающее меню - плавное появление
    const dropdowns = document.querySelectorAll('.menu-dropdown');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('mouseenter', function() {
            const submenu = this.querySelector('.dropdown');
            submenu.style.opacity = '0';
            submenu.style.transform = 'translateY(-10px)';
            submenu.style.display = 'block';
            
            requestAnimationFrame(() => {
                submenu.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                submenu.style.opacity = '1';
                submenu.style.transform = 'translateY(0)';
            });
        });
        
        dropdown.addEventListener('mouseleave', function() {
            const submenu = this.querySelector('.dropdown');
            submenu.style.opacity = '0';
            submenu.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                if(!dropdown.matches(':hover')) {
                    submenu.style.display = 'none';
                }
            }, 300);
        });
    });
});
