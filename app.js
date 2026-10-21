const SUPABASE_URL = 'https://jifoamltmdgpawpjgrbz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_IiaTAO0BNUJTp_pzVidhhA_e1g82vpi';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const CONTACT_EMAIL = 'its.toxic0807@gmail.com';

// ---------- الترجمة ----------
const T = {
  ar: {
    login: 'دخول', signup: 'حساب جديد', createAccount: 'إنشاء حساب',
    email: 'الإيميل', password: 'الباسورد', newPassword: 'الباسورد الجديد',
    pwRule: 'الباسورد 8 حروف على الأقل، فيه حرف كبير وحرف صغير ورقم ورمز (مثال: Ab12@xyz)',
    chooseAvatarSignup: 'لازم تختار صورة بروفايل عشان تعمل الحساب',
    chooseAvatar: 'لازم تختار صورة بروفايل قبل ما تدخل',
    save: 'حفظ', forgot: 'نسيت كلمة السر؟', contact: 'التواصل والشكاوي',
    settings: 'الإعدادات', changeAvatar: 'تغيير صورة البروفايل', changeName: 'تغيير اسم المستخدم',
    history: 'السجل', admin: 'لوحة الأدمن', search: 'بحث', logout: 'تسجيل خروج',
    searchPh: 'ابحث في الرسايل...', msgPh: 'اكتب رسالة...', send: 'إرسال',
    emailPwReq: 'اكتب الإيميل والباسورد', emailReq: 'اكتب إيميلك الأول',
    pwInvalid: 'الباسورد لازم يكون 8 حروف على الأقل، وفيه حرف كبير وصغير ورقم ورمز',
    avatarReq: 'اختار صورة بروفايل الأول',
    checkEmail: 'اتعمل الحساب. اتأكد من إيميلك أو سجّل دخول',
    loginFail: 'الإيميل أو الباسورد غلط', exists: 'الإيميل ده متسجل قبل كده',
    resetSent: 'بعتنالك لينك تغيير الباسورد على الإيميل', pwChanged: 'تم تغيير الباسورد',
    recTitle: 'باسورد جديد', recSave: 'حفظ الباسورد',
    nameAsk: 'اكتب الاسم الجديد:', nameFail: 'فشل التغيير: ',
    avatarFail: 'فشل رفع الصورة: ', avatarSaved: 'تم حفظ صورة البروفايل',
    deleteAsk: 'تمسح الرسالة دي؟', deleteFail: 'فشل المسح: ', sendFail: 'فشل الإرسال: ',
    uploadFail: 'فشل الرفع: ', loadFail: 'فشل تحميل الرسايل: ',
    camFail: 'ما قدرتش أفتح الكاميرا: ', micFail: 'ما قدرتش أفتح الميكروفون: ',
    copyFail: 'ما قدرتش أنسخ الرسالة', copy: 'نسخ', delete: 'مسح',
    noRows: 'مفيش حاجة هنا لسه', tabLinks: 'روابط', tabDocs: 'ملفات', tabMedia: 'ميديا',
    image: 'صورة', audio: 'صوت', video: 'فيديو', file: 'ملف',
    camera: 'الكاميرا', shoot: 'تصوير وإرسال',
    contactTitle: 'التواصل والشكاوي', contactInfo: 'للتواصل أو تقديم الشكاوي:',
    emailLabel: 'الإيميل:', contactPh: 'اكتب شكواك أو رسالتك هنا...', contactBtn: 'إرسال عن طريق الإيميل',
    contactSubject: 'TFM Chat - تواصل وشكوى',
    roles: 'إدارة الأدوار', userDefault: 'مستخدم', profileFail: 'خطأ في تحميل البروفايل',
    noProfile: 'مفيش بروفايل للحساب ده',
    createdBy: 'Created by', designedBy: 'Designed by',
    toggleLang: 'English', toLight: '☀️ فاتح', toDark: '🌙 داكن'
  },
  en: {
    login: 'Login', signup: 'Sign up', createAccount: 'Create account',
    email: 'Email', password: 'Password', newPassword: 'New password',
    pwRule: 'At least 8 characters, with uppercase, lowercase, a number and a symbol (example: Ab12@xyz)',
    chooseAvatarSignup: 'You must choose a profile picture to create your account',
    chooseAvatar: 'You must choose a profile picture before entering',
    save: 'Save', forgot: 'Forgot password?', contact: 'Contact & complaints',
    settings: 'Settings', changeAvatar: 'Change profile picture', changeName: 'Change display name',
    history: 'History', admin: 'Admin panel', search: 'Search', logout: 'Log out',
    searchPh: 'Search messages...', msgPh: 'Write a message...', send: 'Send',
    emailPwReq: 'Enter email and password', emailReq: 'Enter your email first',
    pwInvalid: 'Password must be at least 8 characters with uppercase, lowercase, a number and a symbol',
    avatarReq: 'Choose a profile picture first',
    checkEmail: 'Account created. Check your email or log in',
    loginFail: 'Wrong email or password', exists: 'This email is already registered',
    resetSent: 'We sent a password reset link to your email', pwChanged: 'Password changed',
    recTitle: 'New password', recSave: 'Save password',
    nameAsk: 'Enter the new name:', nameFail: 'Failed: ',
    avatarFail: 'Image upload failed: ', avatarSaved: 'Profile picture saved',
    deleteAsk: 'Delete this message?', deleteFail: 'Delete failed: ', sendFail: 'Send failed: ',
    uploadFail: 'Upload failed: ', loadFail: 'Failed to load messages: ',
    camFail: 'Could not open camera: ', micFail: 'Could not open microphone: ',
    copyFail: 'Could not copy the message', copy: 'Copy', delete: 'Delete',
    noRows: 'Nothing here yet', tabLinks: 'Links', tabDocs: 'Documents', tabMedia: 'Media',
    image: 'Image', audio: 'Audio', video: 'Video', file: 'File',
    camera: 'Camera', shoot: 'Capture & send',
    contactTitle: 'Contact & complaints', contactInfo: 'For contact or complaints:',
    emailLabel: 'Email:', contactPh: 'Write your complaint or message here...', contactBtn: 'Send by email',
    contactSubject: 'TFM Chat - Contact & Complaint',
    roles: 'Role management', userDefault: 'User', profileFail: 'Failed to load profile',
    noProfile: 'No profile found for this account',
    createdBy: 'Created by', designedBy: 'Designed by',
    toggleLang: 'عربي', toLight: '☀️ Light', toDark: '🌙 Dark'
  }
};

