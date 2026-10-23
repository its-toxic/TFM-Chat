// ---------- تفضيلات: الوضع الداكن، حجم الخط، تثبيت التطبيق ----------
(function () {
  const KEY_THEME = 'tfm_theme';   // system | light | dark
  const KEY_FONT = 'tfm_font';     // small | normal | large | xlarge

  const THEMES = ['system', 'light', 'dark'];
  const THEME_LABEL = {
    system: { ar: 'الوضع: تلقائي', en: 'Theme: auto' },
    light: { ar: 'الوضع: فاتح', en: 'Theme: light' },
    dark: { ar: 'الوضع: داكن', en: 'Theme: dark' },
  };

  const FONTS = [
    { key: 'small', zoom: '0.92', ar: 'صغير', en: 'Small' },
    { key: 'normal', zoom: '1', ar: 'عادي', en: 'Normal' },
    { key: 'large', zoom: '1.12', ar: 'كبير', en: 'Large' },
    { key: 'xlarge', zoom: '1.25', ar: 'كبير جداً', en: 'Extra large' },
  ];

  const isEn = () => typeof lang !== 'undefined' && lang === 'en';
  const txt = (ar, en) => (isEn() ? en : ar);
  const el = id => document.getElementById(id);

  function getPref(k, def) {
    try { return localStorage.getItem(k) || def; } catch { return def; }
  }
  function setPref(k, v) {
    try { localStorage.setItem(k, v); } catch {}
  }
  function nextOf(list, cur) {
    const i = list.indexOf(cur);
    return list[(i + 1) % list.length];
  }

  // ستايل الوضع الداكن للأجزاء الأساسية
  const DARK_CSS = `
    html[data-theme="dark"] .screen,
    html[data-theme="dark"] .card,
    html[data-theme="dark"] .modal-box,
    html[data-theme="dark"] .members-panel,
    html[data-theme="dark"] header,
    html[data-theme="dark"] .composer,
    html[data-theme="dark"] .ai-screen,
    html[data-theme="dark"] .ai-head,
    html[data-theme="dark"] .ai-composer {
      background-color: #16161b;
      color: #f1f1f3;
    }
    html[data-theme="dark"] input,
    html[data-theme="dark"] textarea,
    html[data-theme="dark"] select {
      background-color: #22222a;
      color: #f1f1f3;
      border-color: #3a3a44;
    }
    html[data-theme="dark"] .set-item {
      background-color: #22222a;
      color: #f1f1f3;
    }
  `;

  const st = document.createElement('style');
  st.textContent = DARK_CSS;
  document.head.appendChild(st);

  // الوضع التلقائي بيتبع إعداد الجهاز
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  function applyTheme() {
    const pref = getPref(KEY_THEME, 'system');
    const dark = pref === 'dark' || (pref === 'system' && systemDark.matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }

  function applyFont() {
    const key = getPref(KEY_FONT, 'normal');
    const f = FONTS.find(x => x.key === key) || FONTS[1];
    // zoom بيكبّر كل النصوص حتى اللي مكتوبة بـ px
    document.body.style.zoom = f.zoom;
  }

  function refreshLabels() {
    const t = getPref(KEY_THEME, 'system');
    const f = FONTS.find(x => x.key === getPref(KEY_FONT, 'normal')) || FONTS[1];
    const th = el('set-theme');
    if (th) th.textContent = THEME_LABEL[t][isEn() ? 'en' : 'ar'];
    const fb = el('set-font');
    if (fb) fb.textContent = txt('حجم الخط: ' + f.ar, 'Font size: ' + f.en);
    const ins = el('set-install');
    if (ins) ins.hidden = isStandalone();
  }

  // ---------- تثبيت التطبيق ----------
  let deferredPrompt = null;

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  }

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    refreshLabels();
  });

  async function installApp() {
    if (isStandalone()) {
      return alert(txt('التطبيق متثبت بالفعل', 'The app is already installed'));
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try { await deferredPrompt.userChoice; } catch {}
      deferredPrompt = null;
      return refreshLabels();
    }
    // iPhone أو متصفح ما بيدعمش الزرار المباشر
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    alert(isIOS
      ? txt(
        'على آيفون: اضغط زرار المشاركة (Share) تحت، وبعدين اختار "Add to Home Screen".',
        'On iPhone: tap the Share button, then "Add to Home Screen".')
      : txt(
        'على أندرويد (Chrome): اضغط ⋮ فوق على اليمين، وبعدين "Install app" أو "Add to Home screen".',
        'On Android (Chrome): tap ⋮ at the top right, then "Install app" or "Add to Home screen".'));
  }

  // ---------- الأحداث ----------
  el('set-theme')?.addEventListener('click', () => {
    setPref(KEY_THEME, nextOf(THEMES, getPref(KEY_THEME, 'system')));
    applyTheme();
    refreshLabels();
  });

  el('set-font')?.addEventListener('click', () => {
    const keys = FONTS.map(f => f.key);
    setPref(KEY_FONT, nextOf(keys, getPref(KEY_FONT, 'normal')));
    applyFont();
    refreshLabels();
  });

  el('set-install')?.addEventListener('click', installApp);

  systemDark.addEventListener?.('change', applyTheme);

  applyTheme();
  applyFont();
  refreshLabels();
})();