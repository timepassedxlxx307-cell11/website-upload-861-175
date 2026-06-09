(function () {
    var ready = function (callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    };

    ready(function () {
        var toggle = document.querySelector(".mobile-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var index = 0;
            var show = function (nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            };
            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    show(dotIndex);
                });
            });
            setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        var inputs = Array.prototype.slice.call(document.querySelectorAll(".movie-filter-input"));
        var selects = Array.prototype.slice.call(document.querySelectorAll(".filter-select"));
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var emptyState = document.querySelector(".empty-state");
        var searchInput = document.getElementById("pageSearch") || inputs[0];

        if (searchInput && window.location.search) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (query) {
                searchInput.value = query;
            }
        }

        var normalize = function (value) {
            return String(value || "").trim().toLowerCase();
        };

        var applyFilter = function () {
            if (!cards.length) {
                return;
            }
            var keyword = normalize(searchInput ? searchInput.value : "");
            var filters = {};
            selects.forEach(function (select) {
                filters[select.getAttribute("data-filter-field")] = normalize(select.value);
            });
            var visibleCount = 0;
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-search"));
                var matched = !keyword || haystack.indexOf(keyword) !== -1;
                Object.keys(filters).forEach(function (field) {
                    if (filters[field] && normalize(card.getAttribute("data-" + field)) !== filters[field]) {
                        matched = false;
                    }
                });
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visibleCount += 1;
                }
            });
            if (emptyState) {
                emptyState.classList.toggle("is-visible", visibleCount === 0);
            }
        };

        inputs.forEach(function (input) {
            input.addEventListener("input", applyFilter);
        });
        selects.forEach(function (select) {
            select.addEventListener("change", applyFilter);
        });
        applyFilter();
    });
})();
