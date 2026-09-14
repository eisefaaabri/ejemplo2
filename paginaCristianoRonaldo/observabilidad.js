/* ============================================
   DASHBOARD DE OBSERVABILIDAD — CR7
   Lógica del panel de telemetría local.
   Lee datos de localStorage (prefijo cr7-observability:)
   escritos por el módulo de instrumentación en script.js.
   ============================================ */

(function () {
  'use strict';

  var PREFIX = 'cr7-observability:';

  /* --- Utilidades --- */

  function read(key) {
    try {
      var raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) { /* silenciar */ }
  }

  function append(key, entry) {
    var arr = read(key) || [];
    arr.push(entry);
    if (arr.length > 200) arr = arr.slice(arr.length - 200);
    write(key, arr);
  }

  function now() {
    return new Date().toISOString();
  }

  /**
   * Formatea un timestamp ISO a hora local legible.
   */
  function formatTime(iso) {
    if (!iso) return '—';
    try {
      var d = new Date(iso);
      return d.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return iso;
    }
  }

  /**
   * Formatea un timestamp ISO a fecha + hora.
   */
  function formatDateTime(iso) {
    if (!iso) return '—';
    try {
      var d = new Date(iso);
      return d.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      }) + ' ' + d.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return iso;
    }
  }

  /**
   * Formatea milisegundos a texto legible.
   */
  function formatMs(ms) {
    if (ms === null || ms === undefined || isNaN(ms)) return '—';
    if (ms < 1) return '<1 ms';
    if (ms < 1000) return Math.round(ms) + ' ms';
    return (ms / 1000).toFixed(2) + ' s';
  }

  /**
   * Escapa HTML para prevenir XSS al renderizar datos del usuario.
   */
  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ============================================
     RENDERIZADO DEL DASHBOARD
     ============================================ */

  /**
   * Carga todos los datos y renderiza las secciones.
   */
  function render() {
    var perf = read('perf');
    var errors = read('errors') || [];
    var resErrors = read('resource-errors') || [];
    var clicks = read('clicks') || [];
    var visibility = read('visibility') || [];
    var env = read('env');
    var sessions = read('sessions') || [];

    renderKPIs(perf, errors, resErrors, clicks, sessions);
    renderPerformance(perf);
    renderResources(perf);
    renderErrors(errors);
    renderResourceErrors(resErrors);
    renderClicks(clicks);
    renderVisibility(visibility);
    renderEnvironment(env);

    // Actualizar timestamp
    document.getElementById('lastUpdateTime').textContent = formatTime(now());
  }

  /* --- KPIs --- */

  function renderKPIs(perf, errors, resErrors, clicks, sessions) {
    var loadTime = '—';
    var ttfb = '—';

    if (perf && perf.navigation) {
      var nav = perf.navigation;
      if (nav.loadEvent) loadTime = formatMs(nav.loadEvent);
      else if (nav.domComplete) loadTime = formatMs(nav.domComplete);
      if (nav.ttfb !== undefined) ttfb = formatMs(nav.ttfb);
    }

    setText('kpiLoad', loadTime);
    setText('kpiTTFB', ttfb);
    setText('kpiErrors', String(errors.length));
    setText('kpiResErrors', String(resErrors.length));
    setText('kpiClicks', String(clicks.length));
    setText('kpiSessions', String(sessions.length));
  }

  /* --- Rendimiento --- */

  function renderPerformance(perf) {
    var body = document.getElementById('perfBody');
    var badge = document.getElementById('perfBadge');

    if (!perf || !perf.navigation) {
      body.innerHTML = '<tr><td colspan="2" class="empty-state"><span class="icon" aria-hidden="true">⏳</span>Sin datos de rendimiento. Visita la página principal primero.</td></tr>';
      badge.textContent = 'sin datos';
      badge.className = 'badge';
      return;
    }

    var nav = perf.navigation;
    var rows = [
      ['Tipo de navegación', nav.type || '—'],
      ['DNS Lookup', formatMs(nav.dnsLookup)],
      ['Conexión TCP', formatMs(nav.tcpConnect)],
      ['TTFB (Time to First Byte)', formatMs(nav.ttfb)],
      ['Tiempo de respuesta', formatMs(nav.responseTime)],
      ['DOM Interactivo', formatMs(nav.domInteractive)],
      ['DOM Completo', formatMs(nav.domComplete)],
      ['Evento Load', formatMs(nav.loadEvent)]
    ];

    if (nav.totalDuration !== undefined) {
      rows.push(['Duración total', formatMs(nav.totalDuration)]);
    }
    if (nav.redirectCount !== undefined) {
      rows.push(['Redirecciones', String(nav.redirectCount)]);
    }

    var html = '';
    rows.forEach(function (row) {
      html += '<tr><td>' + escapeHtml(row[0]) + '</td><td class="mono">' + escapeHtml(row[1]) + '</td></tr>';
    });
    body.innerHTML = html;

    // Badge de rendimiento
    var loadMs = nav.loadEvent || nav.domComplete || 0;
    if (loadMs < 1500) {
      badge.textContent = 'Rápido';
      badge.className = 'badge badge--success';
    } else if (loadMs < 3000) {
      badge.textContent = 'Normal';
      badge.className = 'badge badge--warning';
    } else {
      badge.textContent = 'Lento';
      badge.className = 'badge badge--error';
    }
  }

  /* --- Recursos --- */

  function renderResources(perf) {
    var body = document.getElementById('resBody');
    var badge = document.getElementById('resBadge');

    if (!perf || !perf.resourceSummary) {
      body.innerHTML = '<tr><td colspan="3" class="empty-state"><span class="icon" aria-hidden="true">📦</span>Sin datos de recursos</td></tr>';
      badge.textContent = '0';
      return;
    }

    badge.textContent = String(perf.resourceCount || 0);

    var summary = perf.resourceSummary;
    var keys = Object.keys(summary).sort();

    if (keys.length === 0) {
      body.innerHTML = '<tr><td colspan="3" class="empty-state">Sin recursos registrados</td></tr>';
      return;
    }

    var html = '';
    keys.forEach(function (type) {
      var s = summary[type];
      html += '<tr>';
      html += '<td><span class="tag tag--info">' + escapeHtml(type) + '</span></td>';
      html += '<td class="mono">' + s.count + '</td>';
      html += '<td class="mono">' + formatMs(s.totalMs) + '</td>';
      html += '</tr>';
    });
    body.innerHTML = html;
  }

  /* --- Errores --- */

  function renderErrors(errors) {
    var body = document.getElementById('errBody');
    var badge = document.getElementById('errBadge');
    badge.textContent = String(errors.length);
    badge.className = errors.length > 0 ? 'badge badge--error' : 'badge badge--success';

    if (errors.length === 0) {
      body.innerHTML = '<tr><td colspan="4" class="empty-state"><span class="icon" aria-hidden="true">✅</span>Sin errores registrados</td></tr>';
      return;
    }

    var html = '';
    // Mostrar los más recientes primero
    errors.slice().reverse().forEach(function (err) {
      var tagClass = err.type === 'unhandled-rejection' ? 'tag--warning' : 'tag--error';
      html += '<tr>';
      html += '<td><span class="tag ' + tagClass + '">' + escapeHtml(err.type) + '</span></td>';
      html += '<td class="truncate" title="' + escapeHtml(err.message) + '">' + escapeHtml(err.message) + '</td>';
      html += '<td class="mono truncate">' + escapeHtml(err.source ? err.source + ':' + err.line : '—') + '</td>';
      html += '<td class="mono">' + formatTime(err.timestamp) + '</td>';
      html += '</tr>';
    });
    body.innerHTML = html;
  }

  /* --- Errores de recursos --- */

  function renderResourceErrors(resErrors) {
    var body = document.getElementById('resErrBody');
    var badge = document.getElementById('resErrBadge');
    badge.textContent = String(resErrors.length);
    badge.className = resErrors.length > 0 ? 'badge badge--warning' : 'badge badge--success';

    if (resErrors.length === 0) {
      body.innerHTML = '<tr><td colspan="3" class="empty-state"><span class="icon" aria-hidden="true">✅</span>Sin errores de recursos</td></tr>';
      return;
    }

    var html = '';
    resErrors.slice().reverse().forEach(function (err) {
      html += '<tr>';
      html += '<td><span class="tag tag--warning">' + escapeHtml(err.tag) + '</span></td>';
      html += '<td class="mono truncate" title="' + escapeHtml(err.src) + '">' + escapeHtml(err.src) + '</td>';
      html += '<td class="mono">' + formatTime(err.timestamp) + '</td>';
      html += '</tr>';
    });
    body.innerHTML = html;
  }

  /* --- Clics --- */

  function renderClicks(clicks) {
    var body = document.getElementById('clicksBody');
    var badge = document.getElementById('clicksBadge');
    badge.textContent = String(clicks.length);

    if (clicks.length === 0) {
      body.innerHTML = '<tr><td colspan="3" class="empty-state"><span class="icon" aria-hidden="true">👆</span>Sin clics registrados. Interactúa con la página principal.</td></tr>';
      return;
    }

    var html = '';
    clicks.slice().reverse().slice(0, 50).forEach(function (click) {
      var detail = click.text || click.href || click.id || '—';
      html += '<tr>';
      html += '<td><span class="tag tag--click">' + escapeHtml(click.tag) + '</span></td>';
      html += '<td class="truncate" title="' + escapeHtml(detail) + '">' + escapeHtml(detail) + '</td>';
      html += '<td class="mono">' + formatTime(click.timestamp) + '</td>';
      html += '</tr>';
    });
    body.innerHTML = html;
  }

  /* --- Visibilidad --- */

  function renderVisibility(visibility) {
    var body = document.getElementById('visBody');
    var badge = document.getElementById('visBadge');
    badge.textContent = String(visibility.length);

    if (visibility.length === 0) {
      body.innerHTML = '<tr><td colspan="3" class="empty-state"><span class="icon" aria-hidden="true">👁️</span>Sin cambios de visibilidad</td></tr>';
      return;
    }

    var html = '';
    visibility.slice().reverse().slice(0, 30).forEach(function (v) {
      var stateClass = v.state === 'visible' ? 'tag--success' : 'tag--warning';
      html += '<tr>';
      html += '<td><span class="tag ' + stateClass + '">' + escapeHtml(v.state) + '</span></td>';
      html += '<td>' + escapeHtml(v.note || '') + '</td>';
      html += '<td class="mono">' + formatTime(v.timestamp) + '</td>';
      html += '</tr>';
    });
    body.innerHTML = html;
  }

  /* --- Entorno --- */

  function renderEnvironment(env) {
    var grid = document.getElementById('envGrid');

    if (!env) {
      grid.innerHTML = '<div class="empty-state"><span class="icon" aria-hidden="true">🖥️</span>Sin datos de entorno. Visita la página principal primero.</div>';
      return;
    }

    var html = '';

    // Viewport
    html += '<div class="env-card"><h3>📐 Viewport</h3>';
    if (env.viewport) {
      html += envRow('Ancho', env.viewport.width + ' px');
      html += envRow('Alto', env.viewport.height + ' px');
      html += envRow('Device Pixel Ratio', env.viewport.devicePixelRatio + 'x');
      html += envRow('Orientación', env.viewport.orientation);
    }
    if (env.screen) {
      html += envRow('Pantalla', env.screen.width + ' × ' + env.screen.height);
      html += envRow('Profundidad color', env.screen.colorDepth + ' bits');
    }
    html += '</div>';

    // Conexión
    html += '<div class="env-card"><h3>🌐 Conexión</h3>';
    if (env.connection) {
      if (env.connection.supported === false) {
        html += envRow('Network Info API', unsupported());
      } else {
        html += envRow('Tipo efectivo', env.connection.effectiveType);
        html += envRow('Bajada', env.connection.downlink + ' Mbps');
        html += envRow('RTT', env.connection.rtt + ' ms');
        html += envRow('Ahorro datos', env.connection.saveData ? 'Sí' : 'No');
      }
    }
    html += envRow('En línea', env.onLine ? supported('Sí') : unsupported('No'));
    html += envRow('Idioma', env.language);
    html += envRow('Cookies', env.cookiesEnabled ? 'Habilitadas' : 'Deshabilitadas');
    html += '</div>';

    // APIs
    html += '<div class="env-card"><h3>🧩 Soporte de APIs</h3>';
    if (env.apis) {
      var apiKeys = Object.keys(env.apis);
      apiKeys.forEach(function (api) {
        var val = env.apis[api];
        if (typeof val === 'boolean') {
          html += envRow(api, val ? supported('✓') : unsupported('✗'));
        } else {
          html += envRow(api, escapeHtml(String(val)));
        }
      });
    }
    html += '</div>';

    // User Agent
    html += '<div class="env-card"><h3>🔍 User Agent</h3>';
    html += '<div style="font-family: var(--font-mono); font-size: 0.75rem; word-break: break-all; color: var(--color-text-secondary); padding: 0.5rem 0;">' +
      escapeHtml(env.userAgent) + '</div>';
    html += '</div>';

    grid.innerHTML = html;
  }

  function envRow(key, val) {
    return '<div class="env-row"><span class="env-key">' + escapeHtml(key) + '</span><span class="env-val">' + val + '</span></div>';
  }

  function supported(text) {
    return '<span class="supported">' + escapeHtml(text || '✓') + '</span>';
  }

  function unsupported(text) {
    return '<span class="unsupported">' + escapeHtml(text || '✗') + '</span>';
  }

  /* ============================================
     ACCIONES
     ============================================ */

  /**
   * Muestra una notificación toast temporal.
   */
  function showToast(message, type) {
    var toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast toast--' + (type || 'info') + ' visible';

    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      toast.classList.remove('visible');
    }, 3000);
  }

  /**
   * Genera un evento de demostración (error JS + clic + recurso).
   */
  function generateDemoEvent() {
    // 1. Error JS simulado
    append('errors', {
      type: 'js-error',
      message: 'Error de demostración: simulación manual desde el dashboard',
      source: 'observabilidad.js',
      line: 0,
      col: 0,
      timestamp: now()
    });

    // 2. Error de recurso simulado
    append('resource-errors', {
      type: 'resource-load-error',
      tag: 'IMG',
      src: 'https://ejemplo.com/imagen-inexistente.jpg',
      alt: 'Imagen de demostración',
      timestamp: now()
    });

    // 3. Clic simulado
    append('clicks', {
      type: 'click',
      tag: 'button',
      text: '🧪 Evento demo (simulado)',
      className: 'btn',
      timestamp: now()
    });

    // 4. Cambio de visibilidad simulado
    append('visibility', {
      state: 'hidden',
      note: 'simulación-demo',
      timestamp: now()
    });
    append('visibility', {
      state: 'visible',
      note: 'simulación-demo',
      timestamp: now()
    });

    showToast('✅ Eventos de demostración generados (5 registros)', 'success');
    render();
  }

  /**
   * Descarga un snapshot JSON con todos los datos.
   */
  function downloadSnapshot() {
    var snapshot = {
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

    var json = JSON.stringify(snapshot, null, 2);
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);

    var a = document.createElement('a');
    a.href = url;
    a.download = 'cr7-observability-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('💾 Snapshot JSON descargado', 'success');
  }

  /**
   * Limpia todos los datos de observabilidad.
   */
  function clearAllData() {
    var keys = ['perf', 'errors', 'resource-errors', 'clicks', 'visibility', 'env', 'sessions'];
    keys.forEach(function (key) {
      try { localStorage.removeItem(PREFIX + key); } catch (e) { /* silenciar */ }
    });

    showToast('🗑️ Datos de observabilidad eliminados', 'info');
    render();
  }

  /* ============================================
     HELPERS
     ============================================ */

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  /* ============================================
     INICIALIZACIÓN
     ============================================ */

  document.addEventListener('DOMContentLoaded', function () {
    // Renderizar datos iniciales
    render();

    // Botones de acción
    document.getElementById('btnRefresh').addEventListener('click', function () {
      render();
      showToast('🔄 Dashboard actualizado', 'info');
    });

    document.getElementById('btnDemo').addEventListener('click', function () {
      generateDemoEvent();
    });

    document.getElementById('btnDownload').addEventListener('click', function () {
      downloadSnapshot();
    });

    document.getElementById('btnClear').addEventListener('click', function () {
      if (window.confirm('¿Eliminar todos los datos de observabilidad?')) {
        clearAllData();
      }
    });
  });
})();
