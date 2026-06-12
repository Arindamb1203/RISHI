/* ============================================================================
 * rishi-math-input.js  —  RISHI shared math typing keyboard for explain pages
 * Version 1  (no-cache via public/_headers — bump ?v=N when changed)
 * ----------------------------------------------------------------------------
 * WHY
 *   A 12-16 year old cannot type x², √, ³√ or a fraction on a normal keyboard.
 *   13 explain pages have a rich math helper; the other 127 show an EMPTY chip
 *   strip (their answer-chips are deliberately hidden by explain-helper.js, and
 *   they never had the shortcut keyboard). So most confirm questions have no
 *   typing help at all.
 *
 * WHAT THIS DOES
 *   When a confirm question appears (#rawAnswer textarea), it fills the chip
 *   strip with a small MATH KEYBOARD (x², x³, xⁿ, √, ³√, a/b, (), ×10ⁿ, π) and
 *   shows a clean live preview (x^2 -> x², sqrt() -> √, cbrt() -> ³√, * -> ×).
 *   Tapping a chip inserts the symbol at the caret. Pure typing aid — it never
 *   reveals the answer.
 *
 * SAFETY
 *   • Self-contained; does NOT use the page's makeChips/mathUpdate/buildSuggChips.
 *   • SKIPS the 13 rich pages (they define window.mathToLatex / MATH_DEFAULTS) so
 *     nothing there changes.
 *   • Idempotent per textarea; loaded on all explain pages.
 * ==========================================================================*/
(function(){
  "use strict";
  if(window.__rishiMathInput) return; window.__rishiMathInput=1;

  function G(id){ return document.getElementById(id); }

  var SUP={ "0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵",
            "6":"⁶","7":"⁷","8":"⁸","9":"⁹","n":"ⁿ","x":"ˣ",
            "-":"⁻","+":"⁺","a":"ᵃ","b":"ᵇ" };
  function sup(s){ return String(s).replace(/./g,function(c){ return SUP[c]||c; }); }

  /* a clean, KaTeX-free pretty preview of what the student typed */
  function pretty(raw){
    var s=String(raw||"");
    s=s.replace(/cbrt\s*\(([^)]*)\)/gi,"∛($1)").replace(/sqrt\s*\(([^)]*)\)/gi,"√($1)");
    s=s.replace(/\bcbrt\b/gi,"∛").replace(/\bsqrt\b/gi,"√");
    s=s.replace(/\^\{([^}]*)\}/g,function(m,g){ return sup(g); });
    s=s.replace(/\^(-?[0-9a-zA-Z]+)/g,function(m,g){ return sup(g); });
    s=s.replace(/\bpi\b/gi,"π");
    s=s.replace(/\*/g,"×");
    return s;
  }

  var CHIPS=[
    {label:"x²",   ins:"^2"},
    {label:"x³",   ins:"^3"},
    {label:"xⁿ",   ins:"^n"},
    {label:"√",     ins:"sqrt()"},
    {label:"∛",     ins:"cbrt()"},
    {label:"a/b",        ins:"()/()"},
    {label:"( )",        ins:"()"},
    {label:"×10ⁿ", ins:"*10^n"},
    {label:"π",     ins:"pi"}
  ];

  function insertAt(ra,ins){
    var s=ra.selectionStart, e=ra.selectionEnd, v=ra.value;
    ra.value=v.slice(0,s)+ins+v.slice(e);
    var caret=s+ins.length, p=ins.indexOf("()");        /* drop caret inside the () */
    if(p>=0) caret=s+p+1;
    try{ ra.focus(); ra.setSelectionRange(caret,caret); }catch(x){ try{ ra.focus(); }catch(y){} }
  }

  function preview(ra){
    var el=G("mathPreview"); if(!el) return;
    var v=ra.value.trim();
    if(!v){ el.innerHTML='<span class="mph">your answer will appear here…</span>'; return; }
    el.textContent=pretty(v);
  }

  function upgrade(ra){
    if(!ra || ra.__rishiKbd) return;
    /* leave the 13 rich pages exactly as they are */
    if(typeof window.mathToLatex==="function" || window.MATH_DEFAULTS) return;
    ra.__rishiKbd=1;

    var strip=G("suggChips");
    if(strip){
      strip.innerHTML="";
      CHIPS.forEach(function(c){
        var b=document.createElement("button");
        b.type="button"; b.className="schip shortcut"; b.textContent=c.label;
        b.addEventListener("click",function(){ insertAt(ra,c.ins); preview(ra); });
        strip.appendChild(b);
      });
      var head=strip.parentNode && strip.parentNode.querySelector(".sugg-strip-head");
      if(head) head.textContent="Math keyboard — tap to insert";
    }
    ra.addEventListener("input",function(){ preview(ra); });   /* runs after page's own; wins */
    preview(ra);
  }

  function scan(node){
    if(!node || node.nodeType!==1) return;
    if(node.id==="rawAnswer"){ upgrade(node); return; }
    var ra=node.querySelector && node.querySelector("#rawAnswer");
    if(ra) upgrade(ra);
  }

  function boot(){
    upgrade(G("rawAnswer"));
    var obs=new MutationObserver(function(muts){
      for(var i=0;i<muts.length;i++){
        var n=muts[i].addedNodes;
        for(var j=0;j<n.length;j++) scan(n[j]);
      }
    });
    obs.observe(document.body,{ childList:true, subtree:true });
  }

  if(/complete|interactive/.test(document.readyState)) boot();
  else document.addEventListener("DOMContentLoaded", boot);
})();
