(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenus() {
    var button = document.querySelector('[data-menu-button]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupSearchForms() {
    selectAll('[data-site-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          return;
        }
        event.preventDefault();
        window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
      });
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', slider);
    var dots = selectAll('[data-hero-dot]', slider);
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  function setupRails() {
    selectAll('[data-movie-rail]').forEach(function (rail) {
      var section = rail.closest('section');
      if (!section) {
        return;
      }
      var left = section.querySelector('[data-scroll-left]');
      var right = section.querySelector('[data-scroll-right]');
      if (left) {
        left.addEventListener('click', function () {
          rail.scrollBy({ left: -420, behavior: 'smooth' });
        });
      }
      if (right) {
        right.addEventListener('click', function () {
          rail.scrollBy({ left: 420, behavior: 'smooth' });
        });
      }
    });
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  }

  function makeCard(movie) {
    var card = document.createElement('article');
    card.className = 'movie-card';
    card.innerHTML = [
      '<a class="card-cover" href="' + movie.url + '">',
      '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="play-badge">▶</span>',
      '<span class="year-badge">' + escapeHtml(movie.year) + '</span>',
      '</a>',
      '<div class="card-body">',
      '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="card-meta">',
      '<span>' + escapeHtml(movie.region) + '</span>',
      '<span>' + escapeHtml(movie.type) + '</span>',
      '<span>' + escapeHtml(movie.category) + '</span>',
      '</div>',
      '</div>'
    ].join('');
    return card;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function setupSearchPage() {
    var host = document.querySelector('[data-search-results]');
    if (!host || !window.SITE_SEARCH_DATA) {
      return;
    }
    var query = getQuery();
    var input = document.querySelector('[data-search-input]');
    var title = document.querySelector('[data-search-title]');
    var subtitle = document.querySelector('[data-search-subtitle]');
    if (input) {
      input.value = query;
    }
    if (!query) {
      return;
    }
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    var results = window.SITE_SEARCH_DATA.filter(function (movie) {
      var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(' ').toLowerCase();
      return terms.every(function (term) {
        return haystack.indexOf(term) !== -1;
      });
    }).slice(0, 120);
    host.innerHTML = '';
    if (title) {
      title.textContent = '搜索：' + query;
    }
    if (subtitle) {
      subtitle.textContent = results.length ? '已匹配到相关影片，点击卡片即可观看。' : '没有匹配结果，可以换一个关键词再试。';
    }
    if (!results.length) {
      var empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = '暂无相关内容';
      host.appendChild(empty);
      return;
    }
    results.forEach(function (movie) {
      host.appendChild(makeCard(movie));
    });
  }

  window.initMoviePlayer = function (source, videoId, buttonId) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button) {
      return;
    }
    var hlsInstance = null;
    function attachSource() {
      if (video.getAttribute('data-ready') === '1') {
        return;
      }
      video.setAttribute('data-ready', '1');
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }
    function startPlayback() {
      attachSource();
      button.classList.add('is-hidden');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }
    attachSource();
    button.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        button.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenus();
    setupSearchForms();
    setupHero();
    setupRails();
    setupSearchPage();
  });
}());