let lang = localStorage.getItem('lang') || 'ar';
let theme = localStorage.getItem('theme') || 'dark';

function t(k) { return (T[lang] && T[lang][k]) || k; }

function applyI18n() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dataset.theme = theme;

  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  document.querySelectorAll('.lang-toggle').forEach(b => { b.textContent = t('toggleLang'); });
  document.querySelectorAll('.theme-toggle').forEach(b => { b.textContent = theme === 'dark' ? t('toLight') : t('toDark'); });

  setAuthMode(authMode);
  if (currentProfile) refreshUserLabel();
}

function toggleLang() {
  lang = lang === 'ar' ? 'en' : 'ar';
  localStorage.setItem('lang', lang);
  applyI18n();
}

function toggleTheme() {
  theme = theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', theme);
  applyI18n();
}

document.querySelectorAll('.lang-toggle').forEach(b => { b.onclick = toggleLang; });
document.querySelectorAll('.theme-toggle').forEach(b => { b.onclick = toggleTheme; });

// ---------- متغيرات ----------
let currentProfile = null;
let subscribed = false;
let msgById = new Map();
let menuMsgId = null;
let activeTab = 'links';
let authMode = 'login';
let recovering = false;
let signingUp = false;
let camStream = null;
let recorder = null;
let chunks = [];

const $ = id => document.getElementById(id);

// ---------- مساعدات ----------
function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function showScreen(id) {
  ['auth-screen', 'recovery-screen', 'chat-screen'].forEach(s => $(s).classList.add('hidden'));
  $(id).classList.remove('hidden');
}

