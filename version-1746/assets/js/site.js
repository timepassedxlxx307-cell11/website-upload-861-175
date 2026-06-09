(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initMobileNav() {
    var toggle = qs('[data-mobile-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', panel.classList.contains('is-open') ? 'true' : 'false');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        stop();
        show(i);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initScrollers() {
    qsa('[data-scroll-dir]').forEach(function (button) {
      button.addEventListener('click', function () {
        var target = qs(button.getAttribute('data-scroll-target'));
        if (!target) {
          return;
        }
        var amount = button.getAttribute('data-scroll-dir') === 'left' ? -420 : 420;
        target.scrollBy({ left: amount, behavior: 'smooth' });
      });
    });
  }

  function initFilters() {
    var input = qs('[data-filter-input]');
    var cards = qsa('[data-movie-card]');
    if (!input || cards.length === 0) {
      return;
    }
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        card.style.display = !q || text.indexOf(q) >= 0 ? '' : 'none';
      });
    });
  }

  function escapeText(text) {
    return String(text || '').replace(/[&<>"']/g, function (ch) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[ch];
    });
  }

  function movieCard(movie) {
    return [
      '<article class="movie-card" data-movie-card data-search="' + escapeText([movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(' ')) + '">',
      '<a href="' + escapeText(movie.url) + '">',
      '<div class="movie-card__poster">',
      '<img src="' + escapeText(movie.cover) + '" alt="' + escapeText(movie.title) + '" loading="lazy">',
      '<span class="movie-card__year">' + escapeText(movie.year) + '</span>',
      '<span class="movie-card__type">' + escapeText(movie.type) + '</span>',
      '<span class="movie-card__play">▶</span>',
      '</div>',
      '<div class="movie-card__body">',
      '<h3>' + escapeText(movie.title) + '</h3>',
      '<p>' + escapeText(movie.oneLine) + '</p>',
      '<div class="card-meta"><span>' + escapeText(movie.region) + '</span><span>' + escapeText(movie.genre) + '</span></div>',
      '</div>',
      '</a>',
      '</article>'
    ].join('');
  }

  function initSearchPage() {
    var root = qs('[data-search-results]');
    if (!root || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    var input = qs('[data-search-page-input]');
    if (input) {
      input.value = q;
    }
    function render(value) {
      var query = value.trim().toLowerCase();
      if (!query) {
        root.innerHTML = '<div class="empty-state">输入片名、类型、年份或地区，发现正在热映的精彩内容。</div>';
        return;
      }
      var results = window.SEARCH_MOVIES.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(' ').toLowerCase();
        return text.indexOf(query) >= 0;
      }).slice(0, 120);
      if (results.length === 0) {
        root.innerHTML = '<div class="empty-state">没有找到匹配内容，换个关键词试试。</div>';
        return;
      }
      root.innerHTML = '<div class="movie-grid">' + results.map(movieCard).join('') + '</div>';
    }
    render(q);
    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }
  }

  window.initMoviePlayer = function (source) {
    var shell = qs('[data-player]');
    if (!shell) {
      return;
    }
    var video = qs('video', shell);
    var starts = qsa('.player-start', shell);
    var loaded = false;
    var hls = null;
    function attach() {
      if (loaded || !video) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      loaded = true;
    }
    function play() {
      attach();
      shell.classList.add('is-playing');
      var action = video.play();
      if (action && action.catch) {
        action.catch(function () {});
      }
    }
    starts.forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    });
    shell.addEventListener('click', function (event) {
      if (event.target && event.target.tagName === 'VIDEO' && loaded) {
        return;
      }
      play();
    });
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initHero();
    initScrollers();
    initFilters();
    initSearchPage();
  });
})();
