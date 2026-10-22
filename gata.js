// ---------- بوابة كلمة السر لكل شعبة ومستوى ----------

const gateEl = document.createElement('div');
gateEl.id = 'room-gate';
gateEl.className = 'modal hidden';
gateEl.style.zIndex = '999';
gateEl.innerHTML = `
  <div class="modal-box">
    <h3 id="gate-title"></h3>
    <p class="hint" id="gate-hint"></p>
    <input id="gate-code" type="password" dir="ltr" autocomplete="off">
    <button id="gate-join" class="primary"></button>
    <button id="gate-logout" class="ghost"></button>
    <p id="gate-err" class="msg-text"></p>
  </div>`;
document.body.appendChild(gateEl);

function gateLabels() {
  const room = currentRoom();
  const parts = room.split('-');
  const trk = parts[0] === 'ar' ? t('trkAr') : t('trkEn');
  const lvl = t('lvl' + parts[1]);
  $('gate-title').textContent = `${trk} · ${lvl}`;
  $('gate-hint').textContent = lang === 'en'
    ? 'Enter the access code for this room'
    : 'اكتب كلمة السر للشعبة والمستوى ده';
  $('gate-join').textContent = lang === 'en' ? 'Enter' : 'دخول';
  $('gate-logout').textContent = lang === 'en' ? 'Log out' : 'تسجيل خروج';
  $('gate-code').placeholder = lang === 'en' ? 'Access code' : 'كلمة السر';
}

function showGate() {
  gateLabels();
  gateEl.classList.remove('hidden');
}

function hideGate() {
  gateEl.classList.add('hidden');
}

let gateChecking = false;

async function checkRoomGate() {
  if (gateChecking) return;
  gateChecking = true;
  try {
    const { data: sess } = await sb.auth.getSession();
    if (!sess.session) {
      hideGate();
      return;
    }
    const { data, error } = await sb.rpc('has_room_access', { p_room: currentRoom() });
    if (error) {
      showGate();
      $('gate-err').textContent = (lang === 'en' ? 'Check failed: ' : 'في مشكلة في التحقق: ') + error.message;
      return;
    }
    if (data === true) {
      hideGate();
    } else {
      showGate();
      $('gate-err').textContent = '';
    }
  } finally {
    gateChecking = false;
  }
}

$('gate-join').onclick = async () => {
  const code = $('gate-code').value.trim();
  if (!code) return;
  $('gate-err').textContent = '';
  const { data, error } = await sb.rpc('join_room', { p_room: currentRoom(), p_code: code });
  if (error) {
    $('gate-err').textContent = error.message;
    return;
  }
  if (data === true) {
    hideGate();
    location.reload();
  } else {
    $('gate-err').textContent = lang === 'en' ? 'Wrong code' : 'الكود غلط';
  }
};

$('gate-code').addEventListener('keydown', e => {
  if (e.key === 'Enter') $('gate-join').click();
});

$('gate-logout').onclick = async () => {
  await sb.auth.signOut({ scope: 'local' });
  location.reload();
};

// ---------- الأدمن: تحديد كلمات سر الشعب ----------
const codesAdmin = document.createElement('div');
codesAdmin.className = 'ai-books-admin';
$('ai-books-admin').before(codesAdmin);

function renderCodesAdmin() {
  codesAdmin.innerHTML = '';

  const title = document.createElement('h3');
  title.textContent = lang === 'en' ? '🔑 Room access codes' : '🔑 كلمات سر الشعب';
  codesAdmin.appendChild(title);

  const form = document.createElement('div');
  form.className = 'ai-book-form';

  const sel = document.createElement('select');
  ROOMS.forEach(r => {
    const o = document.createElement('option');
    o.value = r;
    o.textContent = aiRoomTitle(r);
    sel.appendChild(o);
  });

  const inp = document.createElement('input');
  inp.type = 'text';
  inp.dir = 'ltr';
  inp.placeholder = lang === 'en' ? 'New code (min 4 chars)' : 'كلمة السر الجديدة (4 حروف على الأقل)';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'primary';
  btn.textContent = lang === 'en' ? 'Save code' : 'حفظ الكود';
  btn.onclick = async () => {
    const code = inp.value.trim();
    if (code.length < 4) return alert(lang === 'en' ? 'Min 4 characters' : 'لازم 4 حروف على الأقل');
    const { error } = await sb.rpc('set_room_code', { p_room: sel.value, p_code: code });
    if (error) return alert(error.message);
    inp.value = '';
    alert(lang === 'en' ? 'Saved. Users must re-enter the new code.' : 'اتحفظ. الطلاب لازم يدخلوا الكود الجديد.');
  };

  form.appendChild(sel);
  form.appendChild(inp);
  form.appendChild(btn);
  codesAdmin.appendChild(form);
}

$('set-admin').addEventListener('click', () => setTimeout(renderCodesAdmin, 0));

// ---------- التشغيل ----------
// أول ما الصفحة تفتح (لو الحساب متسجل من قبل)
setTimeout(checkRoomGate, 500);

// بعد تسجيل الدخول أو إنشاء الحساب
sb.auth.onAuthStateChange((event, session) => {
  if (session) setTimeout(checkRoomGate, 300);
  else hideGate();
});