"""patch_anim_story.py — replace text-only getAnimSVG in Story of Numbers."""
import os

PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                    'explain', 'class8', 'arithmetic', 'story-of-numbers.html')

# New animation function — uses shapes, panels, timelines, icons
NEW_ANIM = r'''function getAnimSVG(t){
  var B=svgBase;
  function pill(x,y,w,txt,bg,tc){return '<rect x="'+x+'" y="'+(y-14)+'" width="'+w+'" height="22" rx="8" fill="'+bg+'"/><text x="'+(x+w/2)+'" y="'+y+'" text-anchor="middle" font-family="Share Tech Mono" font-size="12" font-weight="bold" fill="'+(tc||'#fff')+'">'+txt+'</text>';}
  function lbl(x,y,txt,col){return '<text x="'+x+'" y="'+y+'" font-family="Nunito,sans-serif" font-size="12" font-weight="800" fill="'+(col||'#5a4a30')+'">'+txt+'</text>';}
  function clbl(x,y,txt,col){return '<text x="'+x+'" y="'+y+'" text-anchor="middle" font-family="Nunito,sans-serif" font-size="12" font-weight="800" fill="'+(col||'#5a4a30')+'">'+txt+'</text>';}
  function tally(x,y,n,col){var s='';for(var i=0;i<n;i++){if(i%5===4){s+='<line x1="'+(x+i*7-25)+'" y1="'+(y-14)+'" x2="'+(x+i*7)+'" y2="'+(y+4)+'" stroke="'+col+'" stroke-width="2.5"/>';}else{s+='<line x1="'+(x+i*7)+'" y1="'+(y-12)+'" x2="'+(x+i*7)+'" y2="'+(y+6)+'" stroke="'+col+'" stroke-width="2.5"/>';}}return s;}
  var m={
  "sn1":function(){return B()+
    '<g id="sn1s0" opacity="0">'+
      '<rect x="18" y="20" width="170" height="130" rx="10" fill="#f5e6c8" stroke="#c8922a" stroke-width="2"/>'+
      '<rect x="22" y="24" width="6" height="118" rx="3" fill="#c8922a" opacity=".4"/>'+
      clbl(103,38,'LEBOMBO BONE','#c8922a')+
      clbl(103,54,'South Africa','#5a4a30')+
      tally(34,80,29,'#5a4a30')+
      clbl(103,112,'~44,000 years old','#d4870a')+
      clbl(103,128,'29 notches','#5a4a30')+
    '</g>'+
    '<g id="sn1s1" opacity="0">'+
      '<rect x="212" y="20" width="170" height="130" rx="10" fill="#eef2eb" stroke="#7a8c6e" stroke-width="2"/>'+
      '<rect x="374" y="24" width="6" height="118" rx="3" fill="#7a8c6e" opacity=".4"/>'+
      clbl(297,38,'ISHANGO BONE','#7a8c6e')+
      clbl(297,54,'Congo, Africa','#5a4a30')+
      tally(224,80,29,'#5a4a30')+
      clbl(297,112,'20,000+ years old','#7a8c6e')+
      clbl(297,128,'Possible lunar calendar','#5a4a30')+
    '</g>'+
    '<g id="sn1s2" opacity="0">'+
      clbl(200,168,'Lebombo (44,000 yrs) is OLDER than Ishango (20,000 yrs)','#c8922a')+
    '</g>'+
    '<g id="sn1ans" opacity="0">'+svgAns('Lebombo Bone is OLDER')+'</g></svg>';},
  "sn2":function(){return B()+
    '<g id="sn2s0" opacity="0">'+
      '<rect x="18" y="14" width="180" height="148" rx="10" fill="#fff9f0" stroke="#d4870a" stroke-width="2"/>'+
      clbl(108,30,'OKSAPMIN','#d4870a')+clbl(108,46,'Papua New Guinea','#5a4a30')+
      '<circle cx="108" cy="78" r="20" fill="none" stroke="#c8922a" stroke-width="2"/>'+
      clbl(108,82,'head','#c8922a')+
      '<line x1="88" y1="98" x2="68" y2="118" stroke="#c8922a" stroke-width="2"/>'+
      '<line x1="128" y1="98" x2="148" y2="118" stroke="#c8922a" stroke-width="2"/>'+
      lbl(26,136,'1=thumb','#5a4a30')+lbl(26,152,'...27 body parts','#5a4a30')+
    '</g>'+
    '<g id="sn2s1" opacity="0">'+
      '<rect x="210" y="14" width="172" height="148" rx="10" fill="#f0f5f0" stroke="#7a8c6e" stroke-width="2"/>'+
      clbl(296,30,'GUMULGAL','#7a8c6e')+clbl(296,46,'Australia','#5a4a30')+
      pill(226,72,130,'urapon = 1','#d4870a')+
      pill(226,100,130,'ukasar = 2','#7a8c6e')+
      pill(226,128,130,'ukasar+ukasar = 4','#5a4a30')+
      clbl(296,156,'Base-2 additive','#7a8c6e')+
    '</g>'+
    '<g id="sn2s2" opacity="0">'+
      clbl(200,170,'Both: ADDITIVE counting, no place value','#b85c2a')+
    '</g>'+
    '<g id="sn2ans" opacity="0">'+svgAns('ukasar + ukasar = 4')+'</g></svg>';},
  "sn3":function(){
    /* Egyptian hieroglyphic panels */
    var syms=[{s:'|',v:'1',c:'#5a4a30'},{s:'∩',v:'10',c:'#d4870a'},{s:'@',v:'100',c:'#7a8c6e'},{s:'✿',v:'1000',c:'#c8922a'}];
    var s=B()+'<g id="sn3s0" opacity="0">'+clbl(200,16,'Egyptian Number System — Base 10 Additive','#5a4a30');
    syms.forEach(function(sym,i){s+='<rect x="'+(14+i*94)+'" y="24" width="86" height="80" rx="10" fill="'+sym.c+'" opacity=".12"/><rect x="'+(14+i*94)+'" y="24" width="86" height="80" rx="10" fill="none" stroke="'+sym.c+'" stroke-width="2"/><text x="'+(57+i*94)+'" y="72" text-anchor="middle" font-size="32" fill="'+sym.c+'" font-weight="900">'+sym.s+'</text><text x="'+(57+i*94)+'" y="92" text-anchor="middle" font-family="Share Tech Mono" font-size="12" fill="'+sym.c+'" font-weight="bold">= '+sym.v+'</text>';});
    s+='</g><g id="sn3s1" opacity="0">'+clbl(200,120,'Example: Write 1,342','#5a4a30')+'<text x="200" y="144" text-anchor="middle" font-family="Share Tech Mono" font-size="14" font-weight="bold" fill="#c8922a">✿ + @@@ + ∩∩∩∩ + ||</text>'+clbl(200,162,'1000 + 300 + 40 + 2','#5a4a30')+'</g><g id="sn3s2" opacity="0">'+clbl(200,174,'No zero! No place value! Symbols simply add up','#b85c2a')+'</g><g id="sn3ans" opacity="0">'+svgAns('Coil of rope = 100')+'</g></svg>';
    return s;},
  "sn4":function(){
    var syms=[{s:'I',v:'1'},{s:'V',v:'5'},{s:'X',v:'10'},{s:'L',v:'50'},{s:'C',v:'100'},{s:'D',v:'500'},{s:'M',v:'1000'}];
    var cols=['#5a4a30','#d4870a','#7a8c6e','#c8922a','#b85c2a','#6b4c2a','#2c5f2e'];
    var s=B()+'<g id="sn4s0" opacity="0">'+clbl(200,14,'Roman Numeral System — 7 Symbols','#5a4a30');
    syms.forEach(function(sym,i){s+='<rect x="'+(10+i*54)+'" y="20" width="48" height="52" rx="8" fill="'+cols[i]+'" opacity=".85"/><text x="'+(34+i*54)+'" y="50" text-anchor="middle" font-family="Share Tech Mono" font-size="20" font-weight="bold" fill="#fff">'+sym.s+'</text><text x="'+(34+i*54)+'" y="64" text-anchor="middle" font-family="Share Tech Mono" font-size="9" font-weight="bold" fill="#fff">'+sym.v+'</text>';});
    s+='</g><g id="sn4s1" opacity="0">'+clbl(200,92,'Additive: MCCXXII = 1000+200+20+2 = 1222','#5a4a30')+'<text x="200" y="112" text-anchor="middle" font-family="Share Tech Mono" font-size="12" fill="#c8922a" font-weight="bold">Subtractive: CM=900  XC=90  IX=9</text></g><g id="sn4s2" opacity="0">'+clbl(200,134,'NO zero. NOT positional. 2999 = MMCMXCIX (9 symbols!)','#b85c2a')+'</g><g id="sn4ans" opacity="0">'+svgAns('CCCII = 300+2 = 302')+'</g></svg>';
    return s;},
  "sn5":function(){return B()+
    '<g id="sn5s0" opacity="0">'+
      clbl(200,16,'Convert 1222 to Roman numerals','#5a4a30')+
      pill(18,40,80,'1000 = M','#5a4a30')+pill(106,40,80,'200 = CC','#d4870a')+pill(194,40,80,'20 = XX','#7a8c6e')+pill(282,40,80,'2 = II','#c8922a')+
      clbl(200,66,'M + CC + XX + II = MCCXXII','#c8922a')+
    '</g>'+
    '<g id="sn5s1" opacity="0">'+
      clbl(200,90,'Decode MMCMXCIX','#5a4a30')+
      pill(18,110,80,'MM=2000','#5a4a30')+pill(106,110,80,'CM=900','#d4870a')+pill(194,110,80,'XC=90','#7a8c6e')+pill(282,110,80,'IX=9','#c8922a')+
      clbl(200,132,'2000+900+90+9 = 2999','#c8922a')+
    '</g>'+
    '<g id="sn5s2" opacity="0">'+
      clbl(200,154,'Subtractive rule: smaller symbol BEFORE larger = subtract','#7a8c6e')+
    '</g>'+
    '<g id="sn5ans" opacity="0">'+svgAns('715 = DCCXV')+'</g></svg>';},
  "sn6":function(){return B()+
    '<g id="sn6s0" opacity="0">'+
      clbl(200,16,'Babylonian System — Base 60 (Sexagesimal)','#5a4a30')+
      '<rect x="18" y="24" width="170" height="110" rx="10" fill="#fff9f0" stroke="#c8922a" stroke-width="2"/>'+
      clbl(103,44,'Only 2 Symbols','#c8922a')+
      '<polygon points="34,62 46,74 34,86" fill="#c8922a"/><text x="66" y="80" font-family="Share Tech Mono" font-size="13" font-weight="bold" fill="#5a4a30">Y-shape = 1</text>'+
      '<line x1="34" y1="104" x2="60" y2="104" stroke="#7a8c6e" stroke-width="4"/><text x="74" y="108" font-family="Share Tech Mono" font-size="13" font-weight="bold" fill="#5a4a30">angle = 10</text>'+
    '</g>'+
    '<g id="sn6s1" opacity="0">'+
      '<rect x="210" y="24" width="172" height="110" rx="10" fill="#f0f5f0" stroke="#7a8c6e" stroke-width="2"/>'+
      clbl(296,44,'Landmark Numbers','#7a8c6e')+
      pill(224,66,130,'1 (ones)','#5a4a30')+
      pill(224,92,130,'60 (sixties)','#d4870a')+
      pill(224,118,130,'3600 (sixty-squareds)','#7a8c6e')+
    '</g>'+
    '<g id="sn6s2" opacity="0">'+
      clbl(200,150,'60 min/hr, 360 degrees = Babylonian legacy today!','#c8922a')+
      clbl(200,168,'Partial place-value but no zero (blank space = ambiguous)','#b85c2a')+
    '</g>'+
    '<g id="sn6ans" opacity="0">'+svgAns('Base 60 — sexagesimal')+'</g></svg>';},
  "sn7":function(){return B()+
    '<g id="sn7s0" opacity="0">'+
      clbl(200,16,'Mayan System — Base 20 — 3 Symbols Only','#5a4a30')+
      '<rect x="18" y="24" width="108" height="130" rx="10" fill="#fff9f0" stroke="#d4870a" stroke-width="2"/>'+
      '<circle cx="72" cy="52" r="8" fill="#d4870a"/>'+
      clbl(72,72,'dot = 1','#d4870a')+
      '<line x1="36" y1="92" x2="108" y2="92" stroke="#5a4a30" stroke-width="5" stroke-linecap="round"/>'+
      clbl(72,114,'bar = 5','#5a4a30')+
      '<ellipse cx="72" cy="138" rx="14" ry="9" fill="none" stroke="#7a8c6e" stroke-width="2.5"/>'+
      clbl(72,152,'shell = 0','#7a8c6e')+
    '</g>'+
    '<g id="sn7s1" opacity="0">'+
      '<rect x="140" y="24" width="240" height="130" rx="10" fill="#f0f5f0" stroke="#7a8c6e" stroke-width="2"/>'+
      clbl(260,44,'Written Vertically','#7a8c6e')+
      clbl(260,64,'Example: 8 = bar + 3 dots','#5a4a30')+
      '<line x1="200" y1="84" x2="320" y2="84" stroke="#5a4a30" stroke-width="4" stroke-linecap="round"/>'+
      '<circle cx="214" cy="100" r="6" fill="#d4870a"/>'+
      '<circle cx="236" cy="100" r="6" fill="#d4870a"/>'+
      '<circle cx="258" cy="100" r="6" fill="#d4870a"/>'+
      clbl(260,122,'5 + 3 = 8','#c8922a')+
    '</g>'+
    '<g id="sn7s2" opacity="0">'+
      clbl(200,165,'Mayans invented ZERO independently! True place-value system.','#7a8c6e')+
    '</g>'+
    '<g id="sn7ans" opacity="0">'+svgAns('3 symbols: dot=1, bar=5, shell=0')+'</g></svg>';},
  "sn8":function(){return B()+
    '<g id="sn8s0" opacity="0">'+
      clbl(200,16,'Chinese Rod Numerals — Base 10','#5a4a30')+
      '<rect x="18" y="24" width="170" height="130" rx="10" fill="#fff9f0" stroke="#c8922a" stroke-width="2"/>'+
      clbl(103,42,'Zong (vertical rods)','#c8922a')+
      '<line x1="44" y1="54" x2="44" y2="90" stroke="#c8922a" stroke-width="4" stroke-linecap="round"/>'+
      '<line x1="60" y1="54" x2="60" y2="90" stroke="#c8922a" stroke-width="4" stroke-linecap="round"/>'+
      '<line x1="76" y1="54" x2="76" y2="90" stroke="#c8922a" stroke-width="4" stroke-linecap="round"/>'+
      clbl(60,104,'= 3 (units)','#5a4a30')+
    '</g>'+
    '<g id="sn8s1" opacity="0">'+
      '<rect x="210" y="24" width="172" height="130" rx="10" fill="#f0f5f0" stroke="#7a8c6e" stroke-width="2"/>'+
      clbl(296,42,'Heng (horizontal rods)','#7a8c6e')+
      '<line x1="230" y1="62" x2="366" y2="62" stroke="#7a8c6e" stroke-width="4" stroke-linecap="round"/>'+
      '<line x1="230" y1="76" x2="366" y2="76" stroke="#7a8c6e" stroke-width="4" stroke-linecap="round"/>'+
      clbl(296,100,'= 2 (tens)','#5a4a30')+
      clbl(296,122,'Alternating per column','#7a8c6e')+
      clbl(296,140,'prevents confusion!','#c8922a')+
    '</g>'+
    '<g id="sn8s2" opacity="0">'+
      clbl(200,168,'Zong for odd positions, Heng for even positions — visual separator','#5a4a30')+
    '</g>'+
    '<g id="sn8ans" opacity="0">'+svgAns('Zong (vertical) and Heng (horizontal)')+'</g></svg>';},
  "sn9":function(){
    var bases=[{b:10,marks:[1,10,100,1000],col:'#d4870a'},{b:5,marks:[1,5,25,125],col:'#7a8c6e'},{b:2,marks:[1,2,4,8],col:'#c8922a'}];
    var s=B()+'<g id="sn9s0" opacity="0">'+clbl(200,16,'Concept of a BASE — Landmark Numbers','#5a4a30');
    bases.forEach(function(b,i){s+='<rect x="14" y="'+(24+i*46)+'" width="370" height="38" rx="8" fill="'+b.col+'" opacity=".1" stroke="'+b.col+'" stroke-width="1.5"/>'+'<text x="34" y="'+(47+i*46)+'" font-family="Share Tech Mono" font-size="11" font-weight="bold" fill="'+b.col+'">Base '+b.b+':</text>';b.marks.forEach(function(m,j){s+='<rect x="'+(92+j*72)+'" y="'+(28+i*46)+'" width="64" height="28" rx="6" fill="'+b.col+'" opacity=".2"/>'+clbl(124+j*72,47+i*46,''+m,b.col);});});
    s+='</g><g id="sn9s1" opacity="0">'+clbl(200,162,'Symbols needed = the base (Base-5 uses only 0,1,2,3,4)','#5a4a30')+'</g><g id="sn9s2" opacity="0">'+clbl(200,174,'Powers of the base = landmark numbers','#7a8c6e')+'</g><g id="sn9ans" opacity="0">'+svgAns('5^2 = 25 (third landmark in base-5)')+'</g></svg>';
    return s;},
  "sn10":function(){return B()+
    '<g id="sn10s0" opacity="0">'+
      clbl(200,16,'Base-5 Conversion — Division Method','#5a4a30')+
      clbl(200,34,'Divide by 5, read remainders BOTTOM to TOP','#7a8c6e')+
    '</g>'+
    '<g id="sn10s1" opacity="0">'+
      clbl(200,58,'Convert 25 to base-5','#5a4a30')+
      pill(18,78,120,'25 / 5 = 5  r 0','#5a4a30')+pill(152,78,120,'5 / 5 = 1  r 0','#d4870a')+pill(286,78,100,'1 / 5 = 0  r 1','#c8922a')+
      clbl(200,100,'Read remainders up: 1, 0, 0','#5a4a30')+
      pill(140,118,120,'25 = 100 in base-5','#7a8c6e')+
    '</g>'+
    '<g id="sn10s2" opacity="0">'+
      clbl(200,142,'Convert 137 to base-5','#5a4a30')+
      pill(18,160,110,'137/5=27 r2','#5a4a30')+pill(136,160,100,'27/5=5 r2','#d4870a')+pill(244,160,80,'5/5=1 r0','#7a8c6e')+pill(332,160,56,'r1','#c8922a')+
      clbl(200,178,'Read up: 1022 -- so 137 = 1022 in base-5','#c8922a')+
    '</g>'+
    '<g id="sn10ans" opacity="0">'+svgAns('50 = 200 in base-5')+'</g></svg>';},
  "sn11":function(){return B()+
    '<g id="sn11s0" opacity="0">'+
      clbl(200,16,'Binary (Base-2) — Only 0 and 1!','#5a4a30')+
      pill(18,38,100,'2^0 = 1','#5a4a30')+pill(126,38,100,'2^1 = 2','#d4870a')+pill(234,38,100,'2^2 = 4','#7a8c6e')+pill(342,38,46,'8...','#c8922a')+
      clbl(200,62,'Foundation of ALL modern computers','#b85c2a')+
    '</g>'+
    '<g id="sn11s1" opacity="0">'+
      clbl(200,86,'Convert 13 to binary','#5a4a30')+
      pill(18,106,120,'13/2=6 r1','#5a4a30')+pill(146,106,110,'6/2=3 r0','#d4870a')+pill(264,106,110,'3/2=1 r1','#7a8c6e')+
      pill(18,128,110,'1/2=0 r1','#c8922a')+
      clbl(200,150,'Read remainders up: 1, 1, 0, 1','#5a4a30')+
      pill(140,168,120,'13 = 1101 binary','#c8922a')+
    '</g>'+
    '<g id="sn11s2" opacity="0">'+
      clbl(200,174,'Check: 8+4+0+1 = 13 OK  Also: 25 = 11001 binary','#7a8c6e')+
    '</g>'+
    '<g id="sn11ans" opacity="0">'+svgAns('13 = 1101 in binary')+'</g></svg>';},
  "sn12":function(){
    var steps=[{y:30,txt:'3rd century BCE',sub:'Brahmi symbols for 1-9',col:'#5a4a30'},{y:74,txt:'3rd century CE',sub:'Bakshali: zero as dot (place holder)',col:'#d4870a'},{y:118,txt:'Yajurveda Samhita',sub:'Names from 1 up to 10^12 (pararddha)',col:'#7a8c6e'}];
    var s=B()+'<g id="sn12s0" opacity="0">'+clbl(200,16,'Evolution of Hindu Numeral System','#5a4a30');
    steps.forEach(function(st){s+='<circle cx="32" cy="'+(st.y+10)+'" r="8" fill="'+st.col+'"/>'+lbl(50,st.y+8,st.txt,st.col)+lbl(50,st.y+24,st.sub,'#5a4a30');if(st.y<100)s+='<line x1="32" y1="'+(st.y+20)+'" x2="32" y2="'+(st.y+42)+'" stroke="'+st.col+'" stroke-width="2" stroke-dasharray="4,2"/>';});
    s+='</g><g id="sn12s1" opacity="0"><rect x="18" y="128" width="364" height="40" rx="8" fill="#d4870a" opacity=".15" stroke="#d4870a" stroke-width="2"/>'+clbl(200,144,'Bakshali Manuscript: zero as placeholder','#d4870a')+clbl(200,162,'Place value + zero = COMPLETE number system','#c8922a')+'</g><g id="sn12s2" opacity="0">'+clbl(200,174,'Brahmi evolved into modern 0-9 over centuries','#7a8c6e')+'</g><g id="sn12ans" opacity="0">'+svgAns('Bakshali Manuscript')+'</g></svg>';
    return s;},
  "sn13":function(){return B()+
    '<g id="sn13s0" opacity="0">'+
      '<rect x="18" y="14" width="364" height="60" rx="10" fill="#c8922a" opacity=".12" stroke="#c8922a" stroke-width="2"/>'+
      clbl(200,36,'BRAHMAGUPTA — 628 CE','#c8922a')+
      clbl(200,56,'Brahmasphuta-siddhanta','#5a4a30')+
    '</g>'+
    '<g id="sn13s1" opacity="0">'+
      pill(18,96,174,'ZERO as a NUMBER','#d4870a')+
      pill(208,96,174,'Negative numbers','#7a8c6e')+
      clbl(200,116,'n - n = 0 (first formal definition!)','#5a4a30')+
      clbl(200,134,'(-) x (-) = (+)  still true today!','#c8922a')+
    '</g>'+
    '<g id="sn13s2" opacity="0">'+
      clbl(200,158,'Revolutionary! Changed mathematics forever','#b85c2a')+
      clbl(200,174,'India to Arab world to Europe — journey begins','#7a8c6e')+
    '</g>'+
    '<g id="sn13ans" opacity="0">'+svgAns('Brahmagupta (628 CE)')+'</g></svg>';},
  "sn14":function(){
    /* Geographic flow diagram */
    return B()+
    '<g id="sn14s0" opacity="0">'+
      pill(14,34,110,'INDIA','#d4870a')+
      '<text x="134" y="38" font-family="Nunito" font-size="18" fill="#5a4a30">--></text>'+
      pill(164,34,120,'ARAB WORLD','#7a8c6e')+
      '<text x="294" y="38" font-family="Nunito" font-size="18" fill="#5a4a30">--></text>'+
      pill(328,34,60,'EUROPE','#c8922a')+
      clbl(74,58,'Brahmagupta 628 CE','#d4870a')+
      clbl(224,58,'Al-Khwarizmi ~820 CE','#7a8c6e')+
      clbl(358,58,'Fibonacci 1202 CE','#c8922a')+
    '</g>'+
    '<g id="sn14s1" opacity="0">'+
      pill(14,84,174,'Al-Khwarizmi','#7a8c6e')+
      pill(196,84,186,'On Hindu Numerals','#5a4a30')+
      clbl(200,106,'"algorithm" comes from Al-Khwarizmi\'s name!','#c8922a')+
      pill(14,122,174,'Fibonacci','#c8922a')+
      pill(196,122,186,'Liber Abaci 1202 CE','#5a4a30')+
      clbl(200,144,'Introduced Hindu-Arabic numerals to Europe','#7a8c6e')+
    '</g>'+
    '<g id="sn14s2" opacity="0">'+
      clbl(200,162,'Arabs called them Al Hind (from India)','#5a4a30')+
      clbl(200,178,'Correct name: Hindu-Arabic Numerals','#c8922a')+
    '</g>'+
    '<g id="sn14ans" opacity="0">'+svgAns('Liber Abaci (Fibonacci, 1202 CE)')+'</g></svg>';},
  "sn15":function(){
    var rows=[
      {sys:'Egyptian',zero:'NO','pos':'NO',syms:'Many',col:'#b85c2a'},
      {sys:'Roman',  zero:'NO','pos':'NO',syms:'7',    col:'#c8922a'},
      {sys:'Hindu-Arabic',zero:'YES','pos':'YES',syms:'10',col:'#7a8c6e'}
    ];
    var s=B()+'<g id="sn15s0" opacity="0">'+clbl(200,16,'Comparison of Number Systems','#5a4a30');
    s+='<rect x="14" y="24" width="372" height="22" rx="6" fill="#5a4a30" opacity=".12"/>'+lbl(18,40,'System',  '#5a4a30')+lbl(120,40,'Zero?','#5a4a30')+lbl(196,40,'Place-Value?','#5a4a30')+lbl(310,40,'Symbols','#5a4a30');
    rows.forEach(function(r,i){s+='<rect x="14" y="'+(48+i*36)+'" width="372" height="30" rx="6" fill="'+r.col+'" opacity=".1" stroke="'+r.col+'" stroke-width="1.5"/>'+lbl(18,68+i*36,r.sys,r.col)+clbl(148,68+i*36,r.zero,r.zero==='YES'?'#2e8b57':'#b85c2a')+clbl(248,68+i*36,r.pos,r.pos==='YES'?'#2e8b57':'#b85c2a')+clbl(352,68+i*36,r.syms,r.col);});
    s+='</g><g id="sn15s1" opacity="0">'+clbl(200,162,'Hindu-Arabic wins: zero + place-value + fewest symbols','#7a8c6e')+'</g><g id="sn15s2" opacity="0">'+clbl(200,174,'10 symbols can express any number in the universe!','#c8922a')+'</g><g id="sn15ans" opacity="0">'+svgAns('Hindu-Arabic: 10 symbols (0-9)')+'</g></svg>';
    return s;}
  };
  return m[t]?m[t]():'<svg viewBox="0 0 400 190"><text x="200" y="95" text-anchor="middle" font-family="Nunito" font-size="14" fill="#5a4a30">Loading...</text></svg>';
}'''

with open(PATH, 'r', encoding='utf-8') as f:
    content = f.read()

start = content.find('function getAnimSVG(t){')
end_marker = "return m[t]?m[t]()"
end = content.find(end_marker, start)
end = content.find('}\n', end) + 2

content = content[:start] + NEW_ANIM + '\n' + content[end:]

with open(PATH, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'DONE: {PATH}')
