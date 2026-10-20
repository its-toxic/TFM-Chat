const SUPABASE_URL = 'https://jifoamltmdgpawpjgrbz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_IiaTAO0BNUJTp_pzVidhhA_e1g82vpi';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const CONTACT_EMAIL = 'its.toxic0807@gmail.com';

let currentProfile = null;
let subscribed = false;
let msgById = new Map();
let menuMsgId = null;
let activeTab = 'links';
let authMode = 'login';
let recovering = false;
let camStream = null;
let recorder = null;
let chunks = [];

const $ = id => document.getElementById(id);

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
  if (!msg) return 'حصل خطأ';
  if (msg.includes('Invalid login')) return 'الإيميل أو الباسورد غلط';
  if (msg.includes('already registered')) return 'الإيميل ده متسجل قبل كده';
  if (msg.includes('Password should')) return 'الباسورد لازم يكون 6 حروف أو أكتر';
  return msg;
}

function scrollBottom() {
  const el = $('messages');
  el.scrollTop = el.scrollHeight;
}

function isMediaType(t) {
  return !!t && (t.startsWith('image/') || t.startsWith('video/') || t.startsWith('audio/'));
}

function extractLinks(text) {
  return (text || '').match(/https?:\/\/[^\s]+/g) || [];
}

function fileName(url) {
  try {
    return decodeURIComponent(url.split('/').pop().split('?')[0]);
  } catch {
    return 'file';
  }
}

// ---------- زرار القايمة على الموبايل ----------
$('menu-toggle').onclick = () => $('header-extra').classList.toggle('collapsed');
$('header-extra').classList.add('collapsed');

// ---------- شاشة الدخول ----------
document.querySelectorAll('.auth-tab').forEach(t => {
  t.onclick = () => setAuthMode(t.dataset.mode);
});

function setAuthMode(mode) {
  authMode = mode;
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
  $('auth-submit').textContent = mode === 'login' ? 'دخول' : 'إنشاء حساب';
  $('forgot-btn').classList.toggle('hidden', mode !== 'login');
  setMsg('auth-msg', '');
}

$('auth-submit').onclick = async () => {
  const email = $('email').value.trim();
  const password = $('password').value;
  if (!email || !password) return setMsg('auth-msg', 'اكتب الإيميل والباسورد');

  if (authMode === 'login') {
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) setMsg('auth-msg', translateError(error.message));
    return;
  }

  if (password.length < 6) return setMsg('auth-msg', 'الباسورد لازم يكون 6 حروف أو أكتر');
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) return setMsg('auth-msg', translateError(error.message));
  if (data.session) return;

  setAuthMode('login');
  setMsg('auth-msg', 'الحساب اتعمل، سجّل دخول دلوقتي', false);
};

$('password').addEventListener('keydown', e => {
  if (e.key === 'Enter') $('auth-submit').click();
});

$('forgot-btn').onclick = async () => {
  const email = $('email').value.trim();
  if (!email) return setMsg('auth-msg', 'اكتب إيميلك الأول');
  const redirectTo = window.location.origin + window.location.pathname;
  const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) setMsg('auth-msg', error.message);
  else setMsg('auth-msg', 'بعتنالك لينك تغيير الباسورد على الإيميل', false);
};

// ---------- التواصل والشكاوي ----------
$('contact-open').onclick = () => $('contact-modal').classList.remove('hidden');
$('contact-close').onclick = () => $('contact-modal').classList.add('hidden');

$('contact-send').onclick = () => {
  const text = $('contact-msg').value.trim();
  const subject = encodeURIComponent('TFM Chat - تواصل وشكوى');
  const body = encodeURIComponent(text || '');
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
};

// ---------- تغيير الباسورد بعد اللينك ----------
$('recovery-btn').onclick = async () => {
  const pw = $('new-password').value;
  if (pw.length < 6) return setMsg('rec-msg', 'الباسورد لازم يكون 6 حروف أو أكتر');
  const { error } = await sb.auth.updateUser({ password: pw });
  if (error) return setMsg('rec-msg', error.message);

  recovering = false;
  $('new-password').value = '';
  alert('تم تغيير الباسورد');
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
  if (recovering) return;

  if (session) {
    await enterChat(session.user.id);
  } else {
    currentProfile = null;
    showScreen('auth-screen');
  }
});

$('logout-btn').onclick = () => sb.auth.signOut();

async function enterChat(userId) {
  const ok = await loadProfile(userId);
  if (!ok) return;
  showScreen('chat-screen');
  await loadMessages();
  subscribeToMessages();
}

// ---------- تغيير الاسم ----------
$('name-btn').onclick = async () => {
  if (!currentProfile) return;
  const name = prompt('اكتب الاسم الجديد:', currentProfile.display_name || '');
  if (!name || !name.trim()) return;
  const { error } = await sb.from('profiles')
    .update({ display_name: name.trim() })
    .eq('id', currentProfile.id);
  if (error) return alert('فشل التغيير: ' + error.message);
  await loadProfile(currentProfile.id);
  await loadMessages();
};

// ---------- صورة البروفايل ----------
$('avatar-btn').onclick = () => $('avatar-input').click();

$('avatar-input').onchange = async () => {
  const file = $('avatar-input').files[0];
  if (!file || !currentProfile) return;

  const ext = (file.name.split('.').pop() || 'jpg').replace(/[^\w]/g, '');
  const path = `${currentProfile.id}/avatar_${Date.now()}.${ext}`;
  const { error } = await sb.storage.from('uploads').upload(path, file, {
    contentType: file.type, upsert: true
  });
  if (error) return alert('فشل رفع الصورة: ' + error.message);

  const { data } = sb.storage.from('uploads').getPublicUrl(path);
  const { error: upErr } = await sb.from('profiles')
    .update({ avatar_url: data.publicUrl })
    .eq('id', currentProfile.id);
  if (upErr) return alert('فشل الحفظ: ' + upErr.message);

  await loadProfile(currentProfile.id);
  await loadMessages();
  $('avatar-input').value = '';
};

// ---------- البروفايل ----------
async function loadProfile(userId) {
  const { data, error } = await sb.from('profiles')
    .select('*').eq('id', userId).maybeSingle();

  if (error || !data) {
    setMsg('auth-msg', error ? 'خطأ في تحميل البروفايل' : 'مفيش بروفايل للحساب ده');
    await sb.auth.signOut();
    return false;
  }

  currentProfile = data;
  const canWrite = data.role === 'admin' || data.role === 'sender';

  $('user-label').textContent = `${data.display_name || 'مستخدم'} (${data.role})`;

  const av = $('my-avatar');
  if (data.avatar_url) {
    av.src = data.avatar_url;
    av.hidden = false;
  } else {
    av.hidden = true;
  }

  $('admin-toggle').classList.toggle('hidden', data.role !== 'admin');
  $('msg-input').disabled = !canWrite;
  $('send-btn').disabled = !canWrite;
  $('attach-btn').disabled = !canWrite;
  $('cam-btn').disabled = !canWrite;
  $('mic-btn').disabled = !canWrite;
  return true;
}

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

  let html = `<button class="dots" data-id="${m.id}">⋮</button>`;
  html += `<div class="meta">${avatar}${esc(m.profiles?.display_name || '?')} · ${new Date(m.created_at).toLocaleTimeString('ar-EG')}</div>`;
  if (m.content) html += `<div>${esc(m.content)}</div>`;

  if (m.file_url) {
    const t = m.file_type || '';
    if (t.startsWith('image/')) {
      html += `<img src="${esc(m.file_url)}" alt="">`;
    } else if (t.startsWith('video/')) {
      html += `<video src="${esc(m.file_url)}" controls playsinline></video>`;
    } else if (t.startsWith('audio/')) {
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
    alert('فشل تحميل الرسايل: ' + error.message);
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
  if (error) {
    alert('فشل الإرسال: ' + error.message);
    return;
  }
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
  if (error) {
    alert('فشل الرفع: ' + error.message);
    return;
  }

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
    alert('ما قدرتش أفتح الكاميرا: ' + err.message);
  }
}

function closeCamera() {
  if (camStream) camStream.getTracks().forEach(t => t.stop());
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
    if (error) return alert('فشل الرفع: ' + error.message);
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
      stream.getTracks().forEach(t => t.stop());
      const type = recorder.mimeType || 'audio/webm';
      const ext = type.includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(chunks, { type });
      const path = `${currentProfile.id}/${Date.now()}_voice.${ext}`;
      const { error } = await sb.storage.from('uploads').upload(path, blob, { contentType: type });
      if (error) return alert('فشل رفع الصوت: ' + error.message);
      const { data } = sb.storage.from('uploads').getPublicUrl(path);
      await sendMessage(data.publicUrl, type);
    };
    recorder.start();
    $('mic-btn').textContent = '⏹️';
  } catch (err) {
    alert('ما قدرتش أفتح الميكروفون: ' + err.message);
  }
};

// ---------- الثلاث نقط ----------
$('messages').addEventListener('click', e => {
  const btn = e.target.closest('.dots');
  if (!btn) return;
  e.stopPropagation();

  menuMsgId = Number(btn.dataset.id);
  const m = msgById.get(menuMsgId);
  const canDelete = currentProfile &&
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
    alert('ما قدرتش أنسخ الرسالة');
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
  if (!confirm('تمسح الرسالة دي؟')) return;
  const { error } = await sb.from('messages').delete().eq('id', id);
  if (error) {
    alert('فشل المسح: ' + error.message);
    return;
  }
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

$('search-btn').onclick = () => {
  $('search-bar').classList.contains('hidden') ? openSearch() : closeSearch();
};
$('search-close').onclick = closeSearch;
$('search-input').addEventListener('input', e => filterMessages(e.target.value));

// ---------- السجل ----------
$('history-btn').onclick = () => {
  $('history-modal').classList.remove('hidden');
  renderHistory();
};
$('history-close').onclick = () => $('history-modal').classList.add('hidden');

document.querySelectorAll('.tab').forEach(t => {
  t.onclick = () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    activeTab = t.dataset.tab;
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
    } else {
      if (m.file_url && isMediaType(m.file_type)) {
        const t = m.file_type;
        const title = t.startsWith('image/') ? '🖼️ Image'
                    : t.startsWith('audio/') ? '🎙️ Audio' : '🎬 Video';
        items.push({ title, url: m.file_url, who, date });
      }
    }
  }

  items.sort((a, b) => b.date - a.date);

  if (!items.length) {
    list.innerHTML = '<p class="empty">Nothing here yet</p>';
    return;
  }

  items.forEach(it => {
    const a = document.createElement('a');
    a.href = it.url;
    a.target = '_blank';
    a.className = 'hist-item';
    a.innerHTML = `<b>${esc(it.title)}</b><span>${esc(it.who)} · ${it.date.toLocaleString('ar-EG')}</span>`;
    list.appendChild(a);
  });
}

// ---------- الوقت الفعلي (إضافة + مسح) ----------
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
$('admin-toggle').onclick = async () => {
  const panel = $('admin-panel');
  panel.classList.toggle('hidden');
  if (!panel.classList.contains('hidden')) await loadUsers();
};

async function loadUsers() {
  const { data, error } = await sb.from('profiles').select('*').order('created_at');
  if (error) {
    alert(error.message);
    return;
  }

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