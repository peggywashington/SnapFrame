(function () {
  if (document.getElementById('__sfHost')) {
    document.getElementById('__sfHost').style.display = '';
    var f = document.getElementById('__sfFrame');
    if (f) {
      try { f.style.display = (JSON.parse(sessionStorage.getItem('__sfState')||'{}').vis===false)?'none':'block'; } catch(e){}
    }
    return;
  }

  var STORE = '__sfState';
  var def = { x: 40, y: 60, fw: 756, fh: 1344, outW: 1080, lock: false, fn: 1, vis: true };
  // outW only — outH always = outW * fh/fw
  var st;
  try { st = Object.assign({}, def, JSON.parse(sessionStorage.getItem(STORE))); }
  catch(e) { st = Object.assign({}, def); }
  function outH() { return Math.max(1, Math.round(st.outW * st.fh / st.fw)); }
  function save() { try { sessionStorage.setItem(STORE, JSON.stringify(st)); } catch(e){} }

  // ── Shadow DOM panel ──────────────────────────────────────
  var host = document.createElement('div');
  host.id = '__sfHost';
  host.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:2147483647;';
  document.body.appendChild(host);
  var shadow = host.attachShadow({ mode: 'open' });

  var styleEl = document.createElement('style');
  styleEl.textContent = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    #panel {
      background: #1e1e35; border: 1px solid #3a3a5a; border-radius: 14px;
      padding: 14px 16px; width: 280px;
      font-family: 'PingFang SC', system-ui, sans-serif; font-size: 13px;
      color: #eee; box-shadow: 0 8px 32px rgba(0,0,0,.65);
    }
    .row { display: flex; align-items: center; }
    .sb  { justify-content: space-between; margin-bottom: 11px; }
    .title { color: #f5c518; font-size: 14px; font-weight: 700; }
    button {
      background: #2a2a45; border: 1px solid #555; color: #ccc;
      padding: 2px 9px; border-radius: 5px; font-size: 11px; cursor: pointer;
      font-family: inherit;
    }
    button:hover { color: #f5c518; border-color: #f5c518; }
    #visBtn { font-size: 11px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px; }
    .field { display: flex; flex-direction: column; gap: 2px; }
    .lbl { font-size: 10px; color: #888; }
    input[type=number] {
      background: #111; border: 1px solid #555; color: #eee;
      padding: 5px 7px; border-radius: 6px; font-size: 13px;
      width: 100%; font-family: inherit;
    }
    input[type=number]:focus { border-color: #f5c518; outline: 1px solid #f5c518; }
    select {
      background: #111; border: 1px solid #555; color: #eee;
      padding: 5px 7px; border-radius: 6px; font-size: 13px;
      width: 100%; font-family: inherit;
    }
    .presets { display: flex; gap: 5px; margin-bottom: 8px; flex-wrap: wrap; }
    .pb {
      background: #2a2a45; border: 1px solid #555; color: #ccc;
      padding: 3px 10px; border-radius: 6px; font-size: 11px; cursor: pointer;
      font-family: inherit;
    }
    .pb:hover { background: #3a3a55; color: #eee; }
    .pb.on { background: #f5c518; color: #111; border-color: #f5c518; }
    .lockrow {
      display: flex; align-items: center; gap: 7px;
      margin-bottom: 10px; font-size: 11px; color: #888;
    }
    input[type=checkbox] {
      width: 14px; height: 14px; cursor: pointer; accent-color: #f5c518;
      flex-shrink: 0; border: 1px solid #555;
    }
    .hint { font-size: 10px; color: #555; margin-bottom: 8px; line-height: 1.4; }
    #snapBtn {
      display: block; width: 100%; background: #f5c518; color: #111;
      border: none; padding: 9px; border-radius: 8px;
      font-size: 14px; font-weight: 700; cursor: pointer;
      font-family: inherit;
    }
    #snapBtn:hover { background: #ffd740; }
    #status { font-size: 11px; color: #f5c518; margin-top: 6px; min-height: 14px; text-align: center; line-height: 1.5; }
  `;
  shadow.appendChild(styleEl);

  var panel = document.createElement('div');
  panel.id = 'panel';
  panel.innerHTML =
    '<div class="row sb">' +
      '<span class="title">🔲 SnapFrame</span>' +
      '<button id="visBtn">隐藏框</button>' +
    '</div>' +
    '<div class="grid">' +
      '<div class="field"><span class="lbl">框宽 px</span><input type="number" id="fw" min="1"></div>' +
      '<div class="field"><span class="lbl">框高 px</span><input type="number" id="fh" min="1"></div>' +
      '<div class="field"><span class="lbl">输出宽 px</span><input type="number" id="ow" min="1"></div>' +
      '<div class="field"><span class="lbl">输出高 px（自动）</span><input type="number" id="oh" min="1" readonly tabindex="-1" style="color:#666;cursor:default"></div>' +
    '</div>' +
    '<div class="presets" id="presets"></div>' +
    '<div class="lockrow"><input type="checkbox" id="lockChk"><span>锁定框宽高比</span></div>' +
    '<div class="grid" style="margin-bottom:10px">' +
      '<div class="field"><span class="lbl">帧数（分页）</span><input type="number" id="fn" min="1"></div>' +
      '<div class="field"><span class="lbl">格式</span>' +
        '<select id="fmt"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select>' +
      '</div>' +
    '</div>' +
    '<button id="snapBtn">📸 截图</button>' +
    '<div id="status"></div>';
  shadow.appendChild(panel);

  var S = function(id) { return shadow.getElementById(id); };

  function syncUI() {
    S('fw').value = st.fw;
    S('fh').value = st.fh;
    S('ow').value = st.outW;
    S('oh').value = outH();
    S('fn').value = st.fn;
    S('lockChk').checked = st.lock;
    S('visBtn').textContent = st.vis ? '隐藏框' : '显示框';
  }
  syncUI();

  // ── Frame ─────────────────────────────────────────────────
  var fStyle = document.createElement('style');
  fStyle.textContent = `
    #__sfFrame {
      position: fixed; border: 2px solid #f5c518;
      background: rgba(245,197,24,.03);
      z-index: 2147483646; box-sizing: border-box;
    }
    #__sfLabel {
      position: absolute; top: -22px; left: 0;
      font-size: 11px; font-family: monospace; color: #f5c518;
      background: rgba(0,0,0,.78); padding: 2px 7px; border-radius: 4px;
      pointer-events: none; white-space: nowrap;
    }
    #__sfMover { position: absolute; inset: 0; cursor: move; }
    .sfH {
      position: absolute; width: 10px; height: 10px;
      background: #f5c518; border: 2px solid #111; border-radius: 2px;
    }
    .sfH[data-d="nw"]{top:-5px;left:-5px;cursor:nw-resize}
    .sfH[data-d="n"] {top:-5px;left:calc(50% - 5px);cursor:n-resize}
    .sfH[data-d="ne"]{top:-5px;right:-5px;cursor:ne-resize}
    .sfH[data-d="e"] {top:calc(50% - 5px);right:-5px;cursor:e-resize}
    .sfH[data-d="se"]{bottom:-5px;right:-5px;cursor:se-resize}
    .sfH[data-d="s"] {bottom:-5px;left:calc(50% - 5px);cursor:s-resize}
    .sfH[data-d="sw"]{bottom:-5px;left:-5px;cursor:sw-resize}
    .sfH[data-d="w"] {top:calc(50% - 5px);left:-5px;cursor:w-resize}
  `;
  document.head.appendChild(fStyle);

  var frame = document.createElement('div');
  frame.id = '__sfFrame';
  frame.innerHTML = '<div id="__sfLabel"></div><div id="__sfMover"></div>';
  ['nw','n','ne','e','se','s','sw','w'].forEach(function(d) {
    var h = document.createElement('div');
    h.className = 'sfH'; h.dataset.d = d; frame.appendChild(h);
  });
  document.body.appendChild(frame);

  function applyFrame() {
    frame.style.left = st.x+'px'; frame.style.top = st.y+'px';
    frame.style.width = st.fw+'px'; frame.style.height = st.fh+'px';
    frame.style.display = st.vis ? 'block' : 'none';
    document.getElementById('__sfLabel').textContent = st.fw + ' × ' + st.fh;
    syncUI();
    save();
  }
  applyFrame();

  // ── Presets ───────────────────────────────────────────────
  // [label, fw, fh, outW]
  var PRESETS = [['9:16',756,1344,1080],['4:5',756,945,1080],['1:1',756,756,1080],['16:9',1344,756,1920]];
  var pbtns = [];
  PRESETS.forEach(function(pr) {
    var b = document.createElement('button');
    b.className = 'pb'; b.textContent = pr[0];
    b.addEventListener('click', function() {
      st.fw=pr[1]; st.fh=pr[2]; st.outW=pr[3];
      clearPresetHL(); b.classList.add('on');
      applyFrame();
    });
    S('presets').appendChild(b); pbtns.push(b);
  });

  function clearPresetHL() {
    pbtns.forEach(function(b){ b.classList.remove('on'); });
  }

  // ── Input handlers ────────────────────────────────────────
  S('fw').addEventListener('input', function() {
    var v = Math.max(1, parseInt(this.value)||1);
    if (st.lock) st.fh = Math.max(1, Math.round(v * st.fh / st.fw));
    st.fw = v;
    clearPresetHL();
    applyFrame();
  });
  S('fh').addEventListener('input', function() {
    var v = Math.max(1, parseInt(this.value)||1);
    if (st.lock) st.fw = Math.max(1, Math.round(v * st.fw / st.fh));
    st.fh = v;
    clearPresetHL();
    applyFrame();
  });
  S('ow').addEventListener('input', function() {
    st.outW = Math.max(1, parseInt(this.value)||1);
    S('oh').value = outH();
    save();
  });
  S('fn').addEventListener('input', function() { st.fn = Math.max(1,parseInt(this.value)||1); save(); });
  S('lockChk').addEventListener('change', function() { st.lock = this.checked; save(); });
  S('visBtn').addEventListener('click', function() { st.vis = !st.vis; applyFrame(); });

  // ── Move ──────────────────────────────────────────────────
  var moveDrag = null;
  document.getElementById('__sfMover').addEventListener('mousedown', function(e) {
    moveDrag = { sx: st.x, sy: st.y, mx: e.clientX, my: e.clientY };
    e.preventDefault(); e.stopPropagation();
  });

  // ── Resize ────────────────────────────────────────────────
  var resDrag = null;
  frame.querySelectorAll('.sfH').forEach(function(h) {
    h.addEventListener('mousedown', function(e) {
      resDrag = { d:h.dataset.d, sx:st.x, sy:st.y, sw:st.fw, sh:st.fh, mx:e.clientX, my:e.clientY };
      e.preventDefault(); e.stopPropagation();
    });
  });

  document.addEventListener('mousemove', function(e) {
    if (moveDrag) {
      st.x = moveDrag.sx + e.clientX - moveDrag.mx;
      st.y = moveDrag.sy + e.clientY - moveDrag.my;
      frame.style.left = st.x+'px'; frame.style.top = st.y+'px';
    }
    if (resDrag) {
      var r = resDrag, d = r.d;
      var dx = e.clientX - r.mx, dy = e.clientY - r.my;
      var nx = r.sx, ny = r.sy, nw = r.sw, nh = r.sh;
      if (d.includes('e')) nw = Math.max(10, r.sw + dx);
      if (d.includes('s')) nh = Math.max(10, r.sh + dy);
      if (d.includes('w')) { nw = Math.max(10, r.sw - dx); nx = r.sx + r.sw - nw; }
      if (d.includes('n')) { nh = Math.max(10, r.sh - dy); ny = r.sy + r.sh - nh; }
      if (st.lock) {
        var ratio = r.sw / r.sh;
        if (d==='n'||d==='s') nw = Math.round(nh * ratio);
        else nh = Math.round(nw / ratio);
        if (d.includes('n')) ny = r.sy + r.sh - nh;
        if (d.includes('w')) nx = r.sx + r.sw - nw;
      }
      st.x = Math.round(nx); st.y = Math.round(ny);
      st.fw = Math.max(1, Math.round(nw));
      st.fh = Math.max(1, Math.round(nh));
      // output height is always derived from outW * fh/fw — no separate storage
      frame.style.left = st.x+'px'; frame.style.top = st.y+'px';
      frame.style.width = st.fw+'px'; frame.style.height = st.fh+'px';
      document.getElementById('__sfLabel').textContent = st.fw + ' × ' + st.fh;
      S('fw').value = st.fw; S('fh').value = st.fh;
      S('oh').value = outH();
      clearPresetHL();
    }
  });

  document.addEventListener('mouseup', function() {
    if (moveDrag) { save(); moveDrag = null; }
    if (resDrag)  { save(); resDrag = null; }
  });

  // ── Panel drag ────────────────────────────────────────────
  var pdrag = null;
  panel.addEventListener('mousedown', function(e) {
    // Only drag from panel background — not from interactive elements
    var tag = e.target.tagName.toUpperCase();
    if (tag==='INPUT'||tag==='SELECT'||tag==='BUTTON'||tag==='LABEL'||tag==='SPAN') return;
    host.style.right = 'auto';
    pdrag = { sl: host.offsetLeft, st2: host.offsetTop, mx: e.clientX, my: e.clientY };
    e.preventDefault();
  });
  document.addEventListener('mousemove', function(e) {
    if (!pdrag) return;
    host.style.left = (pdrag.sl + e.clientX - pdrag.mx) + 'px';
    host.style.top  = (pdrag.st2 + e.clientY - pdrag.my) + 'px';
  });
  document.addEventListener('mouseup', function() { pdrag = null; });

  // ── Screenshot ────────────────────────────────────────────
  S('snapBtn').addEventListener('click', function() {
    var oW   = Math.max(1, parseInt(S('ow').value)||1080);
    var oH   = Math.max(1, outH());
    var fmt  = S('fmt').value;
    var nf   = Math.max(1, parseInt(S('fn').value)||1);
    var ext  = fmt==='image/png'?'png':fmt==='image/webp'?'webp':'jpg';
    var stat = S('status');

    frame.style.display = 'none';
    host.style.display  = 'none';
    var origScroll = window.scrollY, idx = 0;

    function next() {
      if (idx >= nf) {
        window.scrollTo(0, origScroll);
        frame.style.display = st.vis?'block':'none';
        host.style.display  = '';
        stat.textContent    = '✅ 完成 ' + nf + ' 张';
        return;
      }
      window.scrollTo(0, origScroll + idx * st.fh);
      setTimeout(function() {
        chrome.runtime.sendMessage({ type:'CAPTURE' }, function(resp) {
          if (!resp||!resp.dataUrl) {
            stat.textContent='❌ 截图失败';
            frame.style.display=st.vis?'block':'none'; host.style.display=''; return;
          }
          var img = new Image();
          img.onload = function() {
            var dpr = window.devicePixelRatio||1;
            var cx = Math.round(st.x*dpr), cy = Math.round(st.y*dpr);
            var cw = Math.round(st.fw*dpr), ch = Math.round(st.fh*dpr);
            cx=Math.max(0,Math.min(cx,img.width-1));
            cy=Math.max(0,Math.min(cy,img.height-1));
            cw=Math.min(cw,img.width-cx); ch=Math.min(ch,img.height-cy);
            var c=document.createElement('canvas');
            c.width=oW; c.height=oH;
            c.getContext('2d').drawImage(img,cx,cy,cw,ch,0,0,oW,oH);
            var a=document.createElement('a');
            a.href=c.toDataURL(fmt,0.93);
            a.download='snap_'+String(idx+1).padStart(2,'0')+'.'+ext;
            a.click(); idx++;
            setTimeout(next, 300);
          };
          img.src = resp.dataUrl;
        });
      }, 150);
    }
    stat.textContent='截图中…';
    next();
  });

})();
