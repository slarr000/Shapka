function initHeaderBehavior() {
    const header = document.querySelector('.header');
    const headerContainer = document.querySelector('.header-container');
    let isScrolled = false;
    let lastScrollY = window.scrollY;

    function updateHeaderState() {
        const scrollY = window.scrollY;
        const windowWidth = window.innerWidth;

        const nowScrolled = scrollY > 200;

        if (windowWidth >= 1350) {
            if (nowScrolled && !isScrolled) {
                headerContainer.classList.remove('header-narrow');
                headerContainer.classList.add('header-wide');
            } else if (!nowScrolled && isScrolled) {
                headerContainer.classList.remove('header-wide');
                headerContainer.classList.add('header-narrow');
            }
        } else {
            headerContainer.classList.remove('header-wide');
            headerContainer.classList.add('header-narrow');
        }

        if (scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        isScrolled = nowScrolled;
        lastScrollY = scrollY;
    }

    window.addEventListener('scroll', updateHeaderState);
    window.addEventListener('resize', updateHeaderState);

    updateHeaderState();
}

// Анимация корзины
function animateCartAmount() {
    const cartAmount = document.getElementById('cartAmount');
    const cart = document.querySelector('.cart');

    setTimeout(() => {
        cartAmount.classList.add('amount-increasing');
        cart.classList.add('cart-pulse');

        let currentAmount = 0;
        const targetAmount = 14500;
        const duration = 2000;
        const steps = 100;
        const increment = targetAmount / steps;
        const stepTime = duration / steps;

        const interval = setInterval(() => {
            currentAmount += increment;
            if (currentAmount >= targetAmount) {
                currentAmount = targetAmount;
                clearInterval(interval);

                setTimeout(() => {
                    cartAmount.classList.remove('amount-increasing');
                    cart.classList.remove('cart-pulse');
                }, 1000);
            }
            cartAmount.textContent = Math.round(currentAmount).toLocaleString('ru-RU') + ' ₸';
        }, stepTime);
    }, 300);
}

function initLanguageSelector() {
    const languageButton = document.getElementById('languageButton');
    const languageDropdown = document.getElementById('languageDropdown');
    const languageOptions = document.querySelectorAll('.language-option');
    const languageSelector = document.querySelector('.language-selector');

    languageOptions[0].classList.add('active');

    languageButton.addEventListener('click', (e) => {
        e.stopPropagation();
        languageSelector.classList.toggle('active');
    });

    languageOptions.forEach(option => {
        option.addEventListener('click', () => {
            const lang = option.getAttribute('data-lang');
            const langCode = option.querySelector('.language-code').textContent;

            const buttonSvg = languageButton.querySelector('svg');
            const textElement = buttonSvg.querySelector('text');
            textElement.textContent = langCode;

            languageOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');

            languageSelector.classList.remove('active');
            console.log('Выбран язык:', lang);
        });
    });

    document.addEventListener('click', (e) => {
        if (!languageSelector.contains(e.target)) {
            languageSelector.classList.remove('active');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            languageSelector.classList.remove('active');
        }
    });
}

function initSearch() {
    const searchButton = document.getElementById('searchButton');
    const searchExpanded = document.getElementById('searchExpanded');
    const searchInput = document.getElementById('searchInput');
    const searchClose = document.getElementById('searchClose');
    const searchContainer = document.querySelector('.search-container');
    const suggestionItems = document.querySelectorAll('.suggestion-item');

    searchButton.addEventListener('click', () => {
        searchExpanded.classList.add('active');
        setTimeout(() => searchInput.focus(), 300);
    });

    searchClose.addEventListener('click', closeSearch);

    document.addEventListener('click', (e) => {
        if (!searchContainer.contains(e.target)) {
            closeSearch();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSearch();
    });

    searchInput.addEventListener('focus', () => {
        searchContainer.classList.add('search-pulse');
    });

    searchInput.addEventListener('blur', () => {
        searchContainer.classList.remove('search-pulse');
    });

    searchInput.addEventListener('input', (e) => {
        const value = e.target.value.toLowerCase();
        console.log('Поиск:', value);

        if (value.length > 0) {
            searchContainer.classList.add('search-pulse');
        } else {
            searchContainer.classList.remove('search-pulse');
        }
    });

    suggestionItems.forEach(item => {
        item.addEventListener('click', () => {
            searchInput.value = item.textContent;
            searchInput.focus();
            item.style.background = '#007bff';
            item.style.color = 'white';
            setTimeout(() => {
                item.style.background = '';
                item.style.color = '';
            }, 300);
            console.log('Выбрана подсказка:', item.textContent);
        });
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') performSearch(searchInput.value);
    });

    function closeSearch() {
        searchExpanded.classList.remove('active');
        searchInput.value = '';
        searchContainer.classList.remove('search-pulse');
    }

    function performSearch(query) {
        if (query.trim()) {
            console.log('Выполняется поиск:', query);
            searchInput.value = '';
            closeSearch();
        }
    }
}

function initCart() {
    const cartButton = document.querySelector('.cart-button');
    const cartClose = document.getElementById('cartClose');
    const cartPanel = document.getElementById('cartPanel');
    const body = document.body;
    const headerContainer = document.querySelector('.header-container');
    const cartContainer = document.querySelector('.cart-container');

    cartButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Переключаем состояние корзины
        if (body.classList.contains('cart-open')) {
            closeCart();
        } else {
            openCart();
        }
    });

    cartClose.addEventListener('click', closeCart);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && body.classList.contains('cart-open')) {
            closeCart();
        }
    });

    // Закрытие корзины при клике вне ее области
    document.addEventListener('click', (e) => {
        if (body.classList.contains('cart-open') &&
            !cartContainer.contains(e.target)) {
            closeCart();
        }
    });

    function openCart() {
        body.classList.add('cart-open');
        cartPanel.classList.add('active');

        headerContainer.classList.remove('header-wide');
        headerContainer.classList.add('header-narrow');
    }

    function closeCart() {
        body.classList.remove('cart-open');
        cartPanel.classList.remove('active');

        const scrollY = window.scrollY;
        const windowWidth = window.innerWidth;

        if (windowWidth >= 1350 && scrollY <= 200) {
            headerContainer.classList.remove('header-narrow');
            headerContainer.classList.add('header-wide');
        } else {
            headerContainer.classList.remove('header-wide');
            headerContainer.classList.add('header-narrow');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initHeaderBehavior();
    animateCartAmount();
    initLanguageSelector();
    initSearch();
    initCart();
});
