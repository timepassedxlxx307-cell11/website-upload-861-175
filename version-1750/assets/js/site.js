(function () {
  function qs(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function qsa(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  var menuButton = qs('[data-menu-button]');
  var mobilePanel = qs('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var hero = qs('[data-hero]');

  if (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function startHero() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(index + 1);
      }, 5600);
    }

    qsa('[data-hero-next]').forEach(function (button) {
      button.addEventListener('click', function () {
        showSlide(index + 1);
        startHero();
      });
    });

    qsa('[data-hero-prev]').forEach(function (button) {
      button.addEventListener('click', function () {
        showSlide(index - 1);
        startHero();
      });
    });

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    showSlide(0);
    startHero();
  }

  var currentFilter = 'all';
  var searchInputs = qsa('[data-search-input]');
  var filterButtons = qsa('[data-filter-value]');
  var movieCards = qsa('[data-movie-card]');
  var urlSearch = new URLSearchParams(window.location.search).get('search') || '';

  function normalize(text) {
    return String(text || '').trim().toLowerCase();
  }

  function filterCards() {
    if (!movieCards.length) {
      return;
    }

    var query = normalize(searchInputs.map(function (input) {
      return input.value;
    }).find(Boolean));
    var filter = normalize(currentFilter);

    movieCards.forEach(function (card) {
      var target = normalize(card.getAttribute('data-search'));
      var matchesQuery = !query || target.indexOf(query) !== -1;
      var matchesFilter = filter === 'all' || target.indexOf(filter) !== -1;
      card.classList.toggle('hidden-by-filter', !(matchesQuery && matchesFilter));
    });
  }

  if (urlSearch && movieCards.length) {
    searchInputs.forEach(function (input) {
      input.value = urlSearch;
    });
    var library = qs('#movie-library');
    if (library) {
      setTimeout(function () {
        library.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', filterCards);
  });

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      currentFilter = button.getAttribute('data-filter-value') || 'all';
      filterButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      filterCards();
    });
  });

  qsa('[data-clear-search]').forEach(function (button) {
    button.addEventListener('click', function () {
      searchInputs.forEach(function (input) {
        input.value = '';
      });
      filterCards();
    });
  });

  qsa('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = qs('input[type="search"]', form);
      var value = input ? input.value.trim() : '';

      if (movieCards.length) {
        searchInputs.forEach(function (field) {
          field.value = value;
        });
        filterCards();
        var library = qs('#movie-library');
        if (library) {
          library.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else if (value) {
        window.location.href = './index.html?search=' + encodeURIComponent(value);
      } else {
        window.location.href = './index.html';
      }
    });
  });

  filterCards();
}());

window.initMoviePlayer = function (videoId, overlayId, source) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var hlsPlayer = null;

  if (!video || !overlay || !source) {
    return;
  }

  function attachSource() {
    if (video.getAttribute('data-ready') === '1') {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsPlayer = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsPlayer.loadSource(source);
      hlsPlayer.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else {
      video.src = source;
    }

    video.setAttribute('data-ready', '1');
  }

  function playVideo() {
    attachSource();
    overlay.classList.add('is-hidden');
    video.controls = true;
    var playResult = video.play();

    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {});
    }
  }

  overlay.addEventListener('click', playVideo);
  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsPlayer) {
      hlsPlayer.destroy();
    }
  });
};
