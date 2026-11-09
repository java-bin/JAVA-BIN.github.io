/* 채소 CBT - 다중 답안 입력 UI (기존 app.js와 questions.json 변경 없음) */
(() => {
  'use strict';
  const root = document.getElementById('chaechae-preview');
  if (!root) return;
  const textarea = root.querySelector('#cc-answer');
  const prompt = root.querySelector('[data-prompt]');
  const format = root.querySelector('[data-format]');
  const progress = root.querySelector('#quiz-progress');
  if (!textarea || !prompt || !progress) return;

  const style = document.createElement('style');
  style.textContent = `
    #chaechae-preview .multi-answer-fields { display:grid; gap:12px; margin:10px 0 16px; }
    #chaechae-preview .multi-answer-row { display:flex; align-items:center; gap:12px; }
    #chaechae-preview .multi-answer-key { min-width:30px; font-weight:700; }
    #chaechae-preview .multi-answer-input { flex:1; min-width:0; width:100%; padding:13px 14px;
      border:1px solid var(--line); border-radius:9px; background:var(--panel); color:var(--ink);
      font:inherit; font-size:16px; }
    #chaechae-preview .multi-answer-input:focus { outline:2px solid var(--brand); outline-offset:2px; }
    #chaechae-preview .multi-answer-note { color:var(--muted); font-size:12px; }
  `;
  root.append(style);

  const fields = document.createElement('div');
  fields.className = 'multi-answer-fields';
  fields.hidden = true;
  textarea.insertAdjacentElement('beforebegin', fields);
  const originalLabel = root.querySelector('label[for="cc-answer"]');
  let questionBank = [];
  let lastKey = '';
  let activeCount = 0;

  const number = label => {
    const s = String(label || '').trim().toUpperCase();
    return /^[A-Z]$/.test(s) ? s.charCodeAt(0) - 64 : Number(s);
  };

  function findQuestion() {
    const text = prompt.textContent.trim();
    const meta = format?.textContent || '';
    return questionBank.find(q => q.prompt === text && (!q.exam || meta.includes(q.exam))) ||
           questionBank.find(q => q.prompt === text);
  }

  function parseParts(text, count) {
    const out = Array(count).fill('');
    const re = /(?:^|\n|[,;]\s*)\s*(\d+)\s*\.\s*/g;
    const matches = [...String(text || '').matchAll(re)];
    if (!matches.length) {
      if (text?.trim()) out[0] = text.trim();
      return out;
    }
    matches.forEach((match, i) => {
      const index = Number(match[1]) - 1;
      if (index >= 0 && index < count)
        out[index] = text.slice(match.index + match[0].length,
          i + 1 < matches.length ? matches[i + 1].index : text.length).trim();
    });
    return out;
  }

  function sync() {
    if (!activeCount) return;
    const values = [...fields.querySelectorAll('input')].map(x => x.value);
    textarea.value = values.map((v, i) => `${i + 1}. ${v}`).join('\n');
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function render() {
    const key = `${progress.textContent}|${prompt.textContent}`;
    if (key === lastKey) return;
    lastKey = key;
    const q = findQuestion();
    const parts = q?.grading?.mode === 'parts' ? q.grading.parts : null;
    activeCount = Array.isArray(parts) && parts.length > 1 ? parts.length : 0;
    fields.replaceChildren();

    if (!activeCount) {
      fields.hidden = true;
      textarea.hidden = false;
      if (originalLabel) originalLabel.hidden = false;
      return;
    }

    const values = parseParts(textarea.value, activeCount);
    fields.hidden = false;
    textarea.hidden = true;
    if (originalLabel) originalLabel.hidden = true;

    parts.forEach((part, i) => {
      const row = document.createElement('div');
      row.className = 'multi-answer-row';
      const label = document.createElement('label');
      label.className = 'multi-answer-key';
      label.style.margin = '0';
      label.textContent = String(part.label || i + 1);
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'multi-answer-input';
      input.placeholder = `${part.label || i + 1}번 답안`;
      input.setAttribute('aria-label', `${part.label || i + 1}번 답안`);
      input.value = values[i];
      input.addEventListener('input', sync);
      row.append(label, input);
      fields.append(row);
    });
  }

  const observer = new MutationObserver(render);
  observer.observe(progress, { childList: true, characterData: true, subtree: true });
  observer.observe(prompt, { childList: true, characterData: true, subtree: true });

  // 문제은행을 가져와 grading.parts 수를 기준으로 입력칸을 자동 생성합니다.
  fetch('questions.json', { cache: 'no-cache' })
    .then(r => { if (!r.ok) throw new Error('문제은행을 불러오지 못했습니다.'); return r.json(); })
    .then(data => {
      questionBank = Array.isArray(data) ? data :
        (Array.isArray(data.questions) ? data.questions : []);
      lastKey = '';
      render();
    })
    .catch(err => console.warn('[채소 CBT 다중 답안]', err.message));
})();
