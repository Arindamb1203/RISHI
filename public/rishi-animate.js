/* ============================================================================
 * rishi-animate.js  —  RISHI shared "daily-life" explain-animation engine
 * Version 3  (no-cache via public/_headers — bump ?v=N on every page when changed)
 * ----------------------------------------------------------------------------
 * v3 is a ground-up rethink for 12–16 year olds (owner feedback: v1/v2 were
 * too fast, abstract, boring and repetitive).
 *
 *   • STORY + MOTION  — the scene is a small real-life story that PLAYS OUT:
 *     items slide into rows, the square fills up, a counter ticks. Not a wall
 *     of tiny labels popping in.
 *   • SLOW & NARRATED — the picture is drawn ONE PHASE AT A TIME, each phase
 *     spoken in full by Rishika with a pause before the next. ~20–25s total.
 *   • MERGED — the animation IS the teaching. No separate repeated text steps.
 *     After it finishes the page shows the "I Understand!" button → question.
 *
 * ----------------------------------------------------------------------------
 * HOW A PAGE USES IT
 *   1. <head>:  <script src="/rishi-animate.js?v=3"></script>
 *   2. Each QB question carries CONCEPT + maths-data m (q/qs/cq/cqs/ans/nudges
 *      are the page's own assessment — untouched).
 *   3. At show-time:
 *        q._skin  = RishiAnim.pickSkin(q.concept, q.m);   // random per load
 *        var sc   = RishiAnim.scene(q.concept, q.m, q._skin);  // {base, phases}
 *        q.steps  = sc.phases.map(p=>({t:p.say,s:p.say}));     // for "I Don't
 *                                                              //  Understand" API
 *      Insert sc.base into the canvas, then play the phases: for each phase,
 *      append phase.frag into <g id="rzStage"> (its CSS entrance animation plays
 *      on insert) and say(phase.say); advance when narration ends + phase.pause.
 *      Replay just re-calls pickSkin + scene (fresh skin, fresh play).
 *
 * scene(concept,m,skin) -> { base:<svg…with <g id="rzStage">>, phases:[ {
 *        say  : spoken + on-screen narration for this beat,
 *        frag : SVG markup appended into #rzStage this beat (self-animating),
 *        cap  : short status caption, ms:min duration floor, pause:gap after } ] }
 * ==========================================================================*/
