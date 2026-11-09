/* 채소 CBT: 항목별 입력창 확장. 기존 app.js와 questions.json 수정 불필요. */
(() => {
  'use strict';
  const root = document.querySelector('#chaechae-preview');
  const textarea = root?.querySelector('#cc-answer');
  const prompt = root?.querySelector('[data-prompt]');
  const progress = root?.querySelector('#quiz-progress');
  if (!root || !textarea || !prompt || !progress) {
    console.warn('[multi-answer] CBT 요소를 찾을 수 없습니다.');
    return;
  }
  const style = document.createElement('style');
  style.textContent = `
    #chaechae-preview .multi-answer-fields{display:grid;gap:12px;margin:10px 0 16px}
    #chaechae-preview .multi-answer-row{display:flex;align-items:center;gap:12px}
    #chaechae-preview .multi-answer-label{min-width:34px;font-weight:700}
    #chaechae-preview .multi-answer-input{flex:1;min-width:0;width:100%;padding:13px 14px;border:1px solid var(--line);border-radius:9px;background:var(--panel);color:var(--ink);font:inherit;font-size:16px}
    #chaechae-preview .multi-answer-input:focus{outline:2px solid var(--brand);outline-offset:2px}
  `;
  root.append(style);
  const fields = document.createElement('div');
  fields.className = 'multi-answer-fields';
  fields.hidden = true;
  textarea.before(fields);
  const originalLabel = root.querySelector('label[for="cc-answer"]');
  let bank = [], activeCount = 0, currentKey = '';

  function countFromPrompt(text) {
    const found = [...text.matchAll(/\(\s*([1-9])\s*\)/g)].map(m => Number(m[1]));
    const unique = [...new Set(found)];
    if (unique.length >= 2 && unique.includes(1) && unique.every(n => n <= 9)) return Math.max(...unique);
    const letters = [...text.matchAll(/\(\s*([A-G])\s*\)/gi)].map(m => m[1].toUpperCase().charCodeAt(0)-64);
    const distinct = [...new Set(letters)];
    return distinct.length >= 2 && distinct.includes(1) ? Math.max(...distinct) : 0;
  }
  function parse(text, count) {
    const values = Array(count).fill('');
    const matches = [...String(text).matchAll(/(?:^|\n|[,;]\s*)\s*([1-9]\d*)\s*\.\s*/g)];
    if (!matches.length) { if (text.trim()) values[0] = text.trim(); return values; }
    matches.forEach((m,i) => {
      const at = Number(m[1])-1;
      if (at >= 0 && at < count) values[at] = text.slice(m.index+m[0].length, matches[i+1]?.index ?? text.length).trim();
    });
    return values;
  }
  function sync() {
    textarea.value = [...fields.querySelectorAll('input')].map((input,i)=>`${i+1}. ${input.value}`).join('\n');
    textarea.dispatchEvent(new Event('input', {bubbles:true}));
  }
  function render() {
    const text = prompt.textContent.trim();
    const key = progress.textContent + '|' + text;
    if (key === currentKey) return;
    currentKey = key;
    const q = bank.find(x => x.prompt === text);
    const parts = q?.grading?.mode === 'parts' ? q.grading.parts : null;
    const count = Array.isArray(parts) && parts.length > 1 ? parts.length : countFromPrompt(text);
    activeCount = count >= 2 && count <= 9 ? count : 0;
    fields.replaceChildren();
    if (!activeCount) {
      fields.hidden = true; textarea.hidden = false;
      if (originalLabel) originalLabel.hidden = false;
      return;
    }
    const values = parse(textarea.value, activeCount);
    for (let i=0; i<activeCount; i++) {
      const row = document.createElement('div'); row.className = 'multi-answer-row';
      const label = document.createElement('label'); label.className = 'multi-answer-label'; label.style.margin = '0';
      const partLabel = parts?.[i]?.label || String(i+1);
      label.textContent = partLabel;
      const input = document.createElement('input'); input.className = 'multi-answer-input'; input.type = 'text';
      input.setAttribute('aria-label', `${partLabel}번 답안`); input.placeholder = `${partLabel}번 답안 입력`;
      input.value = values[i]; input.addEventListener('input', sync);
      row.append(label,input); fields.append(row);
    }
    fields.hidden = false; textarea.hidden = true;
    if (originalLabel) originalLabel.hidden = true;
  }
  new MutationObserver(render).observe(progress, {subtree:true,childList:true,characterData:true});
  new MutationObserver(render).observe(prompt, {subtree:true,childList:true,characterData:true});
  render();
  Promise.all(['questions.json','past-exams.json','legacy-questions.json'].map(async path => {
    try {const r=await fetch(path,{cache:'no-store'}); return r.ok ? await r.json() : [];}catch{return [];}
  })).then(groups => {bank=groups.flat().filter(x=>x && typeof x.prompt==='string');currentKey='';render();});
  console.info('[multi-answer] 다중 답안 입력 기능 로드됨');
})();
