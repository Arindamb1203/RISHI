/* ============================================================================
 * rishi-animate.js  —  RISHI shared "daily-life" explain-animation engine
 * Version 2  (no-cache via public/_headers — bump ?v=N on every page when changed)
 * ----------------------------------------------------------------------------
 * WHAT THIS IS
 *   A small SVG scene engine for the EXPLAIN pages. It turns a maths step into a
 *   real-life scene a student can picture and gives Rishika conversational,
 *   question-first narration.
 *
 *   v2 CHANGE: every skin now draws its OWN real item artwork (a chair, a floor
 *   tile, an LED dot, a laddoo box, a sapling, a stadium seat, a solar panel…)
 *   instead of just recolouring the same square. So two square-root questions
 *   shown back-to-back look like genuinely different real-life scenes.
 *
 *   Every scene is built from real shapes + CSS @keyframes (stays "REAL" in
 *   audit_explain.py) and is SELF-ANIMATING (plays on DOM insert) so Replay
 *   just re-renders with a freshly picked skin.
 *
 * ----------------------------------------------------------------------------
 * HOW A PAGE USES IT  (kept tiny so a Python generator can emit it)
 *   1. <head>:  <script src="/rishi-animate.js?v=2"></script>
 *   2. Each QB question carries a CONCEPT + a maths-data object m:
 *        { id:"sq2", concept:"arrange",
 *          m:{ total:196, side:14, method:"pair",
 *              pairHtml:"2×2 and 7×7", pairSpk:"two twos and two sevens" },
 *          q,qs,cq,cqs,ans,nudges }   // assessment text — untouched
 *   3. At show-time:
 *        q._skin = RishiAnim.pickSkin(q.concept, q.m);     // random per load
 *        q.steps = RishiAnim.steps(q.concept, q.m, q._skin); // skin-aware voice
 *        html    = RishiAnim.svg(q.concept, q.m, q._skin);   // the scene
 *        caption = RishiAnim.caption(q.concept, q.m, q._skin);
 *      Replay just re-calls pickSkin (re-randomises the scene).
 *
 * ----------------------------------------------------------------------------
 * CONCEPTS (v2, square / square-root family):
 *   arrange   N items form a perfect square; side = √N  (+ concept mode)
 *   gap       counts between n² and (n+1)²  (always 2n)
 *   oddlayers sum of first n odd numbers = n²  (L-shaped layers)
 *   lastdigit ending 2/3/7/8 → never a perfect square
 *   areaSide  a square's AREA (fraction or decimal) → its SIDE
 *   adjust    add/remove a few items to reach the nearest perfect square
 *   product   product of two perfect squares is a perfect square
 *   New chapter? add an entry to R below. Skins (with artwork) are shared.
 * ==========================================================================*/
