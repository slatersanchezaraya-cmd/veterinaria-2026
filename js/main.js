// Clínica Veterinaria Mr. Patitas — interacciones del sitio

document.addEventListener("DOMContentLoaded", () => {
  initAOS();
  initMobileMenu();
  initHeaderScroll();
  initActiveNav();
  initCountUp();
  initContactForm();
  initBookingCalendar();
  initWhatsAppClickTracking();
  initScrollExpand();
  initScrollReveal();
  initReviewStack();
  initFlipCardsTouch();
  initBookTouchToggle();
  initHeroSlideshow();
  initYear();
});

function initAOS() {
  if (window.AOS) {
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
      offset: 60,
    });
  }
}

function initMobileMenu() {
  const toggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("mobile-menu");
  const iconOpen = document.getElementById("icon-menu-open");
  const iconClose = document.getElementById("icon-menu-close");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    if (iconOpen && iconClose) {
      iconOpen.classList.toggle("hidden", isOpen);
      iconClose.classList.toggle("hidden", !isOpen);
    }
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      if (iconOpen && iconClose) {
        iconOpen.classList.remove("hidden");
        iconClose.classList.add("hidden");
      }
    });
  });
}

function initHeaderScroll() {
  const header = document.getElementById("site-header");
  if (!header) return;

  // El header de index.html empieza transparente sobre la foto del hero
  // (ver .hero-transparent en style.css) y pasa a fondo sólido al hacer
  // scroll. En el resto de páginas mantiene el fondo blanco translúcido.
  const isHeroTransparent = header.classList.contains("hero-transparent");

  const onScroll = () => {
    const scrolled = window.scrollY > 12;
    if (isHeroTransparent) {
      header.classList.toggle("is-scrolled", scrolled);
      return;
    }
    if (scrolled) {
      header.classList.add("shadow-lg", "bg-white/90");
      header.classList.remove("bg-white/70");
    } else {
      header.classList.remove("shadow-lg", "bg-white/90");
      header.classList.add("bg-white/70");
    }
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function initActiveNav() {
  const current = (window.location.pathname.split("/").pop() || "index.html");
  document.querySelectorAll(".nav-link").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === current || (current === "" && href === "index.html")) {
      link.classList.add("active", "text-aqua", "font-semibold");
      link.setAttribute("aria-current", "page");
    }
  });
}

// En touch no hay :hover, así que un tap fija el estado "volteado"
// (y un segundo tap en otra tarjeta cierra la anterior).
function initFlipCardsTouch() {
  if (!window.matchMedia("(hover: none)").matches) return;
  document.querySelectorAll(".flip-card").forEach((card) => {
    card.addEventListener("click", () => {
      const wasFlipped = card.classList.contains("flipped");
      document.querySelectorAll(".flip-card.flipped").forEach((c) => c.classList.remove("flipped"));
      if (!wasFlipped) card.classList.add("flipped");
    });
  });
}

// Revelado al hacer scroll para [data-reveal], sin depender de AOS/CDN.
// Si el navegador no soporta IntersectionObserver o el usuario prefiere
// movimiento reducido, se muestra el contenido de una vez (sin animación).
function initScrollReveal() {
  const els = document.querySelectorAll("[data-reveal]");
  if (!els.length) return;

  if (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !("IntersectionObserver" in window)
  ) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );

  els.forEach((el) => observer.observe(el));
}

function initCountUp() {
  const counters = document.querySelectorAll("[data-countup]");
  if (!counters.length) return;

  const animate = (el) => {
    const target = parseFloat(el.getAttribute("data-countup"));
    const decimals = el.getAttribute("data-decimals") ? parseInt(el.getAttribute("data-decimals"), 10) : 0;
    const suffix = el.getAttribute("data-suffix") || "";
    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = form.querySelector("#nombre").value.trim();
    const phone = form.querySelector("#telefono").value.trim();
    const reason = form.querySelector("#motivo").value;
    const message = form.querySelector("#mensaje").value.trim();
    const dateField = form.querySelector("#fecha");
    const date = dateField ? dateField.value : "";

    const lines = [
      "Hola Mr. Patitas, quisiera hacer una consulta desde el sitio web:",
      `Nombre: ${name}`,
      `Teléfono: ${phone}`,
      `Motivo: ${reason}`,
      ...(date ? [`Fecha preferida: ${date}`] : []),
      `Mensaje: ${message}`,
    ];
    const whatsappUrl = `https://wa.me/50622620400?text=${encodeURIComponent(lines.join("\n"))}`;

    trackEvent("generate_lead", { motivo: reason });
    sendLeadToSheet({ nombre: name, telefono: phone, motivo: reason, fecha: date, mensaje: message });

    const feedback = document.getElementById("form-feedback");
    if (feedback) {
      feedback.classList.remove("hidden");
      feedback.textContent = "¡Gracias! Te llevamos a WhatsApp para confirmar tu mensaje.";
    }

    window.open(whatsappUrl, "_blank", "noopener");
    form.reset();
    document.dispatchEvent(new CustomEvent("booking-calendar:reset"));
  });
}

