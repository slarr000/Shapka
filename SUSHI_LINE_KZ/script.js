class SushiApp {
    constructor() {
        this.cartResizeHandler = this.updateCartPanelPosition.bind(this);
        this.selectors = {
            header: '.header',
            floatingIcons: '.floating-icons',
            languageButton: '#languageButton',
            languageSelector: '.language-selector',
            languageOptions: '.language-option',
            searchButton: '#searchButton',
            searchExpanded: '#searchExpanded',
            searchInput: '#searchInput',
            searchClose: '#searchClose',
            searchContainer: '.search-container',
            suggestionItems: '.suggestion-item',
            cartButton: '.cart-button',
            cartClose: '#cartClose',
            cartPanel: '#cartPanel',
            cartAmount: '#cartAmount',
            contentSections: '.content-sections',
            heroContainer: '.hero-container',
            floatingIconsLeft: '.floating-icons-left',
            floatingIconsRight: '.floating-icons-right'
        };

        this.state = {
            isCartOpen: false,
            currentLanguage: 'ru',
            cartAmount: 0
        };

        this.breakpoints = {
            small: 1440,
            large: 2560
        };

        this.init();
    }

    init() {
        const initMethods = [
            'initHeaderBehavior',
            'initLanguageSelector',
            'initSearch',
            'initCart',
            'animateCartAmount'
        ];

        initMethods.forEach(method => {
            try {
                if (typeof this[method] === 'function') {
                    this[method]();
                }
            } catch (error) {
                console.warn(`SushiApp.${method} failed:`, error);
            }
        });
    }

    // Кэширование DOM элементов
    getElement(selector) {
        return document.querySelector(selector);
    }

    getElements(selector) {
        return document.querySelectorAll(selector);
    }

    // Оптимизированное поведение хедера
    initHeaderBehavior() {
        const header = this.getElement(this.selectors.header);
        const floatingIcons = this.getElement(this.selectors.floatingIcons);

        if (!header || !floatingIcons) return;

        const updateHeader = () => {
            const scrollY = window.scrollY;

            if (document.body.classList.contains('cart-open')) {
                return;
            }

            const shouldScroll = scrollY > 200;
            header.classList.toggle('scrolled', shouldScroll);
            floatingIcons.classList.toggle('scrolled', shouldScroll);
        };

        // Оптимизированный обработчик скролла
        let ticking = false;
        const optimizedScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    updateHeader();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', optimizedScroll, { passive: true });
        window.addEventListener('resize', updateHeader, { passive: true });
        updateHeader();
    }

    // Улучшенная анимация корзины
    animateCartAmount() {
        setTimeout(() => {
            const cartAmount = this.getElement(this.selectors.cartAmount);
            const cart = this.getElement('.cart');

            if (!cartAmount || !cart) return;

            cartAmount.classList.add('amount-increasing');
            cart.classList.add('cart-pulse');

            this.animateValue(0, 14500, 2000,
                (value) => {
                    cartAmount.textContent = Math.round(value).toLocaleString('ru-RU') + ' ₸';
                },
                () => {
                    setTimeout(() => {
                        cartAmount.classList.remove('amount-increasing');
                        cart.classList.remove('cart-pulse');
                    }, 1000);
                }
            );
        }, 300);
    }

    // Универсальная функция анимации значений
    animateValue(start, end, duration, onUpdate, onComplete) {
        const startTime = performance.now();

        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = start + (end - start) * progress;

            onUpdate(current);

            if (progress < 1) {
                requestAnimationFrame(update);
            } else if (onComplete) {
                onComplete();
            }
        };

        requestAnimationFrame(update);
    }

    // Оптимизированный выбор языка
    initLanguageSelector() {
        const languageButton = this.getElement(this.selectors.languageButton);
        const languageSelector = this.getElement(this.selectors.languageSelector);
        const languageOptions = this.getElements(this.selectors.languageOptions);

        if (!languageButton || !languageSelector || languageOptions.length === 0) return;

        // Активируем первый язык
        languageOptions[0]?.classList.add('active');

        languageButton.addEventListener('click', (e) => {
            e.stopPropagation();
            languageSelector.classList.toggle('active');
        });

        languageOptions.forEach(option => {
            option.addEventListener('click', () => {
                const langCodeElement = option.querySelector('.language-code');
                const textElement = languageButton.querySelector('text');

                if (langCodeElement && textElement) {
                    const langCode = langCodeElement.textContent;
                    textElement.textContent = langCode;

                    languageOptions.forEach(opt => opt.classList.remove('active'));
                    option.classList.add('active');
                    languageSelector.classList.remove('active');

                    this.state.currentLanguage = option.dataset.lang;
                }
            });
        });

        // Закрытие по клику вне элемента
        document.addEventListener('click', () => {
            languageSelector.classList.remove('active');
        });

        // Закрытие по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                languageSelector.classList.remove('active');
            }
        });
    }

    // Улучшенный поиск
    initSearch() {
        const searchButton = this.getElement(this.selectors.searchButton);
        const searchExpanded = this.getElement(this.selectors.searchExpanded);
        const searchInput = this.getElement(this.selectors.searchInput);
        const searchClose = this.getElement(this.selectors.searchClose);
        const searchContainer = this.getElement(this.selectors.searchContainer);
        const suggestionItems = this.getElements(this.selectors.suggestionItems);

        if (!searchButton || !searchExpanded || !searchInput || !searchClose || !searchContainer) return;

        searchButton.addEventListener('click', () => {
            searchExpanded.classList.add('active');
            setTimeout(() => searchInput.focus(), 100);
        });

        searchClose.addEventListener('click', () => this.closeSearch());

        // Делегирование событий для кликов вне области
        document.addEventListener('click', (e) => {
            if (!searchContainer.contains(e.target)) {
                this.closeSearch();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSearch();
            }
        });

        // Оптимизированный ввод
        let inputTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(inputTimeout);
            inputTimeout = setTimeout(() => {
                searchContainer.classList.toggle('search-pulse', e.target.value.length > 0);
            }, 150);
        });

        // Обработчик для подсказок
        suggestionItems.forEach(item => {
            item.addEventListener('click', () => {
                searchInput.value = item.textContent;
                searchInput.focus();
                this.performSearch(searchInput.value);
            });
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.performSearch(searchInput.value);
            }
        });
    }

    closeSearch() {
        const searchExpanded = this.getElement(this.selectors.searchExpanded);
        const searchInput = this.getElement(this.selectors.searchInput);
        const searchContainer = this.getElement(this.selectors.searchContainer);

        if (searchExpanded) searchExpanded.classList.remove('active');
        if (searchInput) searchInput.value = '';
        if (searchContainer) searchContainer.classList.remove('search-pulse');
    }

    performSearch(query) {
        if (query.trim()) {
            console.log('Выполняется поиск:', query);
            this.closeSearch();
        }
    }

    // Оптимизированная корзина
    initCart() {
        const cartButton = this.getElement(this.selectors.cartButton);
        const cartClose = this.getElement(this.selectors.cartClose);
        const cartPanel = this.getElement(this.selectors.cartPanel);

        if (!cartButton || !cartClose || !cartPanel) return;

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

        // Делегирование кликов вне корзины
        document.addEventListener('click', (e) => {
            if (cartPanel.classList.contains('active') &&
                !cartPanel.contains(e.target) &&
                !e.target.closest('.cart-button')) {
                this.closeCart();
            }
        });
    }

    toggleCart() {
        const cartPanel = this.getElement(this.selectors.cartPanel);
        if (cartPanel && cartPanel.classList.contains('active')) {
            this.closeCart();
        } else {
            this.openCart();
        }
    }

    openCart() {
        const cartPanel = this.getElement(this.selectors.cartPanel);
        const contentSections = this.getElement(this.selectors.contentSections);
        const heroContainer = this.getElement(this.selectors.heroContainer);
        const body = document.body;

        if (!cartPanel || !contentSections || !heroContainer || !body) return;

        // Для очень больших экранов 2560px+
        if (window.innerWidth >= this.breakpoints.large) {
            body.classList.add('cart-open');
            cartPanel.classList.add('active');
            this.updateCartPanelPosition();
            window.addEventListener('resize', this.cartResizeHandler);
            return;
        }

        contentSections.classList.add('shifted');
        heroContainer.classList.add('shifted');
        body.classList.add('cart-open');

        this.updateFloatingIconsPosition();
        cartPanel.classList.add('active');
        this.updateCartPanelPosition();
        window.addEventListener('resize', this.cartResizeHandler);
    }

    closeCart() {
        const cartPanel = this.getElement(this.selectors.cartPanel);
        const contentSections = this.getElement(this.selectors.contentSections);
        const heroContainer = this.getElement(this.selectors.heroContainer);
        const body = document.body;

        if (!cartPanel || !contentSections || !heroContainer || !body) return;

        cartPanel.classList.remove('active');
        contentSections.classList.remove('shifted');
        heroContainer.classList.remove('shifted');
        body.classList.remove('cart-open');

        this.resetFloatingIconsPosition();
        this.updateHeaderState();

        window.removeEventListener('resize', this.cartResizeHandler);
        cartPanel.style.right = '';
    }

    updateFloatingIconsPosition() {
        const floatingIconsLeft = this.getElement(this.selectors.floatingIconsLeft);
        const floatingIconsRight = this.getElement(this.selectors.floatingIconsRight);

        if (window.innerWidth >= 1025) {
            if (window.innerWidth <= this.breakpoints.small) {
                // Для 1025px - 1440px
                if (floatingIconsLeft) {
                    floatingIconsLeft.style.left = `calc((100vw - 1140px) / 2)`;
                }
                if (floatingIconsRight) {
                    floatingIconsRight.style.right = `calc((100vw - 1140px) / 2)`;
                }
            } else if (window.innerWidth <= (this.breakpoints.large - 1)) {
                // Для 1441px - 2559px
                if (floatingIconsLeft) {
                    floatingIconsLeft.style.left = `calc((100vw - 1300px) / 2)`;
                }
                if (floatingIconsRight) {
                    floatingIconsRight.style.right = `calc((100vw - 1300px) / 2)`;
                }
            }
        }
    }

    resetFloatingIconsPosition() {
        const floatingIconsLeft = this.getElement(this.selectors.floatingIconsLeft);
        const floatingIconsRight = this.getElement(this.selectors.floatingIconsRight);

        if (floatingIconsLeft) floatingIconsLeft.style.left = '';
        if (floatingIconsRight) floatingIconsRight.style.right = '';
    }

    updateCartPanelPosition() {
        const cartPanel = this.getElement(this.selectors.cartPanel);
        if (!cartPanel) return;

        const width = window.innerWidth;
        let rightPosition, panelWidth;

        if (width <= this.breakpoints.small) {
            // Для экранов до 1440px
            rightPosition = 'calc((100vw - 1140px) / 2)';
            panelWidth = '375px';
        } else if (width <= (this.breakpoints.large - 1)) {
            // Для экранов 1441px - 2559px
            rightPosition = 'calc((100vw - 1300px) / 2)';
            panelWidth = '375px';
        } else if (width >= this.breakpoints.large) {
            // Для очень больших экранов 2560px+
            rightPosition = 'calc((100vw - 1300px) / 2 - 375px - 20px)';
            panelWidth = '375px';
        }

        cartPanel.style.right = rightPosition;
        cartPanel.style.width = panelWidth;
    }

    updateHeaderState() {
        const header = this.getElement(this.selectors.header);
        const floatingIcons = this.getElement(this.selectors.floatingIcons);
        const scrollY = window.scrollY;

        if (!header || !floatingIcons || document.body.classList.contains('cart-open')) return;

        // Для всех экранов применяем одинаковую логику
        header.classList.toggle('scrolled', scrollY > 200);
        floatingIcons.classList.toggle('scrolled', scrollY > 200);
    }

    // Очистка при уничтожении
    destroy() {
        window.removeEventListener('resize', this.cartResizeHandler);
        window.removeEventListener('scroll', this.updateHeaderState);
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    new SushiApp();
});
