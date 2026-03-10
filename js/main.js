/**
 * AirClean Premium — main.js
 * Author   : AirClean Premium
 * Version  : 2.0.0
 * Encoding : UTF-8
 */

'use strict';

/* ============================================================
   01. SCROLL REVEAL
   ============================================================ */
(function initReveal() {
  const elements = document.querySelectorAll('.reveal, .reveal-l, .reveal-r');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  elements.forEach((el) => observer.observe(el));
})();

/* ============================================================
   02. STICKY BAR + BACK-TO-TOP
   ============================================================ */
(function initScrollUI() {
  const sticky  = document.getElementById('sticky');
  const backTop = document.getElementById('back-top');
  if (!sticky || !backTop) return;

  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY;
      sticky.classList.toggle('show',  y > 500);
      backTop.classList.toggle('show', y > 800);
    },
    { passive: true }
  );

  backTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ============================================================
   03. COUNTDOWN TIMER
   ============================================================ */
(function initCountdown() {
  const dH = document.getElementById('cdH');
  const dM = document.getElementById('cdM');
  const dS = document.getElementById('cdS');
  if (!dH || !dM || !dS) return;

  const KEY     = 'ac_cd';
  const saved   = sessionStorage.getItem(KEY);
  let   ch, cm, cs;

  if (saved) {
    const parts = saved.split(',');
    ch = +parts[0]; cm = +parts[1]; cs = +parts[2];
  } else {
    ch = 4; cm = 23; cs = 59;
  }

  const pad = (n) => String(n).padStart(2, '0');

  setInterval(() => {
    if (--cs < 0) { cs = 59; if (--cm < 0) { cm = 59; if (--ch < 0) { ch = cm = cs = 0; } } }
    dH.textContent = pad(ch);
    dM.textContent = pad(cm);
    dS.textContent = pad(cs);
    sessionStorage.setItem(KEY, [ch, cm, cs].join(','));
  }, 1000);
})();

/* ============================================================
   04. INTERACTIVE CALCULATOR
   ============================================================ */
(function initCalculator() {
  const acSlider  = document.getElementById('ac-slider');
  const hrSlider  = document.getElementById('hr-slider');
  const acVal     = document.getElementById('ac-val');
  const hrVal     = document.getElementById('hr-val');
  const wResult   = document.getElementById('waste-result');
  const cvBad     = document.getElementById('cv-bad');
  const cvSave    = document.getElementById('cv-save');

  if (!acSlider || !hrSlider) return;

  const fmt = (n) => '฿' + n.toLocaleString();

  function calcWaste() {
    const ac         = parseInt(acSlider.value, 10);
    const hr         = parseInt(hrSlider.value, 10);
    const wastePerYr = Math.round((120 * (hr / 8) * ac * 12) / 100) * 100;

    wResult.textContent  = fmt(wastePerYr);
    cvBad.textContent    = fmt(wastePerYr);
    cvSave.textContent   = fmt(wastePerYr);
    acVal.textContent    = ac + ' เครื่อง';
    hrVal.textContent    = hr + ' ชั่วโมง';

    acSlider.style.setProperty('--pct', ((ac - 1)  / 5  * 100).toFixed(1) + '%');
    hrSlider.style.setProperty('--pct', ((hr - 4)  / 14 * 100).toFixed(1) + '%');
  }

  acSlider.addEventListener('input', calcWaste);
  hrSlider.addEventListener('input', calcWaste);
  calcWaste(); 
})();

/* ============================================================
   05. FAQ ACCORDION
   ============================================================ */
function toggleF(btn) {
  const answer = btn.nextElementSibling;
  const isOpen = answer.classList.contains('open');

  document.querySelectorAll('.fans').forEach((a) => a.classList.remove('open'));
  document.querySelectorAll('.fbtn').forEach((b) => b.classList.remove('open'));

  if (!isOpen) {
    answer.classList.add('open');
    btn.classList.add('open');
  }
}

/* ============================================================
   06. BOOKING FORM VALIDATION
   ============================================================ */
function submitForm(btn) {
  const fieldMap = [
    { id: 'f-name', label: 'กรุณากรอกชื่อของคุณ' },
    { id: 'f-tel',  label: 'กรุณากรอกเบอร์โทรศัพท์' },
    { id: 'f-qty',  label: 'กรุณาเลือกจำนวนแอร์' },
  ];

  let   isValid  = true;
  let   firstErr = null;

  fieldMap.forEach(({ id, label }) => {
    const el = document.getElementById(id);
    if (!el) return;

    if (!el.value.trim()) {
      el.classList.add('error');
      el.classList.remove('ok');
      el.setAttribute('placeholder', label);
      isValid = false;
      if (!firstErr) firstErr = el;
    } else {
      el.classList.remove('error');
      el.classList.add('ok');
    }
  });

  const errDiv = document.getElementById('form-err');

  if (!isValid) {
    if (errDiv) {
      errDiv.textContent = 'กรุณากรอกข้อมูลที่จำเป็นให้ครบก่อนนะคะ';
      errDiv.classList.add('show');
    }
    if (firstErr) firstErr.focus();
    return;
  }

  if (errDiv) errDiv.classList.remove('show');

  btn.textContent          = '✅ รับจองเรียบร้อย! ทีมงานจะโทรยืนยันภายใน 5 นาที';
  btn.style.background     = 'linear-gradient(135deg, #1a6b3a, #2e7d32)';
  btn.style.color          = '#fff';
  btn.disabled             = true;
}

