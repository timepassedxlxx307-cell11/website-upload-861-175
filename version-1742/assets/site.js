(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function initMenu() {
    var toggle = document.querySelector(".nav-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    start();
  }

  function initFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    inputs.forEach(function (input) {
      var section = input.closest(".filter-section") || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll("[data-card]"));
      var empty = section.querySelector("[data-empty-state]");
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var text = card.getAttribute("data-search") || "";
          var matched = !query || text.indexOf(query) !== -1;
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      });
    });
  }

  function initSearchPage() {
    var resultBox = document.querySelector("[data-search-results]");
    if (!resultBox || !window.SEARCH_INDEX) {
      return;
    }
    var input = document.querySelector("[data-search-page-input]");
    var summary = document.querySelector("[data-search-summary]");
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    if (input) {
      input.value = query;
    }
    if (!query) {
      return;
    }
    var lower = query.toLowerCase();
    var results = window.SEARCH_INDEX.filter(function (item) {
      return item.search.indexOf(lower) !== -1;
    }).slice(0, 120);

    if (summary) {
      summary.textContent = results.length ? "找到相关内容，点击卡片进入详情页。" : "没有找到匹配内容。";
    }

    resultBox.innerHTML = results.map(function (item) {
      return [
        '<a class="movie-card" href="./' + escapeHtml(item.file) + '">',
        '  <span class="poster-wrap">',
        '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '    <span class="type-pill">' + escapeHtml(item.type) + '</span>',
        '  </span>',
        '  <span class="movie-card-body">',
        '    <strong>' + escapeHtml(item.title) + '</strong>',
        '    <em>' + escapeHtml(item.oneLine) + '</em>',
        '    <span class="movie-meta">',
        '      <span>' + escapeHtml(item.year) + '</span>',
        '      <span>' + escapeHtml(item.region) + '</span>',
        '      <span>' + escapeHtml(item.category) + '</span>',
        '    </span>',
        '  </span>',
        '</a>'
      ].join("");
    }).join("");
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initSearchPage();
  });
})();
