// ---------- فاهم: مساعد الذكاء الاصطناعي (ومساعد الدكتور للأدمن) ----------

const AI_ICON = '<img src="ai-icon.png" alt="">';
const AI_MAX_FILE = 5 * 1024 * 1024;
const AI_BOOK_MAX = 50 * 1024 * 1024;
const AI_MIME = ['image/png', 'image/jpeg', 'image/webp'];
const ROOMS = ['ar-1', 'ar-2', 'ar-3', 'ar-4', 'en-1', 'en-2', 'en-3', 'en-4'];
const CHUNK_MAX = 1200;

let aiRoom = null;
let aiBusy = false;
let aiPending = null;
let aiLangMode = lang; // يتبع لغة الصفحة، والزرار جوه الشات بيغيّرها للجلسة دي بس

$('ai-open').innerHTML = AI_ICON;
document.querySelectorAll('.ai-avatar').forEach(el => { el.innerHTML = AI_ICON; });

// الدكتور = الأدمن
function aiIsDoctor() {
  return !!currentProfile && currentProfile.role === 'admin';
}

// وضع الامتحان: بيتفعل بالعبارة دي (للأدمن بس) وبيتقفل بعبارة الإيقاف
const EXAM_ON = 'تفعيل تسجيل الامتحان';
const EXAM_OFF = 'إيقاف وضع الامتحان';
let aiExamMode = false;

function aiNorm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0640]/g, '')
    .replace(/[إأآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ');
}

function aiScanExam(texts, start = false) {
  if (!aiIsDoctor()) return false;
  let on = start;
  const onN = aiNorm(EXAM_ON);
  const offN = aiNorm(EXAM_OFF);
  for (const x of texts) {
    const n = aiNorm(x);
    if (n.includes(offN)) on = false;
    else if (n.includes(onN)) on = true;
  }
  return on;
}

// الاسم بالعربي والإنجليزي: فاهم، ولما وضع الامتحان يتفعل يبقى مساعد الدكتور
function aiNames() {
  return aiExamMode
    ? { ar: 'مساعد الدكتور', en: 'Doctor Assistant' }
    : { ar: 'فاهم', en: 'Fahem' };
}

function aiName() {
  const n = aiNames();
  return aiLangMode === 'en' ? n.en : n.ar;
}

function aiRoomTitle(room) {
  const parts = room.split('-');
  const trk = parts[0] === 'ar' ? t('trkAr') : t('trkEn');
  const lvl = t('lvl' + parts[1]);
  return `${trk} · ${lvl}`;
}

function greetingText() {
  const note = aiLangMode === 'en'
    ? '\n\n⚠️ Note: this chat is deleted if you leave it for one hour without sending any message.'
    : '\n\n⚠️ ملحوظة: الشات ده هيتمسح لو طلعت برا الشات لمدة ساعة من غير ما تبعت أي رسالة.';

  const hint = !aiIsDoctor() ? '' : (aiLangMode === 'en'
    ? '\n\nDoctor? To prepare an exam, write: "' + EXAM_ON + '"'
    : '\n\nلو إنت دكتور وعايز تجهّز امتحان اكتب: "' + EXAM_ON + '"');

  return (aiLangMode === 'en'
    ? "Hi! I'm Fahem, your AI assistant 🤖\nWrite to me in English, Arabic or any language. I can explain, solve problems, search the web, and review images you send me. I also answer from the course books when they are available."
    : 'مرحبا! أنا فاهم، مساعد الذكاء الاصطناعي الخاص بيك 🤖\nكلمني بالمصري أو بالإنجليزي أو أي لغة. أقدر أشرح وأحل وأبحث على النت، وأرد عليك من كتب المادة، ولو بعتلي صورة أقدر أحللها أو أعدّلها لك.') + hint + note;
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
  const n = aiNames();
  $('ai-name-ar').textContent = n.ar;
  $('ai-name-en').textContent = n.en;
  $('ai-open').title = aiLangMode === 'en' ? n.en : n.ar;
  $('ai-room-label').textContent = aiRoom ? aiRoomTitle(aiRoom) : '';
  $('ai-back-text').textContent = aiLangMode === 'en' ? 'Back' : 'رجوع';
  $('ai-lang').textContent = aiLangMode === 'en' ? 'عربي' : 'EN';
  $('ai-input').placeholder = aiLangMode === 'en' ? `Write to ${n.en}...` : `اكتب لـ${n.ar}...`;
  $('ai-attach').title = aiLangMode === 'en' ? 'Attach an image' : 'ارفع صورة';
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

  aiExamMode = aiScanExam((data || []).slice(-30).filter(m => m.role === 'user').map(m => m.content));
  applyAiLabels();

  if (!data || !data.length) {
    appendAiBubble('model', greetingText());
    return;
  }

  data.forEach(m => appendAiBubble(m.role === 'user' ? 'user' : 'model', m.content));
  box.scrollTop = box.scrollHeight;
}

async function openAiChat(room) {
  aiRoom = room;
  aiLangMode = lang; // كل ما تفتح الشات، المساعد يتبع لغة الصفحة
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
  const thinking = appendAiBubble('model', aiLangMode === 'en' ? `${aiName()} is thinking...` : `${aiName()} بيفكر...`, 'thinking');

  try {
    const { data: sess } = await sb.auth.getSession();
    const token = sess.session ? sess.session.access_token : null;
    if (!token) throw new Error(aiLangMode === 'en' ? 'Please log in again' : 'سجّل دخول تاني');

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
    aiExamMode = aiScanExam([text], aiExamMode);
    applyAiLabels();
  } catch (e) {
    thinking.remove();
    appendAiBubble('model', '⚠️ ' + e.message);
  } finally {
    aiBusy = false;
    $('ai-send').disabled = false;
  }
}

// ---------- قراية الكتب في المتصفح (pdf.js) ----------
let pdfJsReady = null;

function loadPdfJs() {
  if (window.pdfjsLib) return Promise.resolve();
  if (pdfJsReady) return pdfJsReady;
  pdfJsReady = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    s.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve();
    };
    s.onerror = () => reject(new Error('pdf.js load failed'));
    document.head.appendChild(s);
  });
  return pdfJsReady;
}

