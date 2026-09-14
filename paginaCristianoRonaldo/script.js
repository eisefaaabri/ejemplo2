/* ============================================
   CRISTIANO RONALDO - SITIO WEB ESTÁTICO
   JavaScript principal
   ============================================ */

/**
 * A2: Marca el HTML con clase 'js' para que las animaciones
 * .reveal solo se oculten cuando JS está disponible.
 * Si el script falla después de esta línea, el contenido
 * permanece visible gracias al CSS base (.reveal sin html.js).
 */
document.documentElement.classList.add('js');

/**
 * Espera a que el DOM esté completamente cargado
 * antes de inicializar todos los módulos.
 */
document.addEventListener('DOMContentLoaded', function () {
  initNavigation();
  initScrollReveal();
  initTimeline();
  initCounters();
  initGalleryLightbox();
});

/* ============================================
   1. NAVEGACIÓN
   ============================================ */

/**
 * Controla la navegación fija, el menú hamburguesa
 * en móvil y el resaltado de la sección activa.
 * Corrige: A1 (foco en menú oculto), B2 (Escape, foco).
 */
function initNavigation() {
  var nav = document.getElementById('mainNav');
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  var navAnchors = links.querySelectorAll('a');

  /**
   * Abre o cierra el menú móvil.
   * B2: Al abrir, mueve foco al primer enlace.
   */
  function openMenu() {
    links.classList.add('open');
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    // B2: Mover foco al primer enlace
    var firstLink = links.querySelector('a');
    if (firstLink) {
      firstLink.focus();
    }
  }

  function closeMenu() {
    links.classList.remove('open');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
  }

  // Menú hamburguesa (móvil)
  toggle.addEventListener('click', function () {
    var isOpen = links.classList.contains('open');
    if (isOpen) {
      closeMenu();
      toggle.focus(); // Devolver foco al botón
    } else {
      openMenu();
    }
  });

  // Cerrar menú al hacer clic en un enlace
  navAnchors.forEach(function (anchor) {
    anchor.addEventListener('click', function () {
      closeMenu();
    });
  });

  // B2: Cerrar menú con Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && links.classList.contains('open')) {
      closeMenu();
      toggle.focus(); // Devolver foco al botón
    }
  });

  // Efecto de nav al hacer scroll (fondo semitransparente)
  var scrollThreshold = 80;
  window.addEventListener('scroll', function () {
    if (window.scrollY > scrollThreshold) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // Resaltar enlace activo según la sección visible
  var sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', function () {
    var currentScroll = window.scrollY + 200;

    sections.forEach(function (section) {
      var sectionTop = section.offsetTop;
      var sectionHeight = section.offsetHeight;
      var sectionId = section.getAttribute('id');

      if (currentScroll >= sectionTop && currentScroll < sectionTop + sectionHeight) {
        navAnchors.forEach(function (a) {
          a.classList.remove('active');
          if (a.getAttribute('href') === '#' + sectionId) {
            a.classList.add('active');
          }
        });
      }
    });
  });
}

/* ============================================
   2. SCROLL REVEAL (Animaciones al scroll)
   ============================================ */

/**
 * Usa IntersectionObserver para animar elementos
 * cuando entran en el viewport.
 * A2: Solo se activa si html.js está presente (JS funciona).
 */
function initScrollReveal() {
  var revealElements = document.querySelectorAll('.reveal');

  // Si el navegador no soporta IntersectionObserver, mostrar todo
  if (!('IntersectionObserver' in window)) {
    revealElements.forEach(function (el) {
      el.classList.add('visible');
    });
    return;
  }

  var observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1
  };

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Solo animar una vez
      }
    });
  }, observerOptions);

  revealElements.forEach(function (el) {
    observer.observe(el);
  });
}

/* ============================================
   3. LÍNEA DE TIEMPO INTERACTIVA
   ============================================ */

/**
 * Permite expandir/contraer los detalles de cada etapa
 * mediante botones semánticos (<button>).
 * M2: Usa <button> con aria-expanded y hidden para
 *     una semántica correcta con lectores de pantalla.
 */
function initTimeline() {
  var timelineButtons = document.querySelectorAll('.timeline-btn');

  timelineButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      toggleTimelineItem(btn, timelineButtons);
    });
  });
}

/**
 * Alterna la expansión de un elemento de la línea de tiempo.
 * Si se abre uno, se cierra el anterior.
 * M2: Usa el atributo hidden nativo para ocultar/mostrar
 *     el contenido del árbol de accesibilidad.
 * @param {HTMLElement} currentBtn - El botón clicado.
 * @param {NodeList} allButtons - Todos los botones de la timeline.
 */
function toggleTimelineItem(currentBtn, allButtons) {
  var isExpanded = currentBtn.getAttribute('aria-expanded') === 'true';
  var currentItem = currentBtn.closest('.timeline-item');
  var currentDesc = currentItem.querySelector('.timeline-desc');

  // Cerrar todos los items
  allButtons.forEach(function (btn) {
    var item = btn.closest('.timeline-item');
    var desc = item.querySelector('.timeline-desc');
    btn.setAttribute('aria-expanded', 'false');
    item.classList.remove('active');
    if (desc) {
      desc.setAttribute('hidden', '');
    }
    var hint = btn.querySelector('.timeline-toggle-hint');
    if (hint) {
      hint.textContent = 'Clic para más detalles';
    }
  });

  // Si no estaba expandido, abrirlo
  if (!isExpanded) {
    currentBtn.setAttribute('aria-expanded', 'true');
    currentItem.classList.add('active');
    if (currentDesc) {
      currentDesc.removeAttribute('hidden');
    }
    var hint = currentBtn.querySelector('.timeline-toggle-hint');
    if (hint) {
      hint.textContent = 'Clic para cerrar';
    }
  }
}

/* ============================================
   4. CONTADORES ANIMADOS
   ============================================ */

/**
 * Anima los números de las estadísticas y del palmarés
 * cuando entran en el viewport, contando desde 0 hasta
 * el valor indicado en data-target.
 * A2: El HTML ya tiene el valor final como texto base;
 *     el JS reemplaza con "0" y anima solo si funciona.
 */
function initCounters() {
  var counters = document.querySelectorAll('[data-target]');

  if (!('IntersectionObserver' in window)) {
    // Fallback: dejar los valores que ya están en el HTML
    return;
  }

  // Resetear a 0 para la animación (solo si JS está activo)
  counters.forEach(function (counter) {
    counter.textContent = '0';
  });

  var observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.3
  };

  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  counters.forEach(function (counter) {
    counterObserver.observe(counter);
  });
}

/**
 * Anima un contador numérico de 0 al valor objetivo.
 * @param {HTMLElement} element - El elemento con data-target.
 */
function animateCounter(element) {
  var target = parseInt(element.getAttribute('data-target'), 10);
  var suffix = element.getAttribute('data-suffix') || '';
  var duration = 2000; // milisegundos
  var startTime = null;

  function updateCounter(timestamp) {
    if (!startTime) {
      startTime = timestamp;
    }

    var elapsed = timestamp - startTime;
    var progress = Math.min(elapsed / duration, 1);

    // Ease-out para que desacelere al final
    var easedProgress = 1 - Math.pow(1 - progress, 3);
    var currentValue = Math.floor(easedProgress * target);

    element.textContent = currentValue + suffix;

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = target + suffix;
    }
  }

  requestAnimationFrame(updateCounter);
}

/* ============================================
   5. GALERÍA CON LIGHTBOX
   ============================================ */

/**
 * Abre un visor de imagen (lightbox) al hacer clic
 * en las imágenes de la galería. Soporta cierre
 * con clic, botón y tecla Escape.
 * M3: Implementa focus trap y restauración de foco.
 */
function initGalleryLightbox() {
  var galleryItems = document.querySelectorAll('.gallery-item');
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxCaption = document.getElementById('lightboxCaption');
  var lightboxClose = document.getElementById('lightboxClose');

  // M3: Guardar referencia al elemento que abrió el lightbox
  var lastFocusedElement = null;

  // Abrir lightbox al hacer clic en una imagen
  galleryItems.forEach(function (item) {
    item.addEventListener('click', function () {
      var img = item.querySelector('img');
      if (img) {
        lastFocusedElement = item; // M3: Guardar origen del foco
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxCaption.textContent = img.alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        lightboxClose.focus();
      }
    });

    // Soporte de teclado
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });

  // Cerrar lightbox con el botón ×
  lightboxClose.addEventListener('click', function () {
    closeLightbox();
  });

  // Cerrar lightbox al hacer clic fuera de la imagen
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Cerrar lightbox con Escape + M3: Focus trap
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('active')) {
      return;
    }

    if (e.key === 'Escape') {
      closeLightbox();
      return;
    }

    // M3: Focus trap — mantener Tab dentro del lightbox
    if (e.key === 'Tab') {
      // Los únicos elementos enfocables en el lightbox son el botón de cierre
      // y potencialmente la imagen (no enfocable). Forzar foco en el botón.
      e.preventDefault();
      lightboxClose.focus();
    }
  });

  /**
   * Cierra el lightbox y restaura el scroll y el foco.
   * M3: Restaura el foco al elemento que abrió el lightbox.
   */
  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    lightboxImg.src = '';
    lightboxImg.alt = '';
    lightboxCaption.textContent = '';

    // M3: Restaurar foco al elemento original
    if (lastFocusedElement) {
      lastFocusedElement.focus();
      lastFocusedElement = null;
    }
  }
}

