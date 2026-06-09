(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-toggle]");
        var mobileMenu = document.querySelector("[data-mobile-menu]");
        if (menuButton && mobileMenu) {
            menuButton.addEventListener("click", function () {
                mobileMenu.classList.toggle("is-open");
            });
        }

        var carousel = document.querySelector("[data-hero-carousel]");
        if (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
            var prev = carousel.querySelector("[data-hero-prev]");
            var next = carousel.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;
            function show(target) {
                if (!slides.length) {
                    return;
                }
                index = (target + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === index);
                });
            }
            function run() {
                window.clearInterval(timer);
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                    run();
                });
            });
            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    run();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    run();
                });
            }
            show(0);
            run();
        }

        var pageFilter = document.querySelector("[data-page-filter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-list] .movie-card"));
        var urlQuery = new URLSearchParams(window.location.search).get("q") || "";
        var searchInput = document.querySelector("[data-search-input]");
        if (searchInput && urlQuery) {
            searchInput.value = urlQuery;
        }
        if (pageFilter && urlQuery) {
            pageFilter.value = urlQuery;
        }
        function applyFilter(value) {
            var keyword = String(value || "").trim().toLowerCase();
            cards.forEach(function (card) {
                var text = card.getAttribute("data-filter") || "";
                card.classList.toggle("is-filter-hidden", keyword && text.indexOf(keyword) === -1);
            });
        }
        if (pageFilter && cards.length) {
            pageFilter.addEventListener("input", function () {
                applyFilter(pageFilter.value);
            });
            applyFilter(pageFilter.value);
        }
    });
})();

function initMoviePlayer(streamUrl) {
    var video = document.getElementById("movie-player");
    var start = document.getElementById("player-start");
    if (!video || !streamUrl) {
        return;
    }
    var hlsInstance = null;
    function attach() {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            if (!video.src) {
                video.src = streamUrl;
            }
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            if (!hlsInstance) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            }
        }
    }
    function play() {
        attach();
        if (start) {
            start.classList.add("is-hidden");
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
            attempt.catch(function () {});
        }
    }
    if (start) {
        start.addEventListener("click", play);
    }
    video.addEventListener("play", function () {
        if (start) {
            start.classList.add("is-hidden");
        }
    });
    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });
    attach();
}
