"use strict";(()=>{var E=(e,n,s)=>()=>{if(s)throw s[0];try{return e&&(n=e(e=0)),n}catch(r){throw s=[r],r}};var T=(e,n)=>()=>{try{return n||e((n={exports:{}}).exports,n),n.exports}catch(s){throw n=0,s}};function M(e){return C[e]??"#6e7681"}function u(e){let n=document.createElement("div");return n.textContent=e,n.innerHTML}function S(e){let n=new Date,s=new Date(e),r=n.getTime()-s.getTime(),a=Math.floor(r/(1e3*60*60*24));if(a<1)return"today";if(a<30)return`${a} days ago`;let t=Math.floor(a/30);return t<12?`${t} months ago`:`${Math.floor(t/12)} years ago`}function b(e,n){let s=u(e.name),r=u(e.description),a=u(e.url),t=u(e.language),o=M(e.language),c=e.stars.toLocaleString(),p=S(e.updatedAt),i="";if(e.readmeExcerpt){let l=e.readmeExcerpt.length>150?e.readmeExcerpt.slice(0,150)+"\u2026":e.readmeExcerpt;i=`<blockquote class="card-readme">${u(l)}</blockquote>`}let d=e.topics.length>0?e.topics.map(l=>`<span class="topic-tag">${u(l)}</span>`).join(""):"";return`
<article class="repo-card" data-index="${n}">
  <h3 class="card-name"><a href="${a}" target="_blank" rel="noopener noreferrer">${s}</a></h3>
  <p class="card-desc">${r}</p>
  ${i}
  <div class="card-meta">
    <span class="card-stars">\u2605 ${c}</span>
    <span class="card-lang"><span class="lang-dot" style="color:${o}">\u25CF</span> ${t}</span>
    <span class="card-updated">Updated ${p}</span>
  </div>
  ${d?`<div class="card-topics">${d}</div>`:""}
</article>`.trim()}function f(e){let n=new Set;for(let s of e)s.language&&n.add(s.language);return Array.from(n).sort()}function m(e,n){return e.filter(s=>{if(n.language&&s.language!==n.language)return!1;if(n.search){let r=n.search.toLowerCase(),a=s.name.toLowerCase().includes(r),t=s.description.toLowerCase().includes(r);if(!a&&!t)return!1}return!0})}function g(e,n,s,r){let a=document.createElement("input");a.type="search",a.className="filter-search",a.placeholder="Search repositories\u2026",a.addEventListener("input",()=>{r({search:a.value,language:o})});let t=document.createElement("div");t.className="filter-languages";let o=null,c=document.createElement("button");c.className="lang-btn active",c.textContent="All",c.addEventListener("click",()=>{o=null,p(c),r({search:a.value,language:null})}),t.appendChild(c);for(let d of s){let l=document.createElement("button");l.className="lang-btn",l.textContent=d,l.addEventListener("click",()=>{o=d,p(l),r({search:a.value,language:d})}),t.appendChild(l)}function p(d){t.querySelectorAll(".lang-btn").forEach(L=>L.classList.remove("active")),d.classList.add("active")}let i=document.createElement("div");i.className="filter-bar",i.appendChild(a),i.appendChild(t),e.insertBefore(i,e.firstChild)}function y(e,n){let s=e.querySelector(".repo-grid")??e,r=n.map((t,o)=>b(t,o)).join(`
`);s.innerHTML=r;let a=s.querySelectorAll(".repo-card");requestAnimationFrame(()=>{a.forEach((t,o)=>{t.style.opacity="0",t.style.transform="translateY(12px)",t.style.transition="opacity 0.4s ease, transform 0.4s ease",t.style.transitionDelay=`${o*50}ms`,requestAnimationFrame(()=>{t.style.opacity="1",t.style.transform="translateY(0)"})})})}function h(e,n,s){let r=new Set(s);e.querySelectorAll(".repo-card").forEach(t=>{let o=parseInt(t.getAttribute("data-index")??"",10);if(isNaN(o))return;let c=n[o];if(r.has(c)){let i=t._hideTimer;i&&(clearTimeout(i),delete t._hideTimer),t.style.display==="none"&&(t.style.display="",t.style.opacity="0",t.style.transform="scale(0.95)",t.style.transition="opacity 0.3s ease, transform 0.3s ease",requestAnimationFrame(()=>{t.style.opacity="1",t.style.transform="scale(1)"}))}else t.style.display!=="none"&&(t.style.opacity="0",t.style.transform="scale(0.95)",t.style.transition="opacity 0.3s ease, transform 0.3s ease",t._hideTimer=setTimeout(()=>{t.style.display="none",delete t._hideTimer},300))})}var C,v=E(()=>{"use strict";C={TypeScript:"#3178c6",JavaScript:"#f1e05a",Python:"#3572a5",Go:"#00ADD8",Rust:"#dea584",Ruby:"#701516",HTML:"#e34c26",CSS:"#563d7c",Shell:"#89e051",Vue:"#41b883",Java:"#b07219",C:"#555555","C++":"#f34b7d",PHP:"#4F5D95",Swift:"#F05138",Kotlin:"#A97BFF"}});var w=T(()=>{v();async function H(){let e=document.getElementById("app");if(!e){console.error("App container not found");return}e.innerHTML=`
    <header class="gallery-header">
      <h1 class="gallery-title">
        <a href="https://github.com" target="_blank" rel="noopener">
          <svg class="gh-icon" viewBox="0 0 16 16" width="32" height="32">
            <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
        </a>
        RepoGallery
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
  `;try{let n=await fetch("repos.json");if(!n.ok)throw new Error(`HTTP ${n.status}`);let s=await n.json();R(e,s)}catch(n){let s=e.querySelector(".repo-grid");s&&(s.innerHTML='<div class="error-msg">Failed to load repositories. Make sure repos.json exists.</div>'),console.error(n)}}function R(e,n){if(!e.querySelector(".repo-grid"))return;let r=f(n);y(e,n),g(e,n,r,a=>{let t=m(n,a);h(e,n,t)})}document.addEventListener("DOMContentLoaded",H)});w();})();
