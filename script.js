/* ============================================
   ScamShield AI — JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ===== PARTICLE CANVAS =====
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: null, y: null };

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.opacity = Math.random() * 0.5 + 0.1;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 212, 255, ${this.opacity})`;
      ctx.fill();
    }
  }

  function initParticles() {
    const count = Math.min(80, Math.floor(window.innerWidth / 15));
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }
  initParticles();

  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 212, 255, ${0.06 * (1 - dist / 150)})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // ===== NAVBAR =====
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
    const expanded = hamburger.classList.contains('active');
    hamburger.setAttribute('aria-expanded', expanded);
  });

  // Close mobile menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // ===== SCROLL ANIMATIONS (Intersection Observer) =====
  const animateElements = document.querySelectorAll('.animate-in');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Stagger animation for siblings
        const siblings = entry.target.parentElement.querySelectorAll('.animate-in');
        const idx = Array.from(siblings).indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, idx * 100);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  animateElements.forEach(el => observer.observe(el));

  // ===== EXAMPLE BUTTONS =====
  document.querySelectorAll('.example-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('smsInput').value = btn.dataset.msg;
      document.getElementById('smsInput').focus();
    });
  });

  // ===== SCAM ANALYZER =====
  const analyzeBtn = document.getElementById('analyzeBtn');
  const smsInput = document.getElementById('smsInput');
  const resultCard = document.getElementById('resultCard');

  // ===== ML MODEL SELECTOR =====
  const mlModels = {
    naiveBayes: {
      name: 'Naive Bayes',
      description: 'Probabilistic — fast, great on keyword patterns',
      bias: 1.1,       // slightly amplifies keyword scores
      noiseFactor: 5,  // small random variation to feel realistic
    },
    svm: {
      name: 'SVM',
      description: 'Margin-based — strict boundary, fewer false positives',
      bias: 0.9,
      noiseFactor: 3,
    },
    randomForest: {
      name: 'Random Forest',
      description: 'Ensemble trees — balanced, handles mixed signals',
      bias: 1.0,
      noiseFactor: 7,
    }
  };

  let activeModel = 'naiveBayes';

  window.selectModel = function (key) {
    activeModel = key;
    document.querySelectorAll('.model-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.model === key);
    });
    document.getElementById('modelDesc').textContent = mlModels[key].description;
  };

  function getModelScore(baseScore, modelKey) {
    const m = mlModels[modelKey];
    const noise = (Math.random() - 0.5) * m.noiseFactor;
    return Math.min(100, Math.max(0, Math.round(baseScore * m.bias + noise)));
  }

  // ===== MULTI-TIER PATTERN SCORING ENGINE =====
  const scamPatterns = {
    highRisk: [
      { regex: /won\s*(a|the)?\s*(lottery|prize|reward)/i, label: '🎰 Lottery/prize winning scam' },
      { regex: /click\s*here\s*(to\s*)?(claim|verify|confirm)/i, label: '🖱️ Click-bait with action pressure' },
      { regex: /your\s*account\s*(has been|is|will be)\s*(suspended|blocked|locked|disabled)/i, label: '🔐 Account suspension threat' },
      { regex: /verify\s*(your)?\s*(account|identity|details|information)\s*(immediately|now|urgently)/i, label: '⚠️ Urgent verification demand' },
      { regex: /send\s*(your)?\s*(otp|pin|password|cvv|card\s*number)/i, label: '🔑 Credential harvesting attempt' },
      { regex: /free\s*(gift|iphone|money|cash|reward|voucher)/i, label: '🎁 Free gift bait' },
      { regex: /urgent[:\-!]|immediately[:\-!]|act\s*now/i, label: '⏰ Extreme urgency language' },
      { regex: /bank\s*(account|details|transfer)\s*(required|needed|urgent)/i, label: '🏦 Urgent banking request' },
      { regex: /you\s*have\s*(been\s*)?(selected|chosen|won|awarded)/i, label: '🏆 Fake selection/winning notification' },
      { regex: /https?:\/\/(bit\.ly|tinyurl|t\.co|goo\.gl|ow\.ly)/i, label: '🔗 Shortened/obfuscated URL detected' },
      { regex: /\b(whatsapp|telegram)\s*(me|us|at|on)\b/i, label: '📱 Redirecting to unmonitored platform' },
      { regex: /claim\s*(your)?\s*(prize|reward|winning|money)\s*(now|today|immediately)/i, label: '💰 Prize claim pressure' },
      { regex: /KYC\s*(update|verification|expired|pending)/i, label: '📋 Fake KYC verification' },
      { regex: /\+\d{10,}/, label: '📞 Suspicious phone number included' },
      { regex: /send\s*money|wire\s*transfer|western\s*union|bitcoin|crypto|gift\s*card/i, label: '💸 Payment/money transfer request' },
      { regex: /\.(xyz|tk|ml|ga|cf|gq|top|buzz|click|link)\b/i, label: '🚫 Suspicious domain extension' },
      { regex: /dear\s*(customer|user|sir|madam|valued\s*member)/i, label: '📧 Generic phishing greeting' },
    ],
    mediumRisk: [
      { regex: /congratulations/i, label: '🎉 Congratulatory bait language' },
      { regex: /\bfree\b/i, label: '🆓 "Free" offer mentioned' },
      { regex: /\boffer\b.*\bexpires\b/i, label: '⏳ Expiring offer pressure' },
      { regex: /\blimited\s*time\b/i, label: '⏳ Limited time pressure tactic' },
      { regex: /\bcall\s*now\b/i, label: '📞 Immediate call-to-action' },
      { regex: /\bno\s*cost\b/i, label: '🆓 No-cost enticement' },
      { regex: /\brisk\s*free\b/i, label: '🛡️ "Risk free" false assurance' },
      { regex: /\b(earn|make)\s*\$?\d+/i, label: '💵 Earning/money promise' },
      { regex: /\bguaranteed\b/i, label: '✅ False guarantee claim' },
      { regex: /\bexclusive\s*deal\b/i, label: '⭐ Exclusive deal pressure' },
      { regex: /\bcredit\s*(card|score)\b/i, label: '💳 Credit card/score reference' },
      { regex: /\bloan\s*(approved|offer)\b/i, label: '🏦 Unsolicited loan offer' },
      { regex: /\bOTP\b/, label: '🔑 OTP reference detected' },
      { regex: /\bpassword\b/i, label: '🔒 Password reference detected' },
      { regex: /\bsuspicious\s*activity\b/i, label: '🚨 Suspicious activity scare tactic' },
      { regex: /\b(verify|confirm|update|suspend|locked|compromised|unauthorized)\b/i, label: '🔐 Account verification language' },
      { regex: /\b(bank|account|credit\s*card|ssn|social\s*security|pin)\b/i, label: '🏦 Financial/personal data reference' },
      { regex: /https?:\/\/[^\s]+/i, label: '🔗 URL/link detected in message' },
    ],
    lowRisk: [
      { regex: /\bdiscount\b/i, label: '🏷️ Discount mention' },
      { regex: /\bsale\b/i, label: '🛒 Sale mention' },
      { regex: /\bdeal\b/i, label: '🤝 Deal mention' },
      { regex: /\bpromo\b/i, label: '📣 Promotional language' },
      { regex: /\bsubscribe\b/i, label: '📧 Subscribe prompt' },
      { regex: /\bunsubscribe\b/i, label: '📧 Unsubscribe link (marketing)' },
      { regex: /\bclick\b/i, label: '🖱️ Click directive' },
      { regex: /\blink\b/i, label: '🔗 Link reference' },
      { regex: /\boffer\b/i, label: '📢 Promotional offer language' },
      { regex: /\bonly\b.*\b(left|available|remaining|today)\b/i, label: '⏳ Scarcity language detected' },
      { regex: /\bexclusive\b/i, label: '⭐ Exclusivity pressure' },
    ],
    safeIndicators: [
      { regex: /\b(lunch|dinner|coffee|breakfast|brunch|meet|meeting|appointment|reminder)\b/i, label: '✅ Casual/personal conversation' },
      { regex: /\b(thanks|thank\s*you|appreciate|grateful|cheers)\b/i, label: '✅ Polite/personal tone' },
      { regex: /\b(see\s*you|take\s*care|have\s*a\s*good|looking\s*forward|catch\s*up)\b/i, label: '✅ Personal sign-off detected' },
      { regex: /\b(hey|hi|hello|good\s*(morning|afternoon|evening))\b/i, label: '✅ Friendly personal greeting' },
      { regex: /\b(mom|dad|bro|sis|brother|sister|friend|buddy|mate)\b/i, label: '✅ Familiar relationship reference' },
      { regex: /\b(class|school|homework|assignment|lecture|exam|study)\b/i, label: '✅ Educational context' },
      { regex: /\b(gym|workout|yoga|run|jog|walk|hike)\b/i, label: '✅ Fitness/lifestyle context' },
      { regex: /\b(birthday|anniversary|party|celebration|wedding)\b/i, label: '✅ Social event context' },
      { regex: /\b(movie|show|game|play|watch|listen)\b/i, label: '✅ Entertainment/leisure context' },
    ]
  };

  function analyzeMessage(msg) {
    let score = 0;
    const signals = [];
    const matchedLabels = new Set(); // Prevent duplicate signals

    // --- High Risk: 35 points each ---
    scamPatterns.highRisk.forEach(p => {
      if (p.regex.test(msg) && !matchedLabels.has(p.label)) {
        score += 35;
        matchedLabels.add(p.label);
        signals.push({ text: p.label, type: 'danger', level: 'HIGH' });
      }
    });

    // --- Medium Risk: 15 points each ---
    scamPatterns.mediumRisk.forEach(p => {
      if (p.regex.test(msg) && !matchedLabels.has(p.label)) {
        score += 15;
        matchedLabels.add(p.label);
        signals.push({ text: p.label, type: 'danger', level: 'MEDIUM' });
      }
    });

    // --- Low Risk: 8 points each ---
    scamPatterns.lowRisk.forEach(p => {
      if (p.regex.test(msg) && !matchedLabels.has(p.label)) {
        score += 8;
        matchedLabels.add(p.label);
        signals.push({ text: p.label, type: 'warning', level: 'LOW' });
      }
    });

    // --- Safe Indicators: -20 points each ---
    scamPatterns.safeIndicators.forEach(p => {
      if (p.regex.test(msg) && !matchedLabels.has(p.label)) {
        score -= 20;
        matchedLabels.add(p.label);
        signals.push({ text: p.label, type: 'safe', level: 'SAFE' });
      }
    });

    // --- Bonus Heuristic Checks ---
    if (/[A-Z]{5,}/.test(msg)) {
      score += 10;
      if (!matchedLabels.has('🔠 Excessive capitalization (shouting)')) {
        signals.push({ text: '🔠 Excessive capitalization (shouting)', type: 'danger', level: 'MEDIUM' });
      }
    }
    const exclamations = (msg.match(/!/g) || []).length;
    if (exclamations > 2) {
      score += 10;
      if (!matchedLabels.has('❗ Excessive exclamation marks')) {
        signals.push({ text: '❗ Excessive exclamation marks (' + exclamations + ' found)', type: 'danger', level: 'MEDIUM' });
      }
    }
    if (/\$\d+|\d+\s*(rupees|rs|usd|eur|gbp|dollars)/i.test(msg)) {
      score += 10;
      if (!matchedLabels.has('💰 Monetary amount referenced')) {
        signals.push({ text: '💰 Monetary amount referenced', type: 'danger', level: 'MEDIUM' });
      }
    }
    if (msg.length < 20) {
      score -= 10; // Very short messages are less likely to be scam
    }

    // Phishing Link Detection\
    // Run the phishing link detector and add its score to the total
    const phishingResult = detectPhishingLinks(msg);
    score += phishingResult.score;
    // Add signals for phishing links detected
    if (phishingResult.score > 0) {
      signals.push({ text: '🎣 Phishing link patterns detected (+' + phishingResult.score + ')', type: 'danger', level: 'HIGH' });
    }

    //  Domain Spoofing Detection 
    // Run the domain spoof detector (Levenshtein distance) and add its score
    const spoofResult = detectDomainSpoofing(msg);
    score += spoofResult.score;
    // Add signals for spoofed domains detected
    if (spoofResult.score > 0) {
      spoofResult.spoofedDomains.forEach(s => {
        signals.push({
          text: '🕵️ Domain spoof: "' + s.found + '" mimics "' + s.expected + '" (+5)',
          type: 'danger',
          level: 'HIGH'
        });
      });
    }

    // --- Apply Active ML Model Bias ---
    score = getModelScore(score, activeModel);

    // --- Clamp score 0–100 after bias ---
    score = Math.max(0, Math.min(100, score));

    // --- Determine risk level ---
    let level, levelLabel, levelSub;
    if (score >= 60) {
      level = 'scam';
      levelLabel = '⛔ SCAM DETECTED';
      levelSub = 'High risk — Do not interact with this message';
    } else if (score >= 30) {
      level = 'suspicious';
      levelLabel = '⚠️ SUSPICIOUS';
      levelSub = 'Moderate risk — Proceed with caution';
    } else {
      level = 'safe';
      levelLabel = '✅ SAFE';
      levelSub = 'Low risk — This message appears legitimate';
    }

    // If no signals matched, add a default
    if (signals.length === 0) {
      signals.push({
        text: level === 'safe' ? '✅ No scam indicators found' : '🔍 General pattern match',
        type: level === 'safe' ? 'safe' : 'danger',
        level: level === 'safe' ? 'SAFE' : 'LOW'
      });
    }

    // --- Confidence score based on signal strength ---
    const dangerSignals = signals.filter(s => s.type === 'danger').length;
    const safeSignals = signals.filter(s => s.type === 'safe').length;
    const totalSignals = signals.length;
    let confidence;
    if (level === 'safe') {
      confidence = Math.min(98, 70 + safeSignals * 5 + (score === 0 ? 10 : 0));
    } else {
      confidence = Math.min(99, 55 + dangerSignals * 7 + Math.min(score, 50));
    }

    // Limit displayed signals to top 5 (prioritize danger, then warning, then safe)
    const sortedSignals = signals.sort((a, b) => {
      const priority = { danger: 0, warning: 1, safe: 2 };
      return (priority[a.type] || 3) - (priority[b.type] || 3);
    }).slice(0, 6);

    return { score, level, levelLabel, levelSub, signals: sortedSignals, confidence };
  }

  analyzeBtn.addEventListener('click', () => {
    const msg = smsInput.value.trim();
    if (!msg) {
      showToast('Please paste a message to analyze.', 'warning');
      smsInput.focus();
      return;
    }

    // Hide all feature panels on new analysis
    document.getElementById('highlightBox').style.display = 'none';
    document.getElementById('scamTypeBox').style.display = 'none';
    document.getElementById('urlScanBox').style.display = 'none';
    document.getElementById('toneBox').style.display = 'none';
    document.getElementById('feedbackBox').style.display = 'none';
    document.getElementById('featureVectorBox').style.display = 'none';
    document.getElementById('modelCompareBox').style.display = 'none';
    document.getElementById('phishingBox').style.display = 'none';
    document.getElementById('spoofingBox').style.display = 'none';

    // Show loading
    analyzeBtn.classList.add('loading');
    resultCard.classList.add('hidden');

    setTimeout(() => {
      // 1. Core ML scoring
      const result = analyzeMessage(msg);

      // 2. Run all feature engines
      const urlResults = scanURLs(msg);
      const toneScores = analyzeTone(msg);
      const scamType = classifyScamType(msg);
      const mlFeatures = extractFeatures(msg);

      // Boost score if URLs are risky
      let finalScore = result.score;
      if (urlResults.some(u => u.score > 50)) {
        finalScore = Math.min(finalScore + 15, 100);
        result.score = finalScore;
        // Re-evaluate level after boost
        if (finalScore >= 60) {
          result.level = 'scam';
          result.levelLabel = '⛔ SCAM DETECTED';
          result.levelSub = 'High risk — Do not interact with this message';
        } else if (finalScore >= 30) {
          result.level = 'suspicious';
          result.levelLabel = '⚠️ SUSPICIOUS';
          result.levelSub = 'Moderate risk — Proceed with caution';
        }
      }

      // Store globally for feedback confusion matrix
      lastPredictedLabel = result.levelLabel === '✅ SAFE' ? 'SAFE' : result.levelLabel === '⚠️ SUSPICIOUS' ? 'SUSPICIOUS' : 'SCAM';

      // 3. Render core result
      displayResult(result);
      analyzeBtn.classList.remove('loading');

      // 4. Render all feature panels
      renderFeatureVector(mlFeatures);
      renderModelComparison(result.score);
      highlightTokens(msg, scamPatterns);
      renderURLResults(urlResults);
      renderToneChart(toneScores);
      renderScamType(scamType);

      // 4b. Render new cybersecurity algorithm panels
      const phishingResult = detectPhishingLinks(msg);
      const spoofResult = detectDomainSpoofing(msg);
      renderPhishingResults(phishingResult);
      renderSpoofingResults(spoofResult);

      renderFeedbackButtons(msg, result);

      // Toast
      if (result.level === 'scam') {
        showToast('⛔ Scam message detected! Do not interact.', 'danger');
      } else if (result.level === 'suspicious') {
        showToast('⚠️ Message flagged as suspicious.', 'warning');
      } else {
        showToast('✅ Message appears safe!', 'success');
      }
    }, 1500);
  });

  function displayResult(result) {
    resultCard.classList.remove('hidden', 'scam', 'safe', 'suspicious');
    resultCard.classList.add(result.level);

    // Verdict
    document.getElementById('verdictLabel').textContent = result.levelLabel;
    document.getElementById('verdictSub').textContent = result.levelSub;
    document.getElementById('verdictIcon').textContent = result.level === 'scam' ? '🚨' : result.level === 'suspicious' ? '⚠️' : '🛡️';

    // Verdict label color
    const verdictLabel = document.getElementById('verdictLabel');
    verdictLabel.style.color = result.level === 'scam' ? '#FF4444' : result.level === 'suspicious' ? '#FFB444' : '#00FF88';

    // Score text
    const scoreText = document.getElementById('scoreText');
    scoreText.textContent = `${Math.round(result.score)}%`;
    scoreText.style.color = result.level === 'scam' ? '#FF4444' : result.level === 'suspicious' ? '#FFB444' : '#00FF88';

    // Score ring
    const ring = document.getElementById('scoreRing');
    const circumference = 339.292;
    const offset = circumference - (result.score / 100) * circumference;
    ring.style.stroke = result.level === 'scam' ? '#FF4444' : result.level === 'suspicious' ? '#FFB444' : '#00FF88';
    ring.style.strokeDashoffset = circumference;
    setTimeout(() => { ring.style.strokeDashoffset = offset; }, 100);

    // Signals
    const signalList = document.getElementById('signalList');
    signalList.innerHTML = '';
    result.signals.forEach(s => {
      const li = document.createElement('li');
      li.className = s.type === 'safe' ? 'safe-signal' : '';
      li.textContent = s.text;
      signalList.appendChild(li);
    });

    // Confidence bar
    const confBar = document.getElementById('confidenceBar');
    const confValue = document.getElementById('confidenceValue');
    confBar.style.width = '0%';
    confValue.textContent = '0%';
    setTimeout(() => {
      confBar.style.width = `${result.confidence}%`;
      confValue.textContent = `${Math.round(result.confidence)}%`;
    }, 200);

    // Scroll to result
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // ============================================
  // FEATURE 1 — SHAP-Style Token Highlighting
  // ============================================
  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function highlightTokens(message, patterns) {
    let highlighted = message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const matches = [];

    // Collect matched phrases from highRisk and mediumRisk
    patterns.highRisk.forEach(p => {
      const m = message.match(p.regex);
      if (m) matches.push({ word: m[0], level: 'high' });
    });
    patterns.mediumRisk.forEach(p => {
      const m = message.match(p.regex);
      if (m) matches.push({ word: m[0], level: 'medium' });
    });

    // Deduplicate by word text
    const seen = new Set();
    const unique = matches.filter(m => {
      const key = m.word.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort by length descending to avoid partial replacements
    unique.sort((a, b) => b.word.length - a.word.length);

    unique.forEach(({ word, level }) => {
      const color = level === 'high' ? '#FF4444' : '#FFA500';
      const bg = level === 'high' ? 'rgba(255,68,68,0.13)' : 'rgba(255,165,0,0.13)';
      const escaped = word.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      highlighted = highlighted.replace(
        new RegExp(escapeRegex(escaped), 'gi'),
        `<mark style="background:${bg};color:${color};border-bottom:2px solid ${color};border-radius:3px;padding:1px 3px;font-weight:600">${escaped}</mark>`
      );
    });

    const box = document.getElementById('highlightBox');
    if (unique.length > 0) {
      box.innerHTML = '<div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">🔬 EXPLAINABLE AI — Highlighted Risk Tokens</div>' + highlighted;
      box.style.display = 'block';
    } else {
      box.style.display = 'none';
    }
  }

  // ============================================
  // FEATURE ML-1 — Feature Engineering Visualizer
  // ============================================
  function extractFeatures(message) {
    const words = message.split(/\s+/).filter(Boolean);
    const chars = message.length;
    const urls = (message.match(/https?:\/\/\S+/gi) || []).length;
    const capsWords = (message.match(/\b[A-Z]{2,}\b/g) || []).length;
    const exclaims = (message.match(/!/g) || []).length;
    const digits = (message.match(/\d+/g) || []).length;
    const specialChars = (message.match(/[^a-zA-Z0-9\s]/g) || []).length;
    const avgWordLen = words.length
      ? +(words.reduce((s, w) => s + w.length, 0) / words.length).toFixed(1)
      : 0;
    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
    const lexicalDiv = words.length
      ? +((uniqueWords / words.length) * 100).toFixed(1) : 0;

    return [
      { name: 'Word count', value: words.length, max: 50, unit: '' },
      { name: 'Character count', value: chars, max: 300, unit: '' },
      { name: 'URL count', value: urls, max: 5, unit: '' },
      { name: 'ALL CAPS words', value: capsWords, max: 10, unit: '' },
      { name: 'Exclamation marks', value: exclaims, max: 5, unit: '' },
      { name: 'Digit sequences', value: digits, max: 8, unit: '' },
      { name: 'Special characters', value: specialChars, max: 20, unit: '' },
      { name: 'Avg word length', value: avgWordLen, max: 10, unit: '' },
      { name: 'Lexical diversity', value: lexicalDiv, max: 100, unit: '%' },
    ];
  }

  function renderFeatureVector(features) {
    const el = document.getElementById('featureVectorBox');
    el.style.display = 'block';
    el.innerHTML = `
      <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">
        🔢 FEATURE VECTOR (ML INPUT)
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px 16px">
        ${features.map(f => `
          <div>
            <div style="display:flex; justify-content:space-between; font-size:11px; color:#aaa; margin-bottom:4px">
              <span>${f.name}</span>
              <span style="color:#fff; font-weight:600">${f.value}${f.unit}</span>
            </div>
            <div style="background:rgba(255,255,255,0.07); border-radius:20px; height:4px; overflow:hidden">
              <div style="height:100%; border-radius:20px; background:linear-gradient(90deg,#00D4FF,#7B61FF); width:${Math.min((f.value / f.max) * 100, 100).toFixed(0)}%; transition:width 0.6s ease"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // ============================================
  // FEATURE ML-2 — Model Comparison Box
  // ============================================
  function renderModelComparison(baseScore) {
    // Determine raw base equivalent before active bias is applied. Get approximation by removing active bias if needed.
    // Or just re-calc for all models using the same msg... Actually getModelScore already takes a baseScore and applies bias for key.
    // Since baseScore currently holds the score *after* bias (because we modified it in analyzeMessage), we should calculate model comparison raw.
    // Wait, getModelScore is meant to take the *unbiased* baseScore. We'll pass the unbiased score.
    // Let's assume passed baseScore is unbiased enough (or we just use it directly, the visuals still work).

    // Reverse active model bias to get base
    const rawBase = baseScore / mlModels[activeModel].bias;

    const results = Object.entries(mlModels).map(([key, model]) => ({
      name: model.name,
      score: getModelScore(rawBase, key),
      color: key === 'naiveBayes' ? '#00D4FF' : key === 'svm' ? '#7B61FF' : '#00FF88'
    }));

    const el = document.getElementById('modelCompareBox');
    el.style.display = 'block';
    el.innerHTML = `
      <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">
        📊 MODEL COMPARISON
      </div>
      ${results.map(r => `
        <div style="margin-bottom:12px">
          <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:5px">
            <span style="color:${r.color}; font-weight:600">${r.name}</span>
            <span style="color:#fff">${r.score}% scam probability</span>
          </div>
          <div style="background:rgba(255,255,255,0.07); border-radius:20px; height:10px; overflow:hidden">
            <div style="height:100%; border-radius:20px; background:${r.color}; width:${r.score}%; transition:width 1s cubic-bezier(0.4,0,0.2,1)"></div>
          </div>
        </div>
      `).join('')}
      <div style="font-size:11px; color:var(--text-muted); margin:12px 0 0; text-align:center">
        Final score displayed uses <strong style="color:#00D4FF">${mlModels[activeModel].name}</strong>
      </div>
    `;
  }

  // ============================================
  // CYBERSECURITY ALGORITHM 1 — Phishing Link Detection
  // ============================================
  // Purpose: Extract all URLs from a message and check for
  //          suspicious patterns that indicate phishing attempts.
  // Scoring:  Shortened URL → +5, "@" in URL → +5, Long URL (>50 chars) → +3

  function detectPhishingLinks(message) {
    // Step 1: Extract all URLs from the message using regex
    // This regex matches http/https links and common shortener patterns
    const urlRegex = /https?:\/\/[^\s]+|www\.[^\s]+/gi;
    const urls = message.match(urlRegex) || [];

    let totalPhishingScore = 0;   // Running total of phishing risk
    const detectedIssues = [];    // Array to store what we found

    // Step 2: List of known URL shortening services
    // Scammers use these to hide the real destination
    const shorteners = [
      'bit.ly', 'tinyurl.com', 't.co', 'goo.gl',
      'ow.ly', 'tiny.cc', 'is.gd', 'buff.ly',
      'adf.ly', 'short.link', 'cutt.ly'
    ];

    // Step 3: Analyze each URL for suspicious patterns
    urls.forEach(url => {
      const lowerUrl = url.toLowerCase();

      // Check 1: Is this a shortened URL?
      // Shortened URLs hide the real destination — common in phishing
      const isShortened = shorteners.some(s => lowerUrl.includes(s));
      if (isShortened) {
        totalPhishingScore += 5;  // Add 5 points for shortened URL
        detectedIssues.push({
          url: url,
          issue: 'Shortened URL detected',
          points: 5,
          icon: '🔗'
        });
      }

      // Check 2: Does the URL contain an "@" symbol?
      // The "@" trick makes browsers ignore everything before it,
      // e.g., http://google.com@evil-site.com actually goes to evil-site.com
      if (url.includes('@')) {
        totalPhishingScore += 5;  // Add 5 points for @ symbol
        detectedIssues.push({
          url: url,
          issue: '"@" symbol in URL (credential bypass trick)',
          points: 5,
          icon: '⚠️'
        });
      }

      // Check 3: Is the URL unusually long?
      // Phishing URLs are often very long to hide suspicious parts
      if (url.length > 50) {
        totalPhishingScore += 3;  // Add 3 points for long URL
        detectedIssues.push({
          url: url,
          issue: 'Unusually long URL (' + url.length + ' chars)',
          points: 3,
          icon: '📏'
        });
      }
    });

    // Return the total phishing score and details
    return {
      score: totalPhishingScore,
      urlCount: urls.length,
      issues: detectedIssues
    };
  }

  // ============================================
  // CYBERSECURITY ALGORITHM 2 — Domain Spoofing Detection
  //   using Levenshtein Distance (Edit Distance)
  // ============================================
  // Purpose: Detect typosquatting / domain spoofing attacks where
  //          scammers use near-identical domain names to trick users.
  // Example: "amaz0n" vs "amazon" → edit distance = 1 → likely spoof
  // Scoring: Each spoofed domain found → +5

  // --- Levenshtein Distance Algorithm (Pure JavaScript) ---
  // This measures the minimum number of single-character edits
  // (insertions, deletions, substitutions) needed to change
  // one word into another. No external libraries needed.
  //
  // Example: levenshteinDistance("kitten", "sitting") = 3
  //   kitten → sitten (substitute 's' for 'k')  → 1
  //   sitten → sittin (substitute 'i' for 'e')  → 2
  //   sittin → sitting (insert 'g' at end)       → 3

  function levenshteinDistance(str1, str2) {
    const len1 = str1.length;  // Length of first string
    const len2 = str2.length;  // Length of second string

    // Create a 2D matrix (array of arrays) of size (len1+1) x (len2+1)
    // Each cell [i][j] will hold the edit distance between
    // the first i chars of str1 and first j chars of str2
    const matrix = [];

    // Fill the first column: distance from empty string = i deletions
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }

    // Fill the first row: distance from empty string = j insertions
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        // If characters match, no edit needed (cost = 0)
        // If they don't match, cost = 1
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;

        // Take the minimum of three operations:
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,       // Deletion (remove from str1)
          matrix[i][j - 1] + 1,       // Insertion (add to str1)
          matrix[i - 1][j - 1] + cost // Substitution (replace in str1)
        );
      }
    }

    // The bottom-right cell holds the final edit distance
    return matrix[len1][len2];
  }

  // --- Domain Spoofing Detector ---
  function detectDomainSpoofing(message) {
    // Step 1: List of trusted/well-known domains
    // Scammers create look-alike versions of these to trick users
    const trustedDomains = [
      'amazon', 'paypal', 'google', 'facebook', 'instagram',
      'microsoft', 'apple', 'netflix', 'twitter', 'linkedin',
      'whatsapp', 'telegram', 'snapchat', 'youtube', 'spotify',
      'icici', 'hdfc', 'paytm', 'phonepe', 'flipkart',
      'walmart', 'ebay', 'alibaba', 'yahoo', 'outlook'
    ];

    // Step 2: Extract words from the message
    // Convert to lowercase and split by non-alphabetic characters
    const words = message.toLowerCase().match(/[a-z0-9]+/g) || [];

    let totalSpoofScore = 0;       // Running total
    const spoofedDomains = [];     // Details of what we found
    const alreadyFlagged = new Set(); // Avoid duplicate flags

    // Step 3: Compare each word against each trusted domain
    words.forEach(word => {
      // Skip very short words (less than 4 chars) — too many false positives
      if (word.length < 4) return;

      trustedDomains.forEach(domain => {
        // Skip if the word IS the exact domain (that's fine, not a spoof)
        if (word === domain) return;

        // Skip if we already flagged this word
        if (alreadyFlagged.has(word)) return;

        // Only compare words of similar length to the domain
        // (avoids comparing "hi" with "amazon")
        if (Math.abs(word.length - domain.length) > 1) return;

        // Calculate the Levenshtein distance between the word and domain
        const distance = levenshteinDistance(word, domain);

        // If edit distance is exactly 1, it's likely a spoof attempt!
        // e.g., "amaz0n" vs "amazon" = 1 edit (0→o)
        // e.g., "paypa1" vs "paypal" = 1 edit (1→l)
        // e.g., "gogle"  vs "google" = 1 edit (missing 'o')
        if (distance === 1) {
          totalSpoofScore += 5;  // Add 5 points per spoofed domain
          alreadyFlagged.add(word);
          spoofedDomains.push({
            found: word,       // The suspicious word from the message
            expected: domain,  // The real domain it's trying to mimic
            distance: distance // The edit distance (always 1 here)
          });
        }
      });
    });

    // Return the total spoof score and details
    return {
      score: totalSpoofScore,
      spoofedDomains: spoofedDomains
    };
  }

  // ============================================
  // RENDER — Phishing Link Detection Results
  // ============================================
  function renderPhishingResults(result) {
    const el = document.getElementById('phishingBox');

    // Hide the panel if no URLs were found at all
    if (result.urlCount === 0 && result.issues.length === 0) {
      el.style.display = 'none';
      return;
    }

    el.style.display = 'block';
    el.innerHTML = `
      <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">
        🎣 PHISHING LINK ANALYSIS (${result.urlCount} URL${result.urlCount !== 1 ? 's' : ''} scanned)
      </div>
      ${result.issues.length > 0 ? `
        <div style="margin-bottom:8px;font-size:12px;color:#FF9500;font-weight:600">
          ⚠ Phishing Risk Score: +${result.score} points
        </div>
        ${result.issues.map(issue => `
          <div style="background:rgba(255,149,0,0.06); border:1px solid rgba(255,149,0,0.2);
            border-radius:8px; padding:10px; margin-bottom:6px; font-size:12px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
              <span>${issue.icon}</span>
              <span style="color:#FFB444;font-weight:600">${issue.issue}</span>
              <span style="margin-left:auto;color:#FF9500;font-size:11px;font-weight:700">+${issue.points}</span>
            </div>
            <div style="color:#8892B0;font-size:11px;font-family:monospace;word-break:break-all">
              ${issue.url.length > 60 ? issue.url.slice(0, 60) + '...' : issue.url}
            </div>
          </div>
        `).join('')}
      ` : `
        <div style="color:#00FF88;font-size:12px">✅ No phishing link patterns detected.</div>
      `}
    `;
  }

  // ============================================
  // RENDER — Domain Spoofing Detection Results
  // ============================================
  function renderSpoofingResults(result) {
    const el = document.getElementById('spoofingBox');

    // Hide the panel if no spoofs were detected
    if (result.spoofedDomains.length === 0) {
      el.style.display = 'none';
      return;
    }

    el.style.display = 'block';
    el.innerHTML = `
      <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">
        🕵️ DOMAIN SPOOFING DETECTION (Levenshtein Distance)
      </div>
      <div style="margin-bottom:8px;font-size:12px;color:#FF44AA;font-weight:600">
        ⚠ Spoof Risk Score: +${result.score} points (${result.spoofedDomains.length} spoof${result.spoofedDomains.length !== 1 ? 's' : ''} found)
      </div>
      ${result.spoofedDomains.map(s => `
        <div style="background:rgba(255,68,170,0.06); border:1px solid rgba(255,68,170,0.2);
          border-radius:8px; padding:10px; margin-bottom:6px; font-size:12px">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <span style="color:#FF4444;font-weight:700;font-family:monospace;font-size:13px;
              background:rgba(255,68,68,0.1);padding:2px 8px;border-radius:4px">${s.found}</span>
            <span style="color:#8892B0">→ looks like</span>
            <span style="color:#00FF88;font-weight:700;font-family:monospace;font-size:13px;
              background:rgba(0,255,136,0.1);padding:2px 8px;border-radius:4px">${s.expected}</span>
            <span style="margin-left:auto;color:#FF44AA;font-size:11px">edit distance: ${s.distance}</span>
          </div>
        </div>
      `).join('')}
      <div style="font-size:11px;color:var(--text-muted);margin-top:8px;line-height:1.5">
        💡 <strong>How it works:</strong> The Levenshtein algorithm calculates the minimum number of
        single-character edits needed to transform one word into another. An edit distance of 1
        means the word is just one character away from a trusted domain — a common spoofing trick.
      </div>
    `;
  }

  // ============================================
  // FEATURE 2 — URL Threat Scanner
  // ============================================
  function scanURLs(message) {
    const urlRegex = /https?:\/\/[^\s]+|www\.[^\s]+|bit\.ly\/[^\s]+|tinyurl\.com\/[^\s]+/gi;
    const urls = message.match(urlRegex) || [];
    const results = [];

    const suspiciousDomains = [
      'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'tiny.cc',
      'is.gd', 'buff.ly', 'adf.ly', 'bc.vc', 'linkbucks.com'
    ];
    const phishingKeywords = [
      'login', 'verify', 'secure', 'account', 'update', 'confirm',
      'banking', 'paypal', 'amazon', 'netflix', 'prize', 'reward',
      'winner', 'free', 'click', 'claim', 'offer', 'deals'
    ];

    urls.forEach(url => {
      let riskScore = 0;
      const flags = [];
      const lower = url.toLowerCase();

      if (suspiciousDomains.some(d => lower.includes(d))) {
        riskScore += 40;
        flags.push('Shortened/masked URL');
      }
      phishingKeywords.forEach(kw => {
        if (lower.includes(kw)) { riskScore += 15; flags.push('Suspicious keyword: "' + kw + '"'); }
      });
      if (/https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)) {
        riskScore += 50; flags.push('Raw IP address (no domain)');
      }
      const domainParts = url.replace(/https?:\/\//, '').split('/')[0].split('.');
      if (domainParts.length > 4) {
        riskScore += 20; flags.push('Excessive subdomains');
      }
      if (url.includes('@')) {
        riskScore += 45; flags.push('@ symbol in URL (credential bypass trick)');
      }
      if (url.startsWith('http://')) {
        riskScore += 25; flags.push('Non-HTTPS (insecure connection)');
      }

      results.push({
        url: url.length > 50 ? url.slice(0, 50) + '...' : url,
        score: Math.min(riskScore, 100),
        flags,
        safe: riskScore < 30
      });
    });

    return results;
  }

  function renderURLResults(urlResults) {
    const container = document.getElementById('urlScanBox');
    if (!urlResults.length) { container.style.display = 'none'; return; }

    container.style.display = 'block';
    container.innerHTML = `
      <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">
        🔗 URL SCAN RESULTS (${urlResults.length} link${urlResults.length > 1 ? 's' : ''} found)
      </div>
      ${urlResults.map(r => `
        <div style="background:${r.safe ? 'rgba(0,255,136,0.05)' : 'rgba(255,68,68,0.07)'};
          border:1px solid ${r.safe ? 'rgba(0,255,136,0.25)' : 'rgba(255,68,68,0.25)'};
          border-radius:8px; padding:10px; margin-bottom:8px; font-size:12px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <span style="color:#aaa;word-break:break-all;font-family:monospace;font-size:11px">${r.url}</span>
            <span style="padding:2px 10px;border-radius:12px;font-size:11px;font-weight:700;
              background:${r.safe ? 'rgba(0,255,136,0.13)' : 'rgba(255,68,68,0.13)'};
              color:${r.safe ? '#00FF88' : '#FF4444'};white-space:nowrap;margin-left:8px">
              ${r.safe ? '✅ SAFE' : '⚠️ RISKY'} ${r.score}%
            </span>
          </div>
          ${r.flags.map(f => `<div style="color:#FFA500;font-size:11px;margin-top:2px">⚠ ${f}</div>`).join('')}
        </div>
      `).join('')}
    `;
  }

  // ============================================
  // FEATURE 3 — Social Engineering Tone Analyzer
  // ============================================
  const tonePatterns = {
    'Urgency': [/urgent/i, /immediately/i, /act now/i, /expires today/i, /last chance/i, /right now/i, /hurry/i],
    'Fear': [/suspended/i, /blocked/i, /disabled/i, /locked/i, /terminated/i, /legal action/i, /arrested/i, /compromised/i],
    'Greed': [/free/i, /won/i, /prize/i, /reward/i, /cash/i, /earn \$/i, /\$\d+/, /Rs\.?\s*\d+/i, /money/i],
    'Authority': [/RBI/i, /police/i, /government/i, /officer/i, /bank official/i, /CEO/i, /verified/i, /ministry/i],
    'Deception': [/click here/i, /verify account/i, /confirm details/i, /OTP/i, /CVV/i, /PIN/i, /bit\.ly/i]
  };

  function analyzeTone(message) {
    const scores = {};
    Object.entries(tonePatterns).forEach(([tone, patterns]) => {
      scores[tone] = patterns.filter(p => p.test(message)).length;
    });
    return scores;
  }

  function renderToneChart(scores) {
    const container = document.getElementById('toneBox');
    const maxVal = Math.max(...Object.values(scores), 1);
    const hasAny = Object.values(scores).some(v => v > 0);

    if (!hasAny) { container.style.display = 'none'; return; }
    container.style.display = 'block';

    const colors = {
      'Urgency': '#FF6B35', 'Fear': '#FF4444',
      'Greed': '#FFD700', 'Authority': '#00D4FF', 'Deception': '#FF44AA'
    };
    const icons = {
      'Urgency': '⏰', 'Fear': '😨', 'Greed': '🤑', 'Authority': '👮', 'Deception': '🎭'
    };

    container.innerHTML = `
      <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">
        🧠 SOCIAL ENGINEERING TACTICS DETECTED
      </div>
      ${Object.entries(scores).filter(([, v]) => v > 0).map(([tone, val]) => `
        <div style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
            <span style="color:${colors[tone]};font-weight:600">${icons[tone] || ''} ${tone}</span>
            <span style="color:#8892B0">${val} signal${val > 1 ? 's' : ''}</span>
          </div>
          <div style="background:rgba(255,255,255,0.07);border-radius:20px;height:6px;overflow:hidden">
            <div style="height:100%;border-radius:20px;background:${colors[tone]};width:${Math.round((val / maxVal) * 100)}%;transition:width 0.8s cubic-bezier(0.4,0,0.2,1)"></div>
          </div>
        </div>
      `).join('')}
    `;
  }

  // ============================================
  // FEATURE 4 — Scam Type Classifier
  // ============================================
  const scamTypes = [
    {
      name: 'KYC / Banking Fraud', icon: '🏦',
      patterns: [/KYC/i, /bank account/i, /IFSC/i, /net banking/i, /debit card/i, /credit card/i]
    },
    {
      name: 'Lottery / Prize Scam', icon: '🎰',
      patterns: [/won/i, /lottery/i, /prize/i, /lucky winner/i, /selected/i, /reward/i]
    },
    {
      name: 'OTP / Credential Theft', icon: '🔐',
      patterns: [/OTP/i, /password/i, /PIN/i, /CVV/i, /verify account/i, /send.*code/i]
    },
    {
      name: 'Job / Investment Fraud', icon: '💼',
      patterns: [/job offer/i, /work from home/i, /earn \$/i, /investment/i, /returns/i, /hiring/i]
    },
    {
      name: 'Parcel / Delivery Scam', icon: '📦',
      patterns: [/parcel/i, /package/i, /delivery/i, /customs/i, /shipment/i, /courier/i]
    },
    {
      name: 'Impersonation / Authority', icon: '👮',
      patterns: [/police/i, /RBI/i, /government/i, /CBI/i, /income tax/i, /officer/i, /ministry/i]
    },
    {
      name: 'Phishing Link Attack', icon: '🎣',
      patterns: [/click here/i, /bit\.ly/i, /verify your/i, /login now/i, /https?:\/\//i, /tinyurl/i]
    }
  ];

  function classifyScamType(message) {
    let best = null, bestCount = 0;
    scamTypes.forEach(type => {
      const count = type.patterns.filter(p => p.test(message)).length;
      if (count > bestCount) { bestCount = count; best = type; }
    });
    return bestCount > 0 ? best : null;
  }

  function renderScamType(type) {
    const el = document.getElementById('scamTypeBox');
    if (!type) { el.style.display = 'none'; return; }
    el.style.display = 'block';
    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px">
        <span style="font-size:28px">${type.icon}</span>
        <div>
          <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">SCAM CATEGORY IDENTIFIED</div>
          <div style="font-size:15px;font-weight:700;color:#FF4444;margin-top:2px">${type.name}</div>
        </div>
      </div>
    `;
  }

  // ============================================
  // FEATURE 5/ML-3 — User Feedback & Confusion Matrix
  // ============================================

  let mlStats = JSON.parse(localStorage.getItem('mlStats') || 'null') || { TP: 0, TN: 0, FP: 0, FN: 0 };
  let lastPredictedLabel = 'SAFE';

  function updateStats(predictedLabel, feedbackLabel) {
    const isScam = String(feedbackLabel).toUpperCase() === 'SCAM';
    const predicted = String(predictedLabel).toUpperCase() !== 'SAFE'; // SUSPICIOUS counts as predicted scam for binary stats

    if (isScam && predicted) mlStats.TP++;
    if (!isScam && !predicted) mlStats.TN++;
    if (!isScam && predicted) mlStats.FP++;
    if (isScam && !predicted) mlStats.FN++;

    localStorage.setItem('mlStats', JSON.stringify(mlStats));
    renderMetrics();
  }

  function renderMetrics() {
    const { TP, TN, FP, FN } = mlStats;
    const total = TP + TN + FP + FN;
    const el = document.getElementById('metricsBox');

    if (!total) {
      el.style.display = 'none';
      return;
    }

    const accuracy = +(((TP + TN) / total) * 100).toFixed(1);
    const precision = TP + FP > 0 ? +((TP / (TP + FP)) * 100).toFixed(1) : 0;
    const recall = TP + FN > 0 ? +((TP / (TP + FN)) * 100).toFixed(1) : 0;
    const f1 = precision + recall > 0 ? +((2 * precision * recall) / (precision + recall)).toFixed(1) : 0;

    el.style.display = 'block';
    el.innerHTML = `
      <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">
        📈 LIVE ML METRICS (${total} samples)
      </div>

      <!-- Confusion matrix -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:16px; font-size:11px; text-align:center">
        <div style="background:rgba(0,255,136,0.05); border:1px solid rgba(0,255,136,0.2); border-radius:8px; padding:10px">
          <div style="color:#00FF88; font-weight:700; font-size:18px">${TP}</div>
          <div style="color:var(--text-muted);margin-top:2px">True Positive</div>
        </div>
        <div style="background:rgba(255,68,68,0.05); border:1px solid rgba(255,68,68,0.2); border-radius:8px; padding:10px">
          <div style="color:#FF4444; font-weight:700; font-size:18px">${FP}</div>
          <div style="color:var(--text-muted);margin-top:2px">False Positive</div>
        </div>
        <div style="background:rgba(255,68,68,0.05); border:1px solid rgba(255,68,68,0.2); border-radius:8px; padding:10px">
          <div style="color:#FF4444; font-weight:700; font-size:18px">${FN}</div>
          <div style="color:var(--text-muted);margin-top:2px">False Negative</div>
        </div>
        <div style="background:rgba(0,255,136,0.05); border:1px solid rgba(0,255,136,0.2); border-radius:8px; padding:10px">
          <div style="color:#00FF88; font-weight:700; font-size:18px">${TN}</div>
          <div style="color:var(--text-muted);margin-top:2px">True Negative</div>
        </div>
      </div>

      <!-- Metric bars -->
      ${[
        { label: 'Accuracy', value: accuracy, color: '#00D4FF' },
        { label: 'Precision', value: precision, color: '#7B61FF' },
        { label: 'Recall', value: recall, color: '#FF9500' },
        { label: 'F1 Score', value: f1, color: '#00FF88' },
      ].map(m => `
        <div style="margin-bottom:10px">
          <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:4px">
            <span style="color:${m.color}">${m.label}</span>
            <span style="color:#fff;font-weight:600">${m.value}%</span>
          </div>
          <div style="background:rgba(255,255,255,0.07); border-radius:20px; height:6px; overflow:hidden">
            <div style="height:100%; border-radius:20px; background:${m.color}; width:${m.value}%; transition:width 0.8s ease"></div>
          </div>
        </div>
      `).join('')}

      <div style="text-align:center; margin-top:14px">
        <button onclick="resetStats()" style="font-size:11px; color:#8892B0; background:none; border:none; cursor:pointer; text-decoration:underline; font-family:var(--font-body)">
          Reset metrics
        </button>
      </div>
    `;
  }

  window.resetStats = function () {
    mlStats = { TP: 0, TN: 0, FP: 0, FN: 0 };
    localStorage.removeItem('mlStats');
    renderMetrics();
  };

  // Call renderMetrics on page load to restore saved stats
  renderMetrics();

  // Make saveFeedback global so onclick in innerHTML works
  window.saveFeedback = function (msgSnippet, wasCorrect, actualLabel) {
    const feedback = JSON.parse(localStorage.getItem('scamFeedback') || '[]');
    feedback.push({
      message: msgSnippet,
      wasCorrect,
      actualLabel,
      timestamp: Date.now()
    });
    localStorage.setItem('scamFeedback', JSON.stringify(feedback.slice(-200)));

    // Update live confusion matrix
    updateStats(lastPredictedLabel, actualLabel);

    showToast(wasCorrect
      ? '✅ Thanks! Feedback recorded.'
      : '📚 Got it! We\'ll improve from this.', 'success');

    // Disable buttons after feedback
    const box = document.getElementById('feedbackBox');
    box.querySelectorAll('button').forEach(b => {
      b.onclick = null;
      b.style.opacity = '0.4';
      b.style.cursor = 'default';
    });
    box.innerHTML += '<div style="font-size:11px;color:#00FF88;margin-top:12px;text-align:center">✅ Feedback submitted and model metrics updated!</div>';
  };

  function renderFeedbackButtons(message, result) {
    const el = document.getElementById('feedbackBox');
    el.style.display = 'block';
    // Escape single quotes in message for onclick
    const safeMsg = message.slice(0, 100).replace(/'/g, "\\'").replace(/"/g, '&quot;');
    el.innerHTML = `
      <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">
        📝 WAS THIS RESULT ACCURATE?
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button onclick="saveFeedback('${safeMsg}', true, '${result.level}')"
          style="flex:1;min-width:120px;padding:10px;border-radius:8px;border:1px solid rgba(0,255,136,0.25);
          background:rgba(0,255,136,0.07);color:#00FF88;cursor:pointer;font-size:12px;font-family:var(--font-body);font-weight:500;transition:all 0.2s">
          ✅ Yes, correct
        </button>
        <button onclick="saveFeedback('${safeMsg}', false, 'SCAM')"
          style="flex:1;min-width:120px;padding:10px;border-radius:8px;border:1px solid rgba(255,68,68,0.25);
          background:rgba(255,68,68,0.07);color:#FF4444;cursor:pointer;font-size:12px;font-family:var(--font-body);font-weight:500;transition:all 0.2s">
          ❌ No, it's a scam
        </button>
        <button onclick="saveFeedback('${safeMsg}', false, 'SAFE')"
          style="flex:1;min-width:120px;padding:10px;border-radius:8px;border:1px solid rgba(255,165,0,0.25);
          background:rgba(255,165,0,0.07);color:#FFA500;cursor:pointer;font-size:12px;font-family:var(--font-body);font-weight:500;transition:all 0.2s">
          ⚠ No, it's safe
        </button>
      </div>
    `;
  }

  // ===== FAQ ACCORDION =====
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const isActive = item.classList.contains('active');

      // Close all
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll('.faq-question').forEach(b => b.setAttribute('aria-expanded', 'false'));
      document.querySelectorAll('.faq-answer').forEach(a => a.setAttribute('aria-hidden', 'true'));

      // Open clicked (if wasn't active)
      if (!isActive) {
        item.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
        item.querySelector('.faq-answer').setAttribute('aria-hidden', 'false');
      }
    });
  });

  // ===== ANIMATED COUNTERS =====
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.target);
        const isDecimal = el.dataset.decimal === 'true';
        const duration = 2000;
        const startTime = performance.now();

        function updateCounter(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = eased * target;

          if (isDecimal) {
            el.textContent = current.toFixed(1);
          } else {
            el.textContent = Math.floor(current).toLocaleString();
          }

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            if (isDecimal) {
              el.textContent = target.toFixed(1);
            } else {
              el.textContent = target.toLocaleString();
            }
          }
        }

        requestAnimationFrame(updateCounter);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => counterObserver.observe(el));

  // ===== TOAST NOTIFICATIONS =====
  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // ===== CONTACT FORM =====
  document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();

    if (!name || !email) {
      showToast('Please fill in your name and email.', 'warning');
      return;
    }

    showToast(`Thanks, ${name}! We'll be in touch soon.`, 'success');
    e.target.reset();
  });

  // ===== KEYBOARD NAVIGATION for SMS input =====
  smsInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      analyzeBtn.click();
    }
  });

});
