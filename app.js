// ===== HireIQ — Intelligent Screening Engine =====
// Powered by Groq AI — replace placeholder with key from console.groq.com (free)

const GROQ_KEY = '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';
const GROQ_MODELS = ['llama-3.1-8b-instant', 'llama3-8b-8192', 'gemma2-9b-it'];
let workingModel = GROQ_MODELS[0];
let candidates = [];
let results = null;

// ===== CANVAS BACKGROUND =====
(function initCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  // Particle layers
  const dots = [];      // tiny floating dots (purple + teal)
  const orbs = [];      // large soft glowing orbs
  const stars = [];     // shooting stars

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  // Tiny dot particle
  function Dot() {
    this.reset = function() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.r = Math.random() * 1.4 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.25;
      this.vy = (Math.random() - 0.5) * 0.25;
      this.alpha = Math.random() * 0.55 + 0.1;
      this.color = Math.random() > 0.55 ? '108,99,255' : '0,212,170';
      this.pulse = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.008 + Math.random() * 0.012;
    };
    this.reset();
  }

  // Large soft aurora orb
  function Orb() {
    this.reset = function() {
      this.x = Math.random() * W;
      this.y = Math.random() * H * 0.7;
      this.r = 120 + Math.random() * 200;
      this.vx = (Math.random() - 0.5) * 0.08;
      this.vy = (Math.random() - 0.5) * 0.06;
      this.alpha = 0.025 + Math.random() * 0.04;
      const t = Math.random();
      if (t < 0.4) this.color = '108,99,255';
      else if (t < 0.75) this.color = '0,180,140';
      else this.color = '60,40,180';
    };
    this.reset();
  }

  // Shooting star
  function Star() {
    this.reset = function() {
      this.x = Math.random() * W * 1.2;
      this.y = Math.random() * H * 0.5;
      this.len = 60 + Math.random() * 120;
      this.speed = 2.5 + Math.random() * 3;
      this.alpha = 0;
      this.maxAlpha = 0.4 + Math.random() * 0.4;
      this.angle = Math.PI / 5 + (Math.random() - 0.5) * 0.3;
      this.active = false;
      this.life = 0;
      this.maxLife = 60 + Math.random() * 60;
      this.delay = Math.random() * 400;
    };
    this.reset();
  }

  function init() {
    resize();
    for (let i = 0; i < 90; i++) dots.push(new Dot());
    for (let i = 0; i < 5; i++) orbs.push(new Orb());
    for (let i = 0; i < 4; i++) stars.push(new Star());
  }

  let frame = 0;

  function draw() {
    frame++;
    ctx.clearRect(0, 0, W, H);

    // Draw aurora orbs
    orbs.forEach(function(o) {
      o.x += o.vx; o.y += o.vy;
      if (o.x < -o.r) o.x = W + o.r;
      if (o.x > W + o.r) o.x = -o.r;
      if (o.y < -o.r) o.y = H + o.r;
      if (o.y > H + o.r) o.y = -o.r;
      const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
      g.addColorStop(0, 'rgba(' + o.color + ',' + o.alpha + ')');
      g.addColorStop(0.5, 'rgba(' + o.color + ',' + (o.alpha * 0.4) + ')');
      g.addColorStop(1, 'rgba(' + o.color + ',0)');
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    });

    // Draw connection lines between close dots
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.strokeStyle = 'rgba(108,99,255,' + (0.07 * (1 - dist / 100)) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw dots with pulse
    dots.forEach(function(p) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      p.pulse += p.pulseSpeed;
      const a = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + p.color + ',' + a + ')';
      ctx.fill();
    });

    // Draw shooting stars
    stars.forEach(function(s) {
      if (s.delay > 0) { s.delay--; return; }
      if (!s.active) { s.active = true; s.life = 0; }
      s.life++;
      if (s.life > s.maxLife) { s.reset(); return; }
      const progress = s.life / s.maxLife;
      s.alpha = progress < 0.2 ? (progress / 0.2) * s.maxAlpha
               : progress > 0.7 ? ((1 - progress) / 0.3) * s.maxAlpha
               : s.maxAlpha;
      const tx = Math.cos(s.angle) * s.speed;
      const ty = Math.sin(s.angle) * s.speed;
      s.x += tx; s.y += ty;
      const tailX = s.x - Math.cos(s.angle) * s.len;
      const tailY = s.y - Math.sin(s.angle) * s.len;
      const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(0.7, 'rgba(180,170,255,' + (s.alpha * 0.5) + ')');
      grad.addColorStop(1, 'rgba(255,255,255,' + s.alpha + ')');
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(s.x, s.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // tip glow
      ctx.beginPath();
      ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,' + s.alpha + ')';
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', function() { resize(); });
  init();
  draw();
})();
// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('jdInput').addEventListener('input', function () {
    const words = this.value.trim().split(/\s+/).filter(Boolean).length;
    document.getElementById('jdWordCount').textContent = words + ' words';
  });
  const dz = document.getElementById('dropzone');
  const fi = document.getElementById('fileInput');
  dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('drag-over'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('drag-over'));
  dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('drag-over'); handleFiles(e.dataTransfer.files); });
  fi.addEventListener('change', e => { handleFiles(e.target.files); fi.value = ''; });
});

