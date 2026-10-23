(()=>{'use strict';const root=document.getElementById('chaechae-preview'),$=s=>root.querySelector(s),home=$('[data-home-view]'),quiz=$('[data-quiz-view]'),answer=$('textarea'),result=$('[data-result]'),notice=$('#notice'),collection=$('#collection-panel'),sourcePanel=$('#source-panel'),submission=$('#submission-view');let bank=[],pastBank=[],legacyBank=[],queue=[],index=0,storageOK=true;const KEY='chaeso-cbt-v1';let saved={drafts:{},results:{},stars:[]};try{const data=JSON.parse(localStorage.getItem(KEY)||'null');if(data&&typeof data==='object')saved={drafts:data.drafts||{},results:data.results||{},stars:Array.isArray(data.stars)?data.stars:[]}}catch{storageOK=false}function persist(){try{localStorage.setItem(KEY,JSON.stringify(saved))}catch{storageOK=false;notice.textContent='저장 공간을 사용할 수 없어 현재 탭에서만 기록합니다.'}}const normalize=s=>String(s).normalize('NFKC').toLowerCase().replace(/\s+/gu,'');
const commandNormalize=s=>String(s).normalize('NFKC').trim().replace(/\s+/gu,' ');

// 답안 입력은 번호+마침표 형식으로 통일하며, 문제 원문/그림은 수정하지 않습니다.
const numberOfLabel=v=>{const x=String(v).trim().toUpperCase();return /^[A-Z]$/.test(x)?String(x.charCodeAt(0)-64):x};
const numberizeAnswer=s=>String(s||'').replace(/(^|[\n\s,;/])(?:정답\s*)?([A-Ga-g])\s*[:：.)]\s*/gu,(_,sep,key)=>sep+numberOfLabel(key)+'. ');
const numberizeHint=(q)=>{
 const parts=q.grading?.mode==='parts';
 if(parts)return '각 항목을 1. 답, 2. 답, 3. 답 형식으로 작성하세요. (문제의 A=1, B=2, C=3)';
 return String(q.hint||'').replace(/(?:A\s*[:：.]\s*답[^\n]*|A\s*[:：.]\s*[^\n]*B\s*[:：.])/giu,'1. 답, 2. 답, 3. 답').replace(/([A-Ga-g])\s*[:：.]\s*(?=답)/gu,(_,x)=>numberOfLabel(x)+'. ');
};
// 명칭이 확실히 같은 보안 용어만 동의어로 처리합니다.
const synonymGroups=[
 ['sqlinjection','sql인젝션','sql삽입공격','sqli'],
 ['arpspoofing','arp스푸핑','arp위조'],
 ['dnsspoofing','dns스푸핑','dns위조'],
 ['sessionhijacking','세션하이재킹','세션탈취'],
 ['synflooding','syn플러딩','syn홍수공격'],
 ['crosssitescripting','크로스사이트스크립팅','xss'],
 ['crosssiterequestforgery','사이트간요청위조','csrf','xsrf'],
 ['denialofservice','서비스거부공격','dos'],
 ['distributeddenialofservice','분산서비스거부공격','ddos'],
 ['maninthemiddle','중간자공격','mitm'],
 ['buffer overflow','버퍼오버플로우','버퍼넘침'],
 ['bruteforce','무차별대입공격','무차별대입'],
 ['dictionaryattack','사전공격','사전대입공격'],
 ['phishing','피싱'],['smishing','스미싱'],['vishing','비싱'],
 ['salt','솔트'],['hash','해시'],['firewall','방화벽'],
 ['intrusiondetectionsystem','침입탐지시스템','ids'],
 ['intrusionpreventionsystem','침입방지시스템','ips'],
 ['virtualprivatenetwork','가상사설망','vpn'],
 ['accesscontrollist','접근제어목록','acl'],
 ['rolebasedaccesscontrol','역할기반접근통제','rbac'],
 ['discretionaryaccesscontrol','임의적접근통제','dac'],
 ['mandatoryaccesscontrol','강제적접근통제','mac'],
 ['publickeyinfrastructure','공개키기반구조','pki'],
 ['certificateauthority','인증기관','ca'],
 ['digital signature','전자서명','디지털서명']
].map(g=>g.map(normalize));
function equivalent(a,b){const x=normalize(a),y=normalize(b);return x===y||synonymGroups.some(g=>g.includes(x)&&g.includes(y))}


// 객관식 문항에서만 A/①/1 같은 선택지 표기를 동일하게 취급합니다.
const choiceNumber=s=>{const raw=String(s).trim(),t=raw.normalize('NFKC').replace(/[.．)）]$/u,'').trim();if(/^[1-9]$/u.test(t))return t;if(/^[A-Ia-i]$/u.test(t))return String(t.toUpperCase().charCodeAt(0)-64);const circled='①②③④⑤⑥⑦⑧⑨';const i=circled.indexOf(raw);return i<0?null:String(i+1)};
const isChoiceQuestion=q=>/객관식|선택형|선다형|보기\s*중|다음\s*중|옳은\s*것|틀린\s*것|고르시오|선택하시오/u.test([q.kind,q.hint,q.prompt].join(' '));

function finish(checks){
 if(!checks.length)return{status:'review',checks:[{label:'자동채점 기준 없음',ok:false,ambiguous:true}]};
 const n=checks.filter(c=>c.ok).length;
 return{status:checks.some(c=>c.ambiguous)?'review':n===checks.length?'correct':n?'partial':'wrong',checks};
}
function evaluate(rule,input,label,allowChoice=false){
 if(rule.mode==='exact'){
  const clean=rule.strict?commandNormalize:normalize;
  const ok=Array.isArray(rule.aliases)&&rule.aliases.some(v=>(rule.strict?clean(v)===clean(input):equivalent(v,input))||(allowChoice&&choiceNumber(v)!==null&&choiceNumber(v)===choiceNumber(input)));
  return[{label:label||'답안',ok}];
 }
 if(rule.mode==='criteria'){
  const text=normalize(input),negative=/하지않|되지않|아니다|아님|없다|안된다|못한다/.test(text);
  const canonical=normalize(rule.sample||'')===text;
  const sourceNegative=/하지않|되지않|아니다|아님|없다|안된다|못한다/.test(normalize(rule.sample||''));
  return(rule.groups||[]).map(group=>{const found=group.some(v=>text.includes(normalize(v)));const ambiguous=found&&negative&&!canonical&&!sourceNegative;return{label:(label?label+' · ':'')+group[0],ok:found&&!ambiguous,ambiguous}});
 }
 return[{label:rule.reason||'서술·코드의 의미를 출처 답안 및 검수 보충과 비교하세요.',ok:false,ambiguous:true}];
}
function grade(question,input){
 if(!String(input).trim())return{status:'empty',checks:[]};
 const rule=question.grading;if(!rule||typeof rule!=='object')return finish([]);
 if(rule.mode==='choice'){
  const chunks=String(input).split(/[\n,;]+/).map(v=>v.replace(/^\s*(?:\(?[1-9]\)?[.:]?\s*)/,'').trim()).filter(Boolean);
  const used=new Set();const matched=[];
  for(const [i,item] of (rule.items||[]).entries()){
   const at=chunks.findIndex((v,j)=>!used.has(j)&&evaluate(item,v,'').every(c=>c.ok&&!c.ambiguous));
   if(at>=0){used.add(at);matched.push({label:item.sample||item.aliases?.[0]||('항목 '+(i+1)),ok:true})}
  }
  const need=rule.required;const checks=matched.slice(0,need);
  while(checks.length<need)checks.push({label:'서로 다른 정답 '+need+'개 중 누락된 항목',ok:false});
  if(used.size<chunks.length&&matched.length>=need)return{status:'review',checks:[...checks,{label:'추가로 쓴 항목의 타당성을 확인하세요.',ok:false,ambiguous:true}]};
  return finish(checks);
 }
 if(rule.mode!=='parts')return finish(evaluate(rule,input,'답안',isChoiceQuestion(question)));
 // 번호. 형식만 받습니다. A/B/C 표기 답안은 허용하지 않습니다.
 const pattern=/(?:^|\n|[,;]\s*)\s*([1-9][0-9]*)\s*\.\s*/g;
 const matches=[...input.matchAll(pattern)],sections={},duplicates=new Set();
 for(let i=0;i<matches.length;i++){const m=matches[i],label=m[1];if(Object.hasOwn(sections,label))duplicates.add(label);sections[label]=(sections[label]||'')+input.slice(m.index+m[0].length,i+1<matches.length?matches[i+1].index:input.length)}
 if(!matches.length||/^(?!\s*\d+\s*\.)/u.test(input))return{status:'review',checks:[{label:'1. 답, 2. 답 형식으로 숫자와 마침표를 사용하세요.',ok:false,ambiguous:true}]};
 const checks=[];for(const part of rule.parts||[]){const partNumber=numberOfLabel(part.label);const value=sections[partNumber];if(value===undefined||!value.trim()){for(const label of part.mode==='criteria'?(part.groups||[]).map(g=>g[0]):['답안'])checks.push({label:partNumber+' · '+label+' · 미응답',ok:false});continue}const items=evaluate(part,value,partNumber);if(duplicates.has(partNumber))for(const item of items){item.ok=false;item.ambiguous=true}checks.push(...items)}
 return finish(checks);
}
function currentGrade(q,value){const auto=grade(q,value),previous=saved.results[q.id];if(auto.status==='review'&&previous?.manual&&previous.answer===value)return{status:previous.status,checks:previous.checks,manual:true};return auto}

window.ChaesoGrade=grade;const names={correct:'정답',partial:'부분정답',wrong:'오답',review:'확인 필요'};function shuffle(list){const next=[...list];for(let i=next.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[next[i],next[j]]=[next[j],next[i]]}return next}function saveDraft(){if(queue[index]){saved.drafts[queue[index].id]=answer.value;persist()}}function showHome(){saveDraft();home.hidden=false;quiz.hidden=true;submission.hidden=true}function start(list,random=true){if(!list.length){notice.textContent='아직 해당하는 문제가 없습니다.';return}saveDraft();queue=random?shuffle(list):[...list];index=0;home.hidden=true;quiz.hidden=false;submission.hidden=true;render()}function render(){const q=queue[index];$('[data-category]').textContent=q.subject;$('[data-prompt]').textContent=q.prompt;let figures=$('#question-figures');if(!figures){figures=document.createElement('div');figures.id='question-figures';$('[data-prompt]').insertAdjacentElement('afterend',figures)}figures.replaceChildren();for(const [i,item] of (q.images||[]).entries()){if(!/^figures\/[a-f0-9]+\.png$/.test(item.src))continue;const a=document.createElement('a');a.href=item.src;a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label','문제 그림 '+(i+1)+' 크게 보기');const img=document.createElement('img');img.src=item.src;img.alt=item.alt||'문제 조건 그림';img.loading='eager';img.style.cssText='display:block;max-width:100%;height:auto;margin:12px 0;background:white;border-radius:8px';img.onerror=()=>{img.alt='문제 그림을 불러오지 못했습니다. figures 폴더가 같은 경로에 있는지 확인하세요.'};a.append(img);figures.append(a)}$('[data-format]').textContent=numberizeHint(q);$('[data-format]').append(document.createTextNode(' · '+q.origin+(q.exam?' · '+q.exam:'')));$('#quiz-progress').textContent=`${index+1} / ${queue.length} · ${q.kind}`;answer.value=saved.drafts[q.id]||'';result.hidden=true;$('#bookmark').textContent=saved.stars.includes(q.id)?'★ 저장됨':'☆ 저장';$('#bookmark').setAttribute('aria-pressed',String(saved.stars.includes(q.id)));$('#previous').disabled=index===0;$('#next').disabled=false;$('#next').textContent=index===queue.length-1?'제출하기':'다음 →'}answer.addEventListener('input',saveDraft);function showResult(q,grading){
 result.hidden=false;result.replaceChildren();
 if(grading){
  const title=document.createElement('div');title.className='status-label';
  title.textContent=names[grading.status]+' · '+grading.checks.filter(c=>c.ok).length+'/'+grading.checks.length+' 요소 충족';
  result.append(title);
 }
 const box=document.createElement('div');
 box.style.cssText='background:#e8f7ed;color:#14532d;border:1px solid #86c99a;border-radius:12px;padding:16px 18px;margin-top:12px;line-height:1.65';
 const model=document.createElement('div');
 model.style.cssText='font-weight:700;white-space:pre-wrap;font-size:16px';
 model.textContent='정답: '+numberizeAnswer(q.answer);
 box.append(model);
 if(q.explanation){
  const explanation=document.createElement('div');
  explanation.style.cssText='white-space:pre-wrap;margin-top:10px;font-size:14px';
  explanation.textContent=q.explanation;
  box.append(explanation);
 }
 result.append(box);
 if(grading?.status==='review'){
  const manual=document.createElement('div');manual.style.marginTop='12px';
  const p=document.createElement('p');p.textContent='자동 판정이 어려운 답안입니다. 정답과 설명을 확인한 뒤 직접 판정할 수 있습니다.';manual.append(p);
  for(const [label,status,n,total] of [['정답으로 기록','correct',1,1],['부분정답으로 기록','partial',1,2],['오답으로 기록','wrong',0,1]]){
   const button=document.createElement('button');button.className='secondary';button.style.margin='4px';button.textContent=label;
   button.onclick=()=>{const checks=Array.from({length:total},(_,i)=>({label:'직접 비교 판정',ok:i<n}));const g={status,checks,manual:true};saved.results[q.id]={...g,answer:answer.value,time:Date.now()};persist();showResult(q,g)};
   manual.append(button);
  }
  result.append(manual);
 }
}
$('[data-grade]').onclick=()=>{const q=queue[index],grading=currentGrade(q,answer.value);if(grading.status==='empty'){result.hidden=false;result.textContent='답안을 먼저 작성하세요.';return}saveDraft();saved.results[q.id]={status:grading.status,answer:answer.value,time:Date.now(),manual:!!grading.manual,checks:grading.checks};persist();showResult(q,grading)};$('[data-model]').onclick=()=>showResult(queue[index],null);$('#bookmark').onclick=()=>{const id=queue[index].id;saved.stars=saved.stars.includes(id)?saved.stars.filter(x=>x!==id):[...saved.stars,id];persist();$('#bookmark').textContent=saved.stars.includes(id)?'★ 저장됨':'☆ 저장';$('#bookmark').setAttribute('aria-pressed',String(saved.stars.includes(id)))};$('#next').onclick=()=>{saveDraft();if(index<queue.length-1){index++;render()}else submitSession()};$('#previous').onclick=()=>{saveDraft();if(index>0){index--;render()}};function submitSession(){
 saveDraft();
 const answered=queue.filter(q=>(saved.drafts[q.id]||'').trim());
 if(!answered.length){result.hidden=false;result.textContent='작성한 답안이 없습니다. 한 문제 이상 작성한 뒤 제출하세요.';return}
 const counts={correct:0,partial:0,wrong:0,review:0};let earned=0;const rows=[];
 for(const q of answered){const value=saved.drafts[q.id],g=currentGrade(q,value);counts[g.status]++;earned+=g.status==='review'?0:g.checks.filter(c=>c.ok).length/g.checks.length;saved.results[q.id]={status:g.status,answer:value,time:Date.now(),manual:!!g.manual,checks:g.checks};rows.push({q,g})}
 persist();quiz.hidden=true;submission.hidden=false;submission.replaceChildren();
 const title=document.createElement('h1');title.textContent='제출 결과';submission.append(title);
 const score=document.createElement('p');score.className='status-label';score.textContent='학습 점수 '+(answered.length-counts.review?Math.round(earned/(answered.length-counts.review)*100)+'점 / 100점':'확정할 수 없음 · 답안 형식을 확인하세요.');submission.append(score);
 const stats=document.createElement('p');stats.textContent=`작성 ${answered.length} / 전체 ${queue.length}문항 · 정답 ${counts.correct} · 부분정답 ${counts.partial} · 오답 ${counts.wrong} · 형식 확인 ${counts.review} · 미응답 ${queue.length-answered.length}`;submission.append(stats);
 const detail=document.createElement('p');detail.className='muted';detail.textContent='작성한 문제만 채점합니다. 각 문제는 같은 비중이며 부분정답은 충족한 요소 비율을 반영합니다. 형식 확인 문항은 점수 확정에서 제외합니다. 미응답은 점수에서 제외합니다. 공식 시험 점수가 아닌 학습용 점수입니다.';submission.append(detail);
 const continueButton=document.createElement('button');continueButton.className='primary';continueButton.textContent='이어서 풀기';continueButton.onclick=()=>{submission.hidden=true;quiz.hidden=false;render()};
 const homeButton=document.createElement('button');homeButton.className='secondary';homeButton.textContent='분야 선택으로';homeButton.onclick=showHome;submission.append(continueButton,document.createTextNode(' '),homeButton);
 for(const {q,g} of rows){const b=document.createElement('button');b.className='collection-item';b.textContent=names[g.status]+' · '+q.prompt;b.onclick=()=>{index=queue.findIndex(item=>item.id===q.id);submission.hidden=true;quiz.hidden=false;render();showResult(q,g)};submission.append(b)}
}
$('#submit-session').onclick=submitSession;
root.querySelectorAll('[data-back],[data-home]').forEach(b=>b.onclick=()=>{showHome();collection.hidden=true;sourcePanel.hidden=true;notice.textContent=''});root.querySelectorAll('[data-subject]').forEach(b=>b.onclick=()=>start(b.dataset.subject==='전체랜덤'?bank:bank.filter(q=>q.subject===b.dataset.subject)));root.querySelectorAll('[data-side]').forEach(b=>b.onclick=()=>{showHome();sourcePanel.hidden=true;collection.hidden=false;collection.replaceChildren();const star=b.dataset.side==='저장한 문제';const list=[...new Map([...bank,...pastBank,...legacyBank].map(q=>[q.id,q])).values()].filter(q=>star?saved.stars.includes(q.id):saved.results[q.id]&&saved.results[q.id].status!=='correct');const heading=document.createElement('h2');heading.textContent=b.dataset.side+' · '+list.length+'문항';collection.append(heading);if(!list.length){const p=document.createElement('p');p.textContent=star?'문제 화면에서 ☆ 저장을 눌러 모아보세요.':'아직 오답이 없습니다. 채점 결과가 오답·부분정답·확인 필요인 문제가 모입니다.';collection.append(p);return}const all=document.createElement('button');all.className='primary';all.textContent='모아둔 문제 풀기';all.onclick=()=>start(list);collection.append(all);for(const q of list){const button=document.createElement('button');button.className='collection-item';button.textContent=q.subject+' · '+q.prompt;button.onclick=()=>start([q],false);collection.append(button)}});async function load(){
 notice.textContent='문제은행을 불러오는 중입니다.';
 try{
  const r=await fetch('./questions.json',{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);
  bank=await r.json();
  const intro=$('.intro');if(intro)intro.textContent=bank.length.toLocaleString('ko-KR')+'개 연습문제를 섞어 풀어보세요.';
  if(!Array.isArray(bank)||bank.length===0||new Set(bank.map(q=>q.id)).size!==bank.length)throw new Error('Invalid practice bank');
  const optional=await Promise.allSettled(['past-exams.json','legacy-questions.json'].map(async file=>{const response=await fetch('./'+file,{cache:'no-store'});if(!response.ok)throw new Error(file);const data=await response.json();if(!Array.isArray(data))throw new Error(file);return data}));
  pastBank=optional[0].status==='fulfilled'?optional[0].value:[];
  legacyBank=optional[1].status==='fulfilled'?optional[1].value:[];
  $('.foot').textContent=`연습 ${bank.length}문항 · 다른 회차의 재출제 문항 포함 · 공식 문제지 전체 복원이 아닌 인터넷 복원 자료입니다.`;
  notice.textContent=storageOK?'':'현재 환경에서는 기록을 저장할 수 없습니다.';
  root.querySelectorAll('[data-subject]').forEach(b=>{const count=b.dataset.subject==='전체랜덤'?bank.length:bank.filter(q=>q.subject===b.dataset.subject).length;b.querySelector('small').append(document.createTextNode(' · '+count+'문항'))});
  const years=$('.years');years.replaceChildren();for(const examKey of [...new Set(pastBank.map(q=>q.examKey))].reverse()){const list=pastBank.filter(q=>q.examKey===examKey);const b=document.createElement('button');b.className='year';b.textContent=list[0].exam+' · 일부 복원 '+list.length+'문항';b.onclick=()=>start(list);years.append(b)}
 }catch(e){notice.textContent='문제은행을 불러오지 못했습니다. 새로고침해주세요.';console.error(e)}
}load()})();
