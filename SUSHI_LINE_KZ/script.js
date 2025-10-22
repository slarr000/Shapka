class SushiApp {
    constructor() {
        this.cartResizeHandler = null;
        this.init();
    }

    init() {
        this.initHeaderBehavior();
        this.initLanguageSelector();
        this.initSearch();
        this.initCart();
        this.animateCartAmount();
    }

    initHeaderBehavior() {
        const header = document.querySelector('.header');
        const headerContainer = document.querySelector('.header-container');

        const updateHeader = () => {
            const scrollY = window.scrollY;
            const windowWidth = window.innerWidth;

            if (windowWidth >= 1350) {
                headerContainer.classList.toggle('header-narrow', scrollY <= 200);
                headerContainer.classList.toggle('header-wide', scrollY > 200);
            } else {
                headerContainer.classList.add('header-narrow');
                headerContainer.classList.remove('header-wide');
            }

            header.classList.toggle('scrolled', scrollY > 50);
        };

        window.addEventListener('scroll', updateHeader);
        window.addEventListener('resize', updateHeader);
        updateHeader();
    }

    animateCartAmount() {
        setTimeout(() => {
            const cartAmount = document.getElementById('cartAmount');
            const cart = document.querySelector('.cart');

            cartAmount.classList.add('amount-increasing');
            cart.classList.add('cart-pulse');

            let currentAmount = 0;
            const targetAmount = 14500;
            const duration = 2000;
            const startTime = performance.now();

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                currentAmount = targetAmount * progress;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    setTimeout(() => {
                        cartAmount.classList.remove('amount-increasing');
                        cart.classList.remove('cart-pulse');
                    }, 1000);
                }

                cartAmount.textContent = Math.round(currentAmount).toLocaleString('ru-RU') + ' ₸';
            };

            requestAnimationFrame(animate);
        }, 300);
    }

    initLanguageSelector() {
        const languageButton = document.getElementById('languageButton');
        const languageSelector = document.querySelector('.language-selector');
        const languageOptions = document.querySelectorAll('.language-option');

        languageOptions[0].classList.add('active');

        languageButton.addEventListener('click', (e) => {
            e.stopPropagation();
            languageSelector.classList.toggle('active');
        });

        languageOptions.forEach(option => {
            option.addEventListener('click', () => {
                const langCode = option.querySelector('.language-code').textContent;
                const textElement = languageButton.querySelector('text');

                textElement.textContent = langCode;
                languageOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                languageSelector.classList.remove('active');
            });
        });

        document.addEventListener('click', () => languageSelector.classList.remove('active'));
        document.addEventListener('keydown', (e) => e.key === 'Escape' && languageSelector.classList.remove('active'));
    }

    initSearch() {
        const searchButton = document.getElementById('searchButton');
        const searchExpanded = document.getElementById('searchExpanded');
        const searchInput = document.getElementById('searchInput');
        const searchClose = document.getElementById('searchClose');
        const searchContainer = document.querySelector('.search-container');
        const suggestionItems = document.querySelectorAll('.suggestion-item');

        searchButton.addEventListener('click', () => {
            searchExpanded.classList.add('active');
            setTimeout(() => searchInput.focus(), 100);
        });

        searchClose.addEventListener('click', () => this.closeSearch());

        document.addEventListener('click', (e) => {
            if (!searchContainer.contains(e.target)) this.closeSearch();
        });

        document.addEventListener('keydown', (e) => e.key === 'Escape' && this.closeSearch());

        searchInput.addEventListener('input', (e) => {
            searchContainer.classList.toggle('search-pulse', e.target.value.length > 0);
        });

        suggestionItems.forEach(item => {
            item.addEventListener('click', () => {
                searchInput.value = item.textContent;
                searchInput.focus();
                this.performSearch(searchInput.value);
            });
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.performSearch(searchInput.value);
        });
    }

    closeSearch() {
        const searchExpanded = document.getElementById('searchExpanded');
        const searchInput = document.getElementById('searchInput');
        const searchContainer = document.querySelector('.search-container');

        searchExpanded.classList.remove('active');
        searchInput.value = '';
        searchContainer.classList.remove('search-pulse');
    }

    performSearch(query) {
        if (query.trim()) {
            console.log('Выполняется поиск:', query);
            this.closeSearch();
        }
    }

    initCart() {
        const cartButton = document.querySelector('.cart-button');
        const cartClose = document.getElementById('cartClose');
        const cartPanel = document.getElementById('cartPanel');
        const contentSections = document.querySelector('.content-sections');

        cartButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleCart();
        });

        cartClose.addEventListener('click', () => this.closeCart());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && cartPanel.classList.contains('active')) {
                this.closeCart();
            }
        });

        document.addEventListener('click', (e) => {
            if (cartPanel.classList.contains('active') &&
                !cartPanel.contains(e.target) &&
                !cartButton.contains(e.target)) {
                this.closeCart();
            }
        });
    }

    toggleCart() {
        const cartPanel = document.getElementById('cartPanel');
        if (cartPanel.classList.contains('active')) {
            this.closeCart();
        } else {
            this.openCart();
        }
    }

    openCart() {
        const cartPanel = document.getElementById('cartPanel');
        const contentSections = document.querySelector('.content-sections');

        cartPanel.classList.add('active');
        // Обновляем позиционирование при открытии
        this.updateCartPanelPosition();

        // Сдвигаем только секции контента, а не весь контент (исключая hero)
        if (window.innerWidth > 768) {
            contentSections.classList.add('shifted');
        }

        // Добавляем обработчик для обновления позиции при ресайзе
        this.cartResizeHandler = () => this.updateCartPanelPosition();
        window.addEventListener('resize', this.cartResizeHandler);
    }

    closeCart() {
        const cartPanel = document.getElementById('cartPanel');
        const contentSections = document.querySelector('.content-sections');

        cartPanel.classList.remove('active');
        contentSections.classList.remove('shifted');

        // Убираем обработчик ресайза
        if (this.cartResizeHandler) {
            window.removeEventListener('resize', this.cartResizeHandler);
            this.cartResizeHandler = null;
        }

        // Сбрасываем кастомное позиционирование
        cartPanel.style.right = '';
    }

    updateCartPanelPosition() {
        const cartPanel = document.getElementById('cartPanel');
        const headerContainer = document.querySelector('.header-container');

        if (!cartPanel || !headerContainer) return;

        if (window.innerWidth >= 1351) {
            // Для широкого состояния шапки (1300px)
            const offset = (window.innerWidth - 1300) / 2;
            cartPanel.style.right = `${offset + 15}px`;
        } else if (window.innerWidth >= 1201) {
            // Для узкого состояния шапки (1140px)
            const offset = (window.innerWidth - 1140) / 2;
            cartPanel.style.right = `${offset + 15}px`;
        } else {
            // Для мобильных устройств - убираем кастомное позиционирование
            cartPanel.style.right = '';
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => new SushiApp());