// Calendario de "fecha preferida" en el formulario de contacto. El sitio no
// tiene backend de reservas: esto solo arma un texto legible que se agrega
// al mensaje de WhatsApp para que el cliente proponga un día.
function initBookingCalendar() {
  const daysEl = document.getElementById("cal-days");
  const monthLabel = document.getElementById("cal-month-label");
  const prevBtn = document.getElementById("cal-prev");
  const nextBtn = document.getElementById("cal-next");
  const hiddenInput = document.getElementById("fecha");
  const selectedLabel = document.getElementById("cal-selected-label");
  if (!daysEl || !monthLabel || !prevBtn || !nextBtn || !hiddenInput) return;

  const MESES = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();
  let selectedDate = null;

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const render = () => {
    monthLabel.textContent = `${MESES[viewMonth]} ${viewYear}`;
    daysEl.innerHTML = "";

    const firstDay = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay.getDay(); i++) {
      daysEl.appendChild(document.createElement("span"));
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(viewYear, viewMonth, day);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cal-day";
      btn.textContent = String(day);
      btn.setAttribute("aria-label", `${day} de ${MESES[viewMonth]} de ${viewYear}`);

      if (date < today) btn.disabled = true;
      const isSelected = selectedDate && isSameDay(date, selectedDate);
      if (isSelected) btn.classList.add("is-selected");
      btn.setAttribute("aria-pressed", String(Boolean(isSelected)));

      btn.addEventListener("click", () => {
        selectedDate = date;
        const formatted = `${date.getDate()} de ${MESES[date.getMonth()]} de ${date.getFullYear()}`;
        hiddenInput.value = formatted;
        if (selectedLabel) selectedLabel.textContent = `Fecha seleccionada: ${formatted}`;
        render();
      });

      daysEl.appendChild(btn);
    }

    prevBtn.disabled = viewYear === today.getFullYear() && viewMonth === today.getMonth();
  };

  prevBtn.addEventListener("click", () => {
    viewMonth -= 1;
    if (viewMonth < 0) { viewMonth = 11; viewYear -= 1; }
    render();
  });

  nextBtn.addEventListener("click", () => {
    viewMonth += 1;
    if (viewMonth > 11) { viewMonth = 0; viewYear += 1; }
    render();
  });

  document.addEventListener("booking-calendar:reset", () => {
    selectedDate = null;
    hiddenInput.value = "";
    if (selectedLabel) selectedLabel.textContent = "";
    render();
  });

  render();
}

// Cuenta cada clic en un enlace de WhatsApp (botón flotante, CTAs, footer)
// como señal de interés/conversión, sin importar en qué página esté.
function initWhatsAppClickTracking() {
  document.querySelectorAll('a[href*="wa.me"]').forEach((link) => {
    link.addEventListener("click", () => {
      trackEvent("whatsapp_click", { pagina: window.location.pathname });
    });
  });
}

