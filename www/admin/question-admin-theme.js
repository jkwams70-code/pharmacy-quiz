(()=>{
  const key="ajix-admin-theme";
  const apiBase=()=>String(localStorage.getItem("quizApiBase")||(location.hostname==="localhost"||location.hostname==="127.0.0.1"?(location.port==="4100"?location.origin+"/api":"http://localhost:4000/api"):"https://api.ajixpharmacy.online/api")).replace(/\/+$/g,"");
  const adminHeaders=()=>({"x-admin-key":localStorage.getItem("adminKey")||""});
  const apply=mode=>{document.documentElement.classList.toggle("ajx-dark",mode==="dark");document.querySelectorAll("[data-theme-toggle]").forEach(b=>{b.textContent=mode==="dark"?"☀":"☾";b.setAttribute("aria-label",mode==="dark"?"Use light theme":"Use dark theme")})};
  apply(localStorage.getItem(key)||"light");
  document.addEventListener("click",e=>{const b=e.target.closest("[data-theme-toggle]");if(!b)return;const mode=document.documentElement.classList.contains("ajx-dark")?"light":"dark";localStorage.setItem(key,mode);apply(mode)});
  const setKey=q=>{const rawYear=String(q?.year??"").trim();const yearMatch=rawYear.match(/^(\d{4})\s*([A-Za-z])?$/);const year=yearMatch?.[1]||rawYear;if(!/^\d{4}$/.test(year))return "";const rawSitting=String(q?.sitting||"").trim().toLowerCase();const legacyMain=String(q?.setLetter||"").toUpperCase()==="B"||String(yearMatch?.[2]||"").toUpperCase()==="B"||/B$/i.test(String(q?.sampleSet||""))||/Sample\s*25B$/i.test(String(q?.category||""))||rawSitting==="december";const resit=rawSitting==="resit"||(!rawSitting&&year==="2025"&&!legacyMain);return `${year}${resit?"R":""}`};
  const setupYearFilter=()=>{
    const toolbar=document.querySelector(".ajx-toolbar"),search=document.querySelector("[data-qa-search]");
    if(!toolbar||!search||document.querySelector("[data-qa-year-filter]"))return;
    const label=document.createElement("label");label.className="ajx-type-filter";label.innerHTML='<span>Year</span> <select data-qa-year-filter aria-label="Filter by year"><option value="">All years</option></select>';toolbar.appendChild(label);
    const select=label.querySelector("select");
    const applyRows=()=>document.querySelectorAll("[data-qa-body] tr[data-question-row]").forEach(row=>{const value=yearsByIdGlobal.get(String(row.dataset.questionRow))||"";if(row.cells[4])row.cells[4].textContent=value||"—";row.hidden=Boolean(select.value)&&value!==select.value});
    search.addEventListener("input",event=>{const match=String(search.value||"").trim().match(/^year\s*:\s*(\d{2,4})([a-z])?$/i);if(!match||!match[2])return;event.stopImmediatePropagation();const year=match[1].length===2?`20${match[1]}`:match[1];select.value=`${year}${match[2].toUpperCase()}`;search.value="";search.dispatchEvent(new Event("input",{bubbles:true}));setTimeout(()=>{search.value=`year:${match[1]}${match[2]}`;applyRows()},0)},true);
    select.addEventListener("change",applyRows);
    fetch(`${apiBase()}/admin/questions`,{headers:adminHeaders(),cache:"no-store"}).then(r=>r.ok?r.json():null).then(data=>{(Array.isArray(data?.questions)?data.questions:[]).forEach(q=>{const value=setKey(q);if(value)yearsByIdGlobal.set(String(q.id),value)});const values=[...new Set(yearsByIdGlobal.values())].sort((a,b)=>a.localeCompare(b));select.innerHTML='<option value="">All years</option>'+values.map(value=>`<option value="${value}">${value}</option>`).join("");applyRows()}).catch(()=>{});
  };
  const setupEditorYearSet=()=>{
    const field=document.getElementById("gppqeYearField");let input=document.getElementById("fYear");if(!field||!input)return;
    if(input.tagName!=="SELECT"){
      const select=document.createElement("select");select.id=input.id;select.className=input.className;select.setAttribute("aria-label","GPPQE year");select.innerHTML='<option value="">Select year</option>'+Array.from({length:110},(_,index)=>{const year=1990+index;return `<option value="${year}">${year}</option>`}).join("");input.replaceWith(select);input=select;
    }
    let sittingSelect=document.getElementById("fSitting");if(!sittingSelect){const wrapper=document.createElement("label");wrapper.className="ajx-field";wrapper.style.marginTop="8px";wrapper.innerHTML='<span>Sitting</span> <select id="fSitting" class="ajx-select" aria-label="GPPQE sitting"><option value="main">Main</option><option value="resit">Resit</option></select>';field.appendChild(wrapper);sittingSelect=wrapper.querySelector("select")}
    const isResit=q=>{const rawSitting=String(q?.sitting||"").trim().toLowerCase();return rawSitting==="resit"||(!rawSitting&&String(q?.year||"")==="2025"&&!String(q?.setLetter||"").toUpperCase().match(/^B$/)&&!String(q?.sampleSet||"").match(/B$/i)&&!String(q?.category||"").match(/Sample\s*25B$/i))};
    window.addEventListener("question-editor-data-ready",()=>{sittingSelect.value="main"});
  };
  const reinforceEditorSet=()=>{const select=document.getElementById("fSitting");const id=new URLSearchParams(location.search).get("id");if(!select||!id)return;fetch(`${apiBase()}/admin/questions?summary=1`,{headers:adminHeaders(),cache:"no-store"}).then(r=>r.ok?r.json():null).then(data=>{const q=(Array.isArray(data?.questions)?data.questions:[]).find(item=>String(item.id)===String(id))||{};select.value=setKey(q).endsWith("R")?"resit":"main"}).catch(()=>{})};
  window.addEventListener("question-editor-data-ready",()=>[0,100,300,700,1400].forEach(delay=>setTimeout(reinforceEditorSet,delay)));
  const setupFilteredModal=()=>{
    let activeId="";
    const visibleIds=()=>[...document.querySelectorAll("[data-qa-body] tr[data-question-row]:not([hidden])")].map(row=>String(row.dataset.questionRow));
    const syncModal=()=>{
      const ids=visibleIds(),index=ids.indexOf(activeId),title=document.getElementById("ajxModalTitle");
      if(title&&index>=0)title.textContent=`Question ${index+1} of ${ids.length}`;
      const format=document.querySelector("#ajxModalBody .ajx-quiz-format");
      const row=activeId?[...document.querySelectorAll("[data-qa-body] tr[data-question-row]")].find(item=>String(item.dataset.questionRow)===activeId):null;
      const year=activeId?(yearsByIdGlobal.get(activeId)||row?.cells?.[4]?.textContent?.trim()||""):"";
      if(format&&year)format.textContent=`GPPQE [${year}]`;
    };
    document.addEventListener("click",event=>{
      const view=event.target.closest("[data-view]");
      if(view){activeId=String(view.dataset.view||"");setTimeout(syncModal,0);return}
      const row=event.target.closest("[data-question-row]");
      if(row){activeId=String(row.dataset.questionRow||"");setTimeout(syncModal,0);return}
      const nav=event.target.closest("[data-view-prev],[data-view-next]");
      if(!nav)return;
      event.preventDefault();event.stopImmediatePropagation();
      const ids=visibleIds(),current=ids.indexOf(activeId),next=nav.hasAttribute("data-view-next")?current+1:current-1;
      if(next>=0&&next<ids.length){const button=[...document.querySelectorAll("[data-qa-body] [data-view]")].find(item=>String(item.dataset.view||"")===ids[next]);if(button){button.click();setTimeout(syncModal,0)}}
    },true);
    const modalBody=document.getElementById("ajxModalBody");
    if(modalBody){
      const modalObserver=new MutationObserver(()=>setTimeout(syncModal,0));
      modalObserver.observe(modalBody,{childList:true,subtree:true});
    }
  };
  const yearsByIdGlobal=new Map();
  const originalFetch=window.fetch.bind(window);window.fetch=async(input,init={})=>{const url=typeof input==="string"?input:input?.url||"",method=String(init.method||input?.method||"GET").toUpperCase();if((method==="POST"||method==="PUT")&&/\/api\/admin\/questions(?:\/|\?|$)/.test(url)&&init.body&&document.getElementById("fSetLetterB")){try{const payload=JSON.parse(init.body);payload.setLetter=document.getElementById("fGppqe")?.checked&&document.getElementById("fSetLetterB").checked?"B":"";delete payload.sampleSet;init={...init,body:JSON.stringify(payload)}}catch{}}return originalFetch(input,init)};
  const sittingFetch=window.fetch.bind(window);window.fetch=async(input,init={})=>{const url=typeof input==="string"?input:input?.url||"",method=String(init.method||input?.method||"GET").toUpperCase();if((method==="POST"||method==="PUT")&&/\/api\/admin\/questions(?:\/|\?|$)/.test(url)&&init.body&&document.getElementById("fSitting")){try{const payload=JSON.parse(init.body);if(document.getElementById("fGppqe")?.checked){payload.sitting=document.getElementById("fSitting").value||"main";delete payload.setLetter;delete payload.sampleSet}init={...init,body:JSON.stringify(payload)}}catch{}}return sittingFetch(input,init)};
  setupEditorYearSet();setupFilteredModal();if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setupYearFilter,{once:true});else setupYearFilter();
})();

// Preserve the bank view when opening a preview, editing, or refreshing.
// Review has its own state helper; this covers the read-only question bank.
(()=>{
  if(!/question-bank\.html$/i.test(location.pathname))return;
  const stateKey='ajix-question-bank-state-v1';
  let currentViewQuestionId='';
  const read=()=>{try{const value=JSON.parse(sessionStorage.getItem(stateKey)||'null');return value&&typeof value==='object'?value:null}catch{return null}};
  const save=viewQuestionId=>{
    const active=document.querySelector('[data-qa-filter].active');
    const sort=document.querySelector('[data-qa-sort]');
    sessionStorage.setItem(stateKey,JSON.stringify({
      filter:active?.dataset.qaFilter||'all',
      search:document.querySelector('[data-qa-search]')?.value||'',
      typeFilter:document.querySelector('[data-qa-type-filter]')?.value||'all',
      yearFilter:document.querySelector('[data-qa-year-filter]')?.value||'',
      ascending:String(sort?.textContent||'').indexOf('1')<String(sort?.textContent||'').indexOf('last'),
      viewQuestionId:String(viewQuestionId||''),
      savedAt:Date.now()
    }));
  };
  document.addEventListener('click',event=>{
    const view=event.target.closest('[data-view]');
    if(view)currentViewQuestionId=String(view.dataset.view||'');
    const row=event.target.closest('[data-question-row]');
    if(row)currentViewQuestionId=String(row.dataset.questionRow||'');
    const link=event.target.closest('a[href*="question-edit.html"]');
    if(!link)return;
    try{save(new URL(link.href,location.href).searchParams.get('id')||'')}catch{save('')}
  },true);
  window.addEventListener('pagehide',()=>save(document.querySelector('#ajxModal.open')?currentViewQuestionId:''));
  const restore=(attempt=0)=>{
    const state=read();
    if(!state||Date.now()-Number(state.savedAt||0)>30*60*1000)return;
    const body=document.querySelector('[data-qa-body]');
    const year=document.querySelector('[data-qa-year-filter]');
    if(!body||!body.children.length||state.yearFilter&&(!year||![...year.options].some(option=>option.value===state.yearFilter))){
      if(attempt<60)setTimeout(()=>restore(attempt+1),150);
      return;
    }
    const search=document.querySelector('[data-qa-search]');
    const type=document.querySelector('[data-qa-type-filter]');
    const tab=[...document.querySelectorAll('[data-qa-filter]')].find(item=>item.dataset.qaFilter===String(state.filter||'all'));
    if(search&&search.value!==String(state.search||'')){search.value=String(state.search||'');search.dispatchEvent(new Event('input',{bubbles:true}))}
    if(type&&type.value!==String(state.typeFilter||'all')){type.value=String(state.typeFilter||'all');type.dispatchEvent(new Event('change',{bubbles:true}))}
    if(year&&year.value!==String(state.yearFilter||'')){year.value=String(state.yearFilter||'');year.dispatchEvent(new Event('change',{bubbles:true}))}
    if(tab&&!tab.classList.contains('active'))tab.click();
    const sort=document.querySelector('[data-qa-sort]');
    const current=String(sort?.textContent||'').indexOf('1')<String(sort?.textContent||'').indexOf('last');
    if(sort&&current!==(state.ascending!==false))sort.click();
    const id=String(state.viewQuestionId||'');
    sessionStorage.removeItem(stateKey);
    if(id)setTimeout(()=>[...document.querySelectorAll('[data-view]')].find(item=>String(item.dataset.view)===id)?.click(),100);
  };
  window.addEventListener('load',()=>setTimeout(restore,250),{once:true});
})();
