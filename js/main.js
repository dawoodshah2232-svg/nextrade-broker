/* NexTrade Prime — interactions
   Pointer-down response, critically-damped motion, transform/opacity only.
   All enhancements degrade gracefully; pages are complete without JS. */
(function () {
  "use strict";
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Sticky header: hide on scroll down, reveal on scroll up ---- */
  var header = document.querySelector(".site-header");
  var lastY = window.scrollY;
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    if (header) {
      if (y > 140 && y > lastY + 4) header.classList.add("hide-on-scroll");
      else if (y < lastY - 4 || y <= 140) header.classList.remove("hide-on-scroll");
    }
    lastY = y;
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });

  /* ---- Desktop dropdowns: hover intent + click support ---- */
  document.querySelectorAll(".nav-item.has-drop").forEach(function (item) {
    var link = item.querySelector(".nav-link");
    var timer = null;
    function open() { clearTimeout(timer); closeOthers(item); item.classList.add("open"); link.setAttribute("aria-expanded", "true"); }
    function close() { timer = setTimeout(function () { item.classList.remove("open"); link.setAttribute("aria-expanded", "false"); }, 120); }
    function closeOthers(current) {
      document.querySelectorAll(".nav-item.open").forEach(function (other) {
        if (other !== current) { other.classList.remove("open"); other.querySelector(".nav-link").setAttribute("aria-expanded", "false"); }
      });
    }
    item.addEventListener("mouseenter", open);
    item.addEventListener("mouseleave", close);
    link.addEventListener("click", function (e) {
      if (window.matchMedia("(hover: none)").matches || item.classList.contains("open")) { return; }
      e.preventDefault(); open();
    });
    link.addEventListener("focus", open);
    item.addEventListener("focusout", function (e) {
      if (!item.contains(e.relatedTarget)) { item.classList.remove("open"); link.setAttribute("aria-expanded", "false"); }
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document.querySelectorAll(".nav-item.open").forEach(function (i) { i.classList.remove("open"); });
    }
  });

  /* ---- Mobile drawer ---- */
  var burger = document.querySelector(".hamburger");
  var drawer = document.querySelector(".drawer");
  if (burger && drawer) {
    burger.addEventListener("click", function () {
      var open = drawer.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("drawer-open", open);
    });
    drawer.querySelectorAll(".drawer-group > button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        btn.parentElement.classList.toggle("open");
        btn.setAttribute("aria-expanded", btn.parentElement.classList.contains("open") ? "true" : "false");
      });
    });
    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        drawer.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        document.body.classList.remove("drawer-open");
      });
    });
  }

  /* ---- Ticker: duplicate track for a seamless loop ---- */
  var track = document.querySelector(".ticker-track");
  if (track && !prefersReduced) {
    track.innerHTML += track.innerHTML;
  }

  /* ---- Scroll reveals ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---- Count-up (honest site facts only) ---- */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        cio.unobserve(el);
        var target = parseFloat(el.getAttribute("data-count"));
        var suffix = el.getAttribute("data-suffix") || "";
        if (prefersReduced) { el.textContent = target + suffix; return; }
        var start = null, dur = 1400;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) window.requestAnimationFrame(step);
        }
        window.requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---- FAQ accordion ---- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var btn = item.querySelector(".faq-q");
    var answer = item.querySelector(".faq-a");
    if (!btn || !answer) return;
    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (other) {
        other.classList.remove("open");
        other.querySelector(".faq-a").style.maxHeight = null;
        other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        answer.style.maxHeight = answer.scrollHeight + "px";
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---- Front-end-only forms: success state, no backend ---- */
  document.querySelectorAll("form[data-frontend-only]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var card = form.closest(".form-card") || form.parentElement;
      var success = card ? card.querySelector(".form-success") : null;
      form.style.display = "none";
      if (success) success.classList.add("show");
      if (card) card.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "center" });
    });
  });

  /* ---- Press feedback on primary buttons (pointer-down) ---- */
  document.querySelectorAll(".btn").forEach(function (btn) {
    btn.addEventListener("pointerdown", function () { btn.style.transform = "scale(.97)"; });
    ["pointerup", "pointerleave", "pointercancel"].forEach(function (ev) {
      btn.addEventListener(ev, function () { btn.style.transform = ""; });
    });
  });
})();
