// ---------- زعبوله: مساعد الذكاء الاصطناعي ----------

const AI_ICON = '<img src="ai-icon.png" alt="زعبوله">';
const AI_MAX_FILE = 5 * 1024 * 1024;
const AI_MIME = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif'];

let aiRoom = null;
let aiBusy = false;
let aiPending = null;
let aiLangMode = localStorage.getItem('aiLang') || lang;

// نحط صورة زعبوله في كل الأماكن
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
    ? "Hi! I'm Zaboula, your AI assistant 🤖\nWrite to me in English, Arabic or any language. I can explain, solve problems, search the web, and review PDFs or images you send me."
    : 'مرحبا! أنا زعبوله، مساعد الذكاء الاصطناعي الخاص بيك 🤖\nكلمني بالمصري أو بالإنجليزي أو أي لغة. أقدر أشرح وأحل وأبحث على النت، وتبعتلي PDF أو صورة وأنا أحللها أو أعدّلها لك.';
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
  $('ai-lang').textContent = aiLangMode === 'en' ? 'عربي' : 'EN';
  $('ai-input').placeholder = lang === 'en' ? 'Write to Zaboula...' : 'اكتب لزعبوله...';
  $('ai-subtitle').textContent = lang === 'en' ? 'Choose a chat' : 'اختار الشات اللي عايزه';
  $('ai-attach').title = lang === 'en' ? 'Attach a PDF or image' : 'ارفع PDF أو صورة';
}

function renderAiRooms() {
  const box = $('ai-rooms');
  box.innerHTML = '';
  const cur = currentRoom();

  ['ar', 'en'].forEach(tr => {
    [1, 2, 3, 4].forEach(lv => {
      const room = `${tr}-${lv}`;
      const isCur = room === cur;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ai-room' + (isCur ? ' current' : '');

      const av = document.createElement('div');
      av.className = 'ai-avatar';
      av.innerHTML = AI_ICON;

      const info = document.createElement('div');
      info.className = 'ai-room-info';
      const title = document.createElement('b');
      title.textContent = 'زعبوله · ' + aiRoomTitle(room);
      info.appendChild(title);
      if (isCur) {
        const small = document.createElement('small');
        small.textContent = lang === 'en' ? 'Your current room' : 'شاتك الحالي';
        info.appendChild(small);
      }

      b.appendChild(av);
      b.appendChild(info);
      b.onclick = () => openAiChat(room);
      box.appendChild(b);
    });
  });
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
  $('ai-list-screen').classList.add('hidden');
  $('ai-chat-screen').classList.remove('hidden');
  applyAiLabels();
  await renderAiHistory();
}

function closeAiScreens() {
  $('ai-chat-screen').classList.add('hidden');
  $('ai-list-screen').classList.add('hidden');
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

// ---------- الأحداث ----------
$('ai-open').onclick = () => {
  renderAiRooms();
  applyAiLabels();
  $('ai-list-screen').classList.remove('hidden');
};

$('ai-list-back').onclick = closeAiScreens;
$('ai-chat-back').onclick = closeAiScreens;

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

// لو المستخدم خرج من الحساب، نقفل شاشات زعبوله
sb.auth.onAuthStateChange((event, session) => {
  if (!session) closeAiScreens();
});