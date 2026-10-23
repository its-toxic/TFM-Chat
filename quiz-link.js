// ---------- زرار "الاختبارات" في الإعدادات ----------
(() => {
  const btn = document.getElementById('set-quiz');
  if (!btn) return;

  const isEn = typeof lang !== 'undefined' && lang === 'en';
  btn.textContent = isEn ? '📝 Quizzes' : '📝 الاختبارات';

  btn.onclick = () => {
    document.getElementById('settings-modal').classList.add('hidden');
    window.location.href = 'quiz.html';
  };
})();