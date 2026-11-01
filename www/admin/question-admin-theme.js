(()=>{
  const key="ajix-admin-theme";
  const apply=mode=>{document.documentElement.classList.toggle("ajx-dark",mode==="dark");document.querySelectorAll("[data-theme-toggle]").forEach(b=>{b.textContent=mode==="dark"?"☀":"☾";b.setAttribute("aria-label",mode==="dark"?"Use light theme":"Use dark theme")})};
  const saved=localStorage.getItem(key)||"light"; apply(saved);
  document.addEventListener("click",e=>{const b=e.target.closest("[data-theme-toggle]");if(!b)return;const mode=document.documentElement.classList.contains("ajx-dark")?"light":"dark";localStorage.setItem(key,mode);apply(mode)});
  const setupSampleFilter=()=>{
    const toolbar=document.querySelector(".ajx-toolbar");
    const search=document.querySelector("[data-qa-search]");
    if(!toolbar||!search||document.querySelector("[data-qa-sample-filter]"))return;
    const label=document.createElement("label");
    label.className="ajx-type-filter";
    label.innerHTML='<span>Sample set</span> <select data-qa-sample-filter aria-label="Filter by sample set"><option value="">All sample sets</option></select>';
    toolbar.appendChild(label);
    const select=label.querySelector("select");
    const compactSampleSet=value=>String(value||"").replace(/^sample\s*/i,"");
    const sampleSetsById=new Map();
    const renderOptions=(values)=>{
      const current=select.value;
      select.innerHTML='<option value="">All sample sets</option>'+values.map(value=>{const safe=value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;");return `<option value="${safe}">${compactSampleSet(safe)}</option>`}).join("");
      if(values.includes(current))select.value=current;
    };
    document.querySelectorAll(".ajx-table thead th").forEach(header=>{if(header.textContent.trim()==="Year")header.textContent="Sample set"});
    const applyRows=()=>document.querySelectorAll("[data-qa-body] tr[data-question-row]").forEach(row=>{const sampleSet=sampleSetsById.get(String(row.dataset.questionRow))||"—";if(row.cells[4])row.cells[4].textContent=compactSampleSet(sampleSet);row.hidden=Boolean(select.value)&&sampleSet!==select.value});
    search.addEventListener("input",event=>{
      const match=String(search.value||"").trim().match(/^sample\s*:\s*(\d{2,4})(b)?$/i);
      if(!match)return;
      event.stopImmediatePropagation();
      const year=match[1].length===2?`20${match[1]}`:match[1];
      const requested=`Sample ${year.slice(-2)}${match[2]?'B':''}`;
      select.value=requested;
      search.value="";
      search.dispatchEvent(new Event("input",{bubbles:true}));
      setTimeout(()=>{search.value=`sample:${match[1]}${match[2]||""}`;applyRows()},0);
    },true);
    select.addEventListener("change",applyRows);
    const body=document.querySelector("[data-qa-body]");
    if(body)new MutationObserver(applyRows).observe(body,{childList:true});
    const host=location.hostname;
    const base=String(localStorage.getItem("quizApiBase")||(host==="localhost"||host==="127.0.0.1"?(location.port==="4100"?location.origin+"/api":"http://localhost:4000/api"):"https://api.ajixpharmacy.online/api")).replace(/\/+$/g,"");
    fetch(`${base}/admin/questions`,{headers:{"x-admin-key":localStorage.getItem("adminKey")||""},cache:"no-store"}).then(response=>response.ok?response.json():null).then(data=>{
      (Array.isArray(data?.questions)?data.questions:[]).forEach(question=>{const sitting=String(question.sitting||"").trim().toLowerCase();const year=Number(question.year);const derived=String(question.bank||"").toLowerCase()==="gppqe"&&Number.isFinite(year)?`Sample ${String(year).slice(-2)}${sitting==="december"?"B":""}`:"";const sampleSet=String(question.sampleSet||derived).trim();if(sampleSet)sampleSetsById.set(String(question.id),sampleSet)});
      renderOptions([...new Set(sampleSetsById.values())].sort((a,b)=>a.localeCompare(b)));
      applyRows();
    }).catch(()=>{});
  };
  const setupEditorSampleSet=()=>{
    const field=document.getElementById("gppqeYearField");
    const input=document.getElementById("fYear");
    if(!field||!input)return;
    const label=field.querySelector("label");
    if(label)label.firstChild.textContent="GPPQE sample set";
    input.type="text";
    input.placeholder="e.g. 25B";
    const host=location.hostname;
    const base=String(localStorage.getItem("quizApiBase")||(host==="localhost"||host==="127.0.0.1"?(location.port==="4100"?location.origin+"/api":"http://localhost:4000/api"):"https://api.ajixpharmacy.online/api")).replace(/\/+$/g,"");
    const loadSampleSet=()=>{
      const id=new URLSearchParams(location.search).get("id");
      if(!id)return;
      fetch(`${base}/admin/questions?id=${encodeURIComponent(id)}`,{headers:{"x-admin-key":localStorage.getItem("adminKey")||""},cache:"no-store"}).then(response=>response.ok?response.json():null).then(data=>{const sampleSet=String(data?.question?.sampleSet||"").trim();if(sampleSet)input.value=sampleSet.replace(/^sample\s*/i,"")}).catch(()=>{});
    };
    document.addEventListener("question-editor-data-ready",loadSampleSet);
    setTimeout(loadSampleSet,0);
  };
  setupEditorSampleSet();
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setupSampleFilter,{once:true});else setupSampleFilter();
})();