async function extractBookPages(file) {
  await loadPdfJs();
  const buf = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    const text = tc.items.map(it => it.str).join(' ').replace(/\s+/g, ' ').trim();
    if (text) pages.push({ page: i, text });
  }
  return pages;
}

function makeChunks(pages) {
  const out = [];
  for (const p of pages) {
    let cur = '';
    for (const w of p.text.split(' ')) {
      if (cur && (cur + ' ' + w).length > CHUNK_MAX) {
        out.push({ page: p.page, text: cur.trim() });
        cur = w;
      } else {
        cur = cur ? cur + ' ' + w : w;
      }
    }
    if (cur.trim()) out.push({ page: p.page, text: cur.trim() });
  }
  return out;
}

// ---------- كتب المساعد (الأدمن) ----------
async function loadAiBooksAdmin() {
  const box = $('ai-books-admin');
  box.innerHTML = '';

  const title = document.createElement('h3');
  title.textContent = lang === 'en' ? '📚 Assistant books' : '📚 كتب المساعد';
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
  up.onclick = () => uploadBook(sel.value, file, up);

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

async function uploadBook(room, fileInput, btn) {
  const f = fileInput.files[0];
  if (!f) return alert(lang === 'en' ? 'Choose a PDF first' : 'اختار ملف PDF الأول');
  if (f.type !== 'application/pdf') return alert(lang === 'en' ? 'PDF files only' : 'PDF بس');
  if (f.size > AI_BOOK_MAX) return alert(lang === 'en' ? 'Max 50 MB' : 'أقصى حجم 50 ميجا');

  const oldText = btn.textContent;
  btn.disabled = true;
  try {
    btn.textContent = lang === 'en' ? 'Reading the book...' : 'بقرا الكتاب...';
    const pages = await extractBookPages(f);
    const chunks = makeChunks(pages);
    if (!chunks.length) {
      alert(lang === 'en'
        ? 'No readable text in this PDF (scanned images are not supported)'
        : 'الملف ده مفيهوش نص مقروء (الصور الممسوحة مش بتتقري)');
      return;
    }

    btn.textContent = lang === 'en' ? 'Uploading...' : 'برفع الملف...';
    const safeName = f.name.replace(/[^\w.\-]/g, '_');
    const path = `${room}/${Date.now()}_${safeName}`;
    const { error: upErr } = await sb.storage.from('books').upload(path, f, { contentType: 'application/pdf' });
    if (upErr) return alert(upErr.message);

    const { data: book, error } = await sb.from('ai_books')
      .insert({ room, title: f.name, path, size_bytes: f.size })
      .select('id')
      .single();
    if (error) return alert(error.message);

    const rows = chunks.map(c => ({ book_id: book.id, room, page: c.page, content: c.text }));
    for (let i = 0; i < rows.length; i += 100) {
      btn.textContent = `${lang === 'en' ? 'Indexing' : 'بفهرس'} ${Math.min(i + 100, rows.length)}/${rows.length}`;
      const { error: chErr } = await sb.from('ai_book_chunks').insert(rows.slice(i, i + 100));
      if (chErr) return alert(chErr.message);
    }

    fileInput.value = '';
    alert(lang === 'en'
      ? `Book uploaded and indexed (${rows.length} parts).`
      : `الكتاب اترفع واتفهرس (${rows.length} جزء).`);
  } catch (e) {
    alert((lang === 'en' ? 'Upload failed: ' : 'فشل الرفع: ') + e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = oldText;
    await loadAiBooksAdmin();
  }
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

$('ai-lang').onclick = async () => {
  toggleLang(); // بيقلب الصفحة كلها عربي/إنجليزي
  aiLangMode = lang;
  applyAiLabels();
  if (typeof renderPinned === 'function') renderPinned();
  if (currentProfile) loadMessages(); // عشان الوقت والنصوص تتحدث
  await renderAiHistory();
};

$('ai-clear').onclick = async () => {
  if (!aiRoom) return;
  if (!confirm(aiLangMode === 'en' ? 'Clear this chat?' : 'تمسح المحادثة دي؟')) return;
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
    return alert(aiLangMode === 'en' ? 'Only image files are supported' : 'حالياً بنقبل صور بس (PNG أو JPG أو WEBP)');
  }
  if (f.size > AI_MAX_FILE) {
    return alert(aiLangMode === 'en' ? 'Max file size is 5 MB' : 'أقصى حجم للملف 5 ميجا');
  }

  try {
    const data = await readFileB64(f);
    aiPending = { name: f.name, mime: f.type, data };
    $('ai-file-name').textContent = '📎 ' + f.name + (aiLangMode === 'en' ? '  (tap to remove)' : '  (اضغط للإلغاء)');
    $('ai-file-name').classList.remove('hidden');
  } catch {
    alert(aiLangMode === 'en' ? 'Could not read the file' : 'ما قدرتش أقرأ الملف');
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