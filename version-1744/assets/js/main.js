(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function() {
    var navToggle = document.querySelector("[data-nav-toggle]");
    var mainNav = document.querySelector("[data-main-nav]");

    if (navToggle && mainNav) {
      navToggle.addEventListener("click", function() {
        mainNav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero-slider]").forEach(function(slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var current = 0;

      function show(index) {
        current = index;
        slides.forEach(function(slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function(dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      dots.forEach(function(dot, index) {
        dot.addEventListener("click", function() {
          show(index);
        });
      });

      if (slides.length > 1) {
        window.setInterval(function() {
          show((current + 1) % slides.length);
        }, 5200);
      }
    });

    document.querySelectorAll("[data-filter-scope]").forEach(function(scope) {
      var form = scope.querySelector("[data-filter-form]");
      if (!form) {
        return;
      }

      var search = form.querySelector(".movie-search");
      var filters = Array.prototype.slice.call(form.querySelectorAll(".movie-filter"));
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var empty = scope.querySelector("[data-empty-result]");
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");

      if (query && search) {
        search.value = query;
      }

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function applyFilters() {
        var searchValue = normalize(search ? search.value : "");
        var visible = 0;

        cards.forEach(function(card) {
          var matches = true;
          var haystack = normalize(card.getAttribute("data-search"));

          if (searchValue && haystack.indexOf(searchValue) === -1) {
            matches = false;
          }

          filters.forEach(function(filter) {
            var key = filter.getAttribute("data-filter");
            var selected = normalize(filter.value);
            var value = normalize(card.getAttribute("data-" + key));

            if (selected && value !== selected) {
              matches = false;
            }
          });

          card.hidden = !matches;
          if (matches) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (search) {
        search.addEventListener("input", applyFilters);
      }
      filters.forEach(function(filter) {
        filter.addEventListener("change", applyFilters);
      });

      applyFilters();
    });
  });
})();
