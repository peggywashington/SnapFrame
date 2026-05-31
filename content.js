(function () {
  if (document.getElementById('__sfPanel')) {
    document.getElementById('__sfPanel').style.display = '';
    var f = document.getElementById('__sfFrame');
    if (f) f.style.display = '';
    return;
  }

  var STORE = '__sfState';
  var def = { x: 40, y: 60, w: 756, h: 1344, ow: 1080, oh: 1920, vis: true, fn: 1 };
  var st;
  try { st = Object.assign({}, def, JSON.parse(sessionStorage.getItem(STORE))); }
  catch(e) { st = Object.assign({}, def); }
  function save() { try { sessionStorage.setItem(STORE, JSON.stringify(st)); } catch(e){} }

  // ── Styles ───────────────────────────────────────────────
  var css = document.createElement('style');
  css.textContent = [
    '#__sfPanel{all:initial!important;position:fixed!important;bottom:20px!important;right:20px!important;z-index:2147483647!important;background:#1e1e35!important;border:1px solid #3a3a5a!important;border-radius:14px!important;padding:14px 16px!important;width:272px!important;font-family:PingFang SC,system-ui,sans-serif!important;font-size:13px!important;color:#eee!important;box-shadow:0 8px 32px rgba(0,0,0,.65)!important;user-select:none!important;box-sizing:border-box!important}',
    '#__sfPanel *{all:unset!important;box-sizing:border-box!important;font-family:inherit!important}',
    '#__sfPanel .__r{display:flex!important}',
    '#__sfPanel .__sb{justify-content:space-between!important;align-items:center!important;margin-bottom:11px!important}',
    '#__sfPanel b{color:#f5c518!important;font-size:14px!important;font-weight:700!important}',
    '#__sfVis{cursor:pointer!important;color:#888!important;font-size:11px!important;background:#2a2a45!important;border:1px solid #444!important;padding:2px 9px!important;border-radius:5px!important;display:inline-block!important}',
    '#__sfVis:hover{color:#f5c518!important;border-color:#f5c518!important}',
    '#__sfPanel .__g{display:grid!important;grid-template-columns:1fr 1fr!important;gap:6px!important;margin-bottom:8px!important}',
    '#__sfPanel .__f{display:block!important}',
    '#__sfPanel .__f .__l{display:block!important;font-size:10px!important;color:#888!important;margin-bottom:2px!important}',
    '#__sfPanel .__f input,#__sfPanel .__f select{display:block!important;width:100%!important;background:#111!important;border:1px solid #444!important;color:#eee!important;padding:4px 7px!important;border-radius:6px!important;font-size:12px!important}',
    '#__sfPanel .__ps{display:flex!important;gap:5px!important;margin-bottom:8px!important;flex-wrap:wrap!important}',
    '.__pb{background:#2a2a45!important;border:1px solid #555!important;color:#ccc!important;padding:3px 10px!important;border-radius:6px!important;font-size:11px!important;cursor:pointer!important;display:inline-block!important}',
    '.__pb:hover{background:#f5c518!important;color:#111!important;border-color:#f5c518!important}',
    '#__sfPanel .__hint{font-size:10px!important;color:#555!important;margin-bottom:8px!important;display:block!important}',
    '#__sfSnap{display:block!important;width:100%!important;background:#f5c518!important;color:#111!important;padding:9px!important;border-radius:8px!important;font-size:14px!important;font-weight:700!important;cursor:pointer!important;text-align:center!important}',
    '#__sfSnap:hover{background:#ffd740!important}',
    '#__sfStatus{font-size:11px!important;color:#f5c518!important;margin-top:6px!important;min-height:14px!important;text-align:center!important;display:block!important;line-height:1.5!important}',
    '#__sfFrame{position:fixed!important;border:2px dashed #f5c518!important;background:rgba(245,197,24,.03)!important;z-index:2147483646!important;cursor:move!important;pointer-events:auto!important}',
    '#__sfLabel{position:absolute!important;top:-22px!important;left:0!important;font-size:11px!important;color:#f5c518!important;background:rgba(0,0,0,.78)!important;padding:2px 7px!important;border-radius:4px!important;pointer-events:none!important;white-space:nowrap!important;font-family:monospace!important}',
  ].join('');
  document.head.appendChild(css);

  // ── Panel ────────────────────────────────────────────────
  var panel = document.createElement('div');
  panel.id = '__sfPanel';
  panel.innerHTML =
    '<div class="__r __sb"><b>🔲 截图框</b><span id="__sfVis">隐藏框</span></div>' +
    '<div class="__g">' +
      '<div class="__f"><span class="__l">框宽 px</span><input type="number" id="__sfW" value="'+st.w+'"></div>' +
      '<div class="__f"><span class="__l">框高 px</span><input type="number" id="__sfH" value="'+st.h+'"></div>' +
      '<div class="__f"><span class="__l">输出宽 px</span><input type="number" id="__sfOW" value="'+st.ow+'"></div>' +
      '<div class="__f"><span class="__l">输出高 px</span><input type="number" id="__sfOH" value="'+st.oh+'"></div>' +
    '</div>' +
    '<div class="__ps" id="__sfPresets"></div>' +
    '<span class="__hint">比例按钮同时设置框和输出尺寸</span>' +
    '<div class="__g" style="margin-bottom:10px">' +
      '<div class="__f"><span class="__l">帧数（分页）</span><input type="number" id="__sfFN" value="'+st.fn+'" min="1"></div>' +
      '<div class="__f"><span class="__l">格式</span><select id="__sfFmt"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select></div>' +
    '</div>' +
    '<span id="__sfSnap">📸 截图</span>' +
    '<span id="__sfStatus"></span>';
  document.body.appendChild(panel);

  var presets = [['9:16',756,1344,1080,1920],['4:5',756,945,1080,1350],['1:1',756,756,1080,1080],['16:9',1344,756,1920,1080]];
  var psWrap = document.getElementById('__sfPresets');
  presets.forEach(function(pr) {
    var b = document.createElement('span');
    b.className = '__pb'; b.textContent = pr[0];
    b.addEventListener('click', function() { st.w=pr[1];st.h=pr[2];st.ow=pr[3];st.oh=pr[4]; applyFrame(); });
    psWrap.appendChild(b);
  });

  // ── Frame ────────────────────────────────────────────────
  var frame = document.createElement('div');
  frame.id = '__sfFrame';
  frame.innerHTML = '<div id="__sfLabel"></div>';
  document.body.appendChild(frame);

  function applyFrame() {
    frame.style.cssText = 'position:fixed!important;border:2px dashed #f5c518!important;background:rgba(245,197,24,.03)!important;z-index:2147483646!important;cursor:move!important;pointer-events:auto!important;' +
      'left:'+st.x+'px;top:'+st.y+'px;width:'+st.w+'px;height:'+st.h+'px;display:'+(st.vis?'block':'none');
    document.getElementById('__sfLabel').textContent = st.w + ' × ' + st.h;
    document.getElementById('__sfW').value  = st.w;
    document.getElementById('__sfH').value  = st.h;
    document.getElementById('__sfOW').value = st.ow;
    document.getElementById('__sfOH').value = st.oh;
    document.getElementById('__sfVis').textContent = st.vis ? '隐藏框' : '显示框';
    save();
  }
  applyFrame();

  document.getElementById('__sfW') .addEventListener('input', function(){ st.w  = parseInt(this.value)||756;  applyFrame(); });
  document.getElementById('__sfH') .addEventListener('input', function(){ st.h  = parseInt(this.value)||1344; applyFrame(); });
  document.getElementById('__sfOW').addEventListener('input', function(){ st.ow = parseInt(this.value)||1080; save(); });
  document.getElementById('__sfOH').addEventListener('input', function(){ st.oh = parseInt(this.value)||1920; save(); });
  document.getElementById('__sfFN').addEventListener('input', function(){ st.fn = Math.max(1,parseInt(this.value)||1); save(); });
  document.getElementById('__sfVis').addEventListener('click', function(){ st.vis = !st.vis; applyFrame(); });

  // ── Drag frame ───────────────────────────────────────────
  var drag = null;
  frame.addEventListener('mousedown', function(e) {
    drag = { sx: st.x, sy: st.y, mx: e.clientX, my: e.clientY };
    e.preventDefault();
  });
  document.addEventListener('mousemove', function(e) {
    if (!drag) return;
    st.x = drag.sx + (e.clientX - drag.mx);
    st.y = drag.sy + (e.clientY - drag.my);
    frame.style.left = st.x + 'px';
    frame.style.top  = st.y + 'px';
  });
  document.addEventListener('mouseup', function() { if (drag) { save(); drag = null; } });

  // ── Drag panel ───────────────────────────────────────────
  var pdrag = null;
  panel.addEventListener('mousedown', function(e) {
    var tag = e.target.tagName;
    if (tag==='INPUT'||tag==='SELECT'||tag==='SPAN') return;
    panel.style.right = 'auto';
    pdrag = { sl: panel.offsetLeft, st2: panel.offsetTop, mx: e.clientX, my: e.clientY };
    e.preventDefault();
  });
  document.addEventListener('mousemove', function(e) {
    if (!pdrag) return;
    panel.style.left = (pdrag.sl + e.clientX - pdrag.mx) + 'px';
    panel.style.top  = (pdrag.st2 + e.clientY - pdrag.my) + 'px';
  });
  document.addEventListener('mouseup', function() { pdrag = null; });

  // ── Screenshot via captureVisibleTab ─────────────────────
  // Sends a message to the background script which calls captureVisibleTab,
  // then we crop the result here in the content script.
  document.getElementById('__sfSnap').addEventListener('click', function() {
    var outW   = parseInt(document.getElementById('__sfOW').value)  || 1080;
    var outH   = parseInt(document.getElementById('__sfOH').value)  || 1920;
    var fmt    = document.getElementById('__sfFmt').value;
    var nf     = Math.max(1, parseInt(document.getElementById('__sfFN').value) || 1);
    var ext    = fmt==='image/png'?'png':fmt==='image/webp'?'webp':'jpg';
    var status = document.getElementById('__sfStatus');

    frame.style.display = 'none';
    panel.style.display = 'none';

    // Capture nf frames sequentially
    // For each frame i: scroll so that frame top is at viewport top,
    // capture, crop, then move on.
    var originalScrollY = window.scrollY;
    var frameIndex = 0;

    function captureFrame() {
      if (frameIndex >= nf) {
        // Restore scroll and UI
        window.scrollTo(0, originalScrollY);
        frame.style.display = st.vis ? 'block' : 'none';
        panel.style.display = '';
        status.textContent = '✅ 完成 ' + nf + ' 张';
        return;
      }

      // For multi-frame: scroll so that frame i starts at top of viewport
      // Frame i covers page Y: (st.y + scrollY_at_snap) + i * st.h
      // We want that position to appear at viewport Y = st.y
      // So: scrollTo( originalScrollY + i * st.h )
      var targetScroll = originalScrollY + frameIndex * st.h;
      window.scrollTo(0, targetScroll);

      // Wait for scroll + repaint
      setTimeout(function() {
        // Ask background to capture visible tab
        chrome.runtime.sendMessage({ type: 'CAPTURE' }, function(response) {
          if (!response || !response.dataUrl) {
            status.textContent = '❌ 截图失败';
            frame.style.display = st.vis ? 'block' : 'none';
            panel.style.display = '';
            return;
          }

          var img = new Image();
          img.onload = function() {
            // devicePixelRatio: the capture is at physical pixels
            var dpr = window.devicePixelRatio || 1;

            // Crop coords in physical pixels
            var cropX = Math.round(st.x * dpr);
            var cropY = Math.round(st.y * dpr);
            var cropW = Math.round(st.w * dpr);
            var cropH = Math.round(st.h * dpr);

            // Clamp to image bounds
            cropX = Math.max(0, Math.min(cropX, img.width  - 1));
            cropY = Math.max(0, Math.min(cropY, img.height - 1));
            cropW = Math.min(cropW, img.width  - cropX);
            cropH = Math.min(cropH, img.height - cropY);

            var canvas = document.createElement('canvas');
            canvas.width  = outW;
            canvas.height = outH;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, outW, outH);

            var q = fmt === 'image/jpeg' ? 0.93 : 1.0;
            var a = document.createElement('a');
            a.href     = canvas.toDataURL(fmt, q);
            a.download = 'snap_' + String(frameIndex + 1).padStart(2, '0') + '.' + ext;
            a.click();

            frameIndex++;
            setTimeout(captureFrame, 300);
          };
          img.src = response.dataUrl;
        });
      }, 150); // wait for scroll repaint
    }

    status.textContent = '截图中…';
    captureFrame();
  });

})();