// ===== FILE HANDLING =====
function handleFiles(files) {
  Array.from(files).forEach(file => {
    const name = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').replace(/\b(cv|resume|strong fit|moderate fit|not fit|weak fit|experienced|fresher)\b/gi, '').replace(/\s+/g, ' ').trim();
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      extractPDFText(file, name);
    } else {
      const reader = new FileReader();
      reader.onload = e => { addCandidate(name, e.target.result.trim(), 'file'); showToast('Uploaded: ' + file.name); };
      reader.readAsText(file);
    }
  });
}

async function extractPDFText(file, name) {
  try {
    if (!window.pdfReady || typeof pdfjsLib === 'undefined') {
      showToast('PDF.js loading — try again in a moment');
      addCandidate(name, '', 'file'); return;
    }
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(' ') + '\n';
    }
    if (!text.trim()) { showToast('Scanned PDF — paste text manually'); addCandidate(name, '', 'file'); return; }
    addCandidate(name, text.trim(), 'file');
    showToast('Extracted: ' + file.name);
  } catch (err) {
    showToast('Could not read ' + file.name + ' — paste text manually');
    addCandidate(name, '', 'file');
  }
}

// ===== CANDIDATES =====
function addCandidate(name, text, source) {
  name = name || '';
  text = text || '';
  source = source || 'manual';
  const idx = candidates.length;
  candidates.push({ name, text, source });
  renderEntry(idx);
  updatePill();
}

function addManual() { addCandidate('Candidate ' + (candidates.length + 1), '', 'manual'); }

function renderEntry(idx) {
  const c = candidates[idx];
  const list = document.getElementById('candidateList');
  const div = document.createElement('div');
  div.className = 'cand-entry';
  div.dataset.idx = idx;
  const ico = c.source === 'file' ? '📄' : '✏️';
  div.innerHTML =
    '<div class="ce-row">' +
      '<div class="ce-ico">' + ico + '</div>' +
      '<input class="ce-name" type="text" value="' + escHtml(c.name) + '" placeholder="Candidate name" oninput="candidates[' + idx + '].name = this.value"/>' +
      '<button class="ce-del" onclick="removeCandidate(' + idx + ')">✕ Remove</button>' +
    '</div>' +
    '<textarea class="ce-ta" placeholder="Paste resume text here..." oninput="candidates[' + idx + '].text = this.value">' + escHtml(c.text) + '</textarea>';
  list.appendChild(div);
}

function removeCandidate(idx) {
  candidates.splice(idx, 1);
  document.getElementById('candidateList').innerHTML = '';
  candidates.forEach((_, i) => renderEntry(i));
  updatePill();
}

function updatePill() {
  const n = candidates.length;
  document.getElementById('candidatePill').textContent = n + ' candidate' + (n !== 1 ? 's' : '') + ' added';
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ===== GROQ API =====
// Deployed on Vercel: calls /api/analyze (key hidden server-side)
// Local dev: calls Groq directly — replace GROQ_KEY above with your key
async function callGroq(prompt) {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (!isLocal) {
    try {
      const r = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt, model: workingModel })
      });
      if (r.ok) { const d = await r.json(); return d.text; }
    } catch (_) {}
  }
  const key = GROQ_KEY;
  if (!key || key.indexOf('placeholder') !== -1) {
    throw new Error('Replace GROQ_KEY in app.js with your key from console.groq.com (free)');
  }
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
    body: JSON.stringify({
      model: workingModel,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2048
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error && err.error.message ? err.error.message : 'API error ' + res.status);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

function parseJSON(text) {
  const m = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/(\{[\s\S]*\})/);
  if (m) return JSON.parse(m[1]);
  return JSON.parse(text);
}

// ===== ANALYSIS =====
async function startAnalysis() {
  const jd = document.getElementById('jdInput').value.trim();
  if (!jd) { showToast('Please paste a Job Description'); return; }

  document.querySelectorAll('.cand-entry').forEach(el => {
    const idx = parseInt(el.dataset.idx);
    if (!isNaN(idx) && candidates[idx]) {
      candidates[idx].name = el.querySelector('.ce-name').value.trim() || candidates[idx].name;
      candidates[idx].text = el.querySelector('.ce-ta').value.trim();
    }
  });

  const valid = candidates.filter(c => c.text.trim().length > 20);
  if (!valid.length) { showToast('Add at least one resume with content'); return; }

  showLoading();
  try {
    setLoadingStep('Analyzing Job Description...', 'Checking clarity, bias, and completeness', 10);
    const jdResult = await analyzeJD(jd);

    const scored = [];
    for (let i = 0; i < valid.length; i++) {
      setLoadingStep(
        'Screening ' + (i + 1) + ' of ' + valid.length + ' candidates...',
        'Analyzing ' + valid[i].name,
        10 + Math.round(((i + 1) / valid.length) * 70)
      );
      scored.push(await scoreCandidate(jd, valid[i]));
    }

    setLoadingStep('Generating Hiring Report...', 'Synthesizing final recommendations', 92);
    const recommendation = await generateRecommendation(jd, scored);

    setLoadingStep('Done!', 'Rendering results', 100);
    await sleep(350);

    results = { jdResult: jdResult, candidates: scored.sort((a, b) => b.score - a.score), recommendation: recommendation };
    hideLoading();
    renderResults();
  } catch (err) {
    hideLoading();
    showToast(err.message);
    console.error(err);
  }
}

async function analyzeJD(jd) {
  const prompt = 'You are an expert HR consultant. Analyze this Job Description for quality, clarity, and potential hiring bias.\n\nJD:\n"""\n' + jd + '\n"""\n\nReturn ONLY valid JSON:\n{\n  "score": <number 0-100>,\n  "flags": ["issue 1", "issue 2"],\n  "positives": ["positive 1", "positive 2"],\n  "narrative": "2-3 sentence expert assessment"\n}\n\nScoring: deduct for vague buzzwords, unrealistic requirements, missing compensation, masculine-coded language. Add for clear responsibilities, inclusive language, growth opportunities.';
  return parseJSON(await callGroq(prompt));
}

async function scoreCandidate(jd, candidate) {
  const prompt = 'You are a senior recruiter. Score this candidate against the job description.\n\nJOB DESCRIPTION:\n"""\n' + jd + '\n"""\n\nCANDIDATE: ' + candidate.name + '\nRESUME:\n"""\n' + candidate.text + '\n"""\n\nReturn ONLY valid JSON:\n{\n  "name": "' + candidate.name + '",\n  "score": <number 0-100>,\n  "recommendation": "<exactly one of: Strong Fit, Moderate Fit, Not Fit>",\n  "strengths": ["strength 1", "strength 2", "strength 3"],\n  "gaps": ["gap 1", "gap 2", "gap 3"],\n  "narrative": "2-3 sentence summary referencing specific resume details"\n}\n\nGuide: 70-100 = Strong Fit, 45-69 = Moderate Fit, 0-44 = Not Fit';
  const parsed = parseJSON(await callGroq(prompt));
  parsed.name = candidate.name;
  return parsed;
}

async function generateRecommendation(jd, scored) {
  const summary = scored.map((c, i) => (i + 1) + '. ' + c.name + ' — Score: ' + c.score + ', ' + c.recommendation).join('\n');
  const prompt = 'You are a Chief People Officer. Write a hiring recommendation.\n\nJD Summary: ' + jd.substring(0, 300) + '...\n\nResults:\n' + summary + '\n\nReturn ONLY valid JSON:\n{\n  "shortlist": ["name1", "name2"],\n  "recommendation": "3-4 sentence executive summary with specific hiring recommendation and interview priorities"\n}';
  return parseJSON(await callGroq(prompt));
}

