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

/* ---- skin picker (random; avoids the immediate repeat) -------------------- */
var _last={};
function pickSkin(concept){ var n=SKINS.length,i; do{ i=Math.floor(Math.random()*n); }while(n>1 && i===_last[concept]); _last[concept]=i; return SKINS[i]; }

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