function setMsg(id, text, isErr = true) {
  const el = $(id);
  el.textContent = text;
  el.className = 'msg-text' + (isErr ? '' : ' ok');
}

function translateError(msg) {
  if (!msg) return t('loginFail');
  if (msg.includes('Invalid login')) return t('loginFail');
  if (msg.includes('already registered')) return t('exists');
  if (msg.includes('Password should')) return t('pwInvalid');
  return msg;
}

function validPassword(p) {
  return p.length >= 8 && /[a-z]/.test(p) && /[A-Z]/.test(p) && /\d/.test(p) && /[^A-Za-z0-9]/.test(p);
}

function scrollBottom() {
  const el = $('messages');
  el.scrollTop = el.scrollHeight;
}

function isMediaType(tp) {
  return !!tp && (tp.startsWith('image/') || tp.startsWith('video/') || tp.startsWith('audio/'));
}

function extractLinks(text) {
  return (text || '').match(/https?:\/\/[^\s]+/g) || [];
}

function fileName(url) {
  try { return decodeURIComponent(url.split('/').pop().split('?')[0]); }
  catch { return 'file'; }
}

function refreshUserLabel() {
  if (!currentProfile) return;
  const name = currentProfile.display_name || t('userDefault');
  $('user-label').textContent = `${name} (${currentProfile.role})`;
}

async function uploadAvatar(file, userId) {
  const ext = (file.name.split('.').pop() || 'jpg').replace(/[^\w]/g, '');
  const path = `${userId}/avatar_${Date.now()}.${ext}`;
  const { error } = await sb.storage.from('uploads').upload(path, file, { contentType: file.type });
  if (error) throw new Error(error.message);
  const { data } = sb.storage.from('uploads').getPublicUrl(path);
  const { error: e2 } = await sb.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', userId);
  if (e2) throw new Error(e2.message);
  return data.publicUrl;
}

// ---------- شاشة الدخول ----------
document.querySelectorAll('.auth-tab').forEach(tb => {
  tb.onclick = () => setAuthMode(tb.dataset.mode);
});

function setAuthMode(mode) {
  authMode = mode;
  document.querySelectorAll('.auth-tab').forEach(tb => tb.classList.toggle('active', tb.dataset.mode === mode));
  $('auth-submit').textContent = mode === 'login' ? t('login') : t('createAccount');
  $('forgot-btn').classList.toggle('hidden', mode !== 'login');
  $('signup-box').classList.toggle('hidden', mode !== 'signup');
  setMsg('auth-msg', '');
}

$('signup-avatar-input').onchange = () => {
  const file = $('signup-avatar-input').files[0];
  if (!file) return;
  const pv = $('signup-preview');
  pv.src = URL.createObjectURL(file);
  pv.classList.remove('hidden');
};

$('auth-submit').onclick = async () => {
  const email = $('email').value.trim();
  const password = $('password').value;
  if (!email || !password) return setMsg('auth-msg', t('emailPwReq'));

  if (authMode === 'login') {
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) setMsg('auth-msg', translateError(error.message));
    return;
  }

  // إنشاء حساب
  if (!validPassword(password)) return setMsg('auth-msg', t('pwInvalid'));
  const file = $('signup-avatar-input').files[0];
  if (!file) return setMsg('auth-msg', t('avatarReq'));

  signingUp = true;
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) {
    signingUp = false;
    return setMsg('auth-msg', translateError(error.message));
  }
  if (!data.session) {
    signingUp = false;
    setAuthMode('login');
    return setMsg('auth-msg', t('checkEmail'), false);
  }
  try {
    await uploadAvatar(file, data.user.id);
  } catch (e) {
    signingUp = false;
    return setMsg('auth-msg', t('avatarFail') + e.message);
  }
  signingUp = false;
  await enterChat(data.user.id);
};

$('password').addEventListener('keydown', e => {
  if (e.key === 'Enter') $('auth-submit').click();
});