// ===== RENDER RESULTS =====
function renderResults() {
  const res = results.candidates;
  const jdResult = results.jdResult;
  const recommendation = results.recommendation;

  document.getElementById('inputScreen').classList.add('hidden');
  document.getElementById('resultsScreen').classList.remove('hidden');

  const now = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  document.getElementById('resultsMeta').textContent = res.length + ' candidates screened · ' + now + ' · HireIQ Intelligent Screening';

  renderStats(res);
  renderJDPanel(jdResult);
  renderRankings(res);
  renderDetailCards(res);
  renderRecommendation(recommendation, res);

  window.scrollTo({ top: 0, behavior: 'smooth' });
  showToast('Analysis complete — ' + res.length + ' candidates ranked');
}

function scoreColor(s) {
  if (s >= 70) return '#00e5a0';
  if (s >= 45) return '#ffd060';
  return '#ff6060';
}

function recClass(r) {
  if (r === 'Strong Fit') return 'rec-s';
  if (r === 'Moderate Fit') return 'rec-m';
  return 'rec-n';
}

function renderStats(res) {
  const strong = res.filter(r => r.recommendation === 'Strong Fit').length;
  const moderate = res.filter(r => r.recommendation === 'Moderate Fit').length;
  const notfit = res.filter(r => r.recommendation === 'Not Fit').length;
  const avg = res.length ? Math.round(res.reduce((s, r) => s + (Number(r.score)||0), 0) / res.length) : 0;
  document.getElementById('statsGrid').innerHTML =
    '<div class="stat-card"><div class="stat-val" style="color:var(--a1l)">' + res.length + '</div><div class="stat-lbl">Screened</div></div>' +
    '<div class="stat-card"><div class="stat-val" style="color:var(--green)">' + strong + '</div><div class="stat-lbl">Strong Fit</div></div>' +
    '<div class="stat-card"><div class="stat-val" style="color:var(--yellow)">' + moderate + '</div><div class="stat-lbl">Moderate Fit</div></div>' +
    '<div class="stat-card"><div class="stat-val" style="color:var(--red)">' + notfit + '</div><div class="stat-lbl">Not Fit</div></div>' +
    '<div class="stat-card"><div class="stat-val" style="color:var(--text)">' + avg + '</div><div class="stat-lbl">Avg Score</div></div>';
}

function renderJDPanel(jd) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (jd.score / 100) * circ;
  const color = scoreColor(jd.score);
  const flags = (jd.flags || []).map(f => '<span class="chip chip-r">⚠ ' + f + '</span>').join('');
  const positives = (jd.positives || []).map(p => '<span class="chip chip-g">✓ ' + p + '</span>').join('');
  document.getElementById('jdQualityPanel').innerHTML =
    '<div class="jd-card">' +
      '<div class="jd-card-top">' +
        '<div>' +
          '<div class="jd-card-title">JD Quality Analysis</div>' +
          '<div class="jd-card-sub">AI review of clarity, inclusivity, and completeness</div>' +
          '<div class="jd-chips">' + flags + positives + '</div>' +
        '</div>' +
        '<div class="jd-ring">' +
          '<svg viewBox="0 0 90 90">' +
            '<circle cx="45" cy="45" r="' + r + '" class="ring-bg"/>' +
            '<circle cx="45" cy="45" r="' + r + '" class="ring-fg" id="jdRingFg" style="stroke:' + color + ';stroke-dasharray:' + circ + ';stroke-dashoffset:' + circ + '"/>' +
          '</svg>' +
          '<div class="jd-ring-num" style="color:' + color + '">' + jd.score + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="jd-narrative">' + jd.narrative + '</div>' +
    '</div>';
  setTimeout(function() {
    const el = document.getElementById('jdRingFg');
    if (el) el.style.strokeDashoffset = offset;
  }, 120);
}

function renderRankings(res) {
  const rows = res.map(function(r, i) {
    const badge = i === 0 ? 'rb1' : i === 1 ? 'rb2' : i === 2 ? 'rb3' : 'rbn';
    return '<div class="rank-row" data-rec="' + r.recommendation + '" onclick="scrollToCard(' + i + ')">' +
      '<div><span class="rank-badge ' + badge + '">' + (i + 1) + '</span></div>' +
      '<div class="rank-name">' + escHtml(r.name) + '</div>' +
      '<div class="score-cell">' +
        '<span class="score-n" style="color:' + scoreColor(r.score) + '">' + r.score + '</span>' +
        '<div class="score-bar"><div class="score-fill" style="width:0%;background:' + scoreColor(r.score) + '" data-w="' + r.score + '"></div></div>' +
      '</div>' +
      '<div style="font-size:0.75rem;color:var(--dim)">' + (r.strengths ? r.strengths.length : 0) + ' strengths</div>' +
      '<div><span class="rec ' + recClass(r.recommendation) + '">' + r.recommendation + '</span></div>' +
    '</div>';
  }).join('');
  document.getElementById('rankingsWrap').innerHTML =
    '<div class="rank-head"><div>#</div><div>Candidate</div><div>Score</div><div>Strengths</div><div>Fit</div></div>' + rows;
  setTimeout(function() {
    document.querySelectorAll('.score-fill').forEach(function(b) {
      b.style.transition = 'width 1.2s cubic-bezier(0.4,0,0.2,1)';
      b.style.width = b.dataset.w + '%';
    });
  }, 100);
}

function renderDetailCards(res) {
  document.getElementById('detailGrid').innerHTML = res.map(function(r, i) {
    const strengths = (r.strengths || []).map(s => '<li>' + s + '</li>').join('') || '<li>No significant strengths detected</li>';
    const gaps = (r.gaps || []).map(g => '<li>' + g + '</li>').join('') || '<li>No major gaps detected</li>';
    const note = r.narrative ? '<div class="dc-note">"' + r.narrative + '"</div>' : '';
    return '<div class="dc" id="card-' + i + '">' +
      '<div class="dc-top">' +
        '<div><div class="dc-name">' + escHtml(r.name) + '</div>' +
        '<div class="dc-sub">Rank #' + (i + 1) + '</div></div>' +
        '<div class="dc-score" style="color:' + scoreColor(r.score) + '">' + r.score + '</div>' +
      '</div>' +
      '<div class="dc-div"></div>' +
      '<div class="dc-lbl s">Key Strengths</div>' +
      '<ul class="dc-pts s">' + strengths + '</ul>' +
      '<div class="dc-lbl g" style="margin-top:0.9rem">Key Gaps</div>' +
      '<ul class="dc-pts g">' + gaps + '</ul>' +
      note +
    '</div>';
  }).join('');
}

function renderRecommendation(rec, res) {
  const shortlist = rec.shortlist || res.filter(r => r.recommendation === 'Strong Fit').map(r => r.name);
  const chips = shortlist.map(n => '<span class="shortlist-chip">✓ ' + escHtml(n) + '</span>').join('');
  document.getElementById('recPanel').innerHTML =
    '<div class="rec-panel-title">🎯 Hiring Recommendation</div>' +
    '<div class="rec-panel-body">' + rec.recommendation + '</div>' +
    '<div class="shortlist-row"><span class="shortlist-lbl">Shortlist:</span>' + chips + '</div>';
}

function scrollToCard(i) {
  const el = document.getElementById('card-' + i);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ===== FILTER =====
function filterBy(type, btn) {
  document.querySelectorAll('.filt').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.rank-row').forEach(row => {
    if (type === 'all' || row.dataset.rec === type) row.classList.remove('out');
    else row.classList.add('out');
  });
}