/* ============================================
   6. OBSERVABILIDAD LOCAL
   Módulo de instrumentación para captura de
   métricas de rendimiento, errores, clics,
   visibilidad y entorno del navegador.
   Almacena todo en localStorage sin backend.
   ============================================ */

(function () {
  'use strict';

  var PREFIX = 'cr7-observability:';
  var MAX_ENTRIES = 200;

  /* --- Utilidades de almacenamiento --- */

  /**
   * Lee una clave de localStorage y la parsea como JSON.
   * @param {string} key - Nombre corto de la clave (sin prefijo).
   * @returns {*} El valor parseado o null.
   */
  function read(key) {
    try {
      var raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Escribe un valor en localStorage como JSON.
   * @param {string} key - Nombre corto de la clave (sin prefijo).
   * @param {*} value - El valor a serializar.
   */
  function write(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) {
      // localStorage lleno o no disponible; silenciar
    }
  }

  /**
   * Añade un objeto a un array almacenado en localStorage.
   * Mantiene un máximo de MAX_ENTRIES elementos.
   * @param {string} key - Nombre corto de la clave.
   * @param {Object} entry - Objeto a añadir.
   */
  function append(key, entry) {
    var arr = read(key) || [];
    arr.push(entry);
    if (arr.length > MAX_ENTRIES) {
      arr = arr.slice(arr.length - MAX_ENTRIES);
    }
    write(key, arr);
  }

  /**
   * Genera un timestamp ISO 8601.
   * @returns {string}
   */
  function now() {
    return new Date().toISOString();
  }

  /* --- 6.1 Performance / Tiempos de carga --- */

  /**
   * Captura métricas de navegación y carga usando Performance API.
   * Compatible con Navigation Timing L1 y L2.
   */
  function capturePerformance() {
    if (typeof performance === 'undefined') {
      write('perf', { supported: false, timestamp: now() });
      return;
    }

    var data = { supported: true, timestamp: now() };

    // Navigation Timing
    try {
      var entries = performance.getEntriesByType
        ? performance.getEntriesByType('navigation')
        : [];

      if (entries.length > 0) {
        // Navigation Timing Level 2
        var nav = entries[0];
        data.navigation = {
          type: nav.type || 'unknown',
          redirectCount: nav.redirectCount || 0,
          dnsLookup: round(nav.domainLookupEnd - nav.domainLookupStart),
          tcpConnect: round(nav.connectEnd - nav.connectStart),
          ttfb: round(nav.responseStart - nav.requestStart),
          responseTime: round(nav.responseEnd - nav.responseStart),
          domInteractive: round(nav.domInteractive - nav.startTime),
          domComplete: round(nav.domComplete - nav.startTime),
          loadEvent: round(nav.loadEventEnd - nav.startTime),
          totalDuration: round(nav.duration)
        };
      } else if (performance.timing) {
        // Fallback: Navigation Timing Level 1
        var t = performance.timing;
        var origin = t.navigationStart;
        data.navigation = {
          type: 'L1-fallback',
          dnsLookup: t.domainLookupEnd - t.domainLookupStart,
          tcpConnect: t.connectEnd - t.connectStart,
          ttfb: t.responseStart - t.requestStart,
          responseTime: t.responseEnd - t.responseStart,
          domInteractive: t.domInteractive - origin,
          domComplete: t.domComplete - origin,
          loadEvent: t.loadEventEnd - origin
        };
      }
    } catch (e) {
      data.navigationError = e.message;
    }

    // Resource Timing (resumen)
    try {
      if (performance.getEntriesByType) {
        var resources = performance.getEntriesByType('resource');
        data.resourceCount = resources.length;
        data.resourceSummary = {};
        resources.forEach(function (r) {
          var type = r.initiatorType || 'other';
          if (!data.resourceSummary[type]) {
            data.resourceSummary[type] = { count: 0, totalMs: 0 };
          }
          data.resourceSummary[type].count++;
          data.resourceSummary[type].totalMs += round(r.duration);
        });
      }
    } catch (e) {
      data.resourceTimingError = e.message;
    }

    write('perf', data);
  }

  /**
   * Redondea un número a 2 decimales.
   * @param {number} n
   * @returns {number}
   */
  function round(n) {
    return Math.round((n || 0) * 100) / 100;
  }

  /* --- 6.2 Errores JavaScript --- */

  /**
   * Escucha errores globales de JavaScript.
   */
  function setupErrorListeners() {
    // Errores síncronos
    window.addEventListener('error', function (e) {
      // Distinguir errores JS de errores de recursos
      if (e.target && (e.target.tagName === 'IMG' || e.target.tagName === 'SCRIPT' ||
          e.target.tagName === 'LINK' || e.target.tagName === 'VIDEO' ||
          e.target.tagName === 'AUDIO')) {
        // Es un error de recurso; lo captura otro listener
        return;
      }
      append('errors', {
        type: 'js-error',
        message: e.message || 'Error desconocido',
        source: e.filename || '',
        line: e.lineno || 0,
        col: e.colno || 0,
        timestamp: now()
      });
    });

    // Promesas rechazadas sin manejar
    if (typeof PromiseRejectionEvent !== 'undefined') {
      window.addEventListener('unhandledrejection', function (e) {
        var reason = 'unknown';
        try {
          reason = e.reason
            ? (e.reason.message || e.reason.toString())
            : 'Promise rejected';
        } catch (err) {
          reason = 'Error al serializar razón';
        }
        append('errors', {
          type: 'unhandled-rejection',
          message: reason,
          timestamp: now()
        });
      });
    }
  }

  /* --- 6.3 Errores de carga de recursos --- */

  /**
   * Escucha errores de carga de imágenes, scripts, CSS, etc.
   * Usa la fase de captura para interceptar antes del bubbling.
   */
  function setupResourceErrorListeners() {
    window.addEventListener('error', function (e) {
      var target = e.target || e.srcElement;
      if (!target || !target.tagName) return;

      var tag = target.tagName.toUpperCase();
      if (tag === 'IMG' || tag === 'SCRIPT' || tag === 'LINK' ||
          tag === 'VIDEO' || tag === 'AUDIO' || tag === 'SOURCE') {
        append('resource-errors', {
          type: 'resource-load-error',
          tag: tag,
          src: target.src || target.href || '',
          alt: target.alt || '',
          timestamp: now()
        });
      }
    }, true); // Fase de captura
  }

  /* --- 6.4 Clics en controles interactivos --- */

  /**
   * Captura clics en enlaces, botones y controles interactivos
   * usando delegación de eventos en document.
   */
  function setupClickTracking() {
    document.addEventListener('click', function (e) {
      var target = e.target;

      // Buscar el elemento interactivo más cercano
      var interactive = target.closest(
        'a, button, [role="button"], input, select, textarea, [tabindex]'
      );
      if (!interactive) return;

      var tag = interactive.tagName.toLowerCase();
      var entry = {
        type: 'click',
        tag: tag,
        timestamp: now()
      };

      // Extraer información relevante según el tipo
      if (tag === 'a') {
        entry.href = interactive.getAttribute('href') || '';
        entry.text = (interactive.textContent || '').trim().substring(0, 80);
        entry.external = interactive.hostname !== window.location.hostname;
      } else if (tag === 'button') {
        entry.text = (interactive.textContent || '').trim().substring(0, 80);
        entry.ariaExpanded = interactive.getAttribute('aria-expanded');
        entry.className = (interactive.className || '').substring(0, 60);
      } else {
        entry.id = interactive.id || '';
        entry.role = interactive.getAttribute('role') || '';
        entry.text = (interactive.textContent || '').trim().substring(0, 50);
      }

      append('clicks', entry);
    });
  }

  /* --- 6.5 Cambios de visibilidad --- */

  /**
   * Registra cuándo el usuario cambia de pestaña o minimiza el navegador.
   */
  function setupVisibilityTracking() {
    if (typeof document.hidden === 'undefined') return;

    document.addEventListener('visibilitychange', function () {
      append('visibility', {
        state: document.visibilityState,
        timestamp: now()
      });
    });

    // Registrar estado inicial
    append('visibility', {
      state: document.visibilityState,
      note: 'estado-inicial',
      timestamp: now()
    });
  }

  /* --- 6.6 Entorno del navegador --- */

  /**
   * Captura información del viewport, conexión y soporte de APIs.
   */
  function captureEnvironment() {
    var env = {
      timestamp: now(),
      viewport: {
        width: window.innerWidth || 0,
        height: window.innerHeight || 0,
        devicePixelRatio: window.devicePixelRatio || 1,
        orientation: screen && screen.orientation
          ? screen.orientation.type
          : (window.innerWidth > window.innerHeight ? 'landscape' : 'portrait')
      },
      screen: {
        width: screen ? screen.width : 0,
        height: screen ? screen.height : 0,
        colorDepth: screen ? screen.colorDepth : 0
      },
      connection: {},
      apis: {},
      userAgent: navigator.userAgent || '',
      language: navigator.language || '',
      cookiesEnabled: navigator.cookieEnabled || false,
      onLine: navigator.onLine
    };

    // Connection API (Navigator.connection)
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      env.connection = {
        effectiveType: conn.effectiveType || 'unknown',
        downlink: conn.downlink || 0,
        rtt: conn.rtt || 0,
        saveData: conn.saveData || false
      };
    } else {
      env.connection = { supported: false };
    }

    // Soporte de APIs relevantes
    env.apis = {
      IntersectionObserver: 'IntersectionObserver' in window,
      ResizeObserver: 'ResizeObserver' in window,
      PerformanceObserver: 'PerformanceObserver' in window,
      requestAnimationFrame: 'requestAnimationFrame' in window,
      localStorage: storageAvailable(),
      serviceWorker: 'serviceWorker' in navigator,
      webGL: hasWebGL(),
      touchEvents: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      prefersReducedMotion: window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false,
      prefersColorScheme: window.matchMedia
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : 'unknown'
    };

    write('env', env);
  }

  /**
   * Comprueba si localStorage está disponible y funcional.
   * @returns {boolean}
   */
  function storageAvailable() {
    try {
      var test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Comprueba soporte básico de WebGL.
   * @returns {boolean}
   */
  function hasWebGL() {
    try {
      var canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch (e) {
      return false;
    }
  }

  /* --- 6.7 Sesión --- */

  /**
   * Registra una nueva sesión con timestamp de inicio.
   */
  function registerSession() {
    var sessions = read('sessions') || [];
    sessions.push({
      start: now(),
      page: window.location.pathname,
      referrer: document.referrer || ''
    });
    if (sessions.length > 50) {
      sessions = sessions.slice(sessions.length - 50);
    }
    write('sessions', sessions);
  }

  /* --- 6.8 API pública --- */

  /**
   * Devuelve un snapshot completo de toda la telemetría almacenada.
   * @returns {Object}
   */
  function getSnapshot() {
    return {
      version: '1.0.0',
      exportedAt: now(),
      performance: read('perf'),
      errors: read('errors') || [],
      resourceErrors: read('resource-errors') || [],
      clicks: read('clicks') || [],
      visibility: read('visibility') || [],
      environment: read('env'),
      sessions: read('sessions') || []
    };
  }

  /**
   * Limpia todas las claves de observabilidad en localStorage.
   */
  function clearAll() {
    var keys = ['perf', 'errors', 'resource-errors', 'clicks', 'visibility', 'env', 'sessions'];
    keys.forEach(function (key) {
      try {
        localStorage.removeItem(PREFIX + key);
      } catch (e) {
        // Silenciar
      }
    });
  }

  /* --- Inicialización --- */

  // Capturar entorno y registrar sesión inmediatamente
  captureEnvironment();
  registerSession();
  setupErrorListeners();
  setupResourceErrorListeners();
  setupClickTracking();
  setupVisibilityTracking();

  // Capturar performance después de que la página termine de cargar
  if (document.readyState === 'complete') {
    capturePerformance();
  } else {
    window.addEventListener('load', function () {
      // Pequeño delay para que loadEventEnd se registre
      setTimeout(capturePerformance, 100);
    });
  }

  // Exponer API pública
  window.CR7Observability = {
    getSnapshot: getSnapshot,
    clearAll: clearAll,
    _prefix: PREFIX,
    _version: '1.0.0'
  };
})();