$('forgot-btn').onclick = async () => {
  const email = $('email').value.trim();
  if (!email) return setMsg('auth-msg', t('emailReq'));
  const redirectTo = window.location.origin + window.location.pathname;
  const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) setMsg('auth-msg', error.message);
  else setMsg('auth-msg', t('resetSent'), false);
};

// ---------- التواصل ----------
$('contact-open').onclick = () => $('contact-modal').classList.remove('hidden');
$('contact-close').onclick = () => $('contact-modal').classList.add('hidden');
$('contact-send').onclick = () => {
  const text = $('contact-msg').value.trim();
  const subject = encodeURIComponent(t('contactSubject'));
  const body = encodeURIComponent(text);
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
};

// ---------- تغيير الباسورد بعد اللينك ----------
$('recovery-btn').onclick = async () => {
  const pw = $('new-password').value;
  if (!validPassword(pw)) return setMsg('rec-msg', t('pwInvalid'));
  const { error } = await sb.auth.updateUser({ password: pw });
  if (error) return setMsg('rec-msg', error.message);
  recovering = false;
  $('new-password').value = '';
  alert(t('pwChanged'));
  const { data } = await sb.auth.getSession();
  if (data.session) await enterChat(data.session.user.id);
  else showScreen('auth-screen');
};

// ---------- حالة الجلسة ----------
sb.auth.onAuthStateChange(async (event, session) => {
  if (event === 'PASSWORD_RECOVERY') {
    recovering = true;
    showScreen('recovery-screen');
    return;
  }
  if (recovering || signingUp) return;
  if (session) {
    await enterChat(session.user.id);
  } else {
    currentProfile = null;
    $('avatar-gate').classList.add('hidden');
    showScreen('auth-screen');
  }
});

async function enterChat(userId) {
  const ok = await loadProfile(userId);
  if (!ok) return;

  if (!currentProfile.avatar_url) {
    showScreen('auth-screen');
    $('avatar-gate').classList.remove('hidden');
    return;
  }

  $('avatar-gate').classList.add('hidden');
  showScreen('chat-screen');
  await loadMessages();
  subscribeToMessages();
}

// بوابة صورة البروفايل للحسابات اللي مفيهاش صورة
$('gate-save').onclick = async () => {
  const file = $('gate-input').files[0];
  if (!file) return setMsg('gate-msg', t('avatarReq'));
  try {
    await uploadAvatar(file, currentProfile.id);
  } catch (e) {
    return setMsg('gate-msg', t('avatarFail') + e.message);
  }
  await enterChat(currentProfile.id);
};

$('logout-btn') && null;

// ---------- البروفايل ----------
async function loadProfile(userId) {
  const { data, error } = await sb.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error || !data) {
    setMsg('auth-msg', error ? t('profileFail') : t('noProfile'));
    await sb.auth.signOut();
    return false;
  }

  currentProfile = data;
  const canWrite = data.role === 'admin' || data.role === 'sender';
  refreshUserLabel();

  const av = $('my-avatar');
  if (data.avatar_url) {
    av.src = data.avatar_url;
    av.hidden = false;
  } else {
    av.hidden = true;
  }

  $('msg-input').disabled = !canWrite;
  $('send-btn').disabled = !canWrite;
  $('attach-btn').disabled = !canWrite;
  $('cam-btn').disabled = !canWrite;
  $('mic-btn').disabled = !canWrite;
  return true;
}

// ---------- الإعدادات ----------
$('settings-btn').onclick = () => {
  $('set-admin').classList.toggle('hidden', !(currentProfile && currentProfile.role === 'admin'));
  $('settings-modal').classList.remove('hidden');
};
$('settings-close').onclick = () => $('settings-modal').classList.add('hidden');

$('set-avatar').onclick = () => {
  $('settings-modal').classList.add('hidden');
  $('avatar-input').click();
};

$('avatar-input').onchange = async () => {
  const file = $('avatar-input').files[0];
  if (!file || !currentProfile) return;
  try {
    await uploadAvatar(file, currentProfile.id);
    await loadProfile(currentProfile.id);
    await loadMessages();
    alert(t('avatarSaved'));
  } catch (e) {
    alert(t('avatarFail') + e.message);
  }
  $('avatar-input').value = '';
};

$('set-name').onclick = async () => {
  $('settings-modal').classList.add('hidden');
  if (!currentProfile) return;
  const name = prompt(t('nameAsk'), currentProfile.display_name || '');
  if (!name || !name.trim()) return;
  const { error } = await sb.from('profiles').update({ display_name: name.trim() }).eq('id', currentProfile.id);
  if (error) return alert(t('nameFail') + error.message);
  await loadProfile(currentProfile.id);
  await loadMessages();
};

$('set-history').onclick = () => {
  $('settings-modal').classList.add('hidden');
  $('history-modal').classList.remove('hidden');
  renderHistory();
};

$('set-admin').onclick = async () => {
  $('settings-modal').classList.add('hidden');
  $('admin-modal').classList.remove('hidden');
  await loadUsers();
};
$('admin-close').onclick = () => $('admin-modal').classList.add('hidden');

$('set-search').onclick = () => {
  $('settings-modal').classList.add('hidden');
  openSearch();
};

$('set-logout').onclick = () => {
  $('settings-modal').classList.add('hidden');
  sb.auth.signOut();
};

// ---------- الرسايل ----------
function renderMessage(m) {
  msgById.set(m.id, m);
  if (document.querySelector(`.msg[data-id="${m.id}"]`)) return;

  const div = document.createElement('div');
  div.className = 'msg' + (currentProfile && m.user_id === currentProfile.id ? ' mine' : '');
  div.dataset.id = m.id;

  const avatar = m.profiles?.avatar_url
    ? `<img class="msg-avatar" src="${esc(m.profiles.avatar_url)}" alt="">`
    : '';
  const time = new Date(m.created_at).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US');

  let html = `<button class="dots" data-id="${m.id}">⋮</button>`;
  html += `<div class="meta">${avatar}${esc(m.profiles?.display_name || '?')} · ${time}</div>`;
  if (m.content) html += `<div>${esc(m.content)}</div>`;

  if (m.file_url) {
    const tp = m.file_type || '';
    if (tp.startsWith('image/')) {
      html += `<img src="${esc(m.file_url)}" alt="">`;
    } else if (tp.startsWith('video/')) {
      html += `<video src="${esc(m.file_url)}" controls playsinline></video>`;
    } else if (tp.startsWith('audio/')) {
      html += `<audio src="${esc(m.file_url)}" controls preload="metadata"></audio>`;
    } else {
      html += `<a href="${esc(m.file_url)}" target="_blank">📄 ${esc(fileName(m.file_url))}</a>`;
    }
  }

  div.innerHTML = html;
  $('messages').appendChild(div);
}

function removeMessageEl(id) {
  const el = document.querySelector(`.msg[data-id="${id}"]`);
  if (el) el.remove();
  msgById.delete(id);
}

async function loadMessages() {
  const { data, error } = await sb.from('messages')
    .select('*, profiles(display_name, avatar_url)')
    .order('created_at', { ascending: true })
    .limit(300);
  if (error) {
    alert(t('loadFail') + error.message);
    return;
  }
  $('messages').innerHTML = '';
  msgById = new Map();
  data.forEach(renderMessage);
  scrollBottom();
}

async function sendMessage(fileUrl = null, fileType = null) {
  if (!currentProfile) return;
  const content = $('msg-input').value.trim();
  if (!content && !fileUrl) return;

  const { error } = await sb.from('messages').insert({
    user_id: currentProfile.id,
    content: content || null,
    file_url: fileUrl,
    file_type: fileType
  });
  if (error) return alert(t('sendFail') + error.message);
  $('msg-input').value = '';
}

$('send-btn').onclick = () => sendMessage();
$('msg-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
});

// ---------- رفع الملفات ----------
$('attach-btn').onclick = () => $('file-input').click();