(function(){
"use strict";

var P={bg:"#fffdf8",ink:"#2a2218",mid:"#5a4a30",gold:"#c8922a",amber:"#d4870a",
       sage:"#7a8c6e",rust:"#b85c2a",pale:"#eef7e9",line:"#6b4c2a"};
var DK="#2a2218", LT="#ffffffcc", SH="#00000022";

/* ---- daily-life skins, each with its OWN drawn artwork (`art`) ------------ */
var SKINS=[
 {item:"chairs",          one:"chair",  place:"hall",          color:"#d98a3a", art:"chair"},
 {item:"floor tiles",     one:"tile",   place:"room",          color:"#6f9e8f", art:"tile"},
 {item:"LED pixels",      one:"pixel",  place:"display panel", color:"#c8922a", art:"led"},
 {item:"laddoo boxes",    one:"box",    place:"sweet shop",    color:"#d4870a", art:"box"},
 {item:"photos",          one:"photo",  place:"phone gallery", color:"#9a6fb0", art:"photo"},
 {item:"badges",          one:"badge",  place:"pinboard",      color:"#b85c2a", art:"badge"},
 {item:"saplings",        one:"sapling",place:"garden plot",   color:"#5a8a60", art:"sapling"},
 {item:"stadium seats",   one:"seat",   place:"cricket stand", color:"#4a7fb0", art:"seat"},
 {item:"solar panels",    one:"panel",  place:"rooftop",       color:"#3a6b8a", art:"panel"},
 {item:"chocolate squares",one:"square",place:"chocolate bar", color:"#8a5a2a", art:"choco"},
 {item:"mosaic tiles",    one:"tile",   place:"wall mural",    color:"#b07a3a", art:"mosaic"},
 {item:"postage stamps",  one:"stamp",  place:"album page",    color:"#a04a4a", art:"stamp"},
 {item:"parking slots",   one:"slot",   place:"parking lot",   color:"#6a6a7a", art:"parking"},
 {item:"carrom coins",    one:"coin",   place:"carrom board",  color:"#c8992f", art:"coin"}
];

/* ---- CSS (self-animating) ------------------------------------------------ */
var CSS='<style>'
+'.sc text{font-family:Nunito,Arial,sans-serif}.sc *{transform-box:fill-box}'
+'@keyframes rzPop{0%{opacity:0;transform:scale(.2)}60%{opacity:1;transform:scale(1.18)}100%{opacity:1;transform:scale(1)}}'
+'@keyframes rzFup{0%{opacity:0;transform:translateY(12px)}100%{opacity:1;transform:translateY(0)}}'
+'@keyframes rzDrw{0%{opacity:0;transform:scaleX(0)}100%{opacity:1;transform:scaleX(1)}}'
+'@keyframes rzZoom{0%{opacity:0;transform:scale(.25)}70%{opacity:1;transform:scale(1.06)}100%{opacity:1;transform:scale(1)}}'
+'@keyframes rzCross{0%{opacity:0;transform:scaleX(0)}100%{opacity:1;transform:scaleX(1)}}'
+'.pop{opacity:0;animation:rzPop .5s ease forwards;transform-origin:center}'
+'.fup{opacity:0;animation:rzFup .5s ease forwards}'
+'.strk{animation:rzDrw .45s ease forwards;transform-origin:left center}'
+'.zoom{opacity:0;animation:rzZoom .6s ease forwards;transform-origin:center}'
+'.crs{opacity:0;animation:rzCross .4s ease forwards;transform-origin:center}'
+'</style>';

/* ---- primitive builders -------------------------------------------------- */
function T(x,y,s,d,cls,fs,col,anchor){
  return '<text x="'+x+'" y="'+y+'" text-anchor="'+(anchor||"middle")+'" font-size="'+(fs||13)
    +'" font-weight="800" fill="'+(col||P.ink)+'" class="'+(cls||"pop")+'" style="animation-delay:'+(d||0)+'s">'+s+'</text>';
}
function RC(x,y,w,h,r,fill,stk,sw,dash){
  return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+(r||0)+'" fill="'+(fill||"none")
    +'"'+(stk?(' stroke="'+stk+'" stroke-width="'+(sw||1)+'"'):"")+(dash?(' stroke-dasharray="'+dash+'"'):"")+'/>';
}
function CI(cx,cy,r,fill,stk,sw){
  return '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+(fill||"none")
    +'"'+(stk?(' stroke="'+stk+'" stroke-width="'+(sw||1)+'"'):"")+'/>';
}
function PG(pts,fill,stk,sw){
  return '<polygon points="'+pts+'" fill="'+(fill||"none")+'"'+(stk?(' stroke="'+stk+'" stroke-width="'+(sw||1)+'"'):"")+'/>';
}
function LN(x1,y1,x2,y2,col,sw,cls,d){
  return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+(col||P.line)+'" stroke-width="'+(sw||2)
    +'" stroke-linecap="round" class="'+(cls||"")+'" style="animation-delay:'+(d||0)+'s"/>';
}

/* ---- ITEM ARTWORK: draw one real-life item in an s-box at top-left x,y ---- */
function drawItem(art,x,y,s,c){
  var cx=x+s/2, cy=y+s/2;
  switch(art){
   case "chair":   return RC(x+s*0.16,y,s*0.68,s*0.55,2,c)            /* backrest */
                        +RC(x,y+s*0.5,s,s*0.34,2,c)                   /* seat */
                        +RC(x+s*0.18,y+s*0.12,s*0.44,s*0.06,1,LT);    /* highlight */
   case "tile":    return RC(x,y,s,s,3,c)+RC(x+s*0.16,y+s*0.16,s*0.68,s*0.68,2,"none",LT,1.3);
   case "led":     return CI(cx,cy,s*0.46,c)+CI(cx,cy,s*0.3,LT)+CI(cx,cy,s*0.13,c);
   case "box":     return RC(x,y+s*0.28,s,s*0.56,2,c)
                        +LN(x+s*0.06,y+s*0.46,x+s*0.94,y+s*0.46,DK,1.2)
                        +CI(cx,y+s*0.22,s*0.16,c);                    /* laddoo on top */
   case "photo":   return RC(x,y,s,s,2,c)+RC(x+s*0.12,y+s*0.12,s*0.76,s*0.76,1,LT)
                        +CI(x+s*0.34,y+s*0.34,s*0.09,c)
                        +PG((x+s*0.2)+","+(y+s*0.78)+" "+(x+s*0.46)+","+(y+s*0.46)+" "+(x+s*0.8)+","+(y+s*0.78),c);
   case "badge":   return CI(cx,cy,s*0.44,c)+CI(cx,cy,s*0.22,LT)
                        +PG(cx+","+(y+s*0.7)+" "+(x+s*0.3)+","+(y+s)+" "+(x+s*0.7)+","+(y+s),c);
   case "sapling": return PG((x+s*0.32)+","+(y+s*0.6)+" "+(x+s*0.68)+","+(y+s*0.6)+" "+(x+s*0.6)+","+(y+s*0.92)+" "+(x+s*0.4)+","+(y+s*0.92),c)
                        +LN(cx,y+s*0.6,cx,y+s*0.2,c,1.6)
                        +'<ellipse cx="'+(cx-s*0.16)+'" cy="'+(y+s*0.28)+'" rx="'+(s*0.16)+'" ry="'+(s*0.1)+'" fill="'+c+'"/>'
                        +'<ellipse cx="'+(cx+s*0.16)+'" cy="'+(y+s*0.28)+'" rx="'+(s*0.16)+'" ry="'+(s*0.1)+'" fill="'+c+'"/>';
   case "seat":    return RC(x,y+s*0.52,s,s*0.3,2,c)                  /* seat base */
                        +PG(x+","+(y+s*0.52)+" "+(x+s*0.22)+","+(y+s*0.08)+" "+(x+s*0.42)+","+(y+s*0.08)+" "+(x+s*0.2)+","+(y+s*0.52),c); /* slanted back */
   case "panel":   return RC(x,y+s*0.06,s,s*0.78,2,c)
                        +LN(x+s/3,y+s*0.08,x+s/3,y+s*0.82,LT,1)+LN(x+2*s/3,y+s*0.08,x+2*s/3,y+s*0.82,LT,1)
                        +LN(x+s*0.04,cy,x+s*0.96,cy,LT,1);
   case "choco":   return RC(x,y,s,s,2,c)+RC(x+s*0.1,y+s*0.1,s*0.8,s*0.8,1,SH)
                        +LN(x+s*0.16,y+s*0.16,x+s*0.5,y+s*0.5,LT,1.4);
   case "mosaic":  return PG(cx+","+y+" "+(x+s)+","+cy+" "+cx+","+(y+s)+" "+x+","+cy,c)
                        +PG(cx+","+(y+s*0.22)+" "+(x+s*0.78)+","+cy+" "+cx+","+(y+s*0.78)+" "+(x+s*0.22)+","+cy,LT);
   case "stamp":   return RC(x,y,s,s,1,c,LT,1.4,"2,2")+RC(x+s*0.2,y+s*0.2,s*0.6,s*0.6,1,LT);
   case "parking": return RC(x+s*0.12,y,s*0.76,s,3,c)
                        +RC(x+s*0.24,y+s*0.18,s*0.52,s*0.4,2,LT)      /* roof */
                        +RC(x+s*0.24,y+s*0.64,s*0.52,s*0.16,1,LT);    /* windshield */
   case "coin":    return CI(cx,cy,s*0.44,c)+CI(cx,cy,s*0.3,"none",LT,1.6)+CI(cx,cy,s*0.1,LT);
   default:        return RC(x,y,s,s,3,c);
  }
}
/* a square block of real items, disp×disp shown (disp=min(side,cap)) -------- */
function itemSquare(sk,side,x,y,box,cap,d0,step){
  cap=cap||6; var disp=Math.min(side,cap), gp=2, cs=(box-(disp-1)*gp)/disp, s="",i=0,r,c;
  for(r=0;r<disp;r++)for(c=0;c<disp;c++){
    s+='<g class="pop" style="animation-delay:'+(d0+i*step)+'s">'
       +drawItem(sk.art,x+c*(cs+gp),y+r*(cs+gp),cs,sk.color)+'</g>';
    i++;
  }
  return {svg:s,cs:cs,disp:disp,partial:side>disp};
}
function wrap(inner){
  return '<svg viewBox="0 0 420 200" xmlns="http://www.w3.org/2000/svg"><rect width="420" height="200" fill="'+P.bg+'"/>'
    +CSS+'<g class="sc">'+inner+'</g></svg>';
}

/* ---- concept registry ---------------------------------------------------- */
var R={};

/* ===== arrange : N items make a perfect square; side = √N ================== */
R.arrange={
  svg:function(m,sk){
    if(m.mode==="concept"){
      var ex=m.examples||[3,4,5],s=T(210,16,"When do "+sk.item+" make a perfect square?",0,"pop",13,P.mid),xs=[44,176,300],i,n,blk;
      for(i=0;i<ex.length;i++){
        n=ex[i]; blk=itemSquare(sk,n,xs[i],36,Math.min(96,n*20),n,.4+i*0.55,.05);
        s+=blk.svg+T(xs[i]+Math.min(96,n*20)/2,36+Math.min(96,n*20)+18,n+"×"+n+"="+(n*n),1.3+i*0.5,"fup",12,sk.color);
      }
      s+=T(210,190,"Exact square counts (1,4,9,16,25…) are perfect squares",2.6,"fup",12,P.mid);
      return s;
    }
    var box=120,x=150,y=30,blk=itemSquare(sk,m.side,x,y,box,6,.4,.04);
    var s=T(210,16,"Arrange all "+m.total+" "+sk.item+" in one square "+sk.place,0,"pop",12,P.mid);
    s+=RC(x-8,y-6,box+16,box+16,10,sk.color+"14",sk.color+"55",1.5);    /* place backdrop */
    s+=blk.svg;
    s+=T(x+box/2,y-12,m.side+" per row",1.2,"fup",12,sk.color);
    s+='<text x="'+(x-16)+'" y="'+(y+box/2)+'" text-anchor="middle" font-size="12" font-weight="800" fill="'+sk.color
       +'" transform="rotate(-90,'+(x-16)+','+(y+box/2)+')" class="fup" style="animation-delay:1.4s">'+m.side+" rows</text>";
    s+=T(x+box+44,y+34,m.total+"",1.0,"pop",16,P.ink)+T(x+box+44,y+52,"in all",1.2,"fup",11,P.mid);
    if(blk.partial)s+=T(x+box+44,y+88,"(a corner of",2.0,"fup",10,P.soft||P.mid)+T(x+box+44,y+101,"the "+m.side+"×"+m.side+")",2.1,"fup",10,P.mid);
    s+=T(210,190,"√"+m.total+" = "+m.side,2.2,"pop",18,P.sage);
    return s;
  },
  steps:function(m,sk){
    if(m.mode==="concept"){
      return [
       {t:"When can "+sk.item+" form a <b>perfect</b> square in the "+sk.place+"? Only when the count fills a full square grid with none left over.",
        s:"When can these items form a perfect square? Only when the count fills a full square grid with none left over."},
       {t:"9 "+sk.item+" make a 3×3 square, 16 make 4×4, 25 make 5×5. Those exact counts — 1, 4, 9, 16, 25 — are the <b>perfect squares</b>.",
        s:"9 items make a 3 by 3 square. 16 make 4 by 4. 25 make 5 by 5. Those exact counts, 1, 4, 9, 16, 25, are the perfect squares."},
       {t:"So is 169 a perfect square? Picture 13 rows of 13 "+sk.item+" — yes, 13×13 = 169!",
        s:"So is 169 a perfect square? Picture 13 rows of 13. Yes, 13 times 13 equals 169."}
      ];
    }
    var st=[{t:"Imagine arranging all <b>"+m.total+"</b> "+sk.item+" into one perfect square "+sk.place+". How many "+sk.one+"s go in each row?",
             s:"Imagine arranging all "+m.total+" "+sk.item+" into one perfect square. How many go in each row?"}];
    if(m.method==="pair")
      st.push({t:"Trick: break "+m.total+" into equal pairs of factors — "+m.pairHtml+" — then take just one "+sk.one+" from each pair.",
               s:"Here is the trick. Break "+m.total+" into equal pairs of factors, "+m.pairSpk+", then take just one from each pair."});
    else
      st.push({t:"We just need a number that, times itself, gives "+m.total+".",
               s:"We just need a number that, times itself, gives "+m.total+"."});
    st.push({t:"Each row holds <b>"+m.side+"</b> "+sk.item+", and there are "+m.side+" rows — because "+m.side+"×"+m.side+" = "+m.total+". So √"+m.total+" = <b>"+m.side+"</b>.",
             s:"Each row holds "+m.side+", and there are "+m.side+" rows, because "+m.side+" times "+m.side+" equals "+m.total+". So the square root of "+m.total+" is "+m.side+"."});
    return st;
  },
  caption:function(m,sk){return m.mode==="concept"?"When do "+sk.item+" form a perfect square?":"Arranging "+m.total+" "+sk.item+" into a square…";}
};

/* ===== gap : counts between n² and (n+1)²  (always 2n) ===================== */
R.gap={
  svg:function(m,sk){
    var s=T(210,16,sk.place+": "+m.lo+" "+sk.item+"  vs  "+m.hi+" "+sk.item,0,"pop",12,P.mid);
    var a=itemSquare(sk,m.n,40,34,72,5,.4,.04), b=itemSquare(sk,m.n+1,296,30,84,5,.7,.04);
    s+=a.svg+T(76,124,m.n+"×"+m.n+"="+m.lo,1.5,"fup",12,sk.color);
    s+=b.svg+T(338,124,(m.n+1)+"×"+(m.n+1)+"="+m.hi,1.8,"fup",12,P.sage);
    s+=LN(150,150,270,150,P.rust,3,"strk",1.9);
    s+=T(210,144,m.lo+"+1 … "+(m.hi-1),2.1,"fup",12,P.rust);
    s+=T(210,178,"None of these form a square. Count = 2×"+m.n+" = <b>"+m.gap+"</b>",2.5,"pop",14,P.gold);
    return s;
  },
  steps:function(m,sk){
    return [
     {t:"The "+sk.place+" can seat "+m.lo+" "+sk.item+" as a "+m.n+"×"+m.n+" square, or "+m.hi+" as a "+(m.n+1)+"×"+(m.n+1)+" square. How many crowd sizes <b>in between</b> can NOT form a perfect square?",
      s:"The "+sk.place+" can seat "+m.lo+" as a "+m.n+" by "+m.n+" square, or "+m.hi+" as a "+(m.n+1)+" by "+(m.n+1)+" square. How many sizes in between can not form a perfect square?"},
     {t:"Every size from "+(m.lo+1)+" up to "+(m.hi-1)+" is stuck between the two squares — not one of them makes a full square.",
      s:"Every size from "+(m.lo+1)+" up to "+(m.hi-1)+" is stuck between the two squares. Not one of them makes a full square."},
     {t:"There are always <b>2n</b> such sizes between n² and (n+1)². Here 2×"+m.n+" = <b>"+m.gap+"</b>.",
      s:"There are always 2 n such sizes between n squared and the next square. Here 2 times "+m.n+" equals "+m.gap+"."}
    ];
  },
  caption:function(m,sk){return "Between "+m.lo+" and "+m.hi+" "+sk.item+"…";}
};

/* ===== oddlayers : sum of first n odd numbers = n²  (L-shaped layers) ====== */
R.oddlayers={
  svg:function(m,sk){
    var n=m.n,box=118,gp=2,cs=(box-(n-1)*gp)/n,x=151,y=24,s="",r,c,layer,col,odds=[];
    for(r=0;r<n;r++)for(c=0;c<n;c++){
      layer=Math.max(r,c); col=(layer%2===0)?sk.color:P.sage;
      s+='<g class="pop" style="animation-delay:'+(.3+layer*0.5+(r+c)*0.015)+'s">'+drawItem(sk.art,x+c*(cs+gp),y+r*(cs+gp),cs,col)+'</g>';
    }
    for(layer=0;layer<n;layer++)odds.push(2*layer+1);
    s+=T(210,y+box+18,"1 + 3 + 5 + … = "+odds.join(" + "),1.0,"fup",12,P.mid);
    s+=T(210,y+box+38,"= "+n+"² = <b>"+m.sum+"</b>",2.4,"pop",15,P.gold);
    return s;
  },
  steps:function(m,sk){
    return [
     {t:"Lay "+sk.item+" in growing L-shaped layers: first 1, then 3, then 5… each layer keeps the shape a perfect square. What is 1+3+5+7+9+11?",
      s:"Lay the items in growing L shaped layers. First 1, then 3, then 5, and so on. Each layer keeps the shape a perfect square. What is 1 plus 3 plus 5 plus 7 plus 9 plus 11?"},
     {t:"After "+m.n+" odd layers, the "+sk.item+" sit in a perfect "+m.n+"×"+m.n+" square.",
      s:"After "+m.n+" odd layers, the items sit in a perfect "+m.n+" by "+m.n+" square."},
     {t:"So the sum of the first "+m.n+" odd numbers = "+m.n+"² = <b>"+m.sum+"</b> — no need to add one by one!",
      s:"So the sum of the first "+m.n+" odd numbers equals "+m.n+" squared, which is "+m.sum+". No need to add them one by one."}
    ];
  },
  caption:function(m,sk){return "Stacking odd layers of "+sk.item+"…";}
};

/* ===== lastdigit : ending 2/3/7/8 → never a perfect square ================= */
R.lastdigit={
  svg:function(m,sk){
    var ok={0:1,1:1,4:1,5:1,6:1,9:1},x=24,d,i,s="";
    s+=T(210,16,"Look only at the LAST digit of "+m.num,0,"pop",13,P.mid);
    for(i=0;i<=9;i++){
      d=x+i*38; var good=ok[i];
      s+='<g class="pop" style="animation-delay:'+(.3+i*0.1)+'s">'+RC(d,38,30,30,7,good?P.pale:"#fde8e8",good?P.sage:P.rust,1.5)
        +T(d+15,59,i+"",0,"",16,good?P.sage:P.rust)+'</g>';
      if(!good)s+=LN(d+3,41,d+27,65,P.rust,2.5,"crs",1.4+i*0.05);
    }
    s+=T(210,94,"Squares end only in 0,1,4,5,6,9 — never 2,3,7,8",1.7,"fup",12,P.mid);
    s+=RC(150,116,120,40,8,sk.color+"14",sk.color+"55",1.5);
    s+='<g class="pop" style="animation-delay:2.2s">'+drawItem(sk.art,160,120,30,sk.color)+'</g>';
    s+=T(248,140,m.num,2.3,"pop",16,P.ink);
    s+=T(210,182,m.num+" ends in "+m.digit+" → "+(m.ok?"could be":"<b>NOT</b>")+" a perfect square",2.6,"pop",14,m.ok?P.sage:P.rust);
    return s;
  },
  steps:function(m,sk){
    return [
     {t:"Quick check before any hard work: look at the <b>last digit</b> of "+m.num+". Can a perfect square ever end in "+m.digit+"?",
      s:"Quick check before any hard work. Look at the last digit of "+m.num+". Can a perfect square ever end in "+m.digit+"?"},
     {t:"Perfect squares only ever end in 0, 1, 4, 5, 6 or 9. Ending in 2, 3, 7 or 8 is impossible.",
      s:"Perfect squares only ever end in 0, 1, 4, 5, 6 or 9. Ending in 2, 3, 7 or 8 is impossible."},
     {t:""+m.num+" ends in "+m.digit+", so it can <b>never</b> be a perfect square — you spotted it just from the last digit!",
      s:""+m.num+" ends in "+m.digit+", so it can never be a perfect square. You spotted it just from the last digit."}
    ];
  },
  caption:function(m,sk){return "Checking the last digit of "+m.num+"…";}
};

/* ===== areaSide : a square's AREA (fraction or decimal) → its SIDE ========= */
R.areaSide={
  svg:function(m,sk){
    var x=30,y=44,box=104, blk=itemSquare(sk,4,x,y,box,4,.3,.05);
    var s=T(210,18,"A square "+sk.one+" — area = "+m.disp+(m.kind==="dec"?" m²":""),0,"pop",13,P.mid);
    s+=RC(x-6,y-6,box+12,box+12,8,sk.color+"14",sk.color+"55",1.5)+blk.svg;
    s+=T(x+box/2,y+box/2+5,m.disp+"",1.4,"pop",15,P.ink)+T(x+box/2,y-12,"area",1.2,"fup",11,sk.color);
    if(m.kind==="frac"){
      s+=T(258,62,"√"+m.top+" = "+m.rtop,1.6,"pop",16,P.amber);
      s+=LN(232,76,335,76,P.line,2.5,"strk",2.0);
      s+=T(258,96,"√"+m.bot+" = "+m.rbot,2.2,"pop",16,P.sage);
    }else{
      s+=T(288,68,"side × side",1.6,"fup",12,P.mid)+T(288,92,"= "+m.disp,2.0,"pop",15,P.mid);
    }
    s+=T(288,140,"side = <b>"+m.resultHtml+"</b>"+(m.kind==="dec"?" m":""),2.5,"pop",18,P.sage);
    s+=T(x+box/2,y+box+18,"side = "+m.resultHtml,2.7,"fup",12,sk.color);
    return s;
  },
  steps:function(m,sk){
    if(m.kind==="frac"){
      return [
       {t:"A square "+sk.one+" covers <b>"+m.disp+"</b> of the "+sk.place+" — that fraction is its area. How long is each side?",
        s:"A square covers "+m.rtop+" over "+m.rbot+" of the area. How long is each side?"},
       {t:"Square-root the top and the bottom separately: √"+m.top+" = "+m.rtop+", and √"+m.bot+" = "+m.rbot+".",
        s:"Take the square root of the top and the bottom separately. Square root of "+m.top+" is "+m.rtop+", and square root of "+m.bot+" is "+m.rbot+"."},
       {t:"So the side = <b>"+m.resultHtml+"</b>. Always root the numerator and denominator on their own!",
        s:"So the side is "+m.resultSpk+". Always root the top and the bottom on their own."}
      ];
    }
    return [
     {t:"A square "+sk.one+" has area <b>"+m.disp+" m²</b>. How long is each side?",
      s:"A square "+sk.one+" has area "+m.disp+" square metres. How long is each side?"},
     {t:"Turn the decimal into a fraction, then square-root the top and the bottom — the decimal point lines up neatly.",
      s:"Turn the decimal into a fraction, then square root the top and the bottom. The decimal point lines up neatly."},
     {t:"The side is <b>"+m.resultHtml+" m</b>, because "+m.resultHtml+"×"+m.resultHtml+" = "+m.disp+".",
      s:"The side is "+m.resultSpk+" metres, because "+m.resultSpk+" times "+m.resultSpk+" equals "+m.disp+"."}
    ];
  },
  caption:function(m,sk){return "Area "+m.disp+" → side of the square "+sk.one+"…";}
};

/* ===== adjust : add/remove a few items to reach the nearest square ========= */
R.adjust={
  svg:function(m,sk){
    var x=36,y=42,box=104, blk=itemSquare(sk,m.root,x,y,box,5,.3,.04);
    var s=T(210,16,(m.kind==="sub"?"Too many: ":"Almost a square: ")+m.start+" "+sk.item,0,"pop",13,P.mid);
    s+=RC(x-6,y-6,box+12,box+12,8,sk.color+"14",sk.color+"55",1.5)+blk.svg;
    s+=T(x+box/2,y+box+16,m.square+" = "+m.root+"²",2.2,"fup",12,sk.color);
    /* a few "spare" items off to the side */
    var k,sp=Math.min(m.kind==="mul"?4:Math.min(m.change,4),4);
    for(k=0;k<sp;k++)s+='<g class="pop" style="animation-delay:'+(1.4+k*0.18)+'s">'+drawItem(sk.art,250+ (k%2)*30, 46+Math.floor(k/2)*30, 24, m.kind==="sub"?P.rust:P.sage)+'</g>';
    if(m.kind==="sub"){
      s+=T(330,60,m.start+" − "+m.square,2.0,"pop",15,P.rust);
      s+=T(330,84,"= "+m.change,2.5,"pop",17,P.rust);
      s+=T(310,150,"remove <b>"+m.change+"</b> "+sk.item,3.0,"fup",13,P.mid);
    }else{
      s+=T(330,60,m.start+" × "+m.change,2.0,"pop",15,P.amber);
      s+=T(330,84,"= "+m.square,2.5,"pop",17,P.sage);
      s+=T(310,150,"multiply by <b>"+m.change+"</b>",3.0,"fup",13,P.mid);
    }
    return s;
  },
  steps:function(m,sk){
    if(m.kind==="sub"){
      return [
       {t:"You try to arrange "+m.start+" "+sk.item+" into a square, but a few are left over. The nearest perfect square below is "+m.square+" ("+m.root+"×"+m.root+"). How many "+sk.item+" must you take away?",
        s:"You try to arrange "+m.start+" "+sk.item+" into a square, but a few are left over. The nearest perfect square below is "+m.square+", which is "+m.root+" times "+m.root+". How many must you take away?"},
       {t:"Just subtract: "+m.start+" − "+m.square+" = <b>"+m.change+"</b>.",
        s:"Just subtract. "+m.start+" minus "+m.square+" equals "+m.change+"."},
       {t:"Remove "+m.change+" "+sk.item+" and exactly "+m.square+" = "+m.root+"² remain. Least number to subtract = <b>"+m.change+"</b>.",
        s:"Remove "+m.change+" and exactly "+m.square+", which is "+m.root+" squared, remain. The least number to subtract is "+m.change+"."}
      ];
    }
    return [
     {t:""+m.start+" "+sk.item+" almost form a square, but one group has no partner. What is the <b>smallest</b> number to multiply by so they fit a perfect square?",
      s:""+m.start+" "+sk.item+" almost form a square, but one group has no partner. What is the smallest number to multiply by so they fit a perfect square?"},
     {t:"Supply the missing partner — multiply by "+m.change+": "+m.start+" × "+m.change+" = "+m.square+".",
      s:"Supply the missing partner. Multiply by "+m.change+". "+m.start+" times "+m.change+" equals "+m.square+"."},
     {t:""+m.square+" = "+m.root+"² ✓ — now every group is paired. The answer is <b>"+m.change+"</b>.",
      s:""+m.square+" equals "+m.root+" squared. Now every group is paired. The answer is "+m.change+"."}
    ];
  },
  caption:function(m,sk){return (m.kind==="sub"?"Trimming ":"Topping up ")+m.start+" "+sk.item+" to a square…";}
};

/* ===== product : product of two perfect squares is a perfect square ======== */
R.product={
  svg:function(m,sk){
    var a=itemSquare(sk,m.aRoot,34,40,54,5,.4,.05), b=itemSquare(sk,m.bRoot,150,32,68,5,.7,.04), cc=itemSquare(sk,Math.min(m.root,6),300,28,80,6,1.2,.03);
    var s=T(210,16,"Two square mats of "+sk.item,0,"pop",13,P.mid);
    s+=a.svg+T(61,112,m.aSq+"="+m.aRoot+"²",1.4,"fup",11,sk.color);
    s+=T(128,80,"×",1.6,"pop",22,P.rust);
    s+=b.svg+T(184,112,m.bSq+"="+m.bRoot+"²",1.8,"fup",11,sk.color);
    s+=T(268,80,"=",2.2,"pop",22,P.rust);
    s+=cc.svg+T(340,116,m.prod+"="+m.root+"²",2.6,"fup",12,P.gold);
    s+=T(210,184,m.aSq+" × "+m.bSq+" = "+m.prod+" = <b>"+m.root+"²</b> — still a perfect square!",3.0,"fup",12,P.mid);
    return s;
  },
  steps:function(m,sk){
    return [
     {t:"One mat holds "+m.aSq+" "+sk.item+" in a square, another holds "+m.bSq+". If you combine them into a single square, will it still be <b>perfect</b>?",
      s:"One mat holds "+m.aSq+" "+sk.item+" in a square, another holds "+m.bSq+". If you combine them into a single square, will it still be perfect?"},
     {t:""+m.aSq+" = "+m.aRoot+"² and "+m.bSq+" = "+m.bRoot+"². Their product = ("+m.aRoot+"×"+m.bRoot+")² = "+m.root+"².",
      s:""+m.aSq+" equals "+m.aRoot+" squared, and "+m.bSq+" equals "+m.bRoot+" squared. Their product equals "+m.aRoot+" times "+m.bRoot+", all squared, which is "+m.root+" squared."},
     {t:"So "+m.aSq+" × "+m.bSq+" = "+m.prod+" = "+m.root+"². Yes — the product of two perfect squares is <b>always</b> a perfect square!",
      s:"So "+m.aSq+" times "+m.bSq+" equals "+m.prod+", which is "+m.root+" squared. Yes. The product of two perfect squares is always a perfect square."}
    ];
  },
  caption:function(m,sk){return "Combining two square mats of "+sk.item+"…";}
};

/* ---- skin picker (random; avoids the immediate repeat) -------------------- */
var _last={};
function pickSkin(concept){
  var n=SKINS.length,i;
  do{ i=Math.floor(Math.random()*n); }while(n>1 && i===_last[concept]);
  _last[concept]=i; return SKINS[i];
}

/* ---- public API ---------------------------------------------------------- */
function fallbackSVG(){
  return '<svg viewBox="0 0 420 200" xmlns="http://www.w3.org/2000/svg"><rect width="420" height="200" fill="'+P.bg
    +'"/><text x="210" y="100" text-anchor="middle" font-family="Nunito,Arial,sans-serif" font-size="14" fill="'+P.mid+'">Loading…</text></svg>';
}
window.RishiAnim={
  version:2, skins:SKINS,
  pickSkin:function(concept,m){ return pickSkin(concept); },
  svg:function(concept,m,skin){ var r=R[concept]; if(!r)return fallbackSVG(); try{ return wrap(r.svg(m,skin||pickSkin(concept))); }catch(e){ return fallbackSVG(); } },
  steps:function(concept,m,skin){ var r=R[concept]; if(!r)return []; try{ return r.steps(m,skin||pickSkin(concept)); }catch(e){ return []; } },
  caption:function(concept,m,skin){ var r=R[concept]; if(!r)return "Watch closely…"; try{ return r.caption(m,skin||pickSkin(concept)); }catch(e){ return "Watch closely…"; } }
};
})();
