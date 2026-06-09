(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');

    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        var expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        panel.hidden = expanded;
      });
    }

    var hero = document.querySelector('.js-hero');

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-hero-dot')) || 0);
          start();
        });
      });

      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      show(0);
      start();
    }

    document.querySelectorAll('.horizontal-wrap').forEach(function (wrap) {
      var rail = wrap.querySelector('[data-rail]');
      var prev = wrap.querySelector('[data-rail-prev]');
      var next = wrap.querySelector('[data-rail-next]');

      function move(direction) {
        if (!rail) {
          return;
        }

        rail.scrollBy({
          left: direction * 420,
          behavior: 'smooth'
        });
      }

      if (prev) {
        prev.addEventListener('click', function () {
          move(-1);
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          move(1);
        });
      }
    });

    document.querySelectorAll('.js-filter-list').forEach(function (list) {
      var scope = list.closest('.content-section') || document;
      var input = scope.querySelector('.js-filter-input');
      var year = scope.querySelector('.js-year-filter');
      var empty = scope.querySelector('.empty-state');
      var url = new URL(window.location.href);
      var initial = url.searchParams.get('q') || '';

      if (input && initial) {
        input.value = initial;
      }

      function normalize(value) {
        return String(value || '').toLowerCase().trim();
      }

      function apply() {
        var term = normalize(input ? input.value : '');
        var selectedYear = year ? year.value : '';
        var shown = 0;
        var items = Array.prototype.slice.call(list.querySelectorAll('.js-movie'));

        items.forEach(function (item) {
          var haystack = normalize([
            item.getAttribute('data-title'),
            item.getAttribute('data-region'),
            item.getAttribute('data-type'),
            item.getAttribute('data-genre'),
            item.getAttribute('data-year'),
            item.getAttribute('data-tags')
          ].join(' '));
          var itemYear = item.getAttribute('data-year') || '';
          var matchedTerm = !term || haystack.indexOf(term) !== -1;
          var matchedYear = !selectedYear || itemYear === selectedYear;
          var visible = matchedTerm && matchedYear;

          item.hidden = !visible;

          if (visible) {
            shown += 1;
          }
        });

        if (empty) {
          empty.hidden = shown !== 0;
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }

      if (year) {
        year.addEventListener('change', apply);
      }

      apply();
    });
  });
})();
