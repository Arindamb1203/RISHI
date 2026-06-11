/* ============================================================================
 * rishi-animate.js  —  RISHI shared "daily-life" explain-animation engine
 * Version 1  (no-cache via public/_headers — bump ?v=N on every page when changed)
 * ----------------------------------------------------------------------------
 * WHAT THIS IS
 *   A small, self-contained SVG scene engine for the EXPLAIN pages. It turns an
 *   abstract maths step into a real-life scene a student can picture (chairs in
 *   a hall, tiles on a floor, LED pixels, laddoo boxes, cricket seats, …) and
 *   gives Rishika conversational, question-first narration to read aloud.
 *
 *   It REPLACES the old per-page getAnimSVG/getAnimPlay text scenes. Every scene
 *   is built from real shapes + CSS @keyframes (so it stays "REAL" in
 *   audit_explain.py) and is SELF-ANIMATING (plays the moment it is inserted in
 *   the DOM — no timers needed), which makes Replay trivially work.
 *
 * ----------------------------------------------------------------------------
 * HOW A PAGE USES IT  (kept deliberately tiny so a Python generator can emit it)
 *
 *   1. Include in <head>:   <script src="/rishi-animate.js?v=1"></script>
 *   2. Each question in the page's QB carries a CONCEPT + a maths-data object m:
 *          { id:"sq2", concept:"arrange",
 *            m:{ total:196, side:14, method:"pair",
 *                pairHtml:"2×2 and 7×7", pairSpk:"two twos and two sevens" },
 *            q:"…", qs:"…", cq:"…", cqs:"…", ans:[…], nudges:[…] }
 *      (q/qs/cq/cqs/ans/nudges are the page's own assessment text — untouched.)
 *   3. At show-time the page does:
 *          q._skin = RishiAnim.pickSkin(q.concept, q.m);   // random per load
 *          q.steps = RishiAnim.steps(q.concept, q.m, q._skin); // skin-aware voice
 *          html    = RishiAnim.svg(q.concept, q.m, q._skin);   // the scene
 *          caption = RishiAnim.caption(q.concept, q.m, q._skin);
 *      On Replay it just re-calls pickSkin (re-randomises the scene).
 *
 * ----------------------------------------------------------------------------
 * CONCEPTS implemented in v1 (square / square-root family — the pilot chapter):
 *   arrange     N items form a perfect square; side = √N   (also concept mode)
 *   gap         how many counts between n² and (n+1)²  (always 2n)
 *   oddlayers   sum of first n odd numbers = n²  (L-shaped layers)
 *   lastdigit   a number ending 2/3/7/8 can never be a perfect square
 *   areaSide    a square's AREA (fraction or decimal) → its SIDE length
 *   adjust      add/remove a few items to reach the nearest perfect square
 *   product     product of two perfect squares is a perfect square
 *
 *   To add a new chapter's concepts, register another entry in R below with
 *   { svg(m,skin), steps(m,skin), caption(m,skin) }. Skins are shared (SKINS).
 * ==========================================================================*/
