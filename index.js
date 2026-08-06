/**
 * Premier Schools Exhibition — page behaviour
 * - Generic "marquee" controller reused by:
 *     1) the hero's vertically auto-scrolling photo gallery
 *     2) the Participating Schools horizontal sling ticker
 *   Both get: per-item speed from data attributes, pause-on-hover/focus
 *   (CSS), an explicit accessible play/pause button (WCAG 2.2 SC 2.2.2 —
 *   moving content needs a way to pause it), and prefers-reduced-motion
 *   support on load and if the OS setting changes mid-session.
 * - Minimal, dependency-free enquiry form handler.
 */
(function () {
  "use strict";

  var reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  /**
   * Wires up one auto-scrolling region.
   * @param {Object} config
   * @param {string} config.containerSelector - the pausable wrapper element
   * @param {string} config.toggleSelector - the play/pause button
   * @param {string} config.trackSelector - elements that carry the
   *   per-item scroll speed via a data attribute (e.g. gallery columns)
   * @param {string} config.speedAttr - data attribute holding the speed
   * @param {string} config.speedCssVar - CSS custom property to set
   * @param {string} config.toggleTextClass - class of the button's label span
   */
  function initMarquee(config) {
    var container = document.querySelector(config.containerSelector);
    var toggle = document.querySelector(config.toggleSelector);
    var tracks = container
      ? container.querySelectorAll(config.trackSelector)
      : [];

    if (!container || !toggle) return;

    // Apply any per-track speed set in the markup.
    tracks.forEach(function (track) {
      var speed = track.getAttribute(config.speedAttr);
      if (speed) {
        track.style.setProperty(config.speedCssVar, speed + "s");
      }
    });

    function setPaused(paused) {
      container.classList.toggle("is-paused", paused);
      toggle.setAttribute("aria-pressed", String(paused));
      var label = toggle.querySelector("." + config.toggleTextClass);
      if (label) {
        label.textContent = paused ? "Play animation" : "Pause animation";
      }
    }

    if (reducedMotionQuery.matches) {
      setPaused(true);
    }

    toggle.addEventListener("click", function () {
      setPaused(!container.classList.contains("is-paused"));
    });


  /* Header CTA: make the register button toggle a persistent active state
     so we can show the full gradient and rotate the arrow after click. */
  var headerCta = document.querySelector(".site-header__cta");
  if (headerCta) {
    headerCta.addEventListener("click", function (e) {
      // toggle a persistent active class; clicking still navigates to #enquire-now
      headerCta.classList.toggle("is-active");
    });
  }
    reducedMotionQuery.addEventListener("change", function (event) {
      if (event.matches) setPaused(true);
    });
  }

  /* 1. Hero photo gallery (vertical scroll) */
  initMarquee({
    containerSelector: ".hero__gallery",
    toggleSelector: "#gallery-toggle",
    trackSelector: ".hero__gallery-col",
    speedAttr: "data-speed",
    speedCssVar: "--scroll-duration",
    toggleTextClass: "hero__gallery-toggle-text",
  });

  /* 2. Participating Schools logo ticker (horizontal sling) */
  initMarquee({
    containerSelector: ".schools__ticker",
    toggleSelector: "#schools-ticker-toggle",
    trackSelector: ".schools__row",
    speedAttr: "data-speed",
    speedCssVar: "--ticker-speed",
    toggleTextClass: "schools__ticker-toggle-text",
  });

  /* -------------------------------------------------------------
     "What Makes This Exhibition a Must-Visit" — carousel controls
     Scrolls the card track by one card's width (+ gap) per click,
     letting the browser's native scroll boundaries stop it at
     either end. Falls back to viewport width if no card exists yet.
     ------------------------------------------------------------- */
  var highlightsTrack = document.getElementById("highlights-track");
  var highlightsPrev = document.getElementById("highlights-prev");
  var highlightsNext = document.getElementById("highlights-next");

  if (highlightsTrack && highlightsPrev && highlightsNext) {
    var getScrollStep = function () {
      var card = highlightsTrack.querySelector(".highlights__card");
      if (!card) return highlightsTrack.clientWidth;
      var trackStyles = window.getComputedStyle(highlightsTrack);
      var gap =
        parseFloat(trackStyles.columnGap || trackStyles.gap || "0") || 0;
      return card.getBoundingClientRect().width + gap;
    };

    highlightsPrev.addEventListener("click", function () {
      highlightsTrack.scrollBy({ left: -getScrollStep(), behavior: "smooth" });
    });

    highlightsNext.addEventListener("click", function () {
      highlightsTrack.scrollBy({ left: getScrollStep(), behavior: "smooth" });
    });
  }

  /* -------------------------------------------------------------
     Enquiry form: lightweight client-side handling
     (Replace the fetch() call below with the real endpoint.)
     ------------------------------------------------------------- */
  var form = document.querySelector(".enquiry-form");
  var statusEl = document.getElementById("form-status");

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var name = form.querySelector("#parent-name");
      var phone = form.querySelector("#phone-number");
      var grade = form.querySelector("#grade");

      var isValid = form.checkValidity
        ? form.checkValidity()
        : name.value && phone.value && grade.value;

      if (!isValid) {
        if (statusEl) {
          statusEl.textContent =
            "Please fill in your name, phone number and grade before submitting.";
        }
        var firstInvalid = form.querySelector(":invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      if (statusEl) {
        statusEl.textContent = "Thanks! We'll get in touch shortly.";
      }

      // TODO: wire this up to the real enquiry endpoint, e.g.
      // fetch("/api/enquire", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     name: name.value,
      //     phone: phone.value,
      //     grade: grade.value,
      //   }),
      // });

      form.reset();
    });
  }
})();