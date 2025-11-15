class SushiApp {
    constructor() {
        this.cartResizeHandler = this.updateCartPanelPosition.bind(this);
        this.init();
    }

    init() {
        try {
            this.initHeaderBehavior();
            this.initLanguageSelector();
            this.initSearch();
            this.initCart();
            this.animateCartAmount();
        } catch (error) {
            console.error('SushiApp initialization failed:', error);
        }
    }

    initHeaderBehavior() {
        const header = document.querySelector('.header');
        const floatingIcons = document.querySelector('.floating-icons');

        if (!header || !floatingIcons) return;

        const updateHeader = () => {
            const scrollY = window.scrollY;

           
            if (document.body.classList.contains('cart-open')) {
                return;
            }

            header.classList.toggle('scrolled', scrollY > 200);
            floatingIcons.classList.toggle('scrolled', scrollY > 200);
        };

        window.addEventListener('scroll', updateHeader);
        window.addEventListener('resize', updateHeader);
        updateHeader();
    }

    animateCartAmount() {
        setTimeout(() => {
            const cartAmount = document.getElementById('cartAmount');
            const cart = document.querySelector('.cart');

            if (!cartAmount || !cart) return;

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

        if (!languageButton || !languageSelector || languageOptions.length === 0) return;

        languageOptions[0].classList.add('active');

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
                }
            });
        });

        document.addEventListener('click', () => {
            languageSelector.classList.remove('active');
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                languageSelector.classList.remove('active');
            }
        });
    }

    initSearch() {
        const searchButton = document.getElementById('searchButton');
        const searchExpanded = document.getElementById('searchExpanded');
        const searchInput = document.getElementById('searchInput');
        const searchClose = document.getElementById('searchClose');
        const searchContainer = document.querySelector('.search-container');
        const suggestionItems = document.querySelectorAll('.suggestion-item');

        if (!searchButton || !searchExpanded || !searchInput || !searchClose || !searchContainer) return;

        searchButton.addEventListener('click', () => {
            searchExpanded.classList.add('active');
            setTimeout(() => searchInput.focus(), 100);
        });

        searchClose.addEventListener('click', () => this.closeSearch());

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
            if (e.key === 'Enter') {
                this.performSearch(searchInput.value);
            }
        });
    }

    closeSearch() {
        const searchExpanded = document.getElementById('searchExpanded');
        const searchInput = document.getElementById('searchInput');
        const searchContainer = document.querySelector('.search-container');

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

    initCart() {
        const cartButton = document.querySelector('.cart-button');
        const cartClose = document.getElementById('cartClose');
        const cartPanel = document.getElementById('cartPanel');

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
        if (cartPanel && cartPanel.classList.contains('active')) {
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
        const header = document.querySelector('.header');
        const floatingIcons = document.querySelector('.floating-icons');

        if (!cartPanel || !contentSections || !heroContainer || !body || !header || !floatingIcons) return;

        // Для очень больших экранов 2560px+
        if (window.innerWidth >= 2560) {
            body.classList.add('cart-open');
            cartPanel.classList.add('active');
            this.updateCartPanelPosition();
            window.addEventListener('resize', this.cartResizeHandler);
            return;
        }

        contentSections.classList.add('shifted');
        heroContainer.classList.add('shifted');
        body.classList.add('cart-open');

        // Обновляем позиционирование иконок для всех экранов
        const floatingIconsLeft = document.querySelector('.floating-icons-left');
        const floatingIconsRight = document.querySelector('.floating-icons-right');

        if (window.innerWidth >= 1025) {
            if (window.innerWidth <= 1440) {
                // Для 1025px - 1440px
                if (floatingIconsLeft) {
                    floatingIconsLeft.style.left = `calc((100vw - 1140px) / 2)`;
                }
                if (floatingIconsRight) {
                    floatingIconsRight.style.right = `calc((100vw - 1140px) / 2)`;
                }
            } else if (window.innerWidth <= 2559) {
                // Для 1441px - 2559px
                if (floatingIconsLeft) {
                    floatingIconsLeft.style.left = `calc((100vw - 1300px) / 2)`;
                }
                if (floatingIconsRight) {
                    floatingIconsRight.style.right = `calc((100vw - 1300px) / 2)`;
                }
            }
        }

        cartPanel.classList.add('active');
        this.updateCartPanelPosition();
        window.addEventListener('resize', this.cartResizeHandler);
    }

    closeCart() {
        const cartPanel = document.getElementById('cartPanel');
        const contentSections = document.querySelector('.content-sections');
        const heroContainer = document.querySelector('.hero-container');
        const body = document.body;

        if (!cartPanel || !contentSections || !heroContainer || !body) return;

        cartPanel.classList.remove('active');
        contentSections.classList.remove('shifted');
        heroContainer.classList.remove('shifted');
        body.classList.remove('cart-open');

        // Сбрасываем инлайн-стили на всех экранах
        const floatingIconsLeft = document.querySelector('.floating-icons-left');
        const floatingIconsRight = document.querySelector('.floating-icons-right');

        if (floatingIconsLeft) floatingIconsLeft.style.left = '';
        if (floatingIconsRight) floatingIconsRight.style.right = '';

        this.updateHeaderState();

        window.removeEventListener('resize', this.cartResizeHandler);
        cartPanel.style.right = '';
    }

    updateCartPanelPosition() {
        const cartPanel = document.getElementById('cartPanel');
        if (!cartPanel) return;

        if (window.innerWidth <= 1440) {
            // Для экранов до 1440px
            cartPanel.style.right = 'calc((100vw - 1140px) / 2)';
            cartPanel.style.width = '375px';
        } else if (window.innerWidth <= 2559) {
            // Для экранов 1441px - 2559px
            cartPanel.style.right = 'calc((100vw - 1300px) / 2)';
            cartPanel.style.width = '375px';
        } else if (window.innerWidth >= 2560) {
            // Для очень больших экранов 2560px+
            cartPanel.style.right = 'calc((100vw - 1300px) / 2 - 375px - 20px)';
            cartPanel.style.width = '375px';
        }
    }

    updateHeaderState() {
        const header = document.querySelector('.header');
        const floatingIcons = document.querySelector('.floating-icons');
        const scrollY = window.scrollY;

        if (!header || !floatingIcons || document.body.classList.contains('cart-open')) return;


        header.classList.toggle('scrolled', scrollY > 200);
        floatingIcons.classList.toggle('scrolled', scrollY > 200);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SushiApp();
});
