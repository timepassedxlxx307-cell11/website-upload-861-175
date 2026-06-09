const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function initMobileMenu() {
    const button = qs('[data-mobile-toggle]');
    const panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
        return;
    }
    button.addEventListener('click', () => {
        panel.classList.toggle('is-open');
    });
}

function initHero() {
    const slides = qsa('[data-hero-slide]');
    const dots = qsa('[data-hero-dot]');
    const prev = qs('[data-hero-prev]');
    const next = qs('[data-hero-next]');
    if (!slides.length) {
        return;
    }
    let current = 0;
    let timer = null;
    const show = (index) => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
        dots.forEach((dot, i) => dot.classList.toggle('is-active', i === current));
    };
    const restart = () => {
        window.clearInterval(timer);
        timer = window.setInterval(() => show(current + 1), 5200);
    };
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            show(i);
            restart();
        });
    });
    if (prev) {
        prev.addEventListener('click', () => {
            show(current - 1);
            restart();
        });
    }
    if (next) {
        next.addEventListener('click', () => {
            show(current + 1);
            restart();
        });
    }
    show(0);
    restart();
}

function normalize(value) {
    return String(value || '').trim().toLowerCase();
}

function initFilters() {
    const cards = qsa('[data-card]');
    if (!cards.length) {
        return;
    }
    const search = qs('[data-filter-search]');
    const genre = qs('[data-filter-genre]');
    const year = qs('[data-filter-year]');
    const region = qs('[data-filter-region]');
    const empty = qs('[data-empty-result]');
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('search') || params.get('q') || '';
    if (search && initial) {
        search.value = initial;
    }
    const apply = () => {
        const query = normalize(search ? search.value : '');
        const genreValue = normalize(genre ? genre.value : '');
        const yearValue = normalize(year ? year.value : '');
        const regionValue = normalize(region ? region.value : '');
        let visible = 0;
        cards.forEach((card) => {
            const haystack = normalize(card.getAttribute('data-search'));
            const cardGenre = normalize(card.getAttribute('data-genre'));
            const cardYear = normalize(card.getAttribute('data-year'));
            const cardRegion = normalize(card.getAttribute('data-region'));
            const matched = (!query || haystack.includes(query))
                && (!genreValue || cardGenre.includes(genreValue))
                && (!yearValue || cardYear === yearValue)
                && (!regionValue || cardRegion === regionValue);
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });
        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    };
    [search, genre, year, region].filter(Boolean).forEach((control) => {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
    });
    apply();
}

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initHero();
    initFilters();
});
