(function () {
  'use strict';

  // ─── Elementos ──────────────────────────────────────────────────────────────
  const video       = document.getElementById('camera');
  const controls   = document.getElementById('controls');
  const slBright   = document.getElementById('brightness');
  const slZoom     = document.getElementById('zoom');
  const btnFlip    = document.getElementById('btn-flip');
  const btnFull    = document.getElementById('btn-fullscreen');
  const btnRetry   = document.getElementById('btn-retry');
  const errorScr   = document.getElementById('error-screen');
  const loadScr    = document.getElementById('loading-screen');

  // ─── Estado ─────────────────────────────────────────────────────────────────
  let stream     = null;
  let facing     = 'user';   // 'user' = frontal | 'environment' = trasera
  let hideTimer  = null;
  let wakeLock   = null;

  // ─── Camara ─────────────────────────────────────────────────────────────────
  async function startCamera(face) {
    stopStream();
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: face,
          width:  { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      video.srcObject = stream;
      await video.play();
      applyTransform();
      applyBrightness(parseInt(slBright.value));
      hideLoad();
      errorScr.classList.add('hidden');
      requestWakeLock();
    } catch (err) {
      console.error('Camera error:', err);
      hideLoad();
      errorScr.classList.remove('hidden');
    }
  }

  function stopStream() {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      stream = null;
    }
  }

  // ─── Transform (espejo + zoom) ──────────────────────────────────────────────
  function applyTransform() {
    const scale = parseInt(slZoom.value) / 100;
    const flip  = facing === 'user' ? -1 : 1;
    video.style.transform = `scaleX(${flip * scale}) scaleY(${scale})`;
  }

  // ─── Brillo ─────────────────────────────────────────────────────────────────
  function applyBrightness(val) {
    video.style.filter = `brightness(${val / 100})`;
  }

  slBright.addEventListener('input', e => {
    applyBrightness(parseInt(e.target.value));
    resetTimer();
  });

  slZoom.addEventListener('input', e => {
    applyTransform();
    resetTimer();
  });

  // Evitar que los sliders cierren los controles al tocarlos
  slBright.addEventListener('click', e => e.stopPropagation());
  slZoom.addEventListener('click',   e => e.stopPropagation());

  // ─── Mostrar / ocultar controles ────────────────────────────────────────────
  function showControls() {
    controls.classList.remove('hidden');
    controls.classList.add('visible');
    resetTimer();
  }

  function hideControls() {
    controls.classList.remove('visible');
    controls.classList.add('hidden');
    clearTimeout(hideTimer);
  }

  function resetTimer() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hideControls, 4000);
  }

  // Toque en cualquier area libre = mostrar/ocultar controles
  document.getElementById('app').addEventListener('click', (e) => {
    if (e.target.closest('button, input')) return;
    controls.classList.contains('visible') ? hideControls() : showControls();
  });

  // ─── Boton: cambiar camara ───────────────────────────────────────────────────
  btnFlip.addEventListener('click', (e) => {
    e.stopPropagation();
    facing = (facing === 'user') ? 'environment' : 'user';
    startCamera(facing);
    resetTimer();
  });

  // ─── Boton: pantalla completa ────────────────────────────────────────────────
  btnFull.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
    resetTimer();
  });

  // ─── Boton: reintentar camara ────────────────────────────────────────────────
  btnRetry.addEventListener('click', () => {
    errorScr.classList.add('hidden');
    loadScr.classList.remove('hidden');
    loadScr.style.opacity = '1';
    startCamera(facing);
  });

  // ─── Wake Lock (mantener pantalla encendida) ─────────────────────────────────
  async function requestWakeLock() {
    if (!('wakeLock' in navigator)) return;
    try {
      wakeLock = await navigator.wakeLock.request('screen');
    } catch (_) { /* no critico */ }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && stream) {
      requestWakeLock();
    }
  });

  // ─── Loading ─────────────────────────────────────────────────────────────────
  function hideLoad() {
    loadScr.style.opacity = '0';
    setTimeout(() => loadScr.classList.add('hidden'), 500);
  }

  // ─── Iniciar ─────────────────────────────────────────────────────────────────
  startCamera(facing);

})();
