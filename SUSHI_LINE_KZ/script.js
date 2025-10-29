class SushiApp {
    constructor() {
        this.cartResizeHandler = null;
        this.init();

        // Добавляем обработчик ресайза для обновления позиции корзины
        window.addEventListener('resize', () => {
            if (document.body.classList.contains('cart-open')) {
                this.updateCartPanelPosition();
            }
        });
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
        const headerWrapper = document.querySelector('.header-wrapper');
        const floatingIcons = document.querySelector('.floating-icons');

        const updateHeader = () => {
            const scrollY = window.scrollY;
            const windowWidth = window.innerWidth;

            // Если корзина открыта, обновляем только позицию корзины
            if (document.body.classList.contains('cart-open')) {
                this.updateCartPanelPosition();
                return;
            }

            if (windowWidth >= 1350) {
                headerContainer.classList.toggle('header-narrow', scrollY <= 200);
                headerContainer.classList.toggle('header-wide', scrollY > 200);
                headerWrapper.classList.toggle('header-narrow', scrollY <= 200);
                headerWrapper.classList.toggle('header-wide', scrollY > 200);
            } else {
                headerContainer.classList.add('header-narrow');
                headerContainer.classList.remove('header-wide');
                headerWrapper.classList.add('header-narrow');
                headerWrapper.classList.remove('header-wide');
            }

            header.classList.toggle('scrolled', scrollY > 50);

            if (floatingIcons) {
                floatingIcons.classList.toggle('scrolled', scrollY > 200);
            }

            // Обновляем позицию корзины при скролле, если она открыта
            if (document.body.classList.contains('cart-open')) {
                this.updateCartPanelPosition();
            }
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
        const heroContainer = document.querySelector('.hero-container');

        cartButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleCart();
        });

        cartClose.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeCart();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && cartPanel.classList.contains('active')) {
                this.closeCart();
            }
        });

        document.addEventListener('click', (e) => {
            if (cartPanel.classList.contains('active') &&
                !cartPanel.contains(e.target) &&
                !e.target.closest('.cart-button')) {
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
        const heroContainer = document.querySelector('.hero-container');
        const body = document.body;
        const headerContainer = document.querySelector('.header-container');
        const headerWrapper = document.querySelector('.header-wrapper');

        cartPanel.classList.add('active');
        this.updateCartPanelPosition();

        if (window.innerWidth > 768) {
            contentSections.classList.add('shifted');
            heroContainer.classList.add('shifted');
            body.classList.add('cart-open');

            // Добавляем класс для сужения шапки
            headerContainer.classList.remove('header-wide');
            headerContainer.classList.add('header-narrow');
            headerWrapper.classList.remove('header-wide');
            headerWrapper.classList.add('header-narrow');

            const floatingIcons = document.querySelector('.floating-icons');
            if (floatingIcons) {
                floatingIcons.style.transform = 'none';
                floatingIcons.classList.remove('scrolled');
            }
        }

        this.cartResizeHandler = () => this.updateCartPanelPosition();
        window.addEventListener('resize', this.cartResizeHandler);
    }

    closeCart() {
        const cartPanel = document.getElementById('cartPanel');
        const contentSections = document.querySelector('.content-sections');
        const heroContainer = document.querySelector('.hero-container');
        const body = document.body;
        const headerContainer = document.querySelector('.header-container');
        const headerWrapper = document.querySelector('.header-wrapper');

        cartPanel.classList.remove('active');
        contentSections.classList.remove('shifted');
        heroContainer.classList.remove('shifted');
        body.classList.remove('cart-open');

        // Возвращаем шапку к исходному состоянию
        headerContainer.classList.remove('header-narrow');
        headerContainer.classList.add('header-wide');
        headerWrapper.classList.remove('header-narrow');
        headerWrapper.classList.add('header-wide');

        const floatingIcons = document.querySelector('.floating-icons');
        if (floatingIcons) {
            floatingIcons.style.transform = '';
            this.updateFloatingIconsPosition();
        }

        if (this.cartResizeHandler) {
            window.removeEventListener('resize', this.cartResizeHandler);
            this.cartResizeHandler = null;
        }

        cartPanel.style.right = '';

        // Вызываем обновление заголовка для восстановления правильного состояния
        this.updateHeader();
    }

    updateCartPanelPosition() {
        const cartPanel = document.getElementById('cartPanel');

        if (!cartPanel) return;

        // Для мобильных устройств оставляем стандартное позиционирование
        if (window.innerWidth <= 1200) {
            cartPanel.style.right = '20px';
            return;
        }

        // На десктопе корзина появляется справа с отступом, соответствующим иконкам
        cartPanel.style.right = 'calc((100vw - 1300px) / 2 + 100px)';
    }

    updateHeader() {
        const header = document.querySelector('.header');
        const headerContainer = document.querySelector('.header-container');
        const headerWrapper = document.querySelector('.header-wrapper');
        const floatingIcons = document.querySelector('.floating-icons');

        if (!headerContainer || document.body.classList.contains('cart-open')) return;

        const scrollY = window.scrollY;
        const windowWidth = window.innerWidth;

        if (windowWidth >= 1350) {
            headerContainer.classList.toggle('header-narrow', scrollY <= 200);
            headerContainer.classList.toggle('header-wide', scrollY > 200);
            headerWrapper.classList.toggle('header-narrow', scrollY <= 200);
            headerWrapper.classList.toggle('header-wide', scrollY > 200);
        } else {
            headerContainer.classList.add('header-narrow');
            headerContainer.classList.remove('header-wide');
            headerWrapper.classList.add('header-narrow');
            headerWrapper.classList.remove('header-wide');
        }

        header.classList.toggle('scrolled', scrollY > 50);

        if (floatingIcons) {
            floatingIcons.classList.toggle('scrolled', scrollY > 200);
        }
    }

    updateFloatingIconsPosition() {
        const floatingIcons = document.querySelector('.floating-icons');
        const scrollY = window.scrollY;

        if (floatingIcons) {
            floatingIcons.classList.toggle('scrolled', scrollY > 200);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new SushiApp());