$('file-input').onchange = async () => {
  const file = $('file-input').files[0];
  if (!file || !currentProfile) return;

  const safeName = file.name.replace(/[^\w.\-]/g, '_');
  const path = `${currentProfile.id}/${Date.now()}_${safeName}`;
  const { error } = await sb.storage.from('uploads').upload(path, file, { contentType: file.type });
  if (error) return alert(t('uploadFail') + error.message);

  const { data } = sb.storage.from('uploads').getPublicUrl(path);
  await sendMessage(data.publicUrl, file.type);
  $('file-input').value = '';
};

// ---------- الكاميرا ----------
async function openCamera() {
  try {
    camStream = await navigator.mediaDevices.getUserMedia({ video: true });
    $('cam-video').srcObject = camStream;
    $('cam-modal').classList.remove('hidden');
  } catch (err) {
    alert(t('camFail') + err.message);
  }
}

function closeCamera() {
  if (camStream) camStream.getTracks().forEach(tr => tr.stop());
  camStream = null;
  $('cam-video').srcObject = null;
  $('cam-modal').classList.add('hidden');
}

$('cam-btn').onclick = openCamera;
$('cam-close').onclick = closeCamera;

$('cam-snap').onclick = () => {
  const video = $('cam-video');
  const canvas = $('cam-canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);

  canvas.toBlob(async blob => {
    if (!blob || !currentProfile) return;
    const path = `${currentProfile.id}/${Date.now()}_photo.jpg`;
    const { error } = await sb.storage.from('uploads').upload(path, blob, { contentType: 'image/jpeg' });
    if (error) return alert(t('uploadFail') + error.message);
    const { data } = sb.storage.from('uploads').getPublicUrl(path);
    await sendMessage(data.publicUrl, 'image/jpeg');
    closeCamera();
  }, 'image/jpeg', 0.9);
};

// ---------- الميكروفون ----------
$('mic-btn').onclick = async () => {
  if (recorder && recorder.state === 'recording') {
    recorder.stop();
    $('mic-btn').textContent = '🎙️';
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(stream);
    chunks = [];
    recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    recorder.onstop = async () => {
      stream.getTracks().forEach(tr => tr.stop());
      const type = recorder.mimeType || 'audio/webm';
      const ext = type.includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(chunks, { type });
      const path = `${currentProfile.id}/${Date.now()}_voice.${ext}`;
      const { error } = await sb.storage.from('uploads').upload(path, blob, { contentType: type });
      if (error) return alert(t('uploadFail') + error.message);
      const { data } = sb.storage.from('uploads').getPublicUrl(path);
      await sendMessage(data.publicUrl, type);
    };
    recorder.start();
    $('mic-btn').textContent = '⏹️';
  } catch (err) {
    alert(t('micFail') + err.message);
  }
};

// ---------- الثلاث نقط ----------
$('messages').addEventListener('click', e => {
  const btn = e.target.closest('.dots');
  if (!btn) return;
  e.stopPropagation();

  menuMsgId = Number(btn.dataset.id);
  const m = msgById.get(menuMsgId);
  const canDelete = currentProfile && m &&
    (m.user_id === currentProfile.id || currentProfile.role === 'admin');
  $('menu-delete').classList.toggle('hidden', !canDelete);

  const r = btn.getBoundingClientRect();
  const menu = $('msg-menu');
  menu.classList.remove('hidden');
  menu.style.top = (r.bottom + 4) + 'px';
  menu.style.left = Math.max(8, r.left - 110) + 'px';
});

document.addEventListener('click', () => $('msg-menu').classList.add('hidden'));
$('msg-menu').addEventListener('click', e => e.stopPropagation());

$('menu-copy').onclick = async () => {
  const m = msgById.get(menuMsgId);
  $('msg-menu').classList.add('hidden');
  if (!m) return;
  try {
    await navigator.clipboard.writeText(m.content || m.file_url || '');
  } catch {
    alert(t('copyFail'));
  }
};

$('menu-search').onclick = () => {
  $('msg-menu').classList.add('hidden');
  openSearch();
};

$('menu-delete').onclick = () => {
  $('msg-menu').classList.add('hidden');
  if (menuMsgId) deleteMessage(menuMsgId);
};

async function deleteMessage(id) {
  if (!confirm(t('deleteAsk'))) return;
  const { error } = await sb.from('messages').delete().eq('id', id);
  if (error) return alert(t('deleteFail') + error.message);
  removeMessageEl(id);
}

// ---------- البحث ----------
function openSearch() {
  $('search-bar').classList.remove('hidden');
  $('search-input').focus();
}

function closeSearch() {
  $('search-bar').classList.add('hidden');
  $('search-input').value = '';
  filterMessages('');
}

function filterMessages(q) {
  q = q.trim().toLowerCase();
  document.querySelectorAll('#messages .msg').forEach(el => {
    el.style.display = !q || el.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

$('search-close').onclick = closeSearch;
$('search-input').addEventListener('input', e => filterMessages(e.target.value));

// ---------- السجل ----------
$('history-close').onclick = () => $('history-modal').classList.add('hidden');

document.querySelectorAll('.tab').forEach(tb => {
  tb.onclick = () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    tb.classList.add('active');
    activeTab = tb.dataset.tab;
    renderHistory();
  };
});

function renderHistory() {
  const list = $('history-list');
  list.innerHTML = '';
  const items = [];

  for (const m of msgById.values()) {
    const who = m.profiles?.display_name || '?';
    const date = new Date(m.created_at);

    if (activeTab === 'links') {
      extractLinks(m.content).forEach(u => items.push({ title: u, url: u, who, date }));
    } else if (activeTab === 'docs') {
      if (m.file_url && !isMediaType(m.file_type))
        items.push({ title: '📄 ' + fileName(m.file_url), url: m.file_url, who, date });
    } else if (m.file_url && isMediaType(m.file_type)) {
      const tp = m.file_type;
      const title = tp.startsWith('image/') ? '🖼️ ' + t('image')
                  : tp.startsWith('audio/') ? '🎙️ ' + t('audio') : '🎬 ' + t('video');
      items.push({ title, url: m.file_url, who, date });
    }
  }

  items.sort((a, b) => b.date - a.date);

  if (!items.length) {
    list.innerHTML = `<p class="empty">${t('noRows')}</p>`;
    return;
  }

  items.forEach(it => {
    const a = document.createElement('a');
    a.href = it.url;
    a.target = '_blank';
    a.className = 'hist-item';
    a.innerHTML = `<b>${esc(it.title)}</b><span>${esc(it.who)} · ${it.date.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}</span>`;
    list.appendChild(a);
  });
}

// ---------- الوقت الفعلي ----------
function subscribeToMessages() {
  if (subscribed) return;
  subscribed = true;

  sb.channel('messages-channel')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async payload => {
      const { data } = await sb.from('messages')
        .select('*, profiles(display_name, avatar_url)')
        .eq('id', payload.new.id)
        .maybeSingle();
      if (data) {
        renderMessage(data);
        scrollBottom();
      }
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, payload => {
      removeMessageEl(payload.old.id);
    })
    .subscribe();
}

// ---------- لوحة الأدمن ----------
async function loadUsers() {
  const { data, error } = await sb.from('profiles').select('*').order('created_at');
  if (error) return alert(error.message);

  const box = $('users-list');
  box.innerHTML = '';

  data.forEach(p => {
    const row = document.createElement('div');
    row.className = 'user-row';
    row.innerHTML = `<span>${esc(p.display_name || p.id.slice(0, 8))}</span>`;

    const sel = document.createElement('select');
    ['admin', 'sender', 'viewer'].forEach(r => {
      const opt = document.createElement('option');
      opt.value = r;
      opt.textContent = r;
      if (r === p.role) opt.selected = true;
      sel.appendChild(opt);
    });

    sel.onchange = async () => {
      const { error } = await sb.from('profiles').update({ role: sel.value }).eq('id', p.id);
      if (error) alert(error.message);
      else await loadUsers();
    };

    row.appendChild(sel);
    box.appendChild(row);
  });
}

// ---------- بدء التطبيق ----------
applyI18n();