// ---------- زعبوله: مساعد الذكاء الاصطناعي ----------

const AI_ICON = '<img src="ai-icon.png" alt="زعبوله">';
const AI_MAX_FILE = 5 * 1024 * 1024;
const AI_BOOK_MAX = 50 * 1024 * 1024;
const AI_MIME = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif'];
const ROOMS = ['ar-1', 'ar-2', 'ar-3', 'ar-4', 'en-1', 'en-2', 'en-3', 'en-4'];

let aiRoom = null;
let aiBusy = false;
let aiPending = null;
let aiLangMode = localStorage.getItem('aiLang') || lang;

$('ai-open').innerHTML = AI_ICON;
document.querySelectorAll('.ai-avatar').forEach(el => { el.innerHTML = AI_ICON; });

function aiRoomTitle(room) {
  const parts = room.split('-');
  const trk = parts[0] === 'ar' ? t('trkAr') : t('trkEn');
  const lvl = t('lvl' + parts[1]);
  return `${trk} · ${lvl}`;
}

function greetingText() {
  return lang === 'en'
    ? "Hi! I'm Zaboula, your AI assistant 🤖\nWrite to me in English, Arabic or any language. I can explain, solve problems, search the web, and review PDFs or images you send me.\n\n⚠️ Note: this chat is deleted if you leave it for one hour without sending any message."
    : 'مرحبا! أنا زعبوله، مساعد الذكاء الاصطناعي الخاص بيك 🤖\nكلمني بالمصري أو بالإنجليزي أو أي لغة. أقدر أشرح وأحل وأبحث على النت، وتبعتلي PDF أو صورة وأنا أحللها أو أعدّلها لك.\n\n⚠️ ملحوظة: الشات ده هيتمسح لو طلعت برا الشات لمدة ساعة من غير ما تبعت أي رسالة.';
}

function appendAiBubble(role, text, extra = '') {
  const box = $('ai-messages');
  const div = document.createElement('div');
  div.className = 'ai-msg ' + (role === 'user' ? 'mine' : 'bot') + (extra ? ' ' + extra : '');
  div.textContent = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
  return div;
}

function applyAiLabels() {
  $('ai-room-label').textContent = aiRoom ? aiRoomTitle(aiRoom) : '';
  $('ai-back-text').textContent = lang === 'en' ? 'Back' : 'رجوع';
  $('ai-lang').textContent = aiLangMode === 'en' ? 'عربي' : 'EN';
  $('ai-input').placeholder = lang === 'en' ? 'Write to Zaboula...' : 'اكتب لزعبوله...';
  $('ai-attach').title = lang === 'en' ? 'Attach a PDF or image' : 'ارفع PDF أو صورة';
}

async function renderAiHistory() {
  const box = $('ai-messages');
  box.innerHTML = '';

  const { data, error } = await sb.from('ai_messages')
    .select('role, content')
    .eq('room', aiRoom)
    .order('id', { ascending: true })
    .limit(200);

  if (error) {
    appendAiBubble('model', '⚠️ ' + error.message);
    return;
  }

  if (!data || !data.length) {
    appendAiBubble('model', greetingText());
    return;
  }

  data.forEach(m => appendAiBubble(m.role === 'user' ? 'user' : 'model', m.content));
  box.scrollTop = box.scrollHeight;
}

async function openAiChat(room) {
  aiRoom = room;
  $('ai-chat-screen').classList.remove('hidden');
  applyAiLabels();
  await renderAiHistory();
}

function closeAiScreen() {
  $('ai-chat-screen').classList.add('hidden');
}

function readFileB64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1]);
    r.onerror = () => reject(new Error('read failed'));
    r.readAsDataURL(file);
  });
}

function clearAiFile() {
  aiPending = null;
  $('ai-file-name').textContent = '';
  $('ai-file-name').classList.add('hidden');
}

async function aiSend() {
  if (aiBusy || !aiRoom) return;
  const text = $('ai-input').value.trim();
  if (!text && !aiPending) return;

  const shown = (text + (aiPending ? `\n📎 ${aiPending.name}` : '')).trim();
  appendAiBubble('user', shown);

  const payload = { room: aiRoom, message: text, lang: aiLangMode };
  if (aiPending) {
    payload.file = { name: aiPending.name, mime: aiPending.mime, data: aiPending.data };
  }

  $('ai-input').value = '';
  clearAiFile();

  aiBusy = true;
  $('ai-send').disabled = true;
  const thinking = appendAiBubble('model', lang === 'en' ? 'Zaboula is thinking...' : 'زعبوله بيفكر...', 'thinking');

  try {
    const { data: sess } = await sb.auth.getSession();
    const token = sess.session ? sess.session.access_token : null;
    if (!token) throw new Error(lang === 'en' ? 'Please log in again' : 'سجّل دخول تاني');

    const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_KEY
      },
      body: JSON.stringify(payload)
    });

    const j = await res.json().catch(() => ({}));
    thinking.remove();
    if (!res.ok) throw new Error(j.error || ('Error ' + res.status));
    appendAiBubble('model', j.reply);
  } catch (e) {
    thinking.remove();
    appendAiBubble('model', '⚠️ ' + e.message);
  } finally {
    aiBusy = false;
    $('ai-send').disabled = false;
  }
}

// ---------- كتب زعبوله (الأدمن) ----------
async function loadAiBooksAdmin() {
  const box = $('ai-books-admin');
  box.innerHTML = '';

  const title = document.createElement('h3');
  title.textContent = lang === 'en' ? '📚 Zaboula books' : '📚 كتب زعبوله';
  box.appendChild(title);

  const form = document.createElement('div');
  form.className = 'ai-book-form';

  const sel = document.createElement('select');
  ROOMS.forEach(r => {
    const o = document.createElement('option');
    o.value = r;
    o.textContent = aiRoomTitle(r);
    sel.appendChild(o);
  });

  const file = document.createElement('input');
  file.type = 'file';
  file.accept = 'application/pdf';

  const up = document.createElement('button');
  up.type = 'button';
  up.className = 'primary';
  up.textContent = lang === 'en' ? 'Upload book' : 'ارفع الكتاب';
  up.onclick = () => uploadBook(sel.value, file);

  form.appendChild(sel);
  form.appendChild(file);
  form.appendChild(up);
  box.appendChild(form);

  const list = document.createElement('div');
  list.className = 'ai-book-list';
  box.appendChild(list);

  const { data, error } = await sb.from('ai_books').select('id, room, title, path').order('id', { ascending: true });
  if (error) {
    list.textContent = error.message;
    return;
  }
  if (!data || !data.length) {
    list.textContent = lang === 'en' ? 'No books yet' : 'مفيش كتب لسه';
    return;
  }

  data.forEach(b => {
    const row = document.createElement('div');
    row.className = 'ai-book-row';
    const info = document.createElement('span');
    info.textContent = `${aiRoomTitle(b.room)} · ${b.title}`;
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'danger-btn';
    del.textContent = '🗑️';
    del.onclick = () => deleteBook(b);
    row.appendChild(info);
    row.appendChild(del);
    list.appendChild(row);
  });
}

async function uploadBook(room, fileInput) {
  const f = fileInput.files[0];
  if (!f) return alert(lang === 'en' ? 'Choose a PDF first' : 'اختار ملف PDF الأول');
  if (f.type !== 'application/pdf') return alert(lang === 'en' ? 'PDF files only' : 'PDF بس');
  if (f.size > AI_BOOK_MAX) return alert(lang === 'en' ? 'Max 50 MB' : 'أقصى حجم 50 ميجا');

  const safeName = f.name.replace(/[^\w.\-]/g, '_');
  const path = `${room}/${Date.now()}_${safeName}`;

  const { error: upErr } = await sb.storage.from('books').upload(path, f, { contentType: 'application/pdf' });
  if (upErr) return alert(upErr.message);

  const { error } = await sb.from('ai_books').insert({ room, title: f.name, path, size_bytes: f.size });
  if (error) return alert(error.message);

  fileInput.value = '';
  await loadAiBooksAdmin();
}

async function deleteBook(b) {
  if (!confirm(lang === 'en' ? 'Delete this book?' : 'تمسح الكتاب ده؟')) return;
  const { error: stErr } = await sb.storage.from('books').remove([b.path]);
  if (stErr) return alert(stErr.message);
  const { error } = await sb.from('ai_books').delete().eq('id', b.id);
  if (error) return alert(error.message);
  await loadAiBooksAdmin();
}

// ---------- الأحداث ----------
$('ai-open').onclick = () => openAiChat(currentRoom());

$('ai-chat-back').onclick = closeAiScreen;

$('ai-lang').onclick = () => {
  aiLangMode = aiLangMode === 'en' ? 'ar' : 'en';
  localStorage.setItem('aiLang', aiLangMode);
  applyAiLabels();
};

$('ai-clear').onclick = async () => {
  if (!aiRoom) return;
  if (!confirm(lang === 'en' ? 'Clear this chat?' : 'تمسح المحادثة دي؟')) return;
  const { error } = await sb.from('ai_messages').delete().eq('room', aiRoom);
  if (error) return alert(error.message);
  await renderAiHistory();
};

$('ai-attach').onclick = () => $('ai-file').click();

$('ai-file').onchange = async () => {
  const f = $('ai-file').files[0];
  $('ai-file').value = '';
  if (!f) return;

  if (!AI_MIME.includes(f.type)) {
    return alert(lang === 'en' ? 'Only PDF or image files are supported' : 'الملفات المدعومة: PDF أو صور');
  }
  if (f.size > AI_MAX_FILE) {
    return alert(lang === 'en' ? 'Max file size is 5 MB' : 'أقصى حجم للملف 5 ميجا');
  }

  try {
    const data = await readFileB64(f);
    aiPending = { name: f.name, mime: f.type, data };
    $('ai-file-name').textContent = '📎 ' + f.name + (lang === 'en' ? '  (tap to remove)' : '  (اضغط للإلغاء)');
    $('ai-file-name').classList.remove('hidden');
  } catch {
    alert(lang === 'en' ? 'Could not read the file' : 'ما قدرتش أقرأ الملف');
  }
};

$('ai-file-name').onclick = clearAiFile;

$('ai-send').onclick = aiSend;
$('ai-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') aiSend();
});

$('set-admin').addEventListener('click', () => setTimeout(loadAiBooksAdmin, 0));

sb.auth.onAuthStateChange((event, session) => {
  if (!session) closeAiScreen();
});