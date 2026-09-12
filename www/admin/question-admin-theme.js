(()=>{
  const key="ajix-admin-theme";
  const apply=mode=>{document.documentElement.classList.toggle("ajx-dark",mode==="dark");document.querySelectorAll("[data-theme-toggle]").forEach(b=>{b.textContent=mode==="dark"?"☀":"☾";b.setAttribute("aria-label",mode==="dark"?"Use light theme":"Use dark theme")})};
  const saved=localStorage.getItem(key)||"light"; apply(saved);
  document.addEventListener("click",e=>{const b=e.target.closest("[data-theme-toggle]");if(!b)return;const mode=document.documentElement.classList.contains("ajx-dark")?"light":"dark";localStorage.setItem(key,mode);apply(mode)});
})();
