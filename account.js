// ---------- زرار حذف الحساب من الإعدادات ----------
// بيستخدم sb و lang من app.js (لازم account.js يتحمّل بعد app.js)
(() => {
  const btn = document.getElementById('set-delete');
  if (!btn) return;

  const isEn = typeof lang !== 'undefined' && lang === 'en';
  const txt = (ar, en) => (isEn ? en : ar);
  const WORD = txt('حذف', 'DELETE');

  btn.textContent = txt('🗑️ حذف الحساب', '🗑️ Delete account');

  btn.onclick = async () => {
    document.getElementById('settings-modal').classList.add('hidden');

    const typed = prompt(txt(
      `ده هيمسح حسابك ورسايلك وبياناتك نهائياً ومش هيرجعوا.\nعشان تأكد، اكتب كلمة "${WORD}":`,
      `This permanently deletes your account, messages and data.\nTo confirm, type "${WORD}":`
    ));
    if (typed === null) return;
    if (typed.trim() !== WORD) {
      alert(txt('الكلمة مش مطابقة، حسابك لسه موجود.', 'Word does not match, your account is still there.'));
      return;
    }

    try {
      const { data, error } = await sb.functions.invoke('delete-account', { body: {} });
      if (error || (data && data.error)) {
        if (data && data.error === 'admin') {
          alert(txt('حساب الأدمن مينفعش يتحذف من هنا. اتكلم مع المسؤول الأول.', 'Admin accounts cannot be deleted from here.'));
        } else {
          alert(txt('حصلت مشكلة وحسابك ما اتحذفش. جرّب تاني.', 'Something went wrong, your account was not deleted. Try again.'));
        }
        return;
      }
      try { await sb.auth.signOut(); } catch {}
      alert(txt('حسابك اتحذف. تقدر تسجل حساب جديد في أي وقت.', 'Your account was deleted. You can sign up again anytime.'));
      location.reload();
    } catch {
      alert(txt('حصلت مشكلة وحسابك ما اتحذفش. جرّب تاني.', 'Something went wrong, your account was not deleted. Try again.'));
    }
  };
})();