(()=>{'use strict';const root=document.getElementById('chaechae-preview'),$=s=>root.querySelector(s),home=$('[data-home-view]'),quiz=$('[data-quiz-view]'),answer=$('textarea'),result=$('[data-result]'),notice=$('#notice'),collection=$('#collection-panel'),sourcePanel=$('#source-panel'),submission=$('#submission-view');let bank=[],pastBank=[],legacyBank=[],queue=[],index=0,storageOK=true;const KEY='chaeso-cbt-v1';let saved={drafts:{},results:{},stars:[]};try{const data=JSON.parse(localStorage.getItem(KEY)||'null');if(data&&typeof data==='object')saved={drafts:data.drafts||{},results:data.results||{},stars:Array.isArray(data.stars)?data.stars:[]}}catch{storageOK=false}function persist(){try{localStorage.setItem(KEY,JSON.stringify(saved))}catch{storageOK=false;notice.textContent='저장 공간을 사용할 수 없어 현재 탭에서만 기록합니다.'}}const normalize=s=>s.normalize('NFKC').toLowerCase().replace(/[\s\p{P}\p{S}]/gu,'');
function grade(question,input){const rule=question.grading,text=normalize(input),checks=[];if(!text)return{status:'empty',checks:[]};if(rule.mode==='rubric')return gradeRubric(rule,input);if(rule.mode==='exact'){const ok=rule.aliases.some(alias=>normalize(alias)===text);checks.push({label:question.answer,ok});return{status:ok?'correct':'wrong',checks}}if(rule.mode==='keywords'){for(const group of rule.groups){const found=group.some(word=>text.includes(normalize(word)));let negated=false;for(const line of input.split(/[\n.!?。]/)){const compact=normalize(line);if(group.some(word=>compact.includes(normalize(word)))&&/하지않|되지않|없다|아니다/.test(compact))negated=true}checks.push({label:group[0],ok:found&&!negated,ambiguous:found&&negated})}}else if(rule.mode==='polarity'){const terms=rule.polarity.flatMap(item=>item.term);for(const item of rule.polarity){let values=[];for(const line of input.split(/[\n.!?。]/)){const compact=normalize(line);for(const term of item.term){let cursor=0;while(cursor<compact.length){const at=compact.indexOf(normalize(term),cursor);if(at<0)break;let end=compact.length;for(const other of terms){if(other===term)continue;const next=compact.indexOf(normalize(other),at+normalize(term).length);if(next>=0)end=Math.min(end,next)}const clause=compact.slice(at,end);let value=null;if(/제공하지않|보장하지않|제공안|미제공|제공되지않/.test(clause))value=false;else if(/제공한다|제공함|제공됨|제공됩니다|보장한다|제공할수있/.test(clause))value=true;if(value!==null)values.push(value);cursor=at+normalize(term).length}}}const conflict=values.includes(true)&&values.includes(false);checks.push({label:item.term[0]+' '+(item.positive?'제공한다':'제공하지 않는다'),ok:!conflict&&values.includes(item.positive),ambiguous:conflict})}}const count=checks.filter(c=>c.ok).length;return{status:checks.some(c=>c.ambiguous)?'review':count===checks.length?'correct':count?'partial':'wrong',checks}}
function gradeRubric(rule,input){
 const checks=[],sections={};
 if(rule.numbered){
  const markers=[...input.matchAll(/(?:^|\n)\s*(?:\[|\()?([12])\s*(?:[.)\]:：]|번\s*[:：]?)/g)];
  for(let i=0;i<markers.length;i++){
   const m=markers[i],end=i+1<markers.length?markers[i+1].index:input.length;
   const value=input.slice(m.index+m[0].length,end);
   sections[m[1]]=(sections[m[1]]||'')+'\n'+value;
  }
 }
 for(const part of rule.parts){
  const content=rule.numbered?sections[part.number]:input;
  if(content===undefined){for(const group of part.groups)checks.push({label:part.label+' · '+group[0],ok:false,ambiguous:true});continue}
  const allTerms=part.groups.flat().map(normalize);
  for(const [groupIndex,group] of part.groups.entries()){
   let found=false,negated=false;
   for(const sentence of content.split(/[\n.!?。;]/)){
    const text=normalize(sentence);
    for(const word of group){const term=normalize(word);let from=0;
     while(from<text.length){const at=text.indexOf(term,from);if(at<0)break;
      let end=Math.min(text.length,at+term.length+18);
      for(const other of allTerms){if(other===term)continue;const next=text.indexOf(other,at+term.length);if(next>=0)end=Math.min(end,next)}
      const tail=text.slice(at+term.length,end);
      const negative=/^(?:은|는|이|가|을|를|도)?(?:제공|보장|적용|사용|수행|검증|보호|분리|제한|필요)?(?:하지않|되지않|안한다|안함|없다|불필요|아니다)/.test(tail);
      if(negative)negated=true;else found=true;
      from=at+term.length;
     }
    }
   }
   const expectsNegative=!!(part.expectedNegative&&part.expectedNegative[groupIndex]);
   checks.push({label:part.label+' · '+group[0]+(expectsNegative?' (부정)':''),ok:expectsNegative?negated&&!found:found&&!negated,ambiguous:found&&negated||(!expectsNegative&&negated)});
  }
 }
 const count=checks.filter(c=>c.ok).length;
 return{status:checks.some(c=>c.ambiguous)?'review':count===checks.length?'correct':count?'partial':'wrong',checks};
}

window.ChaesoGrade=grade;const names={correct:'정답',partial:'부분정답',wrong:'오답',review:'확인 필요'};function shuffle(list){const next=[...list];for(let i=next.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[next[i],next[j]]=[next[j],next[i]]}return next}function saveDraft(){if(queue[index]){saved.drafts[queue[index].id]=answer.value;persist()}}function showHome(){saveDraft();home.hidden=false;quiz.hidden=true;submission.hidden=true}function start(list,random=true){if(!list.length){notice.textContent='아직 해당하는 문제가 없습니다.';return}saveDraft();queue=random?shuffle(list):[...list];index=0;home.hidden=true;quiz.hidden=false;submission.hidden=true;render()}function render(){const q=queue[index];$('[data-category]').textContent=q.subject;$('[data-prompt]').textContent=q.prompt;$('[data-format]').textContent=q.hint;$('[data-format]').append(document.createTextNode(' · '+q.origin+(q.exam?' · '+q.exam:'')));$('#quiz-progress').textContent=`${index+1} / ${queue.length} · ${q.kind}`;answer.value=saved.drafts[q.id]||'';result.hidden=true;$('#bookmark').textContent=saved.stars.includes(q.id)?'★ 저장됨':'☆ 저장';$('#bookmark').setAttribute('aria-pressed',String(saved.stars.includes(q.id)));$('#previous').disabled=index===0;$('#next').disabled=false;$('#next').textContent=index===queue.length-1?'제출하기':'다음 →'}answer.addEventListener('input',saveDraft);function showResult(q,grading){result.hidden=false;result.replaceChildren();if(grading){const title=document.createElement('div');title.className='status-label';title.textContent=names[grading.status]+' · '+grading.checks.filter(c=>c.ok).length+'/'+grading.checks.length+' 요소 충족';result.append(title);const list=document.createElement('ul');list.className='checks';for(const check of grading.checks){const li=document.createElement('li');li.textContent=(check.ok?'✓ ':'○ ')+check.label+(check.ambiguous?' — 답안 형식·부정 표현 확인':'');list.append(li)}result.append(list)}const model=document.createElement('p');model.style.whiteSpace='pre-wrap';model.textContent='모범답안\n'+q.answer;const explanation=document.createElement('p');explanation.textContent=q.explanation;const link=document.createElement('a');link.href=q.reference;link.target='_blank';link.rel='noopener noreferrer';link.textContent='관련 개념·기술 문서 ↗';const note=document.createElement('small');note.textContent='학습용 키워드 판정입니다. 표현이 다른 답은 모범답안과 함께 확인하세요.';result.append(model,explanation,link);if(q.sourceUrl){const source=document.createElement('a');source.href=q.sourceUrl;source.target='_blank';source.rel='noopener noreferrer';source.style.display='block';source.textContent='복원 출처 ↗ ('+q.exam+' · 일부 재구성)';result.append(source)}result.append(note)}$('[data-grade]').onclick=()=>{const q=queue[index],grading=grade(q,answer.value);if(grading.status==='empty'){result.hidden=false;result.textContent='답안을 먼저 작성하세요.';return}saveDraft();saved.results[q.id]={status:grading.status,answer:answer.value,time:Date.now()};persist();showResult(q,grading)};$('[data-model]').onclick=()=>showResult(queue[index],null);$('#bookmark').onclick=()=>{const id=queue[index].id;saved.stars=saved.stars.includes(id)?saved.stars.filter(x=>x!==id):[...saved.stars,id];persist();$('#bookmark').textContent=saved.stars.includes(id)?'★ 저장됨':'☆ 저장';$('#bookmark').setAttribute('aria-pressed',String(saved.stars.includes(id)))};$('#next').onclick=()=>{saveDraft();if(index<queue.length-1){index++;render()}else submitSession()};$('#previous').onclick=()=>{saveDraft();if(index>0){index--;render()}};function submitSession(){
 saveDraft();
 const answered=queue.filter(q=>(saved.drafts[q.id]||'').trim());
 if(!answered.length){result.hidden=false;result.textContent='작성한 답안이 없습니다. 한 문제 이상 작성한 뒤 제출하세요.';return}
 const counts={correct:0,partial:0,wrong:0,review:0};let earned=0;const rows=[];
 for(const q of answered){const value=saved.drafts[q.id],g=grade(q,value);counts[g.status]++;earned+=g.checks.filter(c=>c.ok).length/g.checks.length;saved.results[q.id]={status:g.status,answer:value,time:Date.now()};rows.push({q,g})}
 persist();quiz.hidden=true;submission.hidden=false;submission.replaceChildren();
 const title=document.createElement('h1');title.textContent='제출 결과';submission.append(title);
 const score=document.createElement('p');score.className='status-label';score.textContent='학습 점수 '+Math.round(earned/answered.length*100)+'점 / 100점';submission.append(score);
 const stats=document.createElement('p');stats.textContent=`작성 ${answered.length} / 전체 ${queue.length}문항 · 정답 ${counts.correct} · 부분정답 ${counts.partial} · 오답 ${counts.wrong} · 확인 필요 ${counts.review} · 미응답 ${queue.length-answered.length}`;submission.append(stats);
 const detail=document.createElement('p');detail.className='muted';detail.textContent='작성한 문제만 채점합니다. 각 문제는 같은 비중이며 부분정답은 충족한 요소 비율을 반영합니다. 미응답은 점수에서 제외합니다. 공식 시험 점수가 아닌 학습용 점수입니다.';submission.append(detail);
 const continueButton=document.createElement('button');continueButton.className='primary';continueButton.textContent='이어서 풀기';continueButton.onclick=()=>{submission.hidden=true;quiz.hidden=false;render()};
 const homeButton=document.createElement('button');homeButton.className='secondary';homeButton.textContent='분야 선택으로';homeButton.onclick=showHome;submission.append(continueButton,document.createTextNode(' '),homeButton);
 for(const {q,g} of rows){const b=document.createElement('button');b.className='collection-item';b.textContent=names[g.status]+' · '+q.prompt;b.onclick=()=>{index=queue.findIndex(item=>item.id===q.id);submission.hidden=true;quiz.hidden=false;render();showResult(q,g)};submission.append(b)}
}
$('#submit-session').onclick=submitSession;
root.querySelectorAll('[data-back],[data-home]').forEach(b=>b.onclick=()=>{showHome();collection.hidden=true;sourcePanel.hidden=true;notice.textContent=''});root.querySelectorAll('[data-subject]').forEach(b=>b.onclick=()=>start(b.dataset.subject==='전체랜덤'?bank:bank.filter(q=>q.subject===b.dataset.subject)));root.querySelectorAll('[data-side]').forEach(b=>b.onclick=()=>{showHome();sourcePanel.hidden=true;collection.hidden=false;collection.replaceChildren();const star=b.dataset.side==='저장한 문제';const list=[...bank,...pastBank,...legacyBank].filter(q=>star?saved.stars.includes(q.id):saved.results[q.id]&&saved.results[q.id].status!=='correct');const heading=document.createElement('h2');heading.textContent=b.dataset.side+' · '+list.length+'문항';collection.append(heading);if(!list.length){const p=document.createElement('p');p.textContent=star?'문제 화면에서 ☆ 저장을 눌러 모아보세요.':'아직 오답이 없습니다. 채점 결과가 오답·부분정답·확인 필요인 문제가 모입니다.';collection.append(p);return}const all=document.createElement('button');all.className='primary';all.textContent='모아둔 문제 풀기';all.onclick=()=>start(list);collection.append(all);for(const q of list){const button=document.createElement('button');button.className='collection-item';button.textContent=q.subject+' · '+q.prompt;button.onclick=()=>start([q],false);collection.append(button)}});root.querySelectorAll('[data-year]').forEach(b=>b.onclick=()=>{const list=pastBank.filter(q=>q.exam===b.dataset.year);start(list,false)});async function load(){
 notice.textContent='문제은행을 불러오는 중입니다.';
 try{
  const r=await fetch('./questions.json');if(!r.ok)throw new Error('HTTP '+r.status);
  bank=await r.json();
  if(!Array.isArray(bank)||bank.length===0||new Set(bank.map(q=>q.id)).size!==bank.length)throw new Error('Invalid practice bank');
  const optional=await Promise.allSettled(['past-exams.json','legacy-questions.json'].map(async file=>{const response=await fetch('./'+file);if(!response.ok)throw new Error(file);const data=await response.json();if(!Array.isArray(data))throw new Error(file);return data}));
  pastBank=optional[0].status==='fulfilled'?optional[0].value:[];
  legacyBank=optional[1].status==='fulfilled'?optional[1].value:[];
  const subjectCounts=[...new Set(bank.map(q=>q.subject))].map(subject=>bank.filter(q=>q.subject===subject).length);const equalCounts=subjectCounts.every(n=>n===subjectCounts[0]);$('.foot').textContent=`분야별 연습 ${bank.length.toLocaleString()}문항 · ${equalCounts?'과목별 '+subjectCounts[0]+'문항':'과목별 문항수는 분야 버튼에서 확인'} · 복원 기출 ${pastBank.length}문항 별도`;
  notice.textContent=storageOK?'':'현재 환경에서는 기록을 저장할 수 없습니다.';
  root.querySelectorAll('[data-subject]').forEach(b=>{const count=b.dataset.subject==='전체랜덤'?bank.length:bank.filter(q=>q.subject===b.dataset.subject).length;b.querySelector('small').append(document.createTextNode(' · '+count+'문항'))});
  root.querySelectorAll('[data-year]').forEach(b=>{const count=pastBank.filter(q=>q.exam===b.dataset.year).length;b.textContent=b.dataset.year+' · 일부 복원 '+count+'문항';b.disabled=count===0});
 }catch(e){notice.textContent='문제은행을 불러오지 못했습니다. 새로고침해주세요.';console.error(e)}
}load()})();