(function(){
"use strict";

var P={bg:"#fffdf8",ink:"#2a2218",mid:"#5a4a30",gold:"#c8922a",amber:"#d4870a",
       sage:"#7a8c6e",rust:"#b85c2a",pale:"#eef7e9",line:"#6b4c2a"};
var DK="#2a2218", LT="#ffffffcc", SH="#00000022";

/* ---- daily-life skins, each with its own drawn artwork + a story verb ----- */
var SKINS=[
 {item:"chairs",          one:"chair",  place:"hall",          color:"#d98a3a", art:"chair",   verb:"set out"},
 {item:"floor tiles",     one:"tile",   place:"room",          color:"#6f9e8f", art:"tile",    verb:"lay"},
 {item:"LED lights",      one:"light",  place:"display board", color:"#c8922a", art:"led",     verb:"fit"},
 {item:"laddoo boxes",    one:"box",    place:"sweet shop",    color:"#d4870a", art:"box",     verb:"stack"},
 {item:"photos",          one:"photo",  place:"photo wall",    color:"#9a6fb0", art:"photo",   verb:"hang"},
 {item:"medals",          one:"medal",  place:"trophy board",  color:"#b85c2a", art:"badge",   verb:"pin"},
 {item:"saplings",        one:"sapling",place:"garden plot",   color:"#5a8a60", art:"sapling", verb:"plant"},
 {item:"stadium seats",   one:"seat",   place:"cricket stand", color:"#4a7fb0", art:"seat",    verb:"fit"},
 {item:"solar panels",    one:"panel",  place:"rooftop",       color:"#3a6b8a", art:"panel",   verb:"fix"},
 {item:"chocolates",      one:"piece",  place:"chocolate box", color:"#8a5a2a", art:"choco",   verb:"pack"},
 {item:"mosaic tiles",    one:"tile",   place:"wall mural",    color:"#b07a3a", art:"mosaic",  verb:"set"},
 {item:"stamps",          one:"stamp",  place:"album page",    color:"#a04a4a", art:"stamp",   verb:"stick"},
 {item:"cars",            one:"car",    place:"parking lot",   color:"#6a6a7a", art:"parking", verb:"park"},
 {item:"carrom coins",    one:"coin",   place:"carrom board",  color:"#c8992f", art:"coin",    verb:"place"}
];

/* ---- CSS (self-animating; entrance plays when a frag is inserted) --------- */
var CSS='<style>'
+'.sc text{font-family:Nunito,Arial,sans-serif}.sc *{transform-box:fill-box}'
+'@keyframes rzIn{0%{opacity:0;transform:translateY(14px) scale(.8)}70%{opacity:1;transform:translateY(0) scale(1.08)}100%{opacity:1;transform:scale(1)}}'
+'@keyframes rzSl{0%{opacity:0;transform:translateX(-46px)}100%{opacity:1;transform:translateX(0)}}'
+'@keyframes rzPl{0%{opacity:0;transform:scale(.5)}65%{opacity:1;transform:scale(1.18)}100%{opacity:1;transform:scale(1)}}'
+'@keyframes rzCr{0%{opacity:0;transform:scaleX(0)}100%{opacity:1;transform:scaleX(1)}}'
+'@keyframes rzTw{0%{opacity:0;transform:scale(0) rotate(0)}60%{opacity:1;transform:scale(1.3) rotate(35deg)}100%{opacity:.9;transform:scale(1) rotate(0)}}'
+'.rin{opacity:0;animation:rzIn .55s ease forwards}'
+'.rsl{opacity:0;animation:rzSl .5s ease forwards}'
+'.rpl{opacity:0;animation:rzPl .6s ease forwards;transform-origin:center}'
+'.rcr{opacity:0;animation:rzCr .4s ease forwards;transform-origin:center}'
+'.rtw{opacity:0;animation:rzTw .7s ease forwards;transform-origin:center}'
+'</style>';

/* ---- primitive builders -------------------------------------------------- */
function T(x,y,s,d,cls,fs,col,anchor){
  return '<text x="'+x+'" y="'+y+'" text-anchor="'+(anchor||"middle")+'" font-size="'+(fs||13)
    +'" font-weight="800" fill="'+(col||P.ink)+'" class="'+(cls||"rin")+'" style="animation-delay:'+(d||0)+'s">'+s+'</text>';
}
function RC(x,y,w,h,r,fill,stk,sw,dash){
  return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+(r||0)+'" fill="'+(fill||"none")
    +'"'+(stk?(' stroke="'+stk+'" stroke-width="'+(sw||1)+'"'):"")+(dash?(' stroke-dasharray="'+dash+'"'):"")+'/>';
}
function CI(cx,cy,r,fill,stk,sw){
  return '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+(fill||"none")
    +'"'+(stk?(' stroke="'+stk+'" stroke-width="'+(sw||1)+'"'):"")+'/>';
}
function PG(pts,fill,stk,sw){ return '<polygon points="'+pts+'" fill="'+(fill||"none")+'"'+(stk?(' stroke="'+stk+'" stroke-width="'+(sw||1)+'"'):"")+'/>'; }
function LN(x1,y1,x2,y2,col,sw,cls,d){
  return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+(col||P.line)+'" stroke-width="'+(sw||2)
    +'" stroke-linecap="round" class="'+(cls||"")+'" style="animation-delay:'+(d||0)+'s"/>';
}

/* ---- ITEM ARTWORK: one real item in an s-box at top-left x,y -------------- */
function drawItem(art,x,y,s,c){
  var cx=x+s/2, cy=y+s/2;
  switch(art){
   case "chair":   return RC(x+s*0.16,y,s*0.68,s*0.55,2,c)+RC(x,y+s*0.5,s,s*0.34,2,c)+RC(x+s*0.18,y+s*0.12,s*0.44,s*0.06,1,LT);
   case "tile":    return RC(x,y,s,s,3,c)+RC(x+s*0.16,y+s*0.16,s*0.68,s*0.68,2,"none",LT,1.3);
   case "led":     return CI(cx,cy,s*0.46,c)+CI(cx,cy,s*0.3,LT)+CI(cx,cy,s*0.13,c);
   case "box":     return RC(x,y+s*0.28,s,s*0.56,2,c)+LN(x+s*0.06,y+s*0.46,x+s*0.94,y+s*0.46,DK,1.2)+CI(cx,y+s*0.22,s*0.16,c);
   case "photo":   return RC(x,y,s,s,2,c)+RC(x+s*0.12,y+s*0.12,s*0.76,s*0.76,1,LT)+CI(x+s*0.34,y+s*0.34,s*0.09,c)+PG((x+s*0.2)+","+(y+s*0.78)+" "+(x+s*0.46)+","+(y+s*0.46)+" "+(x+s*0.8)+","+(y+s*0.78),c);
   case "badge":   return CI(cx,cy,s*0.44,c)+CI(cx,cy,s*0.22,LT)+PG(cx+","+(y+s*0.7)+" "+(x+s*0.3)+","+(y+s)+" "+(x+s*0.7)+","+(y+s),c);
   case "sapling": return PG((x+s*0.32)+","+(y+s*0.6)+" "+(x+s*0.68)+","+(y+s*0.6)+" "+(x+s*0.6)+","+(y+s*0.92)+" "+(x+s*0.4)+","+(y+s*0.92),c)
                        +LN(cx,y+s*0.6,cx,y+s*0.2,c,1.6)
                        +'<ellipse cx="'+(cx-s*0.16)+'" cy="'+(y+s*0.28)+'" rx="'+(s*0.16)+'" ry="'+(s*0.1)+'" fill="'+c+'"/>'
                        +'<ellipse cx="'+(cx+s*0.16)+'" cy="'+(y+s*0.28)+'" rx="'+(s*0.16)+'" ry="'+(s*0.1)+'" fill="'+c+'"/>';
   case "seat":    return RC(x,y+s*0.52,s,s*0.3,2,c)+PG(x+","+(y+s*0.52)+" "+(x+s*0.22)+","+(y+s*0.08)+" "+(x+s*0.42)+","+(y+s*0.08)+" "+(x+s*0.2)+","+(y+s*0.52),c);
   case "panel":   return RC(x,y+s*0.06,s,s*0.78,2,c)+LN(x+s/3,y+s*0.08,x+s/3,y+s*0.82,LT,1)+LN(x+2*s/3,y+s*0.08,x+2*s/3,y+s*0.82,LT,1)+LN(x+s*0.04,cy,x+s*0.96,cy,LT,1);
   case "choco":   return RC(x,y,s,s,2,c)+RC(x+s*0.1,y+s*0.1,s*0.8,s*0.8,1,SH)+LN(x+s*0.16,y+s*0.16,x+s*0.5,y+s*0.5,LT,1.4);
   case "mosaic":  return PG(cx+","+y+" "+(x+s)+","+cy+" "+cx+","+(y+s)+" "+x+","+cy,c)+PG(cx+","+(y+s*0.22)+" "+(x+s*0.78)+","+cy+" "+cx+","+(y+s*0.78)+" "+(x+s*0.22)+","+cy,LT);
   case "stamp":   return RC(x,y,s,s,1,c,LT,1.4,"2,2")+RC(x+s*0.2,y+s*0.2,s*0.6,s*0.6,1,LT);
   case "parking": return RC(x+s*0.12,y,s*0.76,s,3,c)+RC(x+s*0.24,y+s*0.18,s*0.52,s*0.4,2,LT)+RC(x+s*0.24,y+s*0.64,s*0.52,s*0.16,1,LT);
   case "coin":    return CI(cx,cy,s*0.44,c)+CI(cx,cy,s*0.3,"none",LT,1.6)+CI(cx,cy,s*0.1,LT);
   default:        return RC(x,y,s,s,3,c);
  }
}
/* a row of items that slide in one after another (the "marching in" motion) */
function rowItems(sk,count,x,y,cs,gp,d0,step,color){
  var s="",i; for(i=0;i<count;i++) s+='<g class="rsl" style="animation-delay:'+(d0+i*step)+'s">'+drawItem(sk.art,x+i*(cs+gp),y,cs,color||sk.color)+'</g>';
  return s;
}
/* a disp×disp block of items (each pops in) */
function block(sk,side,x,y,box,cap,d0,step,color){
  var disp=Math.min(side,cap||5),gp=2,cs=(box-(disp-1)*gp)/disp,s="",i=0,r,c;
  for(r=0;r<disp;r++)for(c=0;c<disp;c++){ s+='<g class="rin" style="animation-delay:'+(d0+i*step)+'s">'+drawItem(sk.art,x+c*(cs+gp),y+r*(cs+gp),cs,color||sk.color)+'</g>'; i++; }
  return s;
}
function chip(x,y,txt,d,col){
  return '<g class="rpl" style="animation-delay:'+d+'s"><rect x="'+(x-48)+'" y="'+(y-13)+'" width="96" height="26" rx="13" fill="'+col+'"/><text x="'+x+'" y="'+(y+5)+'" text-anchor="middle" font-size="13" font-weight="900" fill="#fff">'+txt+'</text></g>';
}
function answerBox(cx,cy,txt,d){
  return '<g class="rpl" style="animation-delay:'+d+'s"><rect x="'+(cx-98)+'" y="'+(cy-25)+'" width="196" height="50" rx="14" fill="'+P.pale+'" stroke="'+P.sage+'" stroke-width="2.5"/><text x="'+cx+'" y="'+(cy+9)+'" text-anchor="middle" font-size="24" font-weight="900" fill="'+P.sage+'">'+txt+'</text></g>';
}
function spark(cx,cy,d){
  var s="",pts=[[-118,-6],[118,-2],[-96,30],[100,28],[0,-40]],i,x,y;
  for(i=0;i<pts.length;i++){ x=cx+pts[i][0]; y=cy+pts[i][1];
    s+='<g class="rtw" style="animation-delay:'+(d+i*0.12)+'s">'+PG(x+","+(y-7)+" "+(x+2)+","+(y-2)+" "+(x+7)+","+y+" "+(x+2)+","+(y+2)+" "+x+","+(y+7)+" "+(x-2)+","+(y+2)+" "+(x-7)+","+y+" "+(x-2)+","+(y-2),P.gold)+'</g>'; }
  return s;
}
function braceH(x1,x2,y,label,d,col){
  return LN(x1,y,x2,y,col,2.5,"rsl",d)+LN(x1,y-5,x1,y+5,col,2,"rsl",d)+LN(x2,y-5,x2,y+5,col,2,"rsl",d)+T((x1+x2)/2,y-8,label,d+0.3,"rin",13,col);
}
function braceV(x,y1,y2,label,d,col){
  var my=(y1+y2)/2;
  return LN(x,y1,x,y2,col,2.5,"rsl",d)+LN(x-5,y1,x+5,y1,col,2,"rsl",d)+LN(x-5,y2,x+5,y2,col,2,"rsl",d)
    +'<text x="'+(x-11)+'" y="'+my+'" text-anchor="middle" font-size="13" font-weight="800" fill="'+col+'" transform="rotate(-90,'+(x-11)+','+my+')" class="rin" style="animation-delay:'+(d+0.3)+'s">'+label+'</text>';
}
function stage(backdrop){
  return '<svg viewBox="0 0 440 210" xmlns="http://www.w3.org/2000/svg"><rect width="440" height="210" fill="'+P.bg+'"/>'
    +CSS+'<g class="sc" id="rzStage">'+(backdrop||"")+'</g></svg>';
}

/* ---- concept registry: scene(m,skin) -> {base,phases} -------------------- */
var R={};

/* ===== arrange : N items fill a perfect square; side = √N  (THE SHOWCASE) == */
R.arrange={
  scene:function(m,sk){
    if(m.mode==="concept"){
      var base0=stage("");
      return {base:base0,phases:[
        {cap:"What is a perfect square?", ms:5200, pause:1000,
         say:"When can "+sk.item+" make a perfect square? Only when they fill a full square with none left over.",
         frag:T(220,30,"When do "+sk.item+" make a perfect square?",0,"rin",14,P.mid)},
        {cap:"3×3, 4×4, 5×5…", ms:5600, pause:1000,
         say:"Nine "+sk.item+" make a three by three square. Sixteen make four by four. Twenty five make five by five.",
         frag:block(sk,3,40,70,70,3,.3,.08)+T(75,156,"3×3=9",1.2,"rin",12,sk.color)
             +block(sk,4,170,62,86,4,.9,.06)+T(213,162,"4×4=16",1.8,"rin",12,P.sage)
             +block(sk,5,310,56,98,5,1.5,.05)+T(359,166,"5×5=25",2.4,"rin",12,P.amber)},
        {cap:"…are perfect squares", ms:5200, pause:1300,
         say:"So one, four, nine, sixteen, twenty five are perfect squares. Is 169? Yes — thirteen rows of thirteen!",
         frag:answerBox(220,120,"1, 4, 9, 16, 25 …",.2)+spark(220,120,.6)}
      ]};
    }
    var total=m.total, side=m.side, item=sk.item, one=sk.one;
    var cols=Math.min(side,14), cs=22, gp=4, rowW=cols*(cs+gp)-gp, X=Math.round((440-rowW)/2);
    var rowY=[150,124,98,72], capped=side>cols;
    var base=stage(RC(X-14,58,rowW+50,124,12,sk.color+"12",sk.color+"33",1.5));   // the place / floor
    return {base:base,phases:[
      {cap:total+" "+item+" → a square?", ms:5000, pause:800,
       say:"Let us "+sk.verb+" "+total+" "+item+" as a perfect square "+sk.place+". How many "+one+"s in each row?",
       frag:T(220,28,sk.verb.charAt(0).toUpperCase()+sk.verb.slice(1)+" "+total+" "+item+" as a perfect square",0,"rin",14,P.mid)
           +T(220,50,"How many in each row?",0,"rin",13,sk.color)},
      {cap:"Row 1…", ms:5400, pause:900,
       say:"Let us line them up. Here comes the first row — count them: "+cols+(capped?" so far":"")+" "+item+" in one row.",
       frag:rowItems(sk,cols,X,rowY[0],cs,gp,.3,.16)+chip(388,40,"ROW 1",2.8,sk.color)},
      {cap:"…more rows", ms:5400, pause:900,
       say:"Now the next row, and the next — each row exactly the same size. The "+sk.place+" is filling up.",
       frag:rowItems(sk,cols,X,rowY[1],cs,gp,.2,.1)+rowItems(sk,cols,X,rowY[2],cs,gp,.7,.1)+rowItems(sk,cols,X,rowY[3],cs,gp,1.2,.1)
           +chip(388,40,"ROWS 4…",1.8,sk.color)+(capped?T(220,66,"… and more rows",1.9,"rin",11,P.mid):"")},
      {cap:side+" rows of "+side, ms:5800, pause:1000,
       say:"When it is full there are "+side+" rows, and every single row has "+side+". "+side+" rows of "+side+".",
       frag:braceH(X,X+rowW,rowY[3]-12,side+" across",.3,sk.color)+braceV(X-16,rowY[3],rowY[0]+cs,side+" down",.5,sk.color)
           +T(220,200,side+" rows × "+side+" = "+total,1.3,"rin",15,P.ink)},
      {cap:"√"+total+" = "+side, ms:5200, pause:1500,
       say:side+" times "+side+" is "+total+". So the square root of "+total+" is "+side+"!",
       frag:answerBox(220,108,"√"+total+" = "+side,.2)+spark(220,108,.6)}
    ]};
  },
  caption:function(m,sk){return "Arranging "+(m.total||"")+" "+sk.item+"…";}
};

/* ===== gap : counts between n² and (n+1)²  (always 2n) ===================== */
R.gap={
  scene:function(m,sk){
    return {base:stage(""),phases:[
      {cap:m.lo+" vs "+m.hi+" "+sk.item, ms:6000, pause:1000,
       say:"The "+sk.place+" can hold "+m.lo+" "+sk.item+" as a "+m.n+" by "+m.n+" square, or "+m.hi+" as a "+(m.n+1)+" by "+(m.n+1)+" square. How many sizes in between can NOT make a perfect square?",
       frag:block(sk,m.n,46,46,70,5,.3,.05)+T(81,128,m.n+"×"+m.n+"="+m.lo,1.4,"rin",12,sk.color)
           +T(220,90,"…?",1.0,"rpl",26,P.rust)
           +block(sk,m.n+1,300,40,84,5,.6,.05)+T(342,134,(m.n+1)+"×"+(m.n+1)+"="+m.hi,1.7,"rin",12,P.sage)},
      {cap:"stuck in between", ms:5200, pause:900,
       say:"Every size from "+(m.lo+1)+" up to "+(m.hi-1)+" is stuck between them. Not one of them makes a full square.",
       frag:LN(150,158,290,158,P.rust,3,"rsl",.2)+T(220,150,m.lo+"+1  …  "+(m.hi-1),.6,"rin",13,P.rust)},
      {cap:"2 × "+m.n+" = "+m.gap, ms:5000, pause:1400,
       say:"There are always two-n such sizes. Here, two times "+m.n+" is "+m.gap+".",
       frag:answerBox(220,190,"2 × "+m.n+" = "+m.gap,.2)}
    ]};
  }
};

/* ===== oddlayers : sum of first n odd numbers = n²  (L-shaped layers) ====== */
R.oddlayers={
  scene:function(m,sk){
    var n=m.n,box=120,gp=2,cs=(box-(n-1)*gp)/n,x=160,y=20,full="",r,c,layer,col;
    for(r=0;r<n;r++)for(c=0;c<n;c++){ layer=Math.max(r,c); col=(layer%2===0)?sk.color:P.sage;
      full+='<g class="rin" style="animation-delay:'+(.2+layer*0.55+(r+c)*0.02)+'s">'+drawItem(sk.art,x+c*(cs+gp),y+r*(cs+gp),cs,col)+'</g>'; }
    return {base:stage(""),phases:[
      {cap:"odd layers", ms:6000, pause:1000,
       say:"Lay "+sk.item+" in L-shaped layers — first 1, then 3, then 5, and so on. Each layer keeps the shape a perfect square. What is 1 plus 3 plus 5 plus 7 plus 9 plus 11?",
       frag:'<g class="rpl" style="animation-delay:.3s">'+drawItem(sk.art,x,y,cs,sk.color)+'</g>'+T(220,150,"start with 1",1.0,"rin",13,P.mid)},
      {cap:"wrap around", ms:5400, pause:900,
       say:"Add the next odd layer, and the next — they wrap around and the square keeps growing.",
       frag:full},
      {cap:n+"² = "+m.sum, ms:5200, pause:1400,
       say:"After "+n+" odd layers we have a "+n+" by "+n+" square. So the sum of the first "+n+" odd numbers is "+n+" squared, which is "+m.sum+".",
       frag:answerBox(220,178,n+"² = "+m.sum,.2)}
    ]};
  }
};

/* ===== lastdigit : ending 2/3/7/8 → never a perfect square ================= */
R.lastdigit={
  scene:function(m,sk){
    var ok={0:1,1:1,4:1,5:1,6:1,9:1},x0=24,row="",i,d,good;
    for(i=0;i<=9;i++){ d=x0+i*38; good=ok[i];
      row+='<g class="rin" style="animation-delay:'+(.2+i*0.12)+'s">'+RC(d,86,30,30,7,good?P.pale:"#fde8e8",good?P.sage:P.rust,1.5)+T(d+15,107,i+"",0,"",16,good?P.sage:P.rust)+'</g>';
      if(!good) row+=LN(d+3,89,d+27,113,P.rust,2.6,"rcr",1.4+i*0.05); }
    return {base:stage(""),phases:[
      {cap:"look at the last digit", ms:5400, pause:1000,
       say:"Before any hard work, look only at the LAST digit of "+m.num+". Can a perfect square ever end in "+m.digit+"?",
       frag:T(220,40,m.num,0,"rpl",34,P.ink)+T(330,40,"ends in "+m.digit,.6,"rin",14,P.rust)},
      {cap:"only 0,1,4,5,6,9", ms:5600, pause:900,
       say:"Perfect squares only ever end in 0, 1, 4, 5, 6 or 9. Ending in 2, 3, 7 or 8 is impossible.",
       frag:row+T(220,140,"red digits can never end a perfect square",2.0,"rin",12,P.mid)},
      {cap:m.num+" → not a square", ms:5000, pause:1400,
       say:m.num+" ends in "+m.digit+", so it can never be a perfect square. You spotted it just from the last digit!",
       frag:answerBox(220,182,m.num+" ends in "+m.digit+" → "+(m.ok?"maybe":"NO"),.2)}
    ]};
  }
};

/* ===== areaSide : a square's AREA (fraction or decimal) → its SIDE ========= */
R.areaSide={
  scene:function(m,sk){
    var x=34,y=58,box=96, base=stage(RC(x-6,y-6,box+12,box+12,8,sk.color+"14",sk.color+"40",1.5));
    var p0={cap:"area "+m.disp, ms:5400, pause:1000,
            say:"A square "+sk.one+" has area "+m.disp+(m.kind==="dec"?" square metres":" of the "+sk.place)+". How long is each side?",
            frag:block(sk,3,x,y,box,3,.3,.07)+T(x+box/2,y+box/2+5,m.disp,1.2,"rpl",16,P.ink)+T(x+box/2,y-12,"area",1.0,"rin",11,sk.color)};
    var p1,p2;
    if(m.kind==="frac"){
      p1={cap:"root top & bottom", ms:5400, pause:900,
          say:"Take the square root of the top and the bottom on their own. Root "+m.top+" is "+m.rtop+", and root "+m.bot+" is "+m.rbot+".",
          frag:T(290,70,"√"+m.top+" = "+m.rtop,.2,"rin",17,P.amber)+LN(250,84,340,84,P.line,2.5,"rsl",.6)+T(290,104,"√"+m.bot+" = "+m.rbot,.8,"rin",17,P.sage)};
      p2={cap:"side = "+m.resultHtml, ms:5000, pause:1400, say:"So each side is "+m.resultSpk+".",
          frag:answerBox(290,160,"side = "+m.resultHtml,.2)};
    }else{
      p1={cap:"square the answer", ms:5400, pause:900,
          say:"Find the number that, times itself, gives "+m.disp+". Line up the decimal point neatly.",
          frag:T(290,80,m.resultHtml+" × "+m.resultHtml,.2,"rin",16,P.mid)+T(290,108,"= "+m.disp,.8,"rin",16,P.mid)};
      p2={cap:"side = "+m.resultHtml+" m", ms:5000, pause:1400, say:"So each side is "+m.resultSpk+" metres.",
          frag:answerBox(290,160,"side = "+m.resultHtml+" m",.2)};
    }
    return {base:base,phases:[p0,p1,p2]};
  }
};

/* ===== adjust : add/remove a few items to reach the nearest square ========= */
R.adjust={
  scene:function(m,sk){
    var x=40,y=54,box=96, base=stage(RC(x-6,y-6,box+12,box+12,8,sk.color+"14",sk.color+"40",1.5));
    var k,sp=Math.min(m.kind==="sub"?Math.min(m.change,4):4,4),spare="";
    for(k=0;k<sp;k++) spare+='<g class="rin" style="animation-delay:'+(.3+k*0.2)+'s">'+drawItem(sk.art,250+(k%2)*32,60+Math.floor(k/2)*32,26,m.kind==="sub"?P.rust:P.sage)+'</g>';
    var p0={cap:m.start+" "+sk.item, ms:5800, pause:1000,
            say:(m.kind==="sub"
              ? "You try to "+sk.verb+" "+m.start+" "+sk.item+" in a square, but a few are left over. The nearest perfect square below is "+m.square+", which is "+m.root+" times "+m.root+". How many must you take away?"
              : m.start+" "+sk.item+" almost make a square, but one group has no partner. What is the smallest number to multiply by so they fit a perfect square?"),
            frag:block(sk,m.root,x,y,box,5,.3,.04)+spare+T(x+box/2,y+box+16,m.square+" = "+m.root+"²",2.0,"rin",12,sk.color)};
    var p1={cap:(m.kind==="sub"?"subtract":"multiply"), ms:5200, pause:900,
            say:(m.kind==="sub"? "Just subtract. "+m.start+" minus "+m.square+" is "+m.change+"."
                               : "Supply the missing partner — multiply by "+m.change+". "+m.start+" times "+m.change+" is "+m.square+"."),
            frag:(m.kind==="sub"? T(320,80,m.start+" − "+m.square+" = "+m.change,.2,"rin",16,P.rust)
                                : T(320,80,m.start+" × "+m.change+" = "+m.square,.2,"rin",16,P.amber))};
    var p2={cap:"answer = "+m.change, ms:5000, pause:1400,
            say:(m.kind==="sub"? "Remove "+m.change+" and exactly "+m.square+" remain — a perfect square. The least number to subtract is "+m.change+"."
                               : m.square+" is "+m.root+" squared — now every group is paired. The answer is "+m.change+"."),
            frag:answerBox(290,160,(m.kind==="sub"?"subtract ":"multiply by ")+m.change,.2)};
    return {base:base,phases:[p0,p1,p2]};
  }
};

/* ===== product : product of two perfect squares is a perfect square ======== */
R.product={
  scene:function(m,sk){
    return {base:stage(""),phases:[
      {cap:"two square mats", ms:5800, pause:1000,
       say:"One mat holds "+m.aSq+" "+sk.item+" in a square, another holds "+m.bSq+". If you join them into one big square, will it still be perfect?",
       frag:block(sk,m.aRoot,40,54,60,5,.3,.06)+T(70,128,m.aSq+"="+m.aRoot+"²",1.2,"rin",12,sk.color)
           +T(150,90,"×",1.4,"rpl",24,P.rust)
           +block(sk,m.bRoot,180,46,76,5,.6,.05)+T(218,130,m.bSq+"="+m.bRoot+"²",1.6,"rin",12,P.sage)},
      {cap:"(a×b)²", ms:5400, pause:900,
       say:m.aSq+" is "+m.aRoot+" squared, and "+m.bSq+" is "+m.bRoot+" squared. Their product is "+m.aRoot+" times "+m.bRoot+", all squared.",
       frag:T(330,90,"("+m.aRoot+"×"+m.bRoot+")²",.2,"rin",18,P.mid)+T(330,118,"= "+m.root+"²",.8,"rin",18,P.gold)},
      {cap:m.prod+" = "+m.root+"²", ms:5000, pause:1400,
       say:"So "+m.aSq+" times "+m.bSq+" is "+m.prod+", which is "+m.root+" squared. Yes — the product of two perfect squares is always a perfect square!",
       frag:answerBox(220,180,m.aSq+" × "+m.bSq+" = "+m.root+"²",.2)}
    ]};
  }
};

/* ==========================================================================
 * CUBE FAMILY (chapter 2: Cubes & Cube Roots) — items stack into a 3-D cube
 * ========================================================================== */
var CUBE_SKINS=[
 {item:"sugar cubes",   one:"cube",  place:"sugar box",     color:"#c9a24b", mark:"plain"},
 {item:"dice",          one:"die",   place:"game tray",     color:"#b85c2a", mark:"pips"},
 {item:"ice cubes",     one:"cube",  place:"ice tray",      color:"#5b9bd5", mark:"shine"},
 {item:"gift boxes",    one:"box",   place:"shelf",         color:"#9a6fb0", mark:"ribbon"},
 {item:"bricks",        one:"brick", place:"wall",          color:"#b06a3a", mark:"lines"},
 {item:"toy blocks",    one:"block", place:"playroom",      color:"#d4870a", mark:"dot"},
 {item:"laddoo boxes",  one:"box",   place:"sweet shop",    color:"#d98a3a", mark:"dot"},
 {item:"cheese cubes",  one:"cube",  place:"platter",       color:"#e0b341", mark:"plain"},
 {item:"soap bars",     one:"bar",   place:"store rack",    color:"#6f9e8f", mark:"plain"},
 {item:"storage bins",  one:"bin",   place:"godown",        color:"#4a7fb0", mark:"lines"},
 {item:"chocolate cubes",one:"cube", place:"chocolate box", color:"#8a5a2a", mark:"plain"},
 {item:"Rubik blocks",  one:"block", place:"table",         color:"#3a8a5a", mark:"lines"}
];
var CUBE_CONCEPTS={cubeArrange:1,cubeConcept:1,cubeCheck:1,cubeNeg:1,cubeAdjust:1,cubeFrac:1,hardyRamanujan:1,cubeDiff:1,cubeParity:1,cubeScale:1};

/* one isometric small box (3 visible faces, shaded) + a per-skin top mark */
function isoPt(i,j,k,ox,oy,A,B,H){ return { x:ox+(i-j)*A, y:oy+(i+j)*B-k*H }; }
function drawBox(cx,cy,u,color,mark,d,cls){
  var A=u, B=u*0.5, H=u*0.92;
  var top=cx+","+(cy-B)+" "+(cx+A)+","+cy+" "+cx+","+(cy+B)+" "+(cx-A)+","+cy;
  var left=(cx-A)+","+cy+" "+cx+","+(cy+B)+" "+cx+","+(cy+B+H)+" "+(cx-A)+","+(cy+H);
  var right=(cx+A)+","+cy+" "+cx+","+(cy+B)+" "+cx+","+(cy+B+H)+" "+(cx+A)+","+(cy+H);
  var s='<g class="'+(cls||"rin")+'" style="animation-delay:'+(d||0)+'s">';
  s+=PG(left,color,DK,0.6)+PG(left,"#00000026");
  s+=PG(right,color,DK,0.6)+PG(right,"#0000004d");
  s+=PG(top,color,DK,0.6);
  if(mark==="pips")        s+=CI(cx,cy,1.4,LT)+CI(cx-A*0.42,cy-B*0.2,1.4,LT)+CI(cx+A*0.42,cy+B*0.2,1.4,LT);
  else if(mark==="dot")    s+=CI(cx,cy,2,LT);
  else if(mark==="ribbon") s+=LN(cx,cy-B,cx,cy+B,LT,1.4)+LN(cx-A,cy,cx+A,cy,LT,1.4);
  else if(mark==="lines")  s+=LN(cx-A*0.55,cy-B*0.27,cx+A*0.55,cy+B*0.27,"#00000033",1);
  else if(mark==="shine")  s+=PG(cx+","+(cy-B*0.55)+" "+(cx+A*0.38)+","+(cy-B*0.18)+" "+cx+","+(cy+B*0.18)+" "+(cx-A*0.38)+","+(cy-B*0.18),LT);
  return s+'</g>';
}
/* a flat n×n layer of boxes at height k, painter-sorted back→front, staggered */
function cubeLayer(n,k,ox,oy,u,color,mark,d0,step){
  var A=u,B=u*0.5,H=u*0.92,cells=[],i,j,t,s="";
  for(i=0;i<n;i++)for(j=0;j<n;j++)cells.push([i,j]);
  cells.sort(function(a,b){return (a[0]+a[1])-(b[0]+b[1]);});
  for(t=0;t<cells.length;t++){ var p=isoPt(cells[t][0],cells[t][1],k,ox,oy,A,B,H); s+=drawBox(p.x,p.y,u,color,mark,d0+t*step,"rin"); }
  return s;
}
function cubeModel(n,ox,oy,u,color,mark,d0){           /* whole n×n×n cube at once */
  var s="",k; for(k=0;k<n;k++) s+=cubeLayer(n,k,ox,oy,u,color,mark,d0+k*0.5,0.06); return s;
}

R.cubeArrange={
  scene:function(m,sk){
    var total=m.total, side=m.side, vol=(m.mode==="volume");
    var disp=Math.min(side,3), u=15, ox=205, oy=58, capped=side>disp;
    var base=stage(RC(150,150,150,34,8,sk.color+"12",sk.color+"33",1.5));
    var lead = vol ? ("A cube-shaped "+sk.place+" holds "+total+" "+sk.item+", a volume of "+total+". How many "+sk.one+"s lie along each edge?")
                   : ("Let us stack "+total+" "+sk.item+" into one perfect cube — the same number across, deep and tall. How many "+sk.one+"s along each edge?");
    return {base:base, phases:[
      {cap:total+" "+sk.item+" → a cube?", ms:5200, pause:900, say:lead,
       frag:T(220,24,(vol?"Volume ":"Stack ")+total+" "+sk.item+" as a perfect cube",0,"rin",13,P.mid)+T(220,46,"How many along each edge?",0,"rin",13,sk.color)},
      {cap:"bottom layer", ms:5400, pause:900,
       say:"First the bottom layer: "+side+" across and "+side+" deep — that is "+side+" times "+side+" = "+(side*side)+" "+sk.item+" in one layer.",
       frag:cubeLayer(disp,0,ox,oy,u,sk.color,sk.mark,.3,.12)+chip(384,38,"LAYER 1",2.4,sk.color)},
      {cap:"stack the layers", ms:5400, pause:900,
       say:"Now stack layer upon layer until it is "+side+" layers tall. It grows into a solid cube.",
       frag:cubeLayer(disp,1,ox,oy,u,sk.color,sk.mark,.2,.1)+cubeLayer(disp,2,ox,oy,u,sk.color,sk.mark,.9,.1)+chip(384,38,"LAYERS "+side,1.6,sk.color)+(capped?T(108,150,"(a model of the",1.8,"rin",10,P.mid)+T(108,162,side+"×"+side+"×"+side+" cube)",1.9,"rin",10,P.mid):"")},
      {cap:side+"×"+side+"×"+side, ms:5600, pause:1000,
       say:side+" across, "+side+" deep, "+side+" tall. So "+side+" times "+side+" times "+side+" = "+total+".",
       frag:T(220,196,side+" × "+side+" × "+side+" = "+total,.2,"rin",15,P.ink)},
      {cap:"∛"+total+" = "+side, ms:5000, pause:1500,
       say:"So the cube root of "+total+" is "+side+"!",
       frag:answerBox(220,110,"∛"+total+" = "+side,.2)+spark(220,110,.6)}
    ]};
  }
};
R.cubeConcept={
  scene:function(m,sk){
    return {base:stage(""),phases:[
      {cap:"what is a perfect cube?", ms:5200, pause:900,
       say:"When do "+sk.item+" make a perfect cube? Only when they fill a solid cube — the same number across, deep and tall.",
       frag:T(220,26,"When do "+sk.item+" make a perfect cube?",0,"rin",13,P.mid)},
      {cap:"1, 8, 27 …", ms:5600, pause:900,
       say:"One "+sk.one+" is 1 by 1 by 1. Eight make 2 by 2 by 2. Twenty seven make 3 by 3 by 3.",
       frag:cubeModel(1,70,112,13,sk.color,sk.mark,.3)+T(70,152,"1³=1",1.2,"rin",12,sk.color)
           +cubeModel(2,165,106,12,sk.color,sk.mark,.7)+T(165,154,"2³=8",1.8,"rin",12,P.sage)
           +cubeModel(3,295,98,11,sk.color,sk.mark,1.3)+T(305,158,"3³=27",2.4,"rin",12,P.amber)},
      {cap:"1,8,27,64,125 …", ms:5000, pause:1400,
       say:"So 1, 8, 27, 64, 125 are the perfect cubes. Is 216? Yes — 6 times 6 times 6!",
       frag:answerBox(220,178,"1, 8, 27, 64, 125 …",.2)}
    ]};
  }
};
R.cubeCheck={
  scene:function(m,sk){
    return {base:stage(""),phases:[
      {cap:"group in threes", ms:5400, pause:900,
       say:"Is "+m.n+" a perfect cube? Break it into prime factors and group them in THREES.",
       frag:T(220,40,"Is "+m.n+" a perfect cube?",0,"rin",14,P.mid)+T(220,78,m.n+" = "+(m.facHtml||""),.6,"rin",15,sk.color)},
      {cap:(m.yes?"all in threes":"a leftover"), ms:5200, pause:900,
       say:(m.yes? "Every prime comes in a complete group of three — so it IS a perfect cube."
                 : "One prime is left over without a group of three — so it is NOT a perfect cube."),
       frag:T(220,118,(m.yes?"every factor forms a triple ✓":"a factor has no triple ✗"),.2,"rin",13,(m.yes?P.sage:P.rust))},
      {cap:(m.yes?"∛"+m.n+" = "+m.root:"not a cube"), ms:5000, pause:1400,
       say:(m.yes? "Take one from each triple — the cube root is "+m.root+"." : "So "+m.n+" is not a perfect cube."),
       frag:answerBox(220,176,(m.yes?"∛"+m.n+" = "+m.root:m.n+" is NOT a cube"),.2)}
    ]};
  }
};
R.cubeNeg={
  scene:function(m,sk){
    return {base:stage(""),phases:[
      {cap:"a cube keeps its sign", ms:5200, pause:900,
       say:"What is the cube root of minus "+m.n+"? A cube has three equal factors, so minus times minus times minus stays minus.",
       frag:T(220,40,"∛(−"+m.n+") = ?",0,"rin",18,P.mid)+T(220,80,"(−)(−)(−) = −",.6,"rin",14,P.rust)},
      {cap:"∛"+m.n+" = "+m.root, ms:5000, pause:900,
       say:"The cube root of "+m.n+" is "+m.root+". So we just keep the minus sign.",
       frag:T(220,120,"∛"+m.n+" = "+m.root,.2,"rin",16,P.sage)},
      {cap:"= −"+m.root, ms:5000, pause:1400,
       say:"So the cube root of minus "+m.n+" is minus "+m.root+".",
       frag:answerBox(220,176,"∛(−"+m.n+") = −"+m.root,.2)}
    ]};
  }
};
R.cubeAdjust={
  scene:function(m,sk){
    var mul=(m.kind==="mul");
    return {base:stage(""),phases:[
      {cap:m.start+" "+sk.item, ms:5600, pause:900,
       say:(mul? m.start+" "+sk.item+" cannot form a cube — a prime is missing partners. What is the smallest number to MULTIPLY by so they fit a perfect cube?"
               : m.start+" "+sk.item+" cannot form a cube — a prime is in excess. What is the smallest number to DIVIDE by so they fit a perfect cube?"),
       frag:T(220,40,m.start+" = "+(m.facHtml||""),0,"rin",15,P.mid)+T(220,74,"factors must come in threes",.6,"rin",12,sk.color)},
      {cap:(mul?"× "+m.change:"÷ "+m.change), ms:5200, pause:900,
       say:(mul? "Multiply by "+m.change+": "+m.start+" times "+m.change+" = "+m.cube+"."
               : "Divide by "+m.change+": "+m.start+" divided by "+m.change+" = "+m.cube+"."),
       frag:T(220,118,(mul? m.start+" × "+m.change+" = "+m.cube : m.start+" ÷ "+m.change+" = "+m.cube),.2,"rin",16,(mul?P.amber:P.rust))},
      {cap:"= "+m.root+"³", ms:5000, pause:1400,
       say:m.cube+" is "+m.root+" cubed — now every factor forms a triple. The answer is "+m.change+".",
       frag:answerBox(220,176,(mul?"multiply by ":"divide by ")+m.change,.2)}
    ]};
  }
};
R.cubeFrac={
  scene:function(m,sk){
    var frac=(m.kind==="frac");
    var p1 = frac
      ? {cap:"root top & bottom", ms:5200, pause:900, say:"Cube-root the top and the bottom on their own. Cube root of "+m.top+" is "+m.rtop+", and cube root of "+m.bot+" is "+m.rbot+".",
         frag:T(220,118,"∛"+m.top+" = "+m.rtop+"   ,   ∛"+m.bot+" = "+m.rbot,.2,"rin",16,P.sage)}
      : {cap:"as a fraction", ms:5200, pause:900, say:"Write the decimal as a fraction, then cube-root the top and the bottom.",
         frag:T(220,118,m.resultHtml+" × "+m.resultHtml+" × "+m.resultHtml+" = "+m.disp,.2,"rin",15,P.mid)};
    return {base:stage(""),phases:[
      {cap:"∛"+m.disp, ms:5200, pause:900,
       say:"Find the cube root of "+m.disp+(frac?". Cube root works on the top and the bottom separately.":". First turn it into a fraction."),
       frag:T(220,56,"∛"+m.disp+" = ?",0,"rin",20,P.mid)},
      p1,
      {cap:"= "+m.resultHtml, ms:5000, pause:1400, say:"So the cube root is "+m.resultSpk+".",
       frag:answerBox(220,176,"∛"+m.disp+" = "+m.resultHtml,.2)}
    ]};
  }
};
R.hardyRamanujan={
  scene:function(m,sk){
    return {base:stage(""),phases:[
      {cap:"1729 — an ordinary number?", ms:5600, pause:900,
       say:"1729 looks like an ordinary taxi number. But Ramanujan instantly saw something hidden in it.",
       frag:T(220,46,"1729",0,"rpl",34,P.gold)+T(220,80,"the Hardy–Ramanujan number",.6,"rin",13,P.mid)},
      {cap:"two cubes, two ways", ms:6000, pause:900,
       say:"It is the smallest number that is a sum of two cubes in two different ways. One cubed plus twelve cubed, and also nine cubed plus ten cubed.",
       frag:T(140,120,"1³ + 12³",.2,"rin",16,P.amber)+T(140,142,"= 1 + 1728",.5,"rin",12,P.mid)
           +T(300,120,"9³ + 10³",.8,"rin",16,P.sage)+T(300,142,"= 729 + 1000",1.1,"rin",12,P.mid)},
      {cap:"both = 1729", ms:5200, pause:1400, say:"Both add up to exactly 1729. That is what made it special!",
       frag:answerBox(220,178,"1³+12³ = 9³+10³ = 1729",.2)+spark(220,178,.6)}
    ]};
  }
};
R.cubeDiff={
  scene:function(m,sk){
    return {base:stage(""),phases:[
      {cap:"gaps between cubes", ms:5600, pause:900,
       say:"Look at the cubes 1, 8, 27, 64. The gaps between them are 7, then 19, then 37. What is the rule?",
       frag:T(220,46,"1   8   27   64 …",0,"rin",18,P.mid)+T(220,80,"gaps:  7,  19,  37 …",.6,"rin",14,P.rust)},
      {cap:"3n² + 3n + 1", ms:5400, pause:900,
       say:"Between n cubed and the next cube, the gap is three n squared, plus three n, plus one.",
       frag:T(220,124,"(n+1)³ − n³ = 3n² + 3n + 1",.2,"rin",16,P.sage)},
      {cap:"5³ − 4³ = 61", ms:5000, pause:1400,
       say:"For example, 5 cubed minus 4 cubed is 125 minus 64, which is 61.",
       frag:answerBox(220,178,"5³ − 4³ = 61",.2)}
    ]};
  }
};
R.cubeParity={
  scene:function(m,sk){
    return {base:stage(""),phases:[
      {cap:"even or odd?", ms:5200, pause:900,
       say:"Is the cube of an even number always even? A cube multiplies the number by itself three times.",
       frag:T(220,50,"(even)³ = ?",0,"rin",18,P.mid)},
      {cap:"a cube keeps parity", ms:5400, pause:900,
       say:"Even times even times even stays even. And odd times odd times odd stays odd. A cube keeps the parity.",
       frag:T(150,110,"even³ = even",.2,"rin",15,P.sage)+T(300,110,"odd³ = odd",.6,"rin",15,P.amber)},
      {cap:"even³ = even", ms:5000, pause:1400, say:"So yes — the cube of an even number is always even.",
       frag:answerBox(220,176,"even³ is always even",.2)}
    ]};
  }
};
R.cubeScale={
  scene:function(m,sk){
    return {base:stage(""),phases:[
      {cap:"∛x = 4", ms:5200, pause:900,
       say:"Here is a thinking one. If the cube root of x is 4, what is the cube root of 8 x?",
       frag:T(220,50,"∛x = 4   →   ∛(8x) = ?",0,"rin",17,P.mid)},
      {cap:"split the cube root", ms:5400, pause:900,
       say:"The cube root of 8 x equals the cube root of 8 times the cube root of x. The cube root of 8 is 2.",
       frag:T(220,114,"∛(8x) = ∛8 × ∛x = 2 × 4",.2,"rin",16,P.sage)},
      {cap:"= 8", ms:5000, pause:1400, say:"Two times four is eight. So the answer is 8.",
       frag:answerBox(220,176,"∛(8x) = 8",.2)}
    ]};
  }
};

/* ==========================================================================
 * EXPONENT FAMILY (chapter 3: Exponents & Powers)
 *   Mostly algebraic laws → clean 3-beat narrated reveals. Showcase = expGrow,
 *   the "explosive doubling" story (the real-life hook for powers).
 * ========================================================================== */
function eTile(cx,cy,txt,fill,d){
  var w=Math.max(26,String(txt).length*10+10);
  return '<g class="rin" style="animation-delay:'+d+'s">'+RC(cx-w/2,cy-14,w,28,5,fill||"#fff6e0",DK,0.8)+T(cx,cy+5,txt,d,"",15,P.ink)+'</g>';
}
R.expGrow={
  scene:function(m,sk){
    var b=m.base, seq=[1], v=1, i; for(i=1;i<=m.power;i++){ v*=b; seq.push(v); }
    var n=seq.length, x0=40, x1=400, gap=(x1-x0)/(n>1?n-1:1);
    var tiles="", arr="";
    for(i=0;i<n;i++){ var x=x0+i*gap; tiles+=eTile(x,108,""+seq[i],(i===n-1?"#eef7e9":"#fff6e0"),.3+i*0.35);
      if(i>0) arr+=T((x-gap/2),100,"×"+b,.3+i*0.35,"rin",10,P.rust); }
    return {base:stage(""),phases:[
      {cap:b+"^"+m.power+" = ?", ms:5000, pause:900,
       say:b+" to the power "+m.power+" means multiplying "+b+" by itself "+m.power+" times. Watch how fast it grows!",
       frag:T(220,44,b+"^"+m.power+" = ?",0,"rpl",28,P.gold)+T(220,76,"multiply "+b+" by itself "+m.power+" times",.6,"rin",13,P.mid)},
      {cap:"multiply each step…", ms:5600, pause:900,
       say:"Start at 1 and multiply by "+b+" each step: "+seq.slice(1,Math.min(4,n)).join(", ")+(n>4?", and it keeps growing.":"."),
       frag:tiles+arr},
      {cap:b+"^"+m.power+" = "+m.result, ms:5000, pause:1500,
       say:"After "+m.power+" steps we reach "+m.result+". So "+b+" to the power "+m.power+" is "+m.result+". Powers grow explosively!",
       frag:answerBox(220,165,b+"^"+m.power+" = "+m.result,.2)+spark(220,165,.6)}
    ]};
  }
};
R.expProduct={
  scene:function(m,sk){
    var a=m.a,x,i,top="";
    for(i=0;i<m.m1;i++){ x=70+i*30; top+=eTile(x,90,a,"#fff6e0",.3+i*0.12); }
    top+=T(70+m.m1*30,96,"×",.9,"rin",20,P.rust);
    for(i=0;i<m.m2;i++){ x=70+m.m1*30+26+i*30; top+=eTile(x,90,a,"#eef7e9",.9+i*0.12); }
    return {base:stage(""),phases:[
      {cap:a+m.m1+" × "+a+m.m2, ms:5200, pause:900,
       say:a+" to the "+m.m1+", times "+a+" to the "+m.m2+". The base is the same — what happens to the powers?",
       frag:T(220,46,a+"^"+m.m1+" × "+a+"^"+m.m2+" = ?",0,"rin",20,P.mid)},
      {cap:m.m1+" + "+m.m2+" copies", ms:5400, pause:900,
       say:a+" to the "+m.m1+" is "+m.m1+" copies of "+a+". "+a+" to the "+m.m2+" is "+m.m2+" more. Together that is "+m.m1+" plus "+m.m2+" = "+m.sum+" copies.",
       frag:top},
      {cap:"= "+a+m.sum, ms:5000, pause:1400, say:"So the same base means ADD the powers: "+a+" to the "+m.sum+".",
       frag:answerBox(220,160,"= "+a+"^"+m.sum,.2)}
    ]};
  }
};
R.expQuotient={
  scene:function(m,sk){
    return {base:stage(""),phases:[
      {cap:m.a+m.m1+" ÷ "+m.a+m.m2, ms:5200, pause:900,
       say:m.a+" to the "+m.m1+", divided by "+m.a+" to the "+m.m2+". Same base, but dividing this time.",
       frag:T(220,50,m.a+"^"+m.m1+" ÷ "+m.a+"^"+m.m2+" = ?",0,"rin",20,P.mid)},
      {cap:"cancel pairs", ms:5400, pause:900,
       say:m.m1+" copies on top, "+m.m2+" below. Cancel "+m.m2+" pairs and "+(m.m1-m.m2)+" are left.",
       frag:T(220,108,m.a+" · "+m.a+" … ("+m.m1+" on top)",.2,"rin",14,P.mid)+T(220,134,"cancel "+m.m2+" → "+(m.m1-m.m2)+" left",.6,"rin",14,P.sage)},
      {cap:"= "+m.a+(m.m1-m.m2), ms:5000, pause:1400, say:"Same base means SUBTRACT the powers: "+m.m1+" minus "+m.m2+" = "+(m.m1-m.m2)+".",
       frag:answerBox(220,172,"= "+m.a+"^"+(m.m1-m.m2),.2)}
    ]};
  }
};
R.expZero={
  scene:function(m,sk){
    return {base:stage(""),phases:[
      {cap:m.base+"⁰ = ?", ms:5000, pause:900,
       say:"What is "+m.base+" to the power zero? The answer surprises everyone.",
       frag:T(220,56,m.base+"^0 = ?",0,"rpl",30,P.gold)},
      {cap:"any number ÷ itself", ms:5400, pause:900,
       say:m.base+" to the 1 divided by "+m.base+" to the 1 is "+m.base+" to the power zero. But any number divided by itself is 1.",
       frag:T(220,112,m.base+"^1 ÷ "+m.base+"^1 = "+m.base+"^0 = 1",.2,"rin",16,P.sage)},
      {cap:"= 1", ms:5000, pause:1400, say:"So "+m.base+" to the power zero is 1. In fact ANY non-zero number to the power zero is 1.",
       frag:answerBox(220,172,m.base+"^0 = 1",.2)}
    ]};
  }
};
R.expPower={
  scene:function(m,sk){
    return {base:stage(""),phases:[
      {cap:"("+m.base+m.m1+")"+m.m2, ms:5200, pause:900,
       say:m.base+" to the "+m.m1+", all raised to the "+m.m2+". A power of a power.",
       frag:T(220,54,"("+m.base+"^"+m.m1+")^"+m.m2+" = ?",0,"rin",22,P.mid)},
      {cap:m.m1+" × "+m.m2+" = "+m.prod, ms:5400, pause:900,
       say:"That means "+m.base+" to the "+m.m1+", "+m.m2+" times over — so multiply the powers: "+m.m1+" times "+m.m2+" = "+m.prod+".",
       frag:T(220,112,m.m1+" × "+m.m2+" = "+m.prod,.2,"rin",18,P.sage)},
      {cap:"= "+m.base+m.prod, ms:5000, pause:1400, say:"So it is "+m.base+" to the "+m.prod+", which is "+m.result+". Power of a power means MULTIPLY.",
       frag:answerBox(220,172,"= "+m.base+"^"+m.prod+" = "+m.result,.2)}
    ]};
  }
};
R.expNeg={
  scene:function(m,sk){
    return {base:stage(""),phases:[
      {cap:m.base+"⁻"+m.power, ms:5200, pause:900,
       say:m.base+" to the power minus "+m.power+". A negative power flips the number upside down.",
       frag:T(220,56,m.base+"^(−"+m.power+") = ?",0,"rin",22,P.mid)},
      {cap:"flip it: 1 over", ms:5400, pause:900,
       say:"A minus power means one over the positive power. So "+m.base+" to the minus "+m.power+" is 1 over "+m.base+" to the "+m.power+".",
       frag:T(220,112,m.base+"^(−"+m.power+") = 1 ⁄ "+m.base+"^"+m.power,.2,"rin",17,P.sage)},
      {cap:"= "+m.result, ms:5000, pause:1400, say:"And "+m.base+" to the "+m.power+" is "+(Math.pow(m.base,m.power))+", so the answer is "+m.result+".",
       frag:answerBox(220,172,m.base+"^(−"+m.power+") = "+m.result,.2)}
    ]};
  }
};
R.expProd={
  scene:function(m,sk){
    return {base:stage(""),phases:[
      {cap:"(ab)"+m.n, ms:5000, pause:900,
       say:"a times b, all to the power "+m.n+". The power spreads to each factor inside.",
       frag:T(220,56,"(a·b)^"+m.n+" = ?",0,"rin",22,P.mid)},
      {cap:"power to each", ms:5400, pause:900,
       say:"Give the power to a, and to b, separately: a to the "+m.n+", times b to the "+m.n+".",
       frag:T(220,112,"= a^"+m.n+" · b^"+m.n,.2,"rin",18,P.sage)},
      {cap:"= a"+m.n+"b"+m.n, ms:5000, pause:1400, say:"So the power of a product is the product of the powers.",
       frag:answerBox(220,172,"(ab)^"+m.n+" = a^"+m.n+"b^"+m.n,.2)}
    ]};
  }
};
R.expQuot={
  scene:function(m,sk){
    return {base:stage(""),phases:[
      {cap:"(a/b)"+m.n, ms:5000, pause:900,
       say:"a over b, all to the power "+m.n+". The power goes to BOTH top and bottom.",
       frag:T(220,56,"(a ⁄ b)^"+m.n+" = ?",0,"rin",22,P.mid)},
      {cap:"top and bottom", ms:5400, pause:900,
       say:"Raise the top to the "+m.n+", and the bottom to the "+m.n+". Never forget the denominator.",
       frag:T(220,112,"= a^"+m.n+" ⁄ b^"+m.n,.2,"rin",18,P.sage)},
      {cap:"done", ms:5000, pause:1400, say:"So the power of a quotient is the quotient of the powers.",
       frag:answerBox(220,172,"(a/b)^"+m.n+" = a^"+m.n+"/b^"+m.n,.2)}
    ]};
  }
};
R.stdFormSmall={
  scene:function(m,sk){
    return {base:stage(""),phases:[
      {cap:"into standard form", ms:5200, pause:900,
       say:"Write "+m.disp+" in standard form. Count how many places the decimal must move to reach 1.",
       frag:T(220,56,m.disp,0,"rin",24,P.ink)},
      {cap:m.power+" places", ms:5400, pause:900,
       say:"The decimal moves "+m.power+" places to the right to become 1. A small number means a negative power of ten.",
       frag:T(220,112,"move "+m.power+" places →  10^(−"+m.power+")",.2,"rin",16,P.sage)},
      {cap:"= 10⁻"+m.power, ms:5000, pause:1400, say:"So "+m.disp+" equals 10 to the power minus "+m.power+".",
       frag:answerBox(220,172,m.disp+" = 10^(−"+m.power+")",.2)}
    ]};
  }
};
R.stdFormBig={
  scene:function(m,sk){
    return {base:stage(""),phases:[
      {cap:m.coef+" × 10"+m.power, ms:5200, pause:900,
       say:m.coef+" times 10 to the power "+m.power+". Turn it back into a normal number.",
       frag:T(220,56,m.coef+" × 10^"+m.power,0,"rin",22,P.mid)},
      {cap:"move right "+m.power, ms:5400, pause:900,
       say:"Multiplying by 10 to the "+m.power+" moves the decimal point "+m.power+" places to the right.",
       frag:T(220,112,m.coef+"  →  "+m.result,.2,"rpl",22,P.sage)},
      {cap:"= "+m.result, ms:5000, pause:1400, say:"So the answer is "+m.result+".",
       frag:answerBox(220,172,"= "+m.result,.2)}
    ]};
  }
};
R.expNegBase={
  scene:function(m,sk){
    return {base:stage(""),phases:[
      {cap:"(−"+m.base+")"+m.power, ms:5200, pause:900,
       say:"Minus "+m.base+", to the power "+m.power+". Watch the sign carefully.",
       frag:T(220,56,"(−"+m.base+")^"+m.power+" = ?",0,"rin",22,P.mid)},
      {cap:"even power → +", ms:5400, pause:900,
       say:"The minus signs pair up: minus times minus is plus. An even power makes the result positive.",
       frag:T(150,112,"(−)(−) = +",.2,"rin",15,P.sage)+T(300,112,"(−)(−) = +",.5,"rin",15,P.sage)},
      {cap:"= +"+m.result, ms:5000, pause:1400, say:"So minus "+m.base+" to the power "+m.power+" is positive "+m.result+".",
       frag:answerBox(220,172,"(−"+m.base+")^"+m.power+" = +"+m.result,.2)}
    ]};
  }
};
R.expSameExp={
  scene:function(m,sk){
    return {base:stage(""),phases:[
      {cap:m.a+m.n+" × "+m.b+m.n, ms:5200, pause:900,
       say:m.a+" to the "+m.n+", times "+m.b+" to the "+m.n+". Same power, different bases.",
       frag:T(220,54,m.a+"^"+m.n+" × "+m.b+"^"+m.n+" = ?",0,"rin",20,P.mid)},
      {cap:"combine the bases", ms:5400, pause:900,
       say:"When the power is the same, combine the bases first: "+m.a+" times "+m.b+" = "+m.ab+", all to the "+m.n+".",
       frag:T(220,112,"= ("+m.a+"×"+m.b+")^"+m.n+" = "+m.ab+"^"+m.n,.2,"rin",18,P.sage)},
      {cap:"= "+m.result, ms:5000, pause:1400, say:m.ab+" to the "+m.n+" is "+m.result+".",
       frag:answerBox(220,172,"= "+m.ab+"^"+m.n+" = "+m.result,.2)}
    ]};
  }
};
R.expCompare={
  scene:function(m,sk){
    return {base:stage(""),phases:[
      {cap:"2¹⁰  vs  10²", ms:5200, pause:900,
       say:"Which is bigger: 2 to the power 10, or 10 squared? Take a guess before you calculate.",
       frag:T(140,70,"2^10",0,"rpl",24,P.amber)+T(220,70,"vs",.4,"rin",18,P.mid)+T(300,70,"10^2",0,"rpl",24,P.sage)},
      {cap:"100  vs  1024", ms:5400, pause:900,
       say:"10 squared is just 100. But 2 doubles ten times — 2, 4, 8, all the way to 1024!",
       frag:T(140,120,"= 1024",.2,"rin",18,P.amber)+T(300,120,"= 100",.5,"rin",18,P.sage)},
      {cap:"2¹⁰ wins", ms:5000, pause:1400, say:"So 2 to the power 10 is more than ten times bigger. Powers of 2 grow faster than you expect!",
       frag:answerBox(220,176,"2^10 = 1024  ≫  100",.2)}
    ]};
  }
};
R.expSolve={
  scene:function(m,sk){
    var steps=[],v=1,i; for(i=1;v<m.target;i++){ v*=m.base; steps.push(m.base+"^"+i+"="+v); }
    return {base:stage(""),phases:[
      {cap:m.base+"ˣ = "+m.target, ms:5200, pause:900,
       say:m.base+" to the power x equals "+m.target+". What is x?",
       frag:T(220,60,m.base+"^x = "+m.target,0,"rin",24,P.mid)},
      {cap:"climb the powers", ms:5600, pause:900,
       say:"Climb the powers of "+m.base+" until you hit "+m.target+": "+steps.slice(0,Math.min(4,steps.length)).join(", ")+"…",
       frag:T(220,118,steps.join("   "),.2,"rin",12,P.sage)},
      {cap:"x = "+m.x, ms:5000, pause:1400, say:m.base+" to the "+m.x+" equals "+m.target+". So x is "+m.x+".",
       frag:answerBox(220,172,"x = "+m.x,.2)}
    ]};
  }
};
var EXP_CONCEPTS={expGrow:1,expProduct:1,expQuotient:1,expZero:1,expPower:1,expNeg:1,expProd:1,expQuot:1,stdFormSmall:1,stdFormBig:1,expNegBase:1,expSameExp:1,expCompare:1,expSolve:1};

/* ==========================================================================
 * COMPARING QUANTITIES FAMILY (chapter 8: % , profit/loss, interest, GST)
 *   Money math → bar models + rupee labels. Showcase = profitPct (shopkeeper).
 * ========================================================================== */
var MONEY_SKINS=[
 {item:"shirt",      place:"clothes shop",  color:"#b85c2a"},
 {item:"cycle",      place:"bike shop",     color:"#4a7fb0"},
 {item:"phone",      place:"electronics store", color:"#6a6a7a"},
 {item:"watch",      place:"watch shop",    color:"#c8922a"},
 {item:"pair of shoes", place:"shoe shop",  color:"#8a5a2a"},
 {item:"bag",        place:"bag store",     color:"#9a6fb0"},
 {item:"book",       place:"bookstore",     color:"#5a8a60"},
 {item:"toy",        place:"toy shop",      color:"#d4870a"},
 {item:"cricket bat",place:"sports shop",   color:"#6f9e8f"},
 {item:"lamp",       place:"home store",    color:"#b07a3a"},
 {item:"headphones", place:"gadget shop",   color:"#3a6b8a"},
 {item:"sunglasses", place:"optical shop",  color:"#a04a4a"}
];
var MONEY_CONCEPTS={profitPct:1,lossSP:1,percentOf:1,pctChange:1,simpleInterest:1,compoundInterest:1,discountSP:1,profitSP:1,gstTotal:1,markedPrice:1,siVsCi:1,netChange:1,siRate:1,ciRate:1};

function mBar(x,y,w,fill,d,label,lcol){
  return '<g class="rsl" style="animation-delay:'+d+'s">'+RC(x,y,Math.max(w,2),22,4,fill,DK,1)+'</g>'+T(x+Math.max(w,2)+8,y+16,label||"",d+0.2,"rin",12,lcol||P.ink,"start");
}
function pctStrip(x,y,w,pct,fill,d){
  var fw=w*Math.min(Math.max(pct,0),100)/100;
  return RC(x,y,w,22,4,"#f3ecdd",DK,1)+'<g class="rsl" style="animation-delay:'+d+'s">'+RC(x,y,Math.max(fw,1),22,4,fill)+'</g>';
}

R.profitPct={
  scene:function(m,sk){
    var sc=230/m.sp, wCP=m.cp*sc, wSP=m.sp*sc, x0=70;
    return {base:stage(""),phases:[
      {cap:"buy low, sell high", ms:5400, pause:900,
       say:"A shopkeeper buys a "+sk.item+" for "+m.cp+" rupees and sells it for "+m.sp+" rupees. What is his profit percent?",
       frag:T(220,30,"Buy a "+sk.item+" ₹"+m.cp+"  →  sell ₹"+m.sp,0,"rin",14,P.mid)},
      {cap:"the cost", ms:5000, pause:800,
       say:"He paid "+m.cp+" rupees — that is his cost price.",
       frag:mBar(x0,74,wCP,sk.color,.2,"Cost ₹"+m.cp,sk.color)},
      {cap:"the profit gap", ms:5400, pause:900,
       say:"He sold it for more. The extra "+m.profit+" rupees is his profit.",
       frag:mBar(x0,110,wSP,P.sage,.2,"Sold ₹"+m.sp,P.sage)+braceH(x0+wCP,x0+wSP,104,"+₹"+m.profit,.7,P.rust)},
      {cap:"profit ÷ cost × 100", ms:5600, pause:900,
       say:"Profit percent is profit divided by cost, times 100. So "+m.profit+" divided by "+m.cp+", times 100, is "+m.pct+".",
       frag:T(220,160,"₹"+m.profit+" ÷ ₹"+m.cp+" × 100 = "+m.pct+"%",.2,"rin",16,P.ink)},
      {cap:"profit = "+m.pct+"%", ms:5000, pause:1400, say:"So his profit is "+m.pct+" percent.",
       frag:answerBox(220,96,"Profit = "+m.pct+"%",.2)+spark(220,96,.6)}
    ]};
  }
};
R.lossSP={
  scene:function(m,sk){
    return {base:stage(""),phases:[
      {cap:m.lossPct+"% loss", ms:5400, pause:900,
       say:"A "+sk.item+" bought for "+m.cp+" rupees is sold at "+m.lossPct+" percent loss. What is the selling price?",
       frag:T(220,46,"Cost ₹"+m.cp+",  loss "+m.lossPct+"%",0,"rin",15,P.mid)},
      {cap:"keep "+(100-m.lossPct)+"%", ms:5400, pause:900,
       say:"A loss of "+m.lossPct+" percent means he gets only "+(100-m.lossPct)+" percent of the cost back.",
       frag:pctStrip(90,104,240,100-m.lossPct,P.rust,.2)+T(220,150,(100-m.lossPct)+"% of ₹"+m.cp,.6,"rin",13,P.mid)},
      {cap:"SP = ₹"+m.sp, ms:5000, pause:1400, say:(100-m.lossPct)+" percent of "+m.cp+" is "+m.sp+". So the selling price is "+m.sp+" rupees.",
       frag:answerBox(220,180,"Selling price = ₹"+m.sp,.2)}
    ]};
  }
};
R.percentOf={
  scene:function(m,sk){
    return {base:stage(""),phases:[
      {cap:m.pct+"% of "+m.n, ms:5000, pause:900,
       say:"What is "+m.pct+" percent of "+m.n+"? Percent means out of a hundred.",
       frag:T(220,50,m.pct+"% of "+m.n+" = ?",0,"rin",22,P.mid)},
      {cap:"shade "+m.pct+" of 100", ms:5400, pause:900,
       say:m.pct+" percent means "+m.pct+" hundredths. Multiply: "+m.pct+" over 100, times "+m.n+".",
       frag:pctStrip(90,100,240,m.pct,sk.color,.2)+T(220,146,m.pct+"/100 × "+m.n,.6,"rin",15,P.mid)},
      {cap:"= "+m.ans, ms:5000, pause:1400, say:"That gives "+m.ans+".",
       frag:answerBox(220,178,m.pct+"% of "+m.n+" = "+m.ans,.2)}
    ]};
  }
};
R.pctChange={
  scene:function(m,sk){
    var ch=Math.abs(m.b-m.a);
    return {base:stage(""),phases:[
      {cap:m.a+" → "+m.b, ms:5400, pause:900,
       say:"A town's population went from "+m.a+" to "+m.b+". What is the percentage "+m.dir+"?",
       frag:T(220,50,m.a+"  →  "+m.b,0,"rin",20,P.mid)},
      {cap:"change ÷ original", ms:5400, pause:900,
       say:"The change is "+ch+". Percentage change is change divided by the ORIGINAL, times 100.",
       frag:T(220,108,ch+" ÷ "+m.a+" × 100",.2,"rin",16,P.sage)},
      {cap:"= "+m.pct+"%", ms:5000, pause:1400, say:"That is a "+m.pct+" percent "+m.dir+".",
       frag:answerBox(220,172,m.pct+"% "+m.dir,.2)}
    ]};
  }
};
R.simpleInterest={
  scene:function(m,sk){
    return {base:stage(""),phases:[
      {cap:"Simple Interest", ms:5400, pause:900,
       say:"Find the simple interest on "+m.p+" rupees at "+m.r+" percent per year, for "+m.t+" years.",
       frag:T(220,50,"₹"+m.p+" · "+m.r+"% · "+m.t+" yrs",0,"rin",18,P.mid)},
      {cap:"P × R × T ÷ 100", ms:5600, pause:900,
       say:"Simple interest is principal times rate times time, divided by 100. The same interest is added each year.",
       frag:T(220,108,m.p+" × "+m.r+" × "+m.t+" ÷ 100",.2,"rin",16,P.sage)},
      {cap:"SI = ₹"+m.si, ms:5000, pause:1400, say:"That comes to "+m.si+" rupees.",
       frag:answerBox(220,172,"Interest = ₹"+m.si,.2)}
    ]};
  }
};
R.compoundInterest={
  scene:function(m,sk){
    var coins="",k; for(k=0;k<=m.t;k++){ var cx=80+k*100; coins+=RC(cx-22,150-k*8,44,18+k*12,3,(k===m.t?P.sage:P.gold),DK,1)+T(cx,170,(k===0?"₹"+m.p:"yr "+k),(k*0.4),"rin",11,P.mid); }
    return {base:stage(""),phases:[
      {cap:"interest on interest", ms:5600, pause:900,
       say:"Find the compound interest on "+m.p+" rupees at "+m.r+" percent per year, for "+m.t+" years. Each year the interest itself earns interest.",
       frag:T(220,40,"₹"+m.p+" · "+m.r+"% · "+m.t+" yrs (compound)",0,"rin",14,P.mid)},
      {cap:"grows each year", ms:5800, pause:900,
       say:"Multiply by 1 plus the rate, each year. After "+m.t+" years the amount is "+m.amount+" rupees.",
       frag:'<g class="rsl" style="animation-delay:.2s">'+coins+'</g>'},
      {cap:(m.showAmount?"Amount ₹"+m.amount:"CI ₹"+m.ci), ms:5000, pause:1400,
       say:(m.showAmount? "So the amount after "+m.t+" years is "+m.amount+" rupees." : "Subtract the principal: the compound interest is "+m.ci+" rupees."),
       frag:answerBox(220,96,(m.showAmount?"Amount = ₹"+m.amount:"CI = ₹"+m.ci),.2)}
    ]};
  }
};
R.discountSP={
  scene:function(m,sk){
    return {base:stage(""),phases:[
      {cap:m.discPct+"% off", ms:5400, pause:900,
       say:"A "+sk.item+" is marked at "+m.mp+" rupees with a "+m.discPct+" percent discount. What is the selling price?",
       frag:T(220,46,"Marked ₹"+m.mp+",  "+m.discPct+"% off",0,"rin",15,P.mid)},
      {cap:"pay "+(100-m.discPct)+"%", ms:5400, pause:900,
       say:"A "+m.discPct+" percent discount means you pay only "+(100-m.discPct)+" percent of the marked price.",
       frag:pctStrip(90,104,240,100-m.discPct,P.sage,.2)+T(220,150,(100-m.discPct)+"% of ₹"+m.mp,.6,"rin",13,P.mid)},
      {cap:"SP = ₹"+m.sp, ms:5000, pause:1400, say:"That is "+m.sp+" rupees.",
       frag:answerBox(220,180,"Selling price = ₹"+m.sp,.2)}
    ]};
  }
};
R.profitSP={
  scene:function(m,sk){
    return {base:stage(""),phases:[
      {cap:m.profitPct+"% profit", ms:5400, pause:900,
       say:"A "+sk.item+" costs "+m.cp+" rupees and is sold at "+m.profitPct+" percent profit. What is the selling price?",
       frag:T(220,46,"Cost ₹"+m.cp+",  profit "+m.profitPct+"%",0,"rin",15,P.mid)},
      {cap:"add the profit", ms:5400, pause:900,
       say:"Selling price is the cost plus "+m.profitPct+" percent of it — that is "+(100+m.profitPct)+" percent of the cost.",
       frag:T(220,108,(100+m.profitPct)+"% of ₹"+m.cp,.2,"rin",16,P.sage)},
      {cap:"SP = ₹"+m.sp, ms:5000, pause:1400, say:"That comes to "+m.sp+" rupees.",
       frag:answerBox(220,172,"Selling price = ₹"+m.sp,.2)}
    ]};
  }
};
R.gstTotal={
  scene:function(m,sk){
    return {base:stage(""),phases:[
      {cap:m.gstPct+"% GST", ms:5400, pause:900,
       say:"A bill is "+m.bill+" rupees, and "+m.gstPct+" percent GST is added. What is the total to pay?",
       frag:T(220,50,"Bill ₹"+m.bill+"  +  "+m.gstPct+"% GST",0,"rin",16,P.mid)},
      {cap:"add the tax", ms:5400, pause:900,
       say:m.gstPct+" percent of "+m.bill+" is "+m.gst+" rupees of tax. Add it to the bill.",
       frag:mBar(90,100,150,sk.color,.2,"₹"+m.bill,P.ink)+mBar(90,128,Math.max(150*m.gst/m.bill,14),P.rust,.5,"+₹"+m.gst+" tax",P.rust)},
      {cap:"Total ₹"+m.total, ms:5000, pause:1400, say:"So the total amount paid is "+m.total+" rupees.",
       frag:answerBox(220,178,"Total = ₹"+m.total,.2)}
    ]};
  }
};
R.markedPrice={
  scene:function(m,sk){
    return {base:stage(""),phases:[
      {cap:"discount AND profit", ms:5800, pause:900,
       say:"A dealer gives "+m.discPct+" percent discount but still earns "+m.profitPct+" percent profit on a "+sk.item+" costing "+m.cp+" rupees. Find the marked price.",
       frag:T(220,44,"CP ₹"+m.cp+",  +"+m.profitPct+"% profit,  −"+m.discPct+"% off",0,"rin",13,P.mid)},
      {cap:"first the selling price", ms:5400, pause:900,
       say:"First the selling price: "+(100+m.profitPct)+" percent of cost is "+m.sp+" rupees.",
       frag:T(220,104,"SP = "+(100+m.profitPct)+"% of "+m.cp+" = ₹"+m.sp,.2,"rin",15,P.sage)},
      {cap:"work back to MP", ms:5400, pause:1400,
       say:"That "+m.sp+" is "+(100-m.discPct)+" percent of the marked price. Work backwards: the marked price is "+m.mp+" rupees.",
       frag:answerBox(220,170,"Marked price = ₹"+m.mp,.2)}
    ]};
  }
};
R.siVsCi={
  scene:function(m,sk){
    return {base:stage(""),phases:[
      {cap:"SI vs CI", ms:5600, pause:900,
       say:"On "+m.p+" rupees at "+m.r+" percent for "+m.t+" years, what is the difference between simple and compound interest?",
       frag:T(220,46,"₹"+m.p+" · "+m.r+"% · "+m.t+" yrs",0,"rin",16,P.mid)},
      {cap:"CI is a little more", ms:5600, pause:900,
       say:"Simple interest is "+m.si+" rupees. Compound interest is "+m.ci+" rupees — a little more, because interest earns interest.",
       frag:mBar(90,98,150,P.gold,.2,"SI ₹"+m.si,P.ink)+mBar(90,126,150*m.ci/m.si,P.sage,.5,"CI ₹"+m.ci,P.sage)},
      {cap:"difference ₹"+m.diff, ms:5000, pause:1400, say:"The difference is "+m.diff+" rupees.",
       frag:answerBox(220,178,"Difference = ₹"+m.diff,.2)}
    ]};
  }
};
R.netChange={
  scene:function(m,sk){
    return {base:stage(""),phases:[
      {cap:"+"+m.pct+"% then −"+m.pct+"%", ms:5600, pause:900,
       say:"A number is increased by "+m.pct+" percent, then decreased by "+m.pct+" percent. Is it back to the start?",
       frag:T(220,54,"+"+m.pct+"%   then   −"+m.pct+"%",0,"rin",18,P.mid)},
      {cap:"not the same!", ms:5600, pause:900,
       say:"No! The decrease is taken from the bigger amount, so you lose a little. The net change is minus "+m.pct+" squared over 100.",
       frag:T(220,112,"net = −("+m.pct+"²/100) %",.2,"rin",16,P.rust)},
      {cap:m.net+"% net", ms:5000, pause:1400, say:"So the net change is a "+m.net+" percent decrease.",
       frag:answerBox(220,172,m.net+"% (a decrease)",.2)}
    ]};
  }
};
R.siRate={
  scene:function(m,sk){
    return {base:stage(""),phases:[
      {cap:"find the rate", ms:5400, pause:900,
       say:"What rate of simple interest gives "+m.si+" rupees on "+m.p+" rupees in "+m.t+" years?",
       frag:T(220,50,"₹"+m.si+" on ₹"+m.p+" in "+m.t+" yrs",0,"rin",16,P.mid)},
      {cap:"rearrange the formula", ms:5600, pause:900,
       say:"Rate is interest times 100, divided by principal times time. So "+m.si+" times 100, over "+m.p+" times "+m.t+".",
       frag:T(220,108,"R = "+m.si+"×100 ÷ ("+m.p+"×"+m.t+")",.2,"rin",15,P.sage)},
      {cap:"R = "+m.r+"%", ms:5000, pause:1400, say:"That gives "+m.r+" percent per year.",
       frag:answerBox(220,172,"Rate = "+m.r+"% per year",.2)}
    ]};
  }
};
R.ciRate={
  scene:function(m,sk){
    return {base:stage(""),phases:[
      {cap:"double in 2 years?", ms:5600, pause:900,
       say:"At what compound interest rate does money roughly double in 2 years?",
       frag:T(220,54,"₹1  →  ₹2  in 2 years",0,"rin",18,P.mid)},
      {cap:"(1+r)² = 2", ms:5600, pause:900,
       say:"Doubling means 1 plus the rate, squared, equals 2. So 1 plus the rate is the square root of 2, about 1 point 4 1.",
       frag:T(220,112,"(1 + r)² = 2  →  1+r ≈ 1.41",.2,"rin",15,P.sage)},
      {cap:"≈ 41%", ms:5000, pause:1400, say:"So the rate is about 41 percent per year.",
       frag:answerBox(220,172,"Rate ≈ 41% per year",.2)}
    ]};
  }
};

/* ---- skin picker (random; avoids the immediate repeat) -------------------- */
var _last={};
function pickSkin(concept){
  var pool = CUBE_CONCEPTS[concept]?CUBE_SKINS : (MONEY_CONCEPTS[concept]?MONEY_SKINS:SKINS);
  var n=pool.length,i;
  do{ i=Math.floor(Math.random()*n); }while(n>1 && i===_last[concept]);
  _last[concept]=i; return pool[i];
}

/* ---- public API ---------------------------------------------------------- */
function fallback(){ return {base:'<svg viewBox="0 0 440 210" xmlns="http://www.w3.org/2000/svg"><rect width="440" height="210" fill="'+P.bg+'"/><text x="220" y="105" text-anchor="middle" font-family="Nunito,Arial,sans-serif" font-size="14" fill="'+P.mid+'">Loading…</text></svg>',phases:[]}; }
window.RishiAnim={
  version:3, skins:SKINS,
  pickSkin:function(concept,m){ return pickSkin(concept); },
  scene:function(concept,m,skin){ var r=R[concept]; if(!r)return fallback(); try{ return r.scene(m,skin||pickSkin(concept)); }catch(e){ return fallback(); } },
  /* legacy single-shot helpers (kept so an un-migrated page still renders something) */
  svg:function(concept,m,skin){ try{ return this.scene(concept,m,skin).base; }catch(e){ return fallback().base; } },
  steps:function(concept,m,skin){ try{ return this.scene(concept,m,skin).phases.map(function(p){return {t:p.say,s:p.say};}); }catch(e){ return []; } },
  caption:function(concept,m,skin){ var r=R[concept]; try{ return r.caption?r.caption(m,skin):"Watch closely…"; }catch(e){ return "Watch closely…"; } }
};
})();