// Efecto "scroll to expand": la imagen crece y el título se abre en dos
// mientras el usuario avanza el scroll dentro de #scroll-expand-wrap.
// No usa preventDefault ni hijackea la rueda del mouse (a diferencia del
// componente original en React) para no romper el scroll nativo ni la
// accesibilidad en mobile.
function initScrollExpand() {
  const wrap = document.getElementById("scroll-expand-wrap");
  const media = document.getElementById("se-media");
  if (!wrap || !media) return;

  const word1 = document.getElementById("se-word1");
  const word2 = document.getElementById("se-word2");
  const bg = document.getElementById("se-bg");
  const isMobile = () => window.innerWidth < 768;
  let ticking = false;

  const update = () => {
    const rect = wrap.getBoundingClientRect();
    const viewport = window.innerHeight;
    const scrollable = rect.height - viewport;
    const progress = scrollable > 0 ? Math.min(Math.max(-rect.top / scrollable, 0), 1) : 0;

    const widthStart = isMobile() ? 220 : 320;
    const widthEnd = isMobile() ? 340 : 1000;
    const heightStart = isMobile() ? 280 : 400;
    const heightEnd = isMobile() ? 460 : 620;

    media.style.width = widthStart + progress * (widthEnd - widthStart) + "px";
    media.style.height = heightStart + progress * (heightEnd - heightStart) + "px";
    media.style.borderRadius = 28 - progress * 14 + "px";

    const translate = progress * (isMobile() ? 40 : 130);
    if (word1) word1.style.transform = `translateX(-${translate}px)`;
    if (word2) word2.style.transform = `translateX(${translate}px)`;
    if (bg) bg.style.opacity = String(1 - progress * 0.35);

    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
}

// Pila de reseñas: cada tarjeta reposa con una leve rotación de "abanico"
// y, a medida que el usuario avanza el scroll dentro de #review-stack-wrap,
// se despega hacia arriba y se endereza, revelando la siguiente. La última
// tarjeta nunca se desplaza: solo termina de enderezarse, quedando como
// cierre visual. Si el navegador no soporta sticky o el usuario prefiere
// movimiento reducido, se deja el fallback en grilla estática (ver CSS).
function initReviewStack() {
  const wraps = document.querySelectorAll(".review-stack-wrap");
  if (!wraps.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!CSS.supports("position", "sticky")) return;

  wraps.forEach(setupReviewStack);
}

function setupReviewStack(wrap) {
  const cards = Array.from(wrap.querySelectorAll(".review-stack-card"));
  const n = cards.length;
  if (n < 2) return;

  wrap.classList.add("js-enhanced");
  wrap.style.height = `${n * 100}vh`;

  const segments = n - 1;
  let ticking = false;

  const update = () => {
    const rect = wrap.getBoundingClientRect();
    const viewport = window.innerHeight;
    const scrollable = rect.height - viewport;
    const progress = scrollable > 0 ? Math.min(Math.max(-rect.top / scrollable, 0), 1) : 0;

    cards.forEach((card, i) => {
      const isLast = i === n - 1;
      const segIndex = Math.min(i, segments - 1);
      const start = segIndex / segments;
      const end = (segIndex + 1) / segments;
      const localT = Math.min(Math.max((progress - start) / (end - start), 0), 1);

      const restRotate = (i - (n - 1) / 2) * 6;
      const rotate = restRotate * (1 - localT);
      const y = isLast ? 0 : localT * -140;

      card.style.top = `${i * 14}px`;
      card.style.zIndex = String((n - i) * 10);
      card.style.transform = `translateY(${y}%) rotate(${rotate}deg)`;
    });

    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
}

// Mismo problema de :hover en touch que las flip-cards: un tap abre el
// "libro" del equipo y lo deja abierto hasta el siguiente tap.
function initBookTouchToggle() {
  if (!window.matchMedia("(hover: none)").matches) return;
  document.querySelectorAll(".team-book").forEach((book) => {
    book.addEventListener("click", () => {
      const wasOpen = book.classList.contains("open");
      document.querySelectorAll(".team-book.open").forEach((b) => b.classList.remove("open"));
      if (!wasOpen) book.classList.add("open");
    });
  });
}

function initYear() {
  const yearEl = document.getElementById("current-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

// Alterna las fotos de fondo del hero con crossfade cada 5s.
function initHeroSlideshow() {
  const wrap = document.getElementById("hero-slideshow");
  if (!wrap) return;
  const slides = Array.from(wrap.querySelectorAll(".hero-slide"));
  if (slides.length < 2) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let current = 0;
  setInterval(() => {
    slides[current].classList.remove("is-active");
    current = (current + 1) % slides.length;
    slides[current].classList.add("is-active");
  }, 5000);
}