/* ============================================================
   07. SLOT COUNT
   ============================================================ */
(function initSlots() {
  const KEY = 'ac_slots';
  const MIN = 1;
  let   slots = parseInt(localStorage.getItem(KEY), 10);

  if (isNaN(slots) || slots > 7 || slots < MIN) slots = 7;

  function renderSlots(n) {
    const row = document.querySelector('.slots-row');
    if (row) {
      const taken = 15 - n;
      let html = '';
      // แก้ไข Lighthouse ARIA Role ที่ตรงนี้: เพิ่ม role="listitem"
      for (let i = 0; i < taken; i++) html += '<div class="slot taken" title="จองแล้ว" role="listitem"></div>';
      for (let i = 0; i < n; i++)     html += '<div class="slot open"  title="ว่าง — จองได้เลย" role="listitem">📅</div>';
      row.innerHTML = html;
    }

    const cap = document.querySelector('.slots-caption');
    if (cap) {
      cap.innerHTML =
        'จองแล้ว ' + (15 - n) + ' คิว &nbsp;&middot;&nbsp; ว่างอยู่ ' +
        '<strong style="color:var(--gold)">' + n + ' คิวสุดท้าย</strong>';
    }

    const sMsg = document.querySelector('.sticky-msg');
    if (sMsg) {
      sMsg.innerHTML = '&#128293; เหลือ <strong>' + n + ' คิวสุดท้าย</strong> &mdash; โปรสัปดาห์นี้';
    }

    const urgSpan = document.querySelector('#urgency h2 span');
    if (urgSpan) urgSpan.textContent = n + ' คิวสุดท้าย';
  }

  renderSlots(slots);

  function scheduleDecrease() {
    const delay = (8 + Math.random() * 10) * 60 * 1000;
    setTimeout(() => {
      if (slots > MIN) {
        slots--;
        localStorage.setItem(KEY, slots);
        renderSlots(slots);
      }
      scheduleDecrease();
    }, delay);
  }

  scheduleDecrease();
})();

/* ============================================================
   08. SOCIAL PROOF NOTIFICATIONS
   ============================================================ */
(function initSocialProof() {
  const popup  = document.getElementById('sp-popup');
  const spMsg  = document.getElementById('sp-msg');
  const spTime = document.getElementById('sp-time');
  if (!popup || !spMsg || !spTime) return;

  const notifications = [
    { name: 'สมหญิง',     loc: 'ลาดพร้าว',    action: 'กำลังดูหน้านี้อยู่ด้วยตอนนี้' },
    { name: 'ธนพล',       loc: 'บางนา',        action: 'เพิ่งจองคิวล้างแอร์ไปเมื่อกี้' },
    { name: 'พรทิพย์',    loc: 'จตุจักร',      action: 'กำลังดูหน้านี้อยู่ด้วยตอนนี้' },
    { name: 'อนุชา',      loc: 'พระโขนง',      action: 'เพิ่งจองคิวล้างแอร์ไปเมื่อกี้' },
    { name: 'วารุณี',     loc: 'ลาดกระบัง',    action: 'กำลังดูแพ็คเกจ Standard อยู่' },
    { name: 'สุรศักดิ์',  loc: 'มีนบุรี',      action: 'เพิ่งจองคิวล้างแอร์ไปเมื่อกี้' },
    { name: 'กานดา',      loc: 'บางแค',        action: 'กำลังดูหน้านี้อยู่ด้วยตอนนี้' },
    { name: 'ธีรวัฒน์',  loc: 'ดินแดง',       action: 'เพิ่งกดจองแพ็คเกจ Premium ไป' },
    { name: 'นภาพร',      loc: 'สาทร',         action: 'กำลังดูแพ็คเกจ Premium อยู่' },
    { name: 'ประภาส',     loc: 'รามคำแหง',     action: 'เพิ่งจองคิวล้างแอร์ไปเมื่อกี้' },
  ];

  const timeLabels = ['เมื่อกี้', '1 นาทีที่แล้ว', '2 นาทีที่แล้ว', '3 นาทีที่แล้ว', '5 นาทีที่แล้ว'];

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  let queue = shuffle(notifications);
  let qIdx  = 0;

  function showNotification() {
    if (qIdx >= queue.length) { queue = shuffle(notifications); qIdx = 0; }
    const n = queue[qIdx++];
    const t = timeLabels[Math.floor(Math.random() * timeLabels.length)];

    spMsg.innerHTML   = '<strong>' + n.name + ' จาก ' + n.loc + '</strong><br>' + n.action;
    spTime.textContent = t;

    popup.classList.add('show');
    setTimeout(() => popup.classList.remove('show'), 4500);
  }

  function scheduleNotif() {
    const delay = (15 + Math.random() * 7) * 1000; 
    setTimeout(() => { showNotification(); scheduleNotif(); }, delay);
  }

  setTimeout(() => { showNotification(); scheduleNotif(); }, 6000);
})();
