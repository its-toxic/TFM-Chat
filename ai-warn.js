// ---------- تنبيه قبل مسح محادثة المساعد ----------
const AI_TTL_MIN = 60;   // المحادثة بتتمسح بعد ساعة من آخر رسالة
const AI_WARN_MIN = 5;   // التنبيه يظهر قبلها بكام دقيقة

const aiWarnEl = document.createElement('div');
aiWarnEl.id = 'ai-warn';
aiWarnEl.className = 'hidden';
aiWarnEl.style.cssText = 'background:#f5b301;color:#1a1a1a;padding:8px 14px;font-size:13px;text-align:center;font-weight:bold;';
document.getElementById('ai-chat-screen').querySelector('.ai-messages').before(aiWarnEl);

async function checkAiExpiry() {
  if (!aiRoom || $('ai-chat-screen').classList.contains('hidden')) return;

  const { data: sess } = await sb.auth.getSession();
  if (!sess.session) return;

  const { data, error } = await sb.from('ai_messages')
    .select('created_at')
    .eq('room', aiRoom)
    .order('id', { ascending: false })
    .limit(1);

  if (error || !data || !data.length) {
    aiWarnEl.classList.add('hidden');
    return;
  }

  const last = new Date(data[0].created_at).getTime();
  const minsLeft = AI_TTL_MIN - (Date.now() - last) / 60000;

  if (minsLeft > 0 && minsLeft <= AI_WARN_MIN) {
    const m = Math.ceil(minsLeft);
    aiWarnEl.textContent = lang === 'en'
      ? `This chat will be deleted if you send no message within about ${m} min.`
      : `الشات ده هيتمسح لو مبعتش أي رسالة خلال حوالي ${m} دقايق.`;
    aiWarnEl.classList.remove('hidden');
  } else {
    aiWarnEl.classList.add('hidden');
  }
}

setInterval(checkAiExpiry, 30000);