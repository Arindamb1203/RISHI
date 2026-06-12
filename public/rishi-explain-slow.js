/* ============================================================================
 * rishi-explain-slow.js  —  RISHI shared "slow & paced narration" upgrade
 * Version 1  (no-cache via public/_headers — bump ?v=N when changed)
 * ----------------------------------------------------------------------------
 * WHY
 *   All 138 "standard template" explain pages share one global flow. Their
 *   step-by-step narration advances ONLY on the voice-end callback, with NO
 *   minimum time. When the voice server (ElevenLabs) is down, the browser
 *   fallback fires "ended" almost instantly, so the steps race past — the
 *   "too fast / can't follow" problem the owner reported.
 *
 * WHAT THIS DOES (loaded AFTER the page's own script, so its override wins)
 *   Replaces the global  nextStep()  with a paced version: each step advances
 *   only when BOTH the narration has ended AND a minimum dwell has elapsed
 *   (with a hard cap so it can never stall). Result: every page reads slowly
 *   and stays in sync with the voice — even when TTS is down — with ZERO change
 *   to each page's own content, animation or "I Understand!" button.
 *
 *   The "I Don't Understand" button is unaffected (it is added by the separate
 *   explain-helper.js when it sees the "I Understand!" button we still create).
 *
 * SAFETY
 *   • Only upgrades a page that actually has the standard flow (window.nextStep
 *     + window.session + window.stepIdx). Skips the bespoke v3 page (squares,
 *     which defines window.buildScene) and anything that does not match.
 *   • Re-creates the EXACT DOM the page already builds (.step / #stepsWrap /
 *     "I Understand!" button) so nothing downstream changes.
 *   • Idempotent; self-guards against double install.
 * ==========================================================================*/
(function(){
  "use strict";
  if(window.__rishiSlowV1) return; window.__rishiSlowV1=1;

  function G(id){ return document.getElementById(id); }
  function boot(){
    /* Only standard-template pages. Leave the bespoke v3 page (buildScene) alone. */
    if(typeof window.buildScene==="function") return;
    if(typeof window.nextStep!=="function" || typeof window.beginSteps!=="function") return;
    if(typeof window.showConfirm!=="function") return;

    var nsGen=0;
    window.nextStep=function(){
      var myGen=++nsGen;
      var q=(window.session||[])[window.idx]; if(!q||!q.steps) return;
      var wrap=G("stepsWrap"); if(!wrap) return;

      /* all steps shown → create the "I Understand!" button (explain-helper.js
         then adds "I Don't Understand" beside it) */
      if(window.stepIdx>=q.steps.length){
        var nb=G("nxtStepBtn"); if(nb) nb.style.display="none";
        if(!wrap.querySelector(".rsl-iu") && !wrap.querySelector(".btn-dont")){
          var ib=document.createElement("button");
          ib.className="btn-speak rsl-iu";
          ib.innerHTML="&#9989; I Understand!";
          ib.style.cssText="margin-top:16px;width:100%;";
          ib.onclick=function(){ ib.remove(); window.showConfirm(); };
          wrap.appendChild(ib);
          try{ ib.scrollIntoView({behavior:"smooth",block:"center"}); }catch(e){}
        }
        return;
      }

      /* render this step card (same markup the page uses) */
      var s=q.steps[window.stepIdx];
      var d=document.createElement("div"); d.className="step";
      d.innerHTML='<div class="step-num">'+(window.stepIdx+1)+'</div><div class="step-body">'+(s.t||"")+'</div>';
      wrap.appendChild(d);
      setTimeout(function(){ d.classList.add("vis"); },40);
      window.stepIdx++;

      /* paced advance: wait for BOTH narration-end AND a minimum dwell */
      var spk=s.s||String(s.t||"").replace(/<[^>]*>/g,"");
      var adv=false, ended=false, minMet=false;
      function go(){ if(adv||myGen!==nsGen||!ended||!minMet) return; adv=true; window.nextStep(); }
      var minMs=Math.max(3800, spk.length*55);
      var capMs=Math.max(minMs+1600, spk.length*115);
      if(typeof window.say==="function") window.say(spk,function(){ ended=true; go(); });
      else ended=true;
      setTimeout(function(){ minMet=true; go(); }, minMs);
      setTimeout(function(){ ended=true; minMet=true; go(); }, capMs);   /* hard cap */
    };
  }

  if(/complete|interactive/.test(document.readyState)) boot();
  else document.addEventListener("DOMContentLoaded", boot);
})();
