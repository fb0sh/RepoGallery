"use strict";(()=>{var u=(e,t,r)=>()=>{if(r)throw r[0];try{return e&&(t=e(e=0)),t}catch(a){throw r=[a],a}};var h=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(r){throw t=0,r}};function v(e){return y[e]??"#6e7681"}function i(e){let t=document.createElement("div");return t.textContent=e,t.innerHTML}function M(e){let t=new Date,r=new Date(e),a=t.getTime()-r.getTime(),n=Math.floor(a/(1e3*60*60*24));if(n<1)return"today";if(n<30)return`${n} days ago`;let s=Math.floor(n/30);return s<12?`${s} months ago`:`${Math.floor(s/12)} years ago`}function $(e,t){let r=i(e.name),a=i(e.description),n=i(e.url),s=i(e.language),o=v(e.language),g=e.stars.toLocaleString(),m=M(e.updatedAt),l="";if(e.readmeExcerpt){let c=e.readmeExcerpt.length>150?e.readmeExcerpt.slice(0,150)+"\u2026":e.readmeExcerpt;l=`<blockquote class="card-readme">${i(c)}</blockquote>`}let d=e.topics.length>0?e.topics.map(c=>`<span class="topic-tag">${i(c)}</span>`).join(""):"";return`
<article class="repo-card">
  <h3 class="card-name"><a href="${n}" target="_blank" rel="noopener noreferrer">${r}</a></h3>
  <p class="card-desc">${a}</p>
  ${l}
  <div class="card-meta">
    <span class="card-stars">\u2605 ${g}</span>
    <span class="card-lang"><span class="lang-dot" style="color:${o}">\u25CF</span> ${s}</span>
    <span class="card-updated">Updated ${m}</span>
  </div>
  ${d?`<div class="card-topics">${d}</div>`:""}
</article>`.trim()}function p(e,t){let r=e.querySelector(".repo-grid")??e,a=t.map((s,o)=>$(s,o)).join(`
`);r.innerHTML=a;let n=r.querySelectorAll(".repo-card");requestAnimationFrame(()=>{n.forEach((s,o)=>{s.style.opacity="0",s.style.transform="translateY(12px)",s.style.transition="opacity 0.4s ease, transform 0.4s ease",s.style.transitionDelay=`${o*50}ms`,requestAnimationFrame(()=>{s.style.opacity="1",s.style.transform="translateY(0)"})})})}var y,f=u(()=>{"use strict";y={TypeScript:"#3178c6",JavaScript:"#f1e05a",Python:"#3572a5",Go:"#00ADD8",Rust:"#dea584",Ruby:"#701516",HTML:"#e34c26",CSS:"#563d7c",Shell:"#89e051",Vue:"#41b883",Java:"#b07219",C:"#555555","C++":"#f34b7d",PHP:"#4F5D95",Swift:"#F05138",Kotlin:"#A97BFF"}});var E=h(()=>{f();async function H(){let e=document.getElementById("app");if(!e){console.error("App container not found");return}e.innerHTML=`
    <header class="gallery-header">
      <h1 class="gallery-title">
        <a href="https://github.com" target="_blank" rel="noopener">
          <svg class="gh-icon" viewBox="0 0 16 16" width="32" height="32">
            <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
        </a>
        fb0sh's RepoGallery
      </h1>
      <p class="gallery-subtitle">Projects I've built</p>
    </header>
    <div class="gallery-content">
      <div class="repo-grid">
        <div class="loading">Loading repositories\u2026</div>
      </div>
    </div>
    <footer class="gallery-footer">
      <p>Built with \u2665</p>
    </footer>
  `;try{let t=await fetch("repos.json");if(!t.ok)throw new Error(`HTTP ${t.status}`);let r=await t.json();L(e,r)}catch(t){let r=e.querySelector(".repo-grid");r&&(r.innerHTML='<div class="error-msg">Failed to load repositories. Make sure repos.json exists.</div>'),console.error(t)}}function L(e,t){p(e,t)}document.addEventListener("DOMContentLoaded",H)});E();})();
