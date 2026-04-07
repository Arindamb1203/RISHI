function mathNormalise(raw){
  var s=raw,fixes=[];
  if(/sq[\.\s_-]*r[\.\s_-]*t|square[\s_-]*root|squrt|squroot|sqroot/i.test(s)){
    s=s.replace(/square[\s_-]*root[\s_-]*(of[\s_-]*)?/gi,"sqrt ");
    s=s.replace(/sq[\.\s_-]*r[\.\s_-]*t[\.\s_-]*/gi,"sqrt ");
    s=s.replace(/\b(squrt|squroot|sqroot)\b/gi,"sqrt ");
    fixes.push({label:"Did you mean: sqrt?",type:"fuzzy"});
  }
  if(/cube[\s_-]*root|cubert|cbroot/i.test(s)){
    s=s.replace(/cube[\s_-]*root[\s_-]*(of[\s_-]*)?/gi,"cbrt ");
    s=s.replace(/\b(cubert|cbroot)\b/gi,"cbrt ");
    fixes.push({label:"Did you mean: cbrt?",type:"fuzzy"});
  }
  s=s.replace(/([a-zA-Z])(\d+)/g,function(m,l,d){return l+"^"+d;});
  return {normalised:s.trim(),fixes:fixes};
}
function mathToLatex(s){
  s=s.replace(/sqrt\s*\(([^)]*)\)/g,"\\sqrt{$1}");
  s=s.replace(/sqrt\s+([^\s+\-*\/\^]+)/g,"\\sqrt{$1}");
  s=s.replace(/cbrt\s*\(([^)]*)\)/g,"\\sqrt[3]{$1}");
  s=s.replace(/cbrt\s+([^\s+\-*\/\^]+)/g,"\\sqrt[3]{$1}");
  s=s.replace(/\(([^)]+)\)\/\(([^)]+)\)/g,"\\frac{$1}{$2}");
  s=s.replace(/([A-Za-z0-9\^\{\}]+)\/([A-Za-z0-9\^\{\}]+)/g,"\\frac{$1}{$2}");
  s=s.replace(/\bpi\b/g,"\\pi");
  s=s.replace(/\*/g,"\\times");
  s=s.replace(/\+-/g,"\\pm");
  s=s.replace(/!=/g,"\\neq");
  s=s.replace(/>=/g,"\\geq");
  s=s.replace(/<=/g,"\\leq");
  return s;
}
function mathRender(latex){
  var el=G("mathPreview");if(!el)return;
  if(!latex.trim()){el.innerHTML='<span class="mph">your answer will render here...</span>';return;}
  try{katex.render(latex,el,{throwOnError:false,displayMode:true});}
  catch(e){el.textContent=latex;}
}
function mathGetSuggs(raw,norm){
  if(/[a-zA-Z]\^2/.test(norm)&&!/[a-zA-Z]\^3/.test(norm)){
    var b=(norm.match(/([a-zA-Z])\^2/)||["","x"])[1];
    return {chips:[
      {label:b+"^2 confirmed",ins:b+"^2",type:"confirm"},
      {label:b+"^2-b^2=("+b+"+b)("+b+"-b)",ins:b+"^2-b^2=("+b+"+b)("+b+"-b)",type:"identity"},
      {label:b+"^2+2"+b+"b+b^2=("+b+"+b)^2",ins:b+"^2+2"+b+"b+b^2=("+b+"+b)^2",type:"identity"},
      {label:"("+b+"+a)("+b+"+b)",ins:"("+b+"+a)("+b+"+b)",type:"shortcut"},
    ]};}
  if(/[a-zA-Z]\^3/.test(norm)){return {chips:[
    {label:"a^3+b^3=(a+b)(a^2-ab+b^2)",ins:"a^3+b^3=(a+b)(a^2-ab+b^2)",type:"identity"},
    {label:"a^3-b^3=(a-b)(a^2+ab+b^2)",ins:"a^3-b^3=(a-b)(a^2+ab+b^2)",type:"identity"},
  ]};}
  if(/\\sqrt/.test(mathToLatex(norm))){return {chips:[
    {label:"sqrt confirmed",ins:"sqrt()",type:"confirm"},
    {label:"sqrt(a^2)=a",ins:"sqrt(a^2)=a",type:"identity"},
  ]};}
  if(/\//.test(norm)){return {chips:[
    {label:"Factor numerator",ins:"",type:"hint",action:"num"},
    {label:"Factor denominator",ins:"",type:"hint",action:"den"},
    {label:"Cancel common factor",ins:"",type:"hint",action:"cancel"},
  ]};}
  if(/\(/.test(norm)){return {chips:[
    {label:"(x+a)(x+b)",ins:"(x+a)(x+b)",type:"shortcut"},
    {label:"(x+a)(x-a)",ins:"(x+a)(x-a)",type:"shortcut"},
  ]};}
  return null;
}
var MATH_HINTS={split:"Find two numbers: product=axc, sum=b.",num:"Factor numerator first.",den:"Factor denominator first.",cancel:"Cancel common factors.",hcf:"HCF: ab+ac=a(b+c)"};
var MATH_DEFAULTS=[
  {label:"x^2",ins:"x^2",type:"shortcut"},{label:"x^3",ins:"x^3",type:"shortcut"},
  {label:"(a+b)^2",ins:"(a+b)^2",type:"shortcut"},{label:"(a-b)^2",ins:"(a-b)^2",type:"shortcut"},
  {label:"a^2-b^2",ins:"a^2-b^2",type:"shortcut"},{label:"(x+a)(x+b)",ins:"(x+a)(x+b)",type:"shortcut"},
  {label:"sqrt()",ins:"sqrt()",type:"shortcut"},{label:"cbrt()",ins:"cbrt()",type:"shortcut"},
  {label:"Take HCF out",ins:"",type:"hint",action:"hcf"},
];
function buildSuggChips(list){
  var el=G("suggChips");if(!el)return;
  var ra=G("rawAnswer");
  el.innerHTML="";
  list.forEach(function(c){
    var btn=document.createElement("button");
    btn.className="schip "+(c.type||"shortcut");
    btn.textContent=c.label;btn.type="button";
    btn.addEventListener("click",function(){
      if(c.action&&MATH_HINTS[c.action]){showMathHint(MATH_HINTS[c.action]);return;}
      if(c.ins&&ra){var s=ra.selectionStart,e=ra.selectionEnd;ra.value=ra.value.slice(0,s)+c.ins+ra.value.slice(e);ra.selectionStart=ra.selectionEnd=s+c.ins.length;ra.focus();mathUpdate();}
    });
    el.appendChild(btn);
  });
}
function showMathHint(msg){
  var old=G("mathHintToast");if(old)old.remove();
  var t=document.createElement("div");t.id="mathHintToast";t.className="math-hint-toast";t.textContent=msg;
  var sc=G("suggChips");if(sc)sc.parentNode.insertBefore(t,sc.nextSibling);
  setTimeout(function(){t.remove();},4000);
}
function mathUpdate(){
  var ra=G("rawAnswer");if(!ra)return;
  var raw=ra.value;
  var res=mathNormalise(raw);
  var latex=mathToLatex(res.normalised);
  mathRender(latex);
  var result=raw.trim()?mathGetSuggs(raw,res.normalised):null;
  var chips=[];
  res.fixes.forEach(function(f){chips.push(f);});
  if(result)result.chips.forEach(function(c){chips.push(c);});
  else MATH_DEFAULTS.forEach(function(c){chips.push(c);});
  buildSuggChips(chips);
}