(function(){
"use strict";

/* ---- palette (matches the cream / gold RISHI explain theme) -------------- */
var P={bg:"#fffdf8",ink:"#2a2218",mid:"#5a4a30",gold:"#c8922a",amber:"#d4870a",
       sage:"#7a8c6e",rust:"#b85c2a",pale:"#eef7e9",line:"#6b4c2a"};

/* ---- daily-life skins (≥10 per concept; all concepts share this pool) -----
 * Each skin = a scenario the same scene logic is dressed in.
 * { item:plural, one:singular, place:where, color:accent }                   */
var SKINS=[
 {item:"chairs",         one:"chair",  place:"hall",          color:"#d98a3a"},
 {item:"floor tiles",    one:"tile",   place:"room",          color:"#6f9e8f"},
 {item:"LED pixels",     one:"pixel",  place:"display panel", color:"#c8922a"},
 {item:"laddoo boxes",   one:"box",    place:"sweet shop",    color:"#d4870a"},
 {item:"photos",         one:"photo",  place:"phone gallery", color:"#9a6fb0"},
 {item:"badges",         one:"badge",  place:"pinboard",      color:"#b85c2a"},
 {item:"saplings",       one:"sapling",place:"garden plot",   color:"#5a8a60"},
 {item:"stadium seats",  one:"seat",   place:"cricket stand", color:"#4a7fb0"},
 {item:"solar panels",   one:"panel",  place:"rooftop",       color:"#3a6b8a"},
 {item:"chocolate squares",one:"square",place:"chocolate bar",color:"#8a5a2a"},
 {item:"mosaic tiles",   one:"tile",   place:"wall mural",    color:"#b07a3a"},
 {item:"postage stamps", one:"stamp",  place:"album page",    color:"#a04a4a"},
 {item:"parking slots",  one:"slot",   place:"parking lot",   color:"#6a6a7a"},
 {item:"carrom coins",   one:"coin",   place:"carrom board",  color:"#c8992f"}
];

/* ---- CSS (self-animating; inserted inside every <svg>) ------------------- */
var CSS='<style>'
+'.sc text{font-family:Nunito,Arial,sans-serif}'
+'.sc *{transform-box:fill-box}'
+'@keyframes rzPop{0%{opacity:0;transform:scale(.2)}60%{opacity:1;transform:scale(1.18)}100%{opacity:1;transform:scale(1)}}'
+'@keyframes rzFup{0%{opacity:0;transform:translateY(12px)}100%{opacity:1;transform:translateY(0)}}'
+'@keyframes rzGrow{0%{transform:scaleY(0)}100%{transform:scaleY(1)}}'
+'@keyframes rzDrw{0%{opacity:0;transform:scaleX(0)}100%{opacity:1;transform:scaleX(1)}}'
+'@keyframes rzZoom{0%{opacity:0;transform:scale(.25)}70%{opacity:1;transform:scale(1.06)}100%{opacity:1;transform:scale(1)}}'
+'@keyframes rzCross{0%{opacity:0;transform:scaleX(0)}100%{opacity:1;transform:scaleX(1)}}'
+'.pop{opacity:0;animation:rzPop .5s ease forwards;transform-origin:center}'
+'.fup{opacity:0;animation:rzFup .5s ease forwards}'
+'.bar{animation:rzGrow .6s ease forwards;transform-origin:center bottom}'
+'.strk{animation:rzDrw .45s ease forwards;transform-origin:left center}'
+'.zoom{opacity:0;animation:rzZoom .6s ease forwards;transform-origin:center}'
+'.crs{opacity:0;animation:rzCross .4s ease forwards;transform-origin:center}'
+'</style>';

/* ---- tiny builders ------------------------------------------------------- */
function T(x,y,s,d,cls,fs,col,anchor){
  return '<text x="'+x+'" y="'+y+'" text-anchor="'+(anchor||"middle")+'" font-size="'+(fs||13)
    +'" font-weight="800" fill="'+(col||P.ink)+'" class="'+(cls||"pop")+'" style="animation-delay:'+(d||0)+'s">'+s+'</text>';
}
function RECT(x,y,w,h,r,fill,stk,sw,cls,d){
  return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+(r||0)+'" fill="'+(fill||"none")
    +'"'+(stk?(' stroke="'+stk+'" stroke-width="'+(sw||1.5)+'"'):"")+' class="'+(cls||"")+'" style="animation-delay:'+(d||0)+'s"/>';
}
function LINE(x1,y1,x2,y2,col,sw,cls,d){
  return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+(col||P.line)+'" stroke-width="'+(sw||2)
    +'" stroke-linecap="round" class="'+(cls||"")+'" style="animation-delay:'+(d||0)+'s"/>';
}
function tile(cx,cy,s,d,fill,stk,tc,w,h){
  w=w||44;h=h||32;
  return '<g class="pop" style="animation-delay:'+d+'s">'+RECT(cx-w/2,cy-h/2,w,h,8,fill||"#fff6e0",stk||P.gold,2)
    +T(cx,cy+6,s,d,"",16,tc||P.ink)+'</g>';
}
/* a literal side×side grid of item-cells, staggered pop (used when side is small) */
function grid(side,x,y,cs,gp,fill,d0,step){
  var s="",i=0,r,c,cx,cy;
  for(r=0;r<side;r++)for(c=0;c<side;c++){
    cx=x+c*(cs+gp);cy=y+r*(cs+gp);
    s+=RECT(cx,cy,cs,cs,Math.max(2,cs*0.22),fill,null,0,"pop",d0+i*step);
    i++;
  }
  return s;
}
/* a stylised big square with internal grid lines + dimension labels (large N) */
function bigSquare(total,side,skin,x,y,w){
  x=x||156;y=y||34;w=w||120;
  var s=RECT(x,y,w,w,8,skin.color+"22",skin.color,2.5,"zoom",.1),i,p;
  for(i=1;i<6;i++){
    p=x+i*w/6;
    s+=LINE(p,y,p,y+w,skin.color+"66",1,"fup",.5+i*0.07);
    s+=LINE(x,y+i*w/6,x+w,y+i*w/6,skin.color+"66",1,"fup",.5+i*0.07);
  }
  s+=T(x+w/2,y-8,side+" per row",1.3,"fup",12,skin.color);
  s+='<text x="'+(x-12)+'" y="'+(y+w/2)+'" text-anchor="middle" font-size="12" font-weight="800" fill="'+skin.color
    +'" transform="rotate(-90,'+(x-12)+','+(y+w/2)+')" class="fup" style="animation-delay:1.5s">'+side+" rows</text>";
  s+=T(x+w/2,y+w/2+5,total+"",1.0,"pop",15,P.ink);
  return s;
}
function wrap(inner){
  return '<svg viewBox="0 0 420 196" xmlns="http://www.w3.org/2000/svg"><rect width="420" height="196" fill="'+P.bg+'"/>'
    +CSS+'<g class="sc">'+inner+'</g></svg>';
}

/* ---- concept registry ---------------------------------------------------- *
 * Each concept: svg(m,skin) -> inner markup (wrap() applied by RishiAnim.svg),
 *               steps(m,skin) -> [{t:displayHTML, s:spokenText}, …],
 *               caption(m,skin) -> short status line shown while it plays.     */
var R={};

/* ===== arrange : N items make a perfect square; side = √N ================== */
R.arrange={
  svg:function(m,sk){
    if(m.mode==="concept"){
      var ex=m.examples||[3,4,5],cols=[P.gold,P.sage,P.amber],s="",xs=[40,170,300],n,i;
      s+=T(210,18,"When do "+sk.item+" make a perfect square?",0,"pop",13,P.mid);
      for(i=0;i<ex.length;i++){
        n=ex[i];
        s+=grid(n,xs[i],40,14,3,cols[i],.4+i*0.5,.05);
        s+=T(xs[i]+ (n*17-3)/2,40+n*17+14,n+"×"+n+"="+(n*n),1.2+i*0.5,"fup",12,cols[i]);
      }
      s+=T(210,182,"Exact square counts (1,4,9,16,25…) are perfect squares",2.6,"fup",12,P.mid);
      return s;
    }
    var inner;
    if(m.side<=10){
      inner=T(210,18,m.total+" "+sk.item+" → a perfect square",0,"pop",13,P.mid)
        +grid(m.side,210-(m.side*15)/2,30,12,3,sk.color,.4,.03)
        +T(210,30+m.side*15+16,"√"+m.total+" = "+m.side,1.6,"pop",17,P.sage);
    }else{
      inner=T(210,18,"Arrange all "+m.total+" "+sk.item+" in the "+sk.place,0,"pop",12,P.mid)
        +bigSquare(m.total,m.side,sk)
        +T(210,184,"√"+m.total+" = "+m.side,2.2,"pop",18,P.sage);
    }
    return inner;
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
    if(m.method==="pair"){
      st.push({t:"Trick: break "+m.total+" into equal pairs of factors — "+m.pairHtml+" — then take just one "+sk.one+" from each pair.",
               s:"Here is the trick. Break "+m.total+" into equal pairs of factors, "+m.pairSpk+", then take just one from each pair."});
    }else{
      st.push({t:"We just need a number that, times itself, gives "+m.total+".",
               s:"We just need a number that, times itself, gives "+m.total+"."});
    }
    st.push({t:"Each row holds <b>"+m.side+"</b> "+sk.item+", and there are "+m.side+" rows — because "+m.side+"×"+m.side+" = "+m.total+". So √"+m.total+" = <b>"+m.side+"</b>.",
             s:"Each row holds "+m.side+", and there are "+m.side+" rows, because "+m.side+" times "+m.side+" equals "+m.total+". So the square root of "+m.total+" is "+m.side+"."});
    return st;
  },
  caption:function(m,sk){
    return m.mode==="concept" ? "When do "+sk.item+" form a perfect square?"
      : "Arranging "+m.total+" "+sk.item+" into a square…";
  }
};

/* ===== gap : how many counts sit between n² and (n+1)²  (always 2n) ======== */
R.gap={
  svg:function(m,sk){
    var s=T(210,18,sk.place+": "+m.lo+" "+sk.item+" vs "+m.hi+" "+sk.item,0,"pop",12,P.mid);
    s+=grid(m.n,40,34,12,3,sk.color,.4,.03)+T(40+(m.n*15-3)/2,34+m.n*15+14,m.n+"×"+m.n+"="+m.lo,1.4,"fup",11,sk.color);
    s+=grid(m.n+1,300,30,11,3,P.sage,.6,.03)+T(300+((m.n+1)*14-3)/2,30+(m.n+1)*14+14,(m.n+1)+"×"+(m.n+1)+"="+m.hi,1.7,"fup",11,P.sage);
    s+=LINE(150,150,270,150,P.rust,3,"strk",1.6);
    s+=T(210,140,m.lo+"+1 … "+(m.hi-1),1.9,"fup",12,P.rust);
    s+=T(210,176,"Counts in between = 2n = 2×"+m.n+" = <b>"+m.gap+"</b>",2.4,"pop",14,P.gold);
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
    var n=m.n,cs=18,gp=2,x=150,y=30,s="",r,c,layer,col,delay,odds=[];
    for(r=0;r<n;r++)for(c=0;c<n;c++){
      layer=Math.max(r,c);                 /* which L-shell this cell is in */
      col=(layer%2===0)?sk.color:P.sage;
      delay=.3+layer*0.55+((layer===Math.max(r,c))?0:0);
      s+=RECT(x+c*(cs+gp),y+r*(cs+gp),cs,cs,4,col,null,0,"pop",.3+layer*0.5+(r+c)*0.02);
    }
    for(layer=0;layer<n;layer++)odds.push(2*layer+1);
    s+=T(210,y+n*(cs+gp)+18,"1 + 3 + 5 + … = "+odds.join(" + "),1.0,"fup",12,P.mid);
    s+=T(210,y+n*(cs+gp)+38,"= "+n+"² = <b>"+m.sum+"</b>",2.4,"pop",15,P.gold);
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

/* ===== lastdigit : a number ending 2/3/7/8 can never be a perfect square === */
R.lastdigit={
  svg:function(m,sk){
    var ok={0:1,1:1,4:1,5:1,6:1,9:1},x=24,d,i,s="";
    s+=T(210,18,"Last digit of "+m.num+" is "+m.digit,0,"pop",13,P.mid);
    for(i=0;i<=9;i++){
      d=x+i*38;
      var good=ok[i];
      s+='<g class="pop" style="animation-delay:'+(.3+i*0.12)+'s">'
        +RECT(d,40,30,30,7,good?P.pale:"#fde8e8",good?P.sage:P.rust,1.5)
        +T(d+15,61,i+"",0,"",16,good?P.sage:P.rust)+'</g>';
      if(!good){
        s+=LINE(d+3,43,d+27,67,P.rust,2.5,"crs",1.5+i*0.05);
      }
    }
    s+=T(210,96,"Squares end only in 0,1,4,5,6,9 — never 2,3,7,8",1.7,"fup",12,P.mid);
    s+=T(210,150,m.num+" ends in "+m.digit+" → "+(m.ok?"could be":"<b>NOT</b>")+" a perfect square",2.4,"pop",14,m.ok?P.sage:P.rust);
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
    var x=30,y=46,w=104;
    var s=T(210,20,"A square "+sk.one+": area = "+m.disp+(m.kind==="dec"?" m²":""),0,"pop",13,P.mid);
    s+=RECT(x,y,w,w,8,sk.color+"22",sk.color,2.5,"zoom",.2);
    s+=T(x+w/2,y+w/2+5,m.disp+"",1.0,"pop",16,P.ink);
    s+=T(x+w/2,y-8,"area",1.2,"fup",11,sk.color);
    if(m.kind==="frac"){
      s+=T(250,64,"√"+m.top+" = "+m.rtop,1.4,"pop",16,P.amber);
      s+=LINE(225,78,330,78,P.line,2.5,"strk",1.8);
      s+=T(250,98,"√"+m.bot+" = "+m.rbot,2.0,"pop",16,P.sage);
    }else{
      s+=T(280,70,"side × side",1.4,"fup",12,P.mid);
    }
    s+=T(280,134,"side = <b>"+m.resultHtml+"</b>"+(m.kind==="dec"?" m":""),2.4,"pop",18,P.sage);
    s+=T(x+w/2,y+w+18,"side = "+m.resultHtml,2.6,"fup",12,sk.color);
    return s;
  },
  steps:function(m,sk){
    if(m.kind==="frac"){
      return [
       {t:"A square "+sk.one+" covers <b>"+m.disp+"</b> of the "+sk.place+" — that fraction is its area. How long is each side?",
        s:"A square covers "+m.rtop+" over "+m.rbot+"… let us find it. Its area is "+m.disp+". How long is each side?"},
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

/* ===== adjust : add/remove a few items to reach the nearest perfect square = */
R.adjust={
  svg:function(m,sk){
    var s=T(210,18,(m.kind==="sub"?"Too many: ":"Almost a square: ")+m.start+" "+sk.item,0,"pop",13,P.mid);
    s+=bigSquare(m.square,m.root,sk,40,40,108);
    if(m.kind==="sub"){
      s+=T(300,56,m.start,1.6,"pop",16,P.rust);
      s+=T(300,80,"− "+m.change,2.0,"pop",16,P.rust);
      s+=LINE(270,90,332,90,P.line,2,"strk",2.3);
      s+=T(300,112,m.square,2.5,"pop",16,P.sage);
      s+=T(300,150,"remove <b>"+m.change+"</b>",3.0,"fup",13,P.mid);
    }else{
      s+=T(300,56,m.start+" × "+m.change,1.6,"pop",16,P.amber);
      s+=T(300,86,"= "+m.square,2.2,"pop",18,P.sage);
      s+=T(300,150,"multiply by <b>"+m.change+"</b>",3.0,"fup",13,P.mid);
    }
    s+=T(160,170,m.square+" = "+m.root+"²",2.8,"fup",12,sk.color);
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
    var s=T(210,18,"Two square mats of "+sk.item,0,"pop",13,P.mid);
    s+=grid(m.aRoot,40,38,16,3,sk.color,.4,.05)+T(40+(m.aRoot*19-3)/2,38+m.aRoot*19+14,m.aSq+"="+m.aRoot+"²",1.4,"fup",12,sk.color);
    s+=T(150,80,"×",1.6,"pop",22,P.rust);
    s+=grid(m.bRoot,180,30,16,3,P.sage,.6,.04)+T(180+(m.bRoot*19-3)/2,30+m.bRoot*19+14,m.bSq+"="+m.bRoot+"²",1.8,"fup",12,P.sage);
    s+=T(360,80,"=",2.2,"pop",22,P.rust);
    s+=T(388,70,m.prod,2.6,"pop",16,P.ink);
    s+=T(388,92,"="+m.root+"²",3.0,"pop",16,P.gold);
    s+=T(210,176,m.aSq+" × "+m.bSq+" = "+m.prod+" = <b>"+m.root+"²</b> — still a perfect square!",3.2,"fup",12,P.mid);
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

/* ---- skin picker (random per call; avoids the immediate repeat) ----------- */
var _last={};
function pickSkin(concept){
  var n=SKINS.length,i;
  do{ i=Math.floor(Math.random()*n); }while(n>1 && i===_last[concept]);
  _last[concept]=i;
  return SKINS[i];
}

/* ---- public API ---------------------------------------------------------- */
function fallbackSVG(){
  return '<svg viewBox="0 0 420 196" xmlns="http://www.w3.org/2000/svg"><rect width="420" height="196" fill="'+P.bg
    +'"/><text x="210" y="100" text-anchor="middle" font-family="Nunito,Arial,sans-serif" font-size="14" fill="'+P.mid+'">Loading…</text></svg>';
}
window.RishiAnim={
  version:1,
  skins:SKINS,
  pickSkin:function(concept,m){ return pickSkin(concept); },
  svg:function(concept,m,skin){
    var r=R[concept]; if(!r)return fallbackSVG();
    try{ return wrap(r.svg(m,skin||pickSkin(concept))); }catch(e){ return fallbackSVG(); }
  },
  steps:function(concept,m,skin){
    var r=R[concept]; if(!r)return [];
    try{ return r.steps(m,skin||pickSkin(concept)); }catch(e){ return []; }
  },
  caption:function(concept,m,skin){
    var r=R[concept]; if(!r)return "Watch closely…";
    try{ return r.caption(m,skin||pickSkin(concept)); }catch(e){ return "Watch closely…"; }
  }
};
})();