// ===== EXPORT CSV =====
function exportCSV() {
  if (!results) return;
  var short = function(s) { return s && s.length > 100 ? s.substring(0, 97) + '...' : (s || ''); };
  var rows = [['Rank','Name','Score','Recommendation','Strength 1','Strength 2','Strength 3','Gap 1','Gap 2','Gap 3','Summary']];
  results.candidates.forEach(function(r, i) {
    var s = r.strengths || [];
    var g = r.gaps || [];
    rows.push([i+1, r.name, r.score, r.recommendation, s[0]||'', s[1]||'', s[2]||'', g[0]||'', g[1]||'', g[2]||'', short(r.narrative)]);
  });
  var csv = rows.map(function(r) { return r.map(function(v) { return '"' + String(v).replace(/"/g,'""') + '"'; }).join(','); }).join('\n');
  var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'hireiq-' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
  showToast('CSV exported');
}
// ===== BACK =====
function goBack() {
  results = null;
  candidates = [];
  document.getElementById('candidateList').innerHTML = '';
  document.getElementById('jdInput').value = '';
  updatePill();
  document.getElementById('resultsScreen').classList.add('hidden');
  document.getElementById('inputScreen').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== LOADING =====
function showLoading() { document.getElementById('loadingScreen').classList.remove('hidden'); }
function hideLoading() { document.getElementById('loadingScreen').classList.add('hidden'); }
function setLoadingStep(step, detail, pct) {
  document.getElementById('lsStep').textContent = step;
  document.getElementById('lsDetail').textContent = detail;
  document.getElementById('lsBar').style.width = pct + '%';
}
function sleep(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }

// ===== TOAST =====
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(function() { t.classList.remove('show'); setTimeout(() => t.classList.add('hidden'), 300); }, 3200);
}

// ===== DEMO DATA =====
const DEMO_JD = 'Growth Marketing Intern — Founders Office\n\nWe are looking for a high-agency Growth Marketing Intern to join our Founders Office at a fast-growing fintech startup.\n\nResponsibilities:\n- Own acquisition, activation, and retention experiments end-to-end\n- Run A/B tests across landing pages, onboarding flows, and email campaigns\n- Build and maintain KPI dashboards tracking CAC, LTV, and ROMI\n- Conduct cohort analysis to identify churn drivers and retention opportunities\n\nRequirements:\n- 1-2 years of experience in growth marketing or operations\n- Strong analytical skills — proficient in SQL, Google Sheets, or Excel\n- Experience with funnel analysis, A/B testing, and cohort analysis\n- Familiarity with tools like Google Analytics, Mixpanel, or Amplitude\n\nCompensation: Rs 30,000 - 60,000/month based on experience';

const DEMO_RESUMES = [
  { name: 'Priya Sharma', text: 'Growth Marketing Analyst | 2 years\n\nGroww (Jan 2023–Present)\n- Ran 40+ A/B tests on onboarding flows, improving activation by 23%\n- Built cohort dashboards in SQL tracking CAC, LTV, ROMI\n- Reduced churn by 18% through retention campaigns\n\nSkills: SQL, Google Analytics, Mixpanel, Excel, A/B Testing, Cohort Analysis' },
  { name: 'Arjun Mehta', text: 'Software Developer | 1.5 years\n\nTCS (Aug 2023–Present)\n- Built REST APIs using Node.js\n- Maintained MySQL databases\n\nSkills: JavaScript, React, Node.js, SQL, Git\nEducation: B.Tech CS, VIT 2023' },
  { name: 'Sneha Kapoor', text: 'Operations & Growth | Startup Experience\n\nUnacademy (Oct 2023–Jan 2024)\n- 15% conversion lift through funnel optimization and A/B testing\n- Built CAC, LTV, ROMI data models\n- Improved retention 12% through cohort analysis\n\nSkills: Google Analytics, Excel, Cohort Analysis, Funnel Analysis, A/B Testing, SQL' },
  { name: 'Ananya Singh', text: 'Product & Growth Analyst | 2 years\n\nRazorpay (Mar 2023–Present)\n- Improved D7 merchant activation by 31%\n- 25+ experiments via Optimizely\n- Amplitude dashboards for retention cohorts\n- Referral program drove 8% new signups\n\nSkills: SQL, Amplitude, Mixpanel, Google Analytics, Python, A/B Testing' }
];

function loadDemo() {
  candidates = [];
  document.getElementById('candidateList').innerHTML = '';
  document.getElementById('jdInput').value = DEMO_JD;
  const words = DEMO_JD.split(/\s+/).filter(Boolean).length;
  document.getElementById('jdWordCount').textContent = words + ' words';
  DEMO_RESUMES.forEach(r => addCandidate(r.name, r.text, 'demo'));
  showToast('Demo loaded — click Start Screening');
}
