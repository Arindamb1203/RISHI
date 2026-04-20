/**
 * RishiDiagram.js  v1.0
 * ─────────────────────────────────────────────────────────────
 * SVG diagram renderer for RISHI exam pages.
 * Reads a `diagram` object from the question JSON and draws
 * a clean, labelled SVG figure inside any container element.
 *
 * Usage:
 *   RishiDiagram.render(containerElement, question.diagram);
 *
 * Diagram JSON format:
 *   { "type": "rhombus", "params": { ... } }
 *
 * ─────────────────────────────────────────────────────────────
 * SUPPORTED TYPES
 *   2D shapes:  parallelogram, rhombus, rectangle, square,
 *               trapezium, triangle, kite, regular_polygon,
 *               quadrilateral, circle, concentric_circles
 *   3D shapes:  cuboid_3d, cube_3d, cylinder_3d, cone_3d,
 *               unit_cubes
 *   Graphs:     coordinate_plane, line_graph
 * ─────────────────────────────────────────────────────────────
 */

var RishiDiagram = (function () {
  'use strict';

  /* ── PALETTE (RISHI dark theme) ────────────────────────── */
  var C = {
    stroke:      '#ffd700',          /* gold — primary shape edges  */
    fill:        'rgba(255,215,0,.05)',
    fillDark:    'rgba(255,215,0,.10)',
    fillFace:    'rgba(255,215,0,.08)',/* 3D face fill               */
    fillSide:    'rgba(255,215,0,.04)',
    dashed:      'rgba(255,255,255,.35)',/* diagonals / construction  */
    label:       '#ffffff',           /* vertex labels               */
    measure:     '#ffd700',           /* measurement text            */
    rightAngle:  '#2ecc71',           /* right angle marker          */
    axis:        'rgba(255,255,255,.7)',
    grid:        'rgba(255,255,255,.08)',
    point:       '#ffd700',
    lineGraph:   '#22d3ee',           /* line-graph line             */
    highlight:   'rgba(99,102,241,.6)',
    tickMark:    '#a78bfa',           /* equal-side tick marks       */
    height:      '#e74c3c',           /* height lines                */
    parallel:    '#a78bfa',           /* parallel-mark arrows        */
    shadow:      'rgba(0,0,0,.6)',
    bg:          'transparent'
  };

  var VW = 400, VH = 270; /* default viewBox */
  var CX = 200, CY = 135; /* default centre */
  var NS = 'http://www.w3.org/2000/svg';

  /* ── SVG ELEMENT FACTORY ───────────────────────────────── */
  function el(tag, attrs, txt) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (txt !== undefined) e.textContent = txt;
    return e;
  }

  function makeSVG(w, h) {
    return el('svg', {
      viewBox: '0 0 ' + w + ' ' + h,
      width:  '100%',
      style:  'max-height:260px;display:block;margin:0 auto;'
    });
  }

  /* ── HELPERS ───────────────────────────────────────────── */
  function rad(deg) { return deg * Math.PI / 180; }

  function ptOnCircle(cx, cy, r, angleDeg) {
    return { x: cx + r * Math.cos(rad(angleDeg)), y: cy + r * Math.sin(rad(angleDeg)) };
  }

  function midpt(p1, p2) { return { x: (p1.x+p2.x)/2, y: (p1.y+p2.y)/2 }; }

  function dist(p1, p2) { return Math.sqrt(Math.pow(p2.x-p1.x,2)+Math.pow(p2.y-p1.y,2)); }

  function norm(p1, p2) {
    var d = dist(p1, p2) || 1;
    return { x: (p2.x-p1.x)/d, y: (p2.y-p1.y)/d };
  }

  /* Push a point outward from the polygon centre */
  function pushOut(pt, cx, cy, amt) {
    var dx = pt.x - cx, dy = pt.y - cy;
    var d  = Math.sqrt(dx*dx + dy*dy) || 1;
    return { x: pt.x + (dx/d)*amt, y: pt.y + (dy/d)*amt };
  }

  /* ── DRAWING PRIMITIVES ────────────────────────────────── */

  /* Polygon */
  function polygon(pts, fill, stroke, sw) {
    sw = sw || 2;
    var d = pts.map(function(p){ return p.x+','+p.y; }).join(' ');
    return el('polygon', { points:d, fill:fill||C.fill, stroke:stroke||C.stroke, 'stroke-width':sw, 'stroke-linejoin':'round' });
  }

  /* Polyline */
  function polyline(pts, stroke, sw, dash) {
    var d = pts.map(function(p){ return p.x+','+p.y; }).join(' ');
    var a = { points:d, fill:'none', stroke:stroke||C.stroke, 'stroke-width':sw||2, 'stroke-linecap':'round' };
    if (dash) a['stroke-dasharray'] = '6,4';
    return el('polyline', a);
  }

  /* Line */
  function line(p1, p2, stroke, sw, dash) {
    var a = { x1:p1.x, y1:p1.y, x2:p2.x, y2:p2.y, stroke:stroke||C.stroke, 'stroke-width':sw||1.5, 'stroke-linecap':'round' };
    if (dash) a['stroke-dasharray'] = '6,4';
    return el('line', a);
  }

  /* Right-angle marker at vertex V, along directions to P1 and P2 */
  function rightAngleMark(V, P1, P2, sz) {
    sz = sz || 10;
    var n1 = norm(V, P1), n2 = norm(V, P2);
    var q1 = { x: V.x + n1.x*sz, y: V.y + n1.y*sz };
    var q2 = { x: V.x + n2.x*sz, y: V.y + n2.y*sz };
    var q3 = { x: V.x + n1.x*sz + n2.x*sz, y: V.y + n1.y*sz + n2.y*sz };
    var g = el('g');
    g.appendChild(polyline([q1, q3, q2], C.rightAngle, 1.5));
    return g;
  }

  /* Tick marks on a line segment (equal-side indicator) */
  function tickMark(p1, p2, n) {
    n = n || 1;
    var mid = midpt(p1, p2);
    var nv  = norm(p1, p2);
    var perp = { x: -nv.y, y: nv.x };
    var g = el('g');
    var spacing = 5;
    for (var i = 0; i < n; i++) {
      var offset = (i - (n-1)/2) * spacing;
      var cx = mid.x + nv.x * offset;
      var cy = mid.y + nv.y * offset;
      g.appendChild(line(
        { x: cx - perp.x*6, y: cy - perp.y*6 },
        { x: cx + perp.x*6, y: cy + perp.y*6 },
        C.tickMark, 1.5
      ));
    }
    return g;
  }

  /* Vertex dot */
  function dot(p, r, fill) {
    return el('circle', { cx:p.x, cy:p.y, r:r||4, fill:fill||C.point, stroke:'rgba(0,0,0,.4)', 'stroke-width':1 });
  }

  /* Label text — white with dark shadow for readability */
  function label(p, txt, opts) {
    opts = opts || {};
    var g = el('g');
    /* Shadow */
    g.appendChild(el('text', {
      x: p.x, y: p.y,
      'text-anchor': opts.anchor || 'middle',
      'dominant-baseline': 'central',
      'font-family': 'Nunito, sans-serif',
      'font-size': opts.size || 14,
      'font-weight': opts.weight || '800',
      fill: C.shadow,
      'stroke': C.shadow,
      'stroke-width': 3,
      'stroke-linejoin': 'round'
    }, txt));
    /* Foreground */
    g.appendChild(el('text', {
      x: p.x, y: p.y,
      'text-anchor': opts.anchor || 'middle',
      'dominant-baseline': 'central',
      'font-family': 'Nunito, sans-serif',
      'font-size': opts.size || 14,
      'font-weight': opts.weight || '800',
      fill: opts.color || C.label
    }, txt));
    return g;
  }

  /* Measurement along edge midpoint */
  function measureLabel(p1, p2, txt, offset) {
    var mid = midpt(p1, p2);
    var nv  = norm(p1, p2);
    var perp = { x: -nv.y * (offset||18), y: nv.x * (offset||18) };
    return label({ x: mid.x + perp.x, y: mid.y + perp.y }, txt, { color: C.measure, size: 12 });
  }

  /* Parallel-side arrows (chevron marks) */
  function parallelMark(p1, p2) {
    var mid = midpt(p1, p2);
    var nv  = norm(p1, p2);
    var perp = { x: -nv.y, y: nv.x };
    var sz = 6;
    var tip = { x: mid.x + nv.x*sz, y: mid.y + nv.y*sz };
    var tl  = { x: mid.x - nv.x*sz*0.5 - perp.x*sz*0.6, y: mid.y - nv.y*sz*0.5 - perp.y*sz*0.6 };
    var tr  = { x: mid.x - nv.x*sz*0.5 + perp.x*sz*0.6, y: mid.y - nv.y*sz*0.5 + perp.y*sz*0.6 };
    return polyline([tl, tip, tr], C.parallel, 1.8);
  }

  /* Arc angle marker at vertex V, from direction P1 to P2 */
  function angleMark(V, P1, P2, r, labelTxt) {
    r = r || 22;
    var a1 = Math.atan2(P1.y - V.y, P1.x - V.x);
    var a2 = Math.atan2(P2.y - V.y, P2.x - V.x);
    var sx = V.x + r * Math.cos(a1), sy = V.y + r * Math.sin(a1);
    var ex = V.x + r * Math.cos(a2), ey = V.y + r * Math.sin(a2);
    /* Determine large-arc */
    var da = a2 - a1;
    while (da < 0) da += 2*Math.PI;
    while (da > 2*Math.PI) da -= 2*Math.PI;
    var large = da > Math.PI ? 1 : 0;
    var sweep = 1;
    var g = el('g');
    g.appendChild(el('path', {
      d: 'M '+sx+' '+sy+' A '+r+' '+r+' 0 '+large+' '+sweep+' '+ex+' '+ey,
      fill: 'none', stroke: C.measure, 'stroke-width': 1.5
    }));
    if (labelTxt) {
      var midAngle = a1 + da * 0.5;
      var lp = { x: V.x + (r+12)*Math.cos(midAngle), y: V.y + (r+12)*Math.sin(midAngle) };
      g.appendChild(label(lp, labelTxt, { color: C.measure, size: 11 }));
    }
    return g;
  }

  /* Axis arrow */
  function axisArrow(p1, p2) {
    var n = norm(p1, p2);
    var perp = { x:-n.y, y:n.x };
    var tip = p2;
    var b1 = { x: tip.x - n.x*10 + perp.x*5, y: tip.y - n.y*10 + perp.y*5 };
    var b2 = { x: tip.x - n.x*10 - perp.x*5, y: tip.y - n.y*10 - perp.y*5 };
    var g = el('g');
    g.appendChild(line(p1, p2, C.axis, 2));
    g.appendChild(el('polygon', { points: tip.x+','+tip.y+' '+b1.x+','+b1.y+' '+b2.x+','+b2.y, fill:C.axis }));
    return g;
  }

  /* ══════════════════════════════════════════════════════════
     SHAPE RENDERERS
  ══════════════════════════════════════════════════════════ */

  /* ── PARALLELOGRAM ──────────────────────────────────────── */
  function drawParallelogram(svg, p) {
    var w = 160, h = 80;
    var slant = p.slant_x !== undefined ? p.slant_x : 40;
    var A = { x: CX - w/2,        y: CY + h/2 };
    var B = { x: CX + w/2,        y: CY + h/2 };
    var C_ = { x: CX + w/2 + slant, y: CY - h/2 };
    var D = { x: CX - w/2 + slant, y: CY - h/2 };
    var pts = [A, B, C_, D];
    var lbs = p.labels || {};

    svg.appendChild(polygon(pts));

    /* Optional height line */
    if (p.show_height) {
      var hFoot = { x: A.x + slant, y: A.y };
      var hTop  = D;
      svg.appendChild(line(hTop, hFoot, C.height, 1.5, true));
      svg.appendChild(rightAngleMark(hFoot, A, hTop));
      if (p.measurements && p.measurements.h)
        svg.appendChild(measureLabel(hTop, hFoot, p.measurements.h, -18));
    }

    /* Parallel marks */
    if (p.show_parallel !== false) {
      svg.appendChild(parallelMark(A, B));
      svg.appendChild(parallelMark(D, C_));
      svg.appendChild(parallelMark(B, C_));
      svg.appendChild(parallelMark(A, D));
    }

    /* Measurements */
    var m = p.measurements || {};
    if (m.AB) svg.appendChild(measureLabel(A, B, m.AB, 18));
    if (m.BC) svg.appendChild(measureLabel(B, C_, m.BC, 18));
    if (m.CD) svg.appendChild(measureLabel(C_, D, m.CD, -18));
    if (m.AD) svg.appendChild(measureLabel(A, D, m.AD, 18));

    /* Diagonals */
    if (p.show_diagonals) {
      svg.appendChild(line(A, C_, C.dashed, 1.5, true));
      svg.appendChild(line(B, D, C.dashed, 1.5, true));
      /* Center */
      var ctr = midpt(A, C_);
      svg.appendChild(dot(ctr, 3, C.dashed));
      if (p.center_label)
        svg.appendChild(label({ x: ctr.x+12, y: ctr.y }, p.center_label, { size:12 }));
    }

    /* Vertex dots and labels */
    [{ pt:A, nm:'A' }, { pt:B, nm:'B' }, { pt:C_, nm:'C' }, { pt:D, nm:'D' }].forEach(function(v) {
      svg.appendChild(dot(v.pt));
      if (lbs[v.nm]) {
        var lp = pushOut(v.pt, CX, CY, 20);
        svg.appendChild(label(lp, lbs[v.nm]));
      }
    });
  }

  /* ── RHOMBUS ─────────────────────────────────────────────── */
  function drawRhombus(svg, p) {
    var d1 = 160, d2 = 110; /* horizontal, vertical diagonals */
    /* Vertices: A=top, B=right, C=bottom, D=left */
    var A = { x: CX,       y: CY - d2/2 };
    var B = { x: CX + d1/2, y: CY };
    var C_ = { x: CX,       y: CY + d2/2 };
    var D = { x: CX - d1/2, y: CY };
    var O = { x: CX, y: CY };
    var lbs = p.labels || {};

    svg.appendChild(polygon([A, B, C_, D]));

    /* Diagonals — always shown for rhombus */
    svg.appendChild(line(A, C_, C.dashed, 1.5, true));
    svg.appendChild(line(B, D, C.dashed, 1.5, true));
    svg.appendChild(dot(O, 3, C.dashed));

    /* Right angle at center */
    if (p.right_angle_center !== false) {
      svg.appendChild(rightAngleMark(O, B, A, 9));
    }

    /* Diagonal measurements */
    var m = p.measurements || {};
    if (m.d1 || m.AC) svg.appendChild(measureLabel(A, C_, m.d1||m.AC, -20));
    if (m.d2 || m.BD) svg.appendChild(measureLabel(B, D, m.d2||m.BD, 18));
    if (m.side) {
      svg.appendChild(measureLabel(A, B, m.side, 18));
    }

    /* Half-diagonal labels (AO, OB etc.) */
    var hm = p.half_measurements || {};
    if (hm.AO) svg.appendChild(label(midpt(A, O), hm.AO, { color:C.measure, size:11 }));
    if (hm.OC) svg.appendChild(label(midpt(O, C_), hm.OC, { color:C.measure, size:11 }));
    if (hm.OB) svg.appendChild(label({ x: midpt(O,B).x, y: midpt(O,B).y-10 }, hm.OB, { color:C.measure, size:11 }));
    if (hm.OD) svg.appendChild(label({ x: midpt(O,D).x, y: midpt(O,D).y-10 }, hm.OD, { color:C.measure, size:11 }));

    [{ pt:A, nm:'A' }, { pt:B, nm:'B' }, { pt:C_, nm:'C' }, { pt:D, nm:'D' }].forEach(function(v) {
      svg.appendChild(dot(v.pt));
      if (lbs[v.nm]) {
        var lp = pushOut(v.pt, CX, CY, 20);
        svg.appendChild(label(lp, lbs[v.nm]));
      }
    });
    if (p.center_label) svg.appendChild(label({ x:O.x+14, y:O.y }, p.center_label, { size:13 }));
  }

  /* ── RECTANGLE ───────────────────────────────────────────── */
  function drawRectangle(svg, p) {
    var ratio = p.ratio || 1.6;
    var h = 100, w = Math.round(h * ratio);
    if (w > 200) { w = 200; h = Math.round(w/ratio); }
    var A = { x: CX - w/2, y: CY + h/2 };
    var B = { x: CX + w/2, y: CY + h/2 };
    var C_ = { x: CX + w/2, y: CY - h/2 };
    var D = { x: CX - w/2, y: CY - h/2 };
    var lbs = p.labels || {};

    svg.appendChild(polygon([A, B, C_, D]));

    /* Right angle markers at all 4 corners */
    svg.appendChild(rightAngleMark(A, B, D));
    svg.appendChild(rightAngleMark(B, C_, A));
    svg.appendChild(rightAngleMark(C_, D, B));
    svg.appendChild(rightAngleMark(D, A, C_));

    /* Diagonal */
    var diag = p.show_diagonal;
    if (diag === 'AC' || diag === true) {
      svg.appendChild(line(A, C_, C.dashed, 1.5, true));
      if (p.measurements && p.measurements.diagonal)
        svg.appendChild(measureLabel(A, C_, p.measurements.diagonal, 14));
    }
    if (diag === 'BD') {
      svg.appendChild(line(B, D, C.dashed, 1.5, true));
      if (p.measurements && p.measurements.diagonal)
        svg.appendChild(measureLabel(B, D, p.measurements.diagonal, 14));
    }

    /* Both diagonals + intersection */
    if (p.show_diagonals) {
      svg.appendChild(line(A, C_, C.dashed, 1.5, true));
      svg.appendChild(line(B, D, C.dashed, 1.5, true));
      var O = midpt(A, C_);
      svg.appendChild(dot(O, 3));
      if (p.center_label) svg.appendChild(label({ x:O.x+12, y:O.y }, p.center_label));
    }

    /* Measurements */
    var m = p.measurements || {};
    if (m.AB || m.length) svg.appendChild(measureLabel(A, B, m.AB||m.length, 18));
    if (m.BC || m.width) svg.appendChild(measureLabel(B, C_, m.BC||m.width, 18));

    /* Equal-side ticks */
    svg.appendChild(tickMark(A, B, 1));
    svg.appendChild(tickMark(C_, D, 1));
    svg.appendChild(tickMark(B, C_, 2));
    svg.appendChild(tickMark(D, A, 2));

    [{ pt:A, nm:'A' }, { pt:B, nm:'B' }, { pt:C_, nm:'C' }, { pt:D, nm:'D' }].forEach(function(v) {
      svg.appendChild(dot(v.pt));
      if (lbs[v.nm]) {
        var lp = pushOut(v.pt, CX, CY, 20);
        svg.appendChild(label(lp, lbs[v.nm]));
      }
    });
  }

  /* ── SQUARE ──────────────────────────────────────────────── */
  function drawSquare(svg, p) {
    var s = 110;
    var A = { x: CX - s/2, y: CY + s/2 };
    var B = { x: CX + s/2, y: CY + s/2 };
    var C_ = { x: CX + s/2, y: CY - s/2 };
    var D = { x: CX - s/2, y: CY - s/2 };
    var lbs = p.labels || {};

    svg.appendChild(polygon([A, B, C_, D]));
    svg.appendChild(rightAngleMark(A, B, D));
    svg.appendChild(rightAngleMark(B, C_, A));
    svg.appendChild(rightAngleMark(C_, D, B));
    svg.appendChild(rightAngleMark(D, A, C_));

    /* All sides equal — single tick */
    ['AB','BC','CD','DA'].forEach(function(e, i) {
      var pairs = [[A,B],[B,C_],[C_,D],[D,A]];
      svg.appendChild(tickMark(pairs[i][0], pairs[i][1], 1));
    });

    if (p.show_diagonals || p.show_diagonal) {
      svg.appendChild(line(A, C_, C.dashed, 1.5, true));
      svg.appendChild(line(B, D, C.dashed, 1.5, true));
      var O = midpt(A, C_);
      svg.appendChild(dot(O, 3));
      svg.appendChild(rightAngleMark(O, B, A, 8));
      if (p.center_label) svg.appendChild(label({ x:O.x+12, y:O.y }, p.center_label));
    }

    var m = p.measurements || {};
    if (m.side || m.AB) svg.appendChild(measureLabel(A, B, m.side||m.AB, 18));
    if (m.diagonal) svg.appendChild(measureLabel(A, C_, m.diagonal, 14));

    [{ pt:A, nm:'A' }, { pt:B, nm:'B' }, { pt:C_, nm:'C' }, { pt:D, nm:'D' }].forEach(function(v) {
      svg.appendChild(dot(v.pt));
      if (lbs[v.nm]) {
        var lp = pushOut(v.pt, CX, CY, 20);
        svg.appendChild(label(lp, lbs[v.nm]));
      }
    });
  }

  /* ── TRAPEZIUM ───────────────────────────────────────────── */
  function drawTrapezium(svg, p) {
    var botW = 180, h = 90;
    var topRatio = p.top_ratio !== undefined ? p.top_ratio : 0.55;
    var topW = Math.round(botW * topRatio);
    var rightSlant = p.right_angle_at === 'B' || p.right_angle_at === 'A' ? 0 : 20;

    /* AB at bottom (longer), DC at top */
    var A = { x: CX - botW/2,          y: CY + h/2 };
    var B = { x: CX + botW/2,          y: CY + h/2 };
    var C_ = { x: CX + topW/2 + rightSlant, y: CY - h/2 };
    var D = { x: CX - topW/2 + rightSlant, y: CY - h/2 };
    var lbs = p.labels || {};

    svg.appendChild(polygon([A, B, C_, D]));

    /* Parallel marks */
    svg.appendChild(parallelMark(A, B));
    svg.appendChild(parallelMark(D, C_));

    /* Right angle at A */
    if (p.right_angle_at === 'A') {
      A = { x: CX - botW/2, y: CY + h/2 };
      D = { x: CX - botW/2, y: CY - h/2 };
      svg.appendChild(rightAngleMark(A, B, D));
      svg.appendChild(rightAngleMark(D, A, C_));
    }

    /* Height */
    if (p.show_height !== false) {
      var hFoot = { x: D.x, y: A.y };
      svg.appendChild(line(D, hFoot, C.height, 1.5, true));
      svg.appendChild(rightAngleMark(hFoot, A, D, 8));
    }

    var m = p.measurements || {};
    if (m.AB) svg.appendChild(measureLabel(A, B, m.AB, 20));
    if (m.DC || m.CD) svg.appendChild(measureLabel(D, C_, m.DC||m.CD, -20));
    if (m.h || m.height) {
      var hFoot2 = { x: D.x, y: A.y };
      svg.appendChild(measureLabel(D, hFoot2, m.h||m.height, -18));
    }
    if (m.BC) svg.appendChild(measureLabel(B, C_, m.BC, 18));
    if (m.AD) svg.appendChild(measureLabel(A, D, m.AD, -18));

    [{ pt:A, nm:'A' }, { pt:B, nm:'B' }, { pt:C_, nm:'C' }, { pt:D, nm:'D' }].forEach(function(v) {
      svg.appendChild(dot(v.pt));
      if (lbs[v.nm]) {
        var lp = pushOut(v.pt, CX, CY, 20);
        svg.appendChild(label(lp, lbs[v.nm]));
      }
    });
  }

  /* ── TRIANGLE ────────────────────────────────────────────── */
  function drawTriangle(svg, p) {
    var variant = p.variant || 'scalene';
    var A, B, C_;
    if (variant === 'right') {
      /* Right angle at B */
      B  = { x: CX - 70, y: CY + 60 };
      C_ = { x: CX + 70, y: CY + 60 };
      A  = { x: CX - 70, y: CY - 60 };
    } else if (variant === 'equilateral') {
      var r = 90;
      A  = ptOnCircle(CX, CY, r, -90);
      B  = ptOnCircle(CX, CY, r, 150);
      C_ = ptOnCircle(CX, CY, r, 30);
    } else if (variant === 'isosceles') {
      A  = { x: CX,      y: CY - 80 };
      B  = { x: CX - 75, y: CY + 60 };
      C_ = { x: CX + 75, y: CY + 60 };
    } else {
      A  = { x: CX - 60, y: CY - 60 };
      B  = { x: CX - 80, y: CY + 60 };
      C_ = { x: CX + 80, y: CY + 60 };
    }

    /* Override with explicit coords */
    if (p.coords) {
      A  = p.coords.A || A;
      B  = p.coords.B || B;
      C_ = p.coords.C || C_;
    }

    var center = { x:(A.x+B.x+C_.x)/3, y:(A.y+B.y+C_.y)/3 };
    var lbs = p.labels || {};
    svg.appendChild(polygon([A, B, C_]));

    /* Right angle */
    var ra = p.right_at || (variant === 'right' ? 'B' : null);
    if (ra === 'A') svg.appendChild(rightAngleMark(A, B, C_));
    if (ra === 'B') svg.appendChild(rightAngleMark(B, A, C_));
    if (ra === 'C') svg.appendChild(rightAngleMark(C_, A, B));

    /* Height */
    if (p.show_height) {
      var foot = { x: C_.x, y: B.y }; /* foot on BC from A — simplified */
      svg.appendChild(line(A, foot, C.height, 1.5, true));
      if (p.measurements && p.measurements.h)
        svg.appendChild(measureLabel(A, foot, p.measurements.h, -16));
    }

    var m = p.measurements || {};
    if (m.AB) svg.appendChild(measureLabel(A, B, m.AB, -18));
    if (m.BC) svg.appendChild(measureLabel(B, C_, m.BC, 18));
    if (m.AC) svg.appendChild(measureLabel(A, C_, m.AC, 20));

    /* Equal side ticks for isosceles/equilateral */
    if (variant === 'isosceles') {
      svg.appendChild(tickMark(A, B, 1));
      svg.appendChild(tickMark(A, C_, 1));
    }
    if (variant === 'equilateral') {
      svg.appendChild(tickMark(A, B, 1));
      svg.appendChild(tickMark(B, C_, 1));
      svg.appendChild(tickMark(A, C_, 1));
    }

    [{ pt:A, nm:'A' }, { pt:B, nm:'B' }, { pt:C_, nm:'C' }].forEach(function(v) {
      svg.appendChild(dot(v.pt));
      if (lbs[v.nm]) {
        var lp = pushOut(v.pt, center.x, center.y, 20);
        svg.appendChild(label(lp, lbs[v.nm]));
      }
    });
  }

  /* ── KITE ────────────────────────────────────────────────── */
  function drawKite(svg, p) {
    var A = { x: CX,       y: CY - 100 };
    var B = { x: CX + 80,  y: CY };
    var C_ = { x: CX,       y: CY + 70 };
    var D = { x: CX - 80,  y: CY };
    var O = { x: CX, y: CY };
    var lbs = p.labels || {};
    svg.appendChild(polygon([A, B, C_, D]));
    /* Diagonals */
    svg.appendChild(line(A, C_, C.dashed, 1.5, true));
    svg.appendChild(line(B, D, C.dashed, 1.5, true));
    svg.appendChild(dot(O, 3));
    svg.appendChild(rightAngleMark(O, B, A, 9));
    /* Equal side ticks */
    svg.appendChild(tickMark(A, B, 1)); svg.appendChild(tickMark(A, D, 1));
    svg.appendChild(tickMark(C_, B, 2)); svg.appendChild(tickMark(C_, D, 2));
    var m = p.measurements || {};
    if (m.AB) svg.appendChild(measureLabel(A, B, m.AB, 18));
    [{ pt:A, nm:'A' }, { pt:B, nm:'B' }, { pt:C_, nm:'C' }, { pt:D, nm:'D' }].forEach(function(v) {
      svg.appendChild(dot(v.pt));
      if (lbs[v.nm]) svg.appendChild(label(pushOut(v.pt, CX, CY, 20), lbs[v.nm]));
    });
    if (p.axis_label) svg.appendChild(label({ x:CX+14, y:CY }, p.axis_label, {size:12}));
  }

  /* ── REGULAR POLYGON ─────────────────────────────────────── */
  function drawRegularPolygon(svg, p) {
    var n = p.sides || 6;
    var r = 100;
    var startAngle = -90; /* first vertex at top */
    var pts = [];
    for (var i = 0; i < n; i++) {
      pts.push(ptOnCircle(CX, CY, r, startAngle + i * 360/n));
    }
    svg.appendChild(polygon(pts));
    /* Vertex labels */
    var names = (p.labels) ? Object.values(p.labels) : 'ABCDEFGHIJKLMNOP'.split('').slice(0,n);
    if (!Array.isArray(names)) names = Object.values(names);
    pts.forEach(function(pt, i) {
      svg.appendChild(dot(pt));
      var lp = pushOut(pt, CX, CY, 20);
      svg.appendChild(label(lp, names[i] || ('V'+(i+1))));
    });
    /* Diagonals */
    if (p.show_diagonals) {
      for (var i = 0; i < n; i++) {
        for (var j = i+2; j < n; j++) {
          if (i === 0 && j === n-1) continue;
          svg.appendChild(line(pts[i], pts[j], C.dashed, 1, true));
        }
      }
    }
    /* Center */
    if (p.center_label) {
      svg.appendChild(dot({x:CX,y:CY}, 3));
      svg.appendChild(label({x:CX+12,y:CY}, p.center_label, {size:12}));
    }
    /* Side measurement */
    var m = p.measurements || {};
    if (m.side) svg.appendChild(measureLabel(pts[0], pts[1], m.side, 18));
  }

  /* ── GENERAL QUADRILATERAL ───────────────────────────────── */
  function drawQuadrilateral(svg, p) {
    /* Default: irregular quad */
    var pts = p.vertices || [
      { x: CX - 90, y: CY + 70 },
      { x: CX + 100, y: CY + 80 },
      { x: CX + 80,  y: CY - 60 },
      { x: CX - 70,  y: CY - 70 }
    ];
    var names = ['A','B','C','D'];
    var lbs = p.labels || {};
    var ctr = { x:0, y:0 };
    pts.forEach(function(pt){ ctr.x+=pt.x/4; ctr.y+=pt.y/4; });

    svg.appendChild(polygon(pts));

    /* Diagonal */
    if (p.diagonal === 'AC') svg.appendChild(line(pts[0], pts[2], C.dashed, 1.5, true));
    if (p.diagonal === 'BD') svg.appendChild(line(pts[1], pts[3], C.dashed, 1.5, true));
    if (p.show_diagonals) {
      svg.appendChild(line(pts[0], pts[2], C.dashed, 1.5, true));
      svg.appendChild(line(pts[1], pts[3], C.dashed, 1.5, true));
    }

    /* Perpendiculars from opposite vertices to diagonal */
    if (p.perp_from && p.diagonal) {
      var d0 = p.diagonal === 'AC' ? pts[0] : pts[1];
      var d1 = p.diagonal === 'AC' ? pts[2] : pts[3];
      /* foot of perpendicular from B to AC */
      var foot = midpt(d0, d1); /* simplified */
      svg.appendChild(line(pts[1], foot, C.height, 1.5, true));
      svg.appendChild(rightAngleMark(foot, d0, pts[1], 8));
    }

    var m = p.measurements || {};
    if (m.diagonal) {
      var d0 = p.diagonal === 'BD' ? pts[1] : pts[0];
      var d1 = p.diagonal === 'BD' ? pts[3] : pts[2];
      svg.appendChild(measureLabel(d0, d1, m.diagonal, 16));
    }

    pts.forEach(function(pt, i) {
      svg.appendChild(dot(pt));
      if (lbs[names[i]]) svg.appendChild(label(pushOut(pt, ctr.x, ctr.y, 20), lbs[names[i]]));
    });
  }

  /* ── CIRCLE ──────────────────────────────────────────────── */
  function drawCircle(svg, p) {
    var r = 90;
    var O = { x: CX, y: CY };
    svg.appendChild(el('circle', { cx:CX, cy:CY, r:r, fill:C.fill, stroke:C.stroke, 'stroke-width':2 }));

    if (p.show_center !== false) {
      svg.appendChild(dot(O, 3));
      if (p.center_label) svg.appendChild(label({ x:CX+12, y:CY-4 }, p.center_label));
    }

    /* Radius line */
    if (p.show_radius !== false) {
      var rPt = { x: CX + r * Math.cos(rad(-35)), y: CY + r * Math.sin(rad(-35)) };
      svg.appendChild(line(O, rPt, C.dashed, 1.5));
      if (p.measurements && p.measurements.radius)
        svg.appendChild(measureLabel(O, rPt, p.measurements.radius, -12));
    }

    /* Diameter */
    if (p.show_diameter) {
      svg.appendChild(line({ x:CX-r, y:CY }, { x:CX+r, y:CY }, C.dashed, 1.5));
      if (p.measurements && p.measurements.diameter)
        svg.appendChild(measureLabel({ x:CX-r, y:CY }, { x:CX+r, y:CY }, p.measurements.diameter, -14));
    }

    /* Chord */
    if (p.show_chord) {
      var c1 = ptOnCircle(CX, CY, r, -150);
      var c2 = ptOnCircle(CX, CY, r, -30);
      svg.appendChild(line(c1, c2, C.stroke, 1.5));
    }
  }

  /* ── CONCENTRIC CIRCLES ──────────────────────────────────── */
  function drawConcentricCircles(svg, p) {
    var rInner = p.r_inner_visual || 55;
    var rOuter = p.r_outer_visual || 100;

    /* Shaded ring */
    var ring = el('path', {
      d: 'M '+(CX+rOuter)+' '+CY+' A '+rOuter+' '+rOuter+' 0 1 0 '+(CX-rOuter)+' '+CY+
         ' A '+rOuter+' '+rOuter+' 0 1 0 '+(CX+rOuter)+' '+CY+
         ' M '+(CX+rInner)+' '+CY+' A '+rInner+' '+rInner+' 0 1 1 '+(CX-rInner)+' '+CY+
         ' A '+rInner+' '+rInner+' 0 1 1 '+(CX+rInner)+' '+CY+' Z',
      fill: 'rgba(255,215,0,0.12)',
      'fill-rule': 'evenodd',
      stroke: 'none'
    });
    svg.appendChild(ring);
    svg.appendChild(el('circle', { cx:CX, cy:CY, r:rOuter, fill:'none', stroke:C.stroke, 'stroke-width':2 }));
    svg.appendChild(el('circle', { cx:CX, cy:CY, r:rInner, fill:'none', stroke:C.stroke, 'stroke-width':2 }));
    svg.appendChild(dot({ x:CX, y:CY }, 3));

    var m = p.measurements || {};
    if (m.r_inner || (p.labels && p.labels.inner)) {
      svg.appendChild(measureLabel({ x:CX, y:CY }, { x:CX+rInner, y:CY }, m.r_inner || p.labels.inner, -14));
    }
    if (m.r_outer || (p.labels && p.labels.outer)) {
      svg.appendChild(measureLabel({ x:CX+rInner, y:CY }, { x:CX+rOuter, y:CY }, m.r_outer || p.labels.outer, -14));
    }
    if (p.center_label) svg.appendChild(label({ x:CX, y:CY+14 }, p.center_label, {size:12}));
  }

  /* ── CUBOID 3D ───────────────────────────────────────────── */
  function drawCuboid3D(svg, p) {
    var w = 120, h = 80, d = 50;
    var offX = 28, offY = -18; /* isometric offset for depth */
    /* Front face */
    var fl = { x: CX - w/2,       y: CY + h/2 };
    var fr = { x: CX + w/2,       y: CY + h/2 };
    var tr = { x: CX + w/2,       y: CY - h/2 };
    var tl = { x: CX - w/2,       y: CY - h/2 };
    /* Back-top-right offset */
    var bfr = { x: fr.x+offX, y: fr.y+offY };
    var btr = { x: tr.x+offX, y: tr.y+offY };
    var btl = { x: tl.x+offX, y: tl.y+offY };

    /* Right face */
    svg.appendChild(polygon([fr, bfr, btr, tr], C.fillSide));
    /* Top face */
    svg.appendChild(polygon([tl, tr, btr, btl], C.fillDark));
    /* Front face */
    svg.appendChild(polygon([fl, fr, tr, tl], C.fillFace));

    /* Edges */
    [[ fl,fr],[fr,tr],[tr,tl],[tl,fl],
     [fr,bfr],[tr,btr],[tl,btl],
     [bfr,btr],[btr,btl]].forEach(function(e){ svg.appendChild(line(e[0],e[1])); });
    /* Hidden edges dashed */
    var bfl = { x: fl.x+offX, y: fl.y+offY };
    [[fl,bfl],[bfl,bfr],[bfl,btl]].forEach(function(e){ svg.appendChild(line(e[0],e[1],C.dashed,1,true)); });

    /* Labels */
    var m = p.measurements || p.labels || {};
    if (m.l || m.length) svg.appendChild(measureLabel(fl, fr, m.l||m.length, 18));
    if (m.b || m.width)  svg.appendChild(measureLabel(fr, bfr, m.b||m.width, 16));
    if (m.h || m.height) svg.appendChild(measureLabel(fr, tr, m.h||m.height, 18));
    if (p.open_top) {
      /* Show opening at top */
      svg.appendChild(line(tl, btl, C.height, 1.5));
      svg.appendChild(line(btl, btr, C.height, 1.5));
      svg.appendChild(line(btr, tr, C.height, 1.5));
    }
  }

  /* ── CUBE 3D ─────────────────────────────────────────────── */
  function drawCube3D(svg, p) {
    p.measurements = p.measurements || {};
    if (!p.measurements.l && p.measurements && p.measurements.side) {
      p.measurements.l = p.measurements.b = p.measurements.h = p.measurements.side;
    }
    drawCuboid3D(svg, p);
  }

  /* ── CYLINDER 3D ─────────────────────────────────────────── */
  function drawCylinder3D(svg, p) {
    var r = 60, hgt = 110;
    var ex = r, ey = r * 0.35; /* ellipse x,y radii */
    var topY = CY - hgt/2, botY = CY + hgt/2;

    /* Bottom ellipse fill */
    svg.appendChild(el('ellipse', { cx:CX, cy:botY, rx:ex, ry:ey, fill:'rgba(255,215,0,.08)', stroke:C.stroke, 'stroke-width':2 }));
    /* Cylinder body */
    svg.appendChild(el('path', {
      d: 'M '+(CX-ex)+' '+topY+' L '+(CX-ex)+' '+botY+' A '+ex+' '+ey+' 0 0 0 '+(CX+ex)+' '+botY+' L '+(CX+ex)+' '+topY,
      fill: 'rgba(255,215,0,.06)', stroke: C.stroke, 'stroke-width': 2
    }));
    /* Top ellipse */
    svg.appendChild(el('ellipse', { cx:CX, cy:topY, rx:ex, ry:ey, fill:'rgba(255,215,0,.12)', stroke:C.stroke, 'stroke-width':2 }));

    /* Center dot + axis */
    svg.appendChild(dot({ x:CX, y:topY }, 3));
    svg.appendChild(dot({ x:CX, y:botY }, 3));
    if (p.show_axis !== false) {
      svg.appendChild(line({ x:CX, y:topY }, { x:CX, y:botY }, C.dashed, 1, true));
    }

    var m = p.measurements || {};
    if (m.r || m.radius) {
      svg.appendChild(line({ x:CX, y:topY }, { x:CX+ex, y:topY }, C.measure, 1.5));
      svg.appendChild(measureLabel({ x:CX, y:topY }, { x:CX+ex, y:topY }, m.r||m.radius, -14));
    }
    if (m.h || m.height) {
      svg.appendChild(measureLabel({ x:CX+ex+12, y:topY }, { x:CX+ex+12, y:botY }, m.h||m.height, 18));
    }
    if (p.center_label) {
      svg.appendChild(label({ x:CX-10, y:topY }, 'O', {size:12}));
    }
  }

  /* ── CONE 3D ─────────────────────────────────────────────── */
  function drawCone3D(svg, p) {
    var r = 70, hgt = 120;
    var ex = r, ey = r * 0.3;
    var apex = p.inverted ? { x:CX, y:CY + hgt/2 } : { x:CX, y:CY - hgt/2 };
    var baseY = p.inverted ? CY - hgt/2 : CY + hgt/2;

    /* Base ellipse */
    svg.appendChild(el('ellipse', { cx:CX, cy:baseY, rx:ex, ry:ey, fill:'rgba(255,215,0,.1)', stroke:C.stroke, 'stroke-width':2 }));
    /* Slant edges */
    svg.appendChild(line({ x:CX-ex, y:baseY }, apex, C.stroke, 2));
    svg.appendChild(line({ x:CX+ex, y:baseY }, apex, C.stroke, 2));

    /* Apex dot */
    svg.appendChild(dot(apex, 4));
    if (p.apex_label || p.labels && p.labels.apex)
      svg.appendChild(label({ x:apex.x, y:apex.y - 14 }, p.apex_label || p.labels.apex));

    /* Center of base */
    svg.appendChild(dot({ x:CX, y:baseY }, 3));

    var m = p.measurements || {};
    if (m.r || m.radius) {
      svg.appendChild(line({ x:CX, y:baseY }, { x:CX+ex, y:baseY }, C.measure, 1.5));
      svg.appendChild(measureLabel({ x:CX, y:baseY }, { x:CX+ex, y:baseY }, m.r||m.radius, -14));
    }
    if (m.h || m.height) {
      var midH = { x:CX, y:(apex.y+baseY)/2 };
      svg.appendChild(line({ x:CX, y:apex.y }, { x:CX, y:baseY }, C.dashed, 1, true));
      svg.appendChild(measureLabel({ x:CX, y:apex.y }, { x:CX, y:baseY }, m.h||m.height, 18));
    }
  }

  /* ── UNIT CUBES (isometric stack) ────────────────────────── */
  function drawUnitCubes(svg, p) {
    /* Accepts a 3D grid: p.grid = [[[true/false, ...], ...], ...] */
    /* OR a simple count p.count with p.arrangement */
    var s = 30; /* unit size */
    var ox = s, oy = s * 0.5; /* iso offsets */

    function drawUnitCube(x3d, y3d, z3d) {
      /* iso projection */
      var sx = CX + (x3d - z3d) * s;
      var sy = CY + (x3d + z3d) * oy - y3d * s;
      var fl = { x:sx,    y:sy    };
      var fr = { x:sx+s,  y:sy    };
      var tr = { x:sx+s,  y:sy-s  };
      var tl = { x:sx,    y:sy-s  };
      var btr= { x:sx+s+ox*0.7, y:sy-s-oy*0.7 };
      var btl= { x:sx+ox*0.7,   y:sy-s-oy*0.7 };
      var bfr= { x:sx+s+ox*0.7, y:sy-oy*0.7   };

      svg.appendChild(polygon([fl,fr,tr,tl], C.fillFace));
      svg.appendChild(polygon([fr,bfr,btr,tr], C.fillSide));
      svg.appendChild(polygon([tl,tr,btr,btl], C.fillDark));
      [[fl,fr],[fr,tr],[tr,tl],[tl,fl],[fr,bfr],[tr,btr],[tl,btl],[bfr,btr],[btr,btl]]
        .forEach(function(e){ svg.appendChild(line(e[0],e[1],C.stroke,1)); });
    }

    /* Offset so arrangement is centred */
    var grid = p.grid || [[[true],[true],[true]]];
    var xLen = grid.length;
    var yLen = grid[0] ? grid[0].length : 1;
    var zLen = grid[0] && grid[0][0] ? grid[0][0].length : 1;

    /* Draw from back to front, bottom to top */
    for (var z = zLen-1; z >= 0; z--) {
      for (var y = 0; y < yLen; y++) {
        for (var x = 0; x < xLen; x++) {
          if (grid[x] && grid[x][y] && grid[x][y][z]) {
            drawUnitCube(x - Math.floor(xLen/2), y, z - Math.floor(zLen/2));
          }
        }
      }
    }

    /* Label */
    if (p.label) {
      svg.appendChild(label({ x:CX, y:VH-16 }, p.label, { color:C.measure, size:12 }));
    }
  }

  /* ── COORDINATE PLANE ────────────────────────────────────── */
  function drawCoordinatePlane(svg, p) {
    var xRange = p.x_range || [-3, 6];
    var yRange = p.y_range || [-3, 6];
    var margin = 36;
    var plotW = VW - margin*2, plotH = VH - margin*2;

    /* Scale functions */
    function scX(v) { return margin + (v - xRange[0]) / (xRange[1]-xRange[0]) * plotW; }
    function scY(v) { return VH - margin - (v - yRange[0]) / (yRange[1]-yRange[0]) * plotH; }

    var originX = scX(0), originY = scY(0);

    /* Grid */
    if (p.grid !== false) {
      for (var gx = Math.ceil(xRange[0]); gx <= xRange[1]; gx++) {
        svg.appendChild(line({x:scX(gx),y:margin},{x:scX(gx),y:VH-margin},C.grid,1));
      }
      for (var gy = Math.ceil(yRange[0]); gy <= yRange[1]; gy++) {
        svg.appendChild(line({x:margin,y:scY(gy)},{x:VW-margin,y:scY(gy)},C.grid,1));
      }
    }

    /* Axes */
    svg.appendChild(axisArrow({x:margin,y:originY},{x:VW-margin+8,y:originY}));
    svg.appendChild(axisArrow({x:originX,y:VH-margin},{x:originX,y:margin-8}));

    /* Axis labels */
    svg.appendChild(label({x:VW-margin+14,y:originY}, 'x', {color:C.axis,size:13,weight:'700'}));
    svg.appendChild(label({x:originX,y:margin-16}, 'y', {color:C.axis,size:13,weight:'700'}));
    svg.appendChild(label({x:originX-12,y:originY+12}, '0', {color:C.axis,size:11}));

    /* Tick labels */
    for (var gx = Math.ceil(xRange[0]); gx <= xRange[1]; gx++) {
      if (gx===0) continue;
      svg.appendChild(label({x:scX(gx),y:originY+14}, String(gx), {color:C.axis,size:10}));
    }
    for (var gy = Math.ceil(yRange[0]); gy <= yRange[1]; gy++) {
      if (gy===0) continue;
      svg.appendChild(label({x:originX-16,y:scY(gy)}, String(gy), {color:C.axis,size:10}));
    }

    /* Lines/curves */
    (p.lines || []).forEach(function(ln) {
      var lp1 = {x:scX(ln.x1),y:scY(ln.y1)}, lp2 = {x:scX(ln.x2),y:scY(ln.y2)};
      svg.appendChild(line(lp1, lp2, ln.color||C.lineGraph, 2, ln.dashed));
      if (ln.label) svg.appendChild(label({x:lp2.x+8,y:lp2.y}, ln.label, {color:C.lineGraph,size:12}));
    });

    /* Points */
    (p.points || []).forEach(function(pt) {
      var px = scX(pt.x), py = scY(pt.y);
      svg.appendChild(dot({x:px,y:py}, 5, C.point));
      if (pt.label) {
        var ox2 = pt.label_offset_x || 10, oy2 = pt.label_offset_y || -12;
        svg.appendChild(label({x:px+ox2,y:py+oy2}, pt.label, {color:C.label,size:13}));
      }
    });

    /* Rectangle from 3 points → find 4th */
    if (p.complete_rectangle && p.points && p.points.length >= 3) {
      var pts3 = p.points.slice(0,3);
      /* Already handled by point plot above */
    }

    /* Quadrant labels */
    if (p.show_quadrants) {
      svg.appendChild(label({x:scX((xRange[1])*0.6),y:scY((yRange[1])*0.6)},'I',{color:'rgba(255,255,255,.2)',size:28,weight:'900'}));
      svg.appendChild(label({x:scX((xRange[0])*0.6),y:scY((yRange[1])*0.6)},'II',{color:'rgba(255,255,255,.2)',size:28,weight:'900'}));
      svg.appendChild(label({x:scX((xRange[0])*0.6),y:scY((yRange[0])*0.6)},'III',{color:'rgba(255,255,255,.2)',size:28,weight:'900'}));
      svg.appendChild(label({x:scX((xRange[1])*0.6),y:scY((yRange[0])*0.6)},'IV',{color:'rgba(255,255,255,.2)',size:28,weight:'900'}));
    }
  }

  /* ── LINE GRAPH ──────────────────────────────────────────── */
  function drawLineGraph(svg, p) {
    var margin = 48, tMargin = 20;
    var plotW = VW - margin - tMargin;
    var plotH = VH - margin - tMargin;
    var pts = p.points || [];
    if (!pts.length) return;

    var xs = pts.map(function(p){return p.x;}), ys = pts.map(function(p){return p.y;});
    var xMin = Math.min.apply(null,xs), xMax = Math.max.apply(null,xs);
    var yMin = 0, yMax = Math.max.apply(null,ys) * 1.15;

    function scX(v) { return margin + (v-xMin)/(xMax-xMin||1) * plotW; }
    function scY(v) { return VH - margin - (v-yMin)/(yMax-yMin||1) * plotH; }

    /* Grid */
    var ySteps = p.y_values || [];
    ySteps.forEach(function(ys2) {
      var yv = parseFloat(ys2);
      if (!isNaN(yv)) {
        var yp = scY(yv);
        svg.appendChild(line({x:margin,y:yp},{x:VW-tMargin,y:yp},C.grid,1));
        svg.appendChild(label({x:margin-6,y:yp},ys2,{color:C.axis,size:10,anchor:'end'}));
      }
    });

    /* Axes */
    svg.appendChild(line({x:margin,y:VH-margin},{x:VW-tMargin,y:VH-margin},C.axis,2));
    svg.appendChild(line({x:margin,y:VH-margin},{x:margin,y:tMargin},C.axis,2));

    /* X labels */
    var xLabels = p.x_values || pts.map(function(p2){return String(p2.x);});
    pts.forEach(function(pt, i) {
      var px = scX(pt.x);
      svg.appendChild(line({x:px,y:VH-margin},{x:px,y:VH-margin+4},C.axis,1));
      svg.appendChild(label({x:px,y:VH-margin+14}, xLabels[i]||String(pt.x), {color:C.axis,size:10}));
    });

    /* Axis labels */
    if (p.x_label) svg.appendChild(label({x:margin+plotW/2,y:VH-4},p.x_label,{color:C.muted||'rgba(255,255,255,.5)',size:11}));
    if (p.y_label) {
      var yLabelEl = el('text',{
        x:12, y:tMargin+plotH/2,
        transform:'rotate(-90,12,'+(tMargin+plotH/2)+')',
        'text-anchor':'middle','font-family':'Nunito,sans-serif','font-size':11,
        fill:'rgba(255,255,255,.5)'
      },p.y_label);
      svg.appendChild(yLabelEl);
    }

    /* Data line */
    var linePts = pts.map(function(pt){return {x:scX(pt.x),y:scY(pt.y)};});
    svg.appendChild(polyline(linePts, C.lineGraph, 2.5));

    /* Data points */
    linePts.forEach(function(lp, i) {
      svg.appendChild(dot(lp, 5, C.point));
      if (pts[i] && pts[i].label)
        svg.appendChild(label({x:lp.x+8,y:lp.y-10},pts[i].label,{color:C.label,size:11}));
    });
  }

  /* ══════════════════════════════════════════════════════════
     DISPATCHER
  ══════════════════════════════════════════════════════════ */

  var RENDERERS = {
    parallelogram:      drawParallelogram,
    rhombus:            drawRhombus,
    rectangle:          drawRectangle,
    square:             drawSquare,
    trapezium:          drawTrapezium,
    triangle:           drawTriangle,
    kite:               drawKite,
    regular_polygon:    drawRegularPolygon,
    quadrilateral:      drawQuadrilateral,
    circle:             drawCircle,
    concentric_circles: drawConcentricCircles,
    cuboid_3d:          drawCuboid3D,
    cube_3d:            drawCube3D,
    cylinder_3d:        drawCylinder3D,
    cone_3d:            drawCone3D,
    unit_cubes:         drawUnitCubes,
    coordinate_plane:   drawCoordinatePlane,
    line_graph:         drawLineGraph
  };

  /**
   * render(container, diagramData)
   * container — DOM element (div) to render into
   * diagramData — { type: string, params: object }
   */
  function render(container, diagramData) {
    if (!container || !diagramData || !diagramData.type) return;
    var fn = RENDERERS[diagramData.type];
    if (!fn) { console.warn('RishiDiagram: unknown type:', diagramData.type); return; }

    container.innerHTML = '';
    var svg = makeSVG(VW, VH);
    fn(svg, diagramData.params || {});
    container.appendChild(svg);
  }

  /* Expose */
  return { render: render, RENDERERS: RENDERERS };

}());
