/* Preferências de acessibilidade: fonte, contraste, movimento, botões e leitura simplificada. */
(function(){
 const defaults={font:0,contrast:false,motion:false,targets:false,easy:false};
 let prefs={...defaults};
 const key=()=>'sc-v2-accessibility-'+(window.SCActiveUserId||'guest');
 const q=s=>document.querySelector(s);
 const template=()=>'<div class="a11y-actions" aria-label="Ferramentas de acessibilidade"><button type="button" class="btn" id="accessBtn" aria-haspopup="dialog">Meu Modo</button></div><dialog id="accessDialog" aria-labelledby="accessTitle"><div class="a11y-dialog"><div class="a11y-dialog-heading"><div><div class="eyebrow">ACESSIBILIDADE</div><h2 id="accessTitle">Meu Modo</h2><p>Personalize a plataforma para aprender no seu ritmo.</p></div><button type="button" class="btn" id="accessClose">Fechar</button></div><div class="a11y-group"><strong>Tamanho do texto</strong><div role="group" aria-label="Tamanho do texto" class="a11y-font"><button type="button" data-font="0" class="btn">A</button><button type="button" data-font="1" class="btn">A+</button><button type="button" data-font="2" class="btn">A++</button></div></div><label class="a11y-option"><span>Alto contraste<small>Aumenta a diferença entre texto e fundo</small></span><input type="checkbox" data-a11y="contrast"></label><label class="a11y-option"><span>Reduzir animações<small>Evita transições e movimentos desnecessários</small></span><input type="checkbox" data-a11y="motion"></label><label class="a11y-option"><span>Botões maiores<small>Facilita cliques e toques</small></span><input type="checkbox" data-a11y="targets"></label><label class="a11y-option"><span>Leitura simplificada<small>Mais espaço entre linhas nas aulas</small></span><input type="checkbox" data-a11y="easy"></label><div class="a11y-dialog-footer"><button type="button" class="btn" id="accessReset">Restaurar padrão</button><button type="button" class="btn primary" id="accessDone">Concluir</button></div></div></dialog>';
 const style=document.createElement('style');
 style.textContent='.a11y-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.a11y-actions .btn{font-size:13px;padding:9px 12px;white-space:nowrap}.a11y-dialog{width:min(540px,calc(100vw - 32px));padding:27px;background:#fff;border-radius:16px}.a11y-dialog-heading{display:flex;justify-content:space-between;gap:10px;align-items:start}.a11y-dialog-heading h2{margin:5px 0}.a11y-dialog-heading p{font-size:14px;color:#667085}.a11y-group{padding:16px 0;border-top:1px solid #e5e7eb}.a11y-font{display:flex;gap:8px;margin-top:12px}.a11y-font button[aria-pressed=true]{background:#0b57d0;color:white}.a11y-option{display:flex;justify-content:space-between;align-items:center;gap:15px;border-top:1px solid #e5e7eb;padding:15px 0;font-weight:600}.a11y-option small{display:block;color:#667085;font-weight:400;margin-top:5px}.a11y-option input{width:22px;height:22px;accent-color:#0b57d0;flex-shrink:0}.a11y-dialog-footer{display:flex;gap:10px;justify-content:end;margin-top:18px}#accessDialog{border:0;border-radius:16px;padding:0;max-height:90dvh;overflow:auto;box-shadow:0 25px 90px #10182840}#accessDialog::backdrop{background:#101828aa}html.sc-font-1{font-size:18px}html.sc-font-2{font-size:21px}html.sc-font-1 .card p,html.sc-font-1 .lead,html.sc-font-1 .meta,html.sc-font-1 .lesson,html.sc-font-1 .top a,html.sc-font-1 #sideNav a{font-size:1.08rem}html.sc-font-2 .card p,html.sc-font-2 .lead,html.sc-font-2 .meta,html.sc-font-2 .lesson,html.sc-font-2 .top a,html.sc-font-2 #sideNav a{font-size:1.18rem}html.sc-font-1 .headline{font-size:2.3rem}html.sc-font-2 .headline{font-size:2.5rem}html.sc-font-1 .content,html.sc-font-2 .content{font-size:1.12em}body.sc-contrast{background:#fff;color:#080808}body.sc-contrast .card,body.sc-contrast .sc-stat,body.sc-contrast #sideMenu{border-color:#111;background:#fff;color:#000}body.sc-contrast .muted,body.sc-contrast .lead,body.sc-contrast p,body.sc-contrast .meta{color:#222}body.sc-contrast a{color:#003caa}body.sc-contrast .sc-hero,body.sc-contrast .auth-promo{background:#00236c;color:#fff}body.sc-contrast .sc-hero p,body.sc-contrast .auth-promo p{color:#fff}body.sc-targets a,body.sc-targets button,body.sc-targets input{min-height:48px}body.sc-easy .content{font-size:1.12rem;line-height:2.1;max-width:65ch}body.sc-motion *,body.sc-motion *:before,body.sc-motion *:after{animation:none!important;transition:none!important;scroll-behavior:auto!important}@media(max-width:760px){.a11y-actions .btn{font-size:12px;padding:8px}.a11y-dialog{padding:18px}}@media print{.a11y-actions,#accessDialog{display:none!important}}';
 function apply(){
  const root=document.documentElement;
  root.classList.toggle('sc-font-1',prefs.font===1);root.classList.toggle('sc-font-2',prefs.font===2);
  ['contrast','motion','targets','easy'].forEach(k=>document.body.classList.toggle('sc-'+k,!!prefs[k]));
  document.querySelectorAll('[data-a11y]').forEach(e=>{e.checked=!!prefs[e.dataset.a11y]});
  document.querySelectorAll('[data-font]').forEach(e=>e.setAttribute('aria-pressed',String(Number(e.dataset.font)===prefs.font)));
 }
 function save(){try{localStorage.setItem(key(),JSON.stringify(prefs))}catch(e){}apply()}
 function load(){try{const x=JSON.parse(localStorage.getItem(key())||'{}');prefs={font:[0,1,2].includes(x.font)?x.font:0,contrast:x.contrast===true,motion:x.motion===true,targets:x.targets===true,easy:x.easy===true}}catch(e){prefs={...defaults}}apply()}
 function init(){
  document.head.appendChild(style);
  const holder=document.createElement('div');holder.innerHTML=template();
  const header=q('.top');header?.insertBefore(holder.querySelector('.a11y-actions'),q('.top .nav'));document.body.appendChild(holder.querySelector('dialog'));
  const dialog=q('#accessDialog');
  q('#accessBtn').onclick=()=>dialog.showModal();
  q('#accessClose').onclick=q('#accessDone').onclick=()=>dialog.close();
  q('#accessReset').onclick=()=>{prefs={...defaults};save()};
  document.querySelectorAll('[data-font]').forEach(e=>e.onclick=()=>{prefs.font=Number(e.dataset.font);save()});
  document.querySelectorAll('[data-a11y]').forEach(e=>e.onchange=()=>{prefs[e.dataset.a11y]=e.checked;save()});
  load();
 }
 document.addEventListener('DOMContentLoaded',init);
 window.SCAccessibilityV2={load};
})();