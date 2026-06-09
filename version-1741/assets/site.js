(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', mobilePanel.classList.contains('open') ? 'true' : 'false');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      if (query) {
        window.location.href = 'search.html?q=' + encodeURIComponent(query);
      }
    });
  });

  var hero = document.querySelector('[data-hero-slider]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;
    var setActive = function (index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === activeIndex);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        setActive(index);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        setActive(activeIndex + 1);
      }, 5600);
    }
  }

  var filterRoots = Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]'));
  filterRoots.forEach(function (root) {
    var input = root.querySelector('[data-filter-input]');
    var typeSelect = root.querySelector('[data-filter-type]');
    var yearSelect = root.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-filter-card]'));
    var empty = root.querySelector('[data-filter-empty]');
    var applyFilter = function () {
      var query = input ? input.value.trim().toLowerCase() : '';
      var typeValue = typeSelect ? typeSelect.value : 'all';
      var yearValue = yearSelect ? yearSelect.value : 'all';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-genre')).toLowerCase();
        var typeMatch = typeValue === 'all' || card.getAttribute('data-type') === typeValue;
        var yearMatch = yearValue === 'all' || card.getAttribute('data-year') === yearValue;
        var queryMatch = !query || haystack.indexOf(query) !== -1;
        var show = typeMatch && yearMatch && queryMatch;
        card.classList.toggle('hide-by-filter', !show);
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    };
    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', applyFilter);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && input) {
      input.value = q;
    }
    applyFilter();
  });

  document.querySelectorAll('.watch-player').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.player-start');
    var source = player.getAttribute('data-video');
    var poster = player.getAttribute('data-poster');
    var started = false;
    var fail = function () {
      player.classList.add('has-error');
    };
    var start = function () {
      if (!video || !source) {
        fail();
        return;
      }
      if (started) {
        video.play().catch(function () {});
        return;
      }
      started = true;
      player.classList.add('is-playing');
      if (poster) {
        video.setAttribute('poster', poster);
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.load();
        video.play().catch(function () {
          started = false;
          player.classList.remove('is-playing');
        });
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {
            started = false;
            player.classList.remove('is-playing');
          });
        });
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            fail();
          }
        });
        video.addEventListener('emptied', function () {
          if (video.hlsInstance && video.hlsInstance.destroy) {
            video.hlsInstance.destroy();
          }
        }, { once: true });
        video.hlsInstance = hls;
        return;
      }
      video.src = source;
      video.load();
      video.play().catch(function () {
        started = false;
        player.classList.remove('is-playing');
        fail();
      });
    };
    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }
    player.addEventListener('click', function (event) {
      if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'video') {
        return;
      }
      start();
    });
  });

  var backTop = document.querySelector('[data-back-top]');
  if (backTop) {
    window.addEventListener('scroll', function () {
      backTop.classList.toggle('show', window.scrollY > 520);
    });
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
