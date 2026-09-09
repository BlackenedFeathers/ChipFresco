"use strict";
/* ================= TIPOS ================= */
/* Catálogo de servicios por categoría, usado por el chatbot para mostrar
   botones con los mismos servicios y precios que las tarjetas de la página.
   IMPORTANTE: si cambias un precio o nombre aquí, cambia también la tarjeta
   correspondiente en index.html (y viceversa) para que no queden desincronizados. */
const SERVICIOS_WINDOWS = [
    { label: 'Diagnóstico para Reparación PC Windows', price: 250 },
    { label: 'Limpieza Profunda PC Windows', price: 500 },
    { label: 'Limpieza + Formateo PC Windows', price: 600 },
    { label: 'Formateo con Respaldo Parcial o Total PC Windows', price: 400 },
    { label: 'Instalación de Software', price: 190 },
    { label: 'Actualización a Disco SSD', price: 450, note: 'SSD se cobra aparte' },
];
const SERVICIOS_MAC = [
    { label: 'Limpieza Profunda de Mac', price: 700 },
    { label: 'Actualización de Sistema Mac', price: 600 },
    { label: 'Actualización Mac + Limpieza', price: 1000 },
    { label: 'Actualización de Disco Mac', price: 500, note: 'SSD se cobra aparte' },
];
const SERVICIOS_CONSOLAS = [
    { label: 'Limpieza Profunda + Pasta Térmica Consolas Anteriores', price: 380 },
    { label: 'Limpieza Profunda + Pasta Térmica Nintendo Switch', price: 500 },
    { label: 'Limpieza Profunda + Pasta Térmica Xbox Series S/X', price: 650 },
    { label: 'Limpieza Profunda + Metal Líquido PS5', price: 750 },
];
/* ================= AUDIO ENGINE SILENCIOSO ================= */
let audioCtx = null;
let soundEnabled = true;
let audioUnlocked = false;
const unlockAudio = () => {
    if (audioUnlocked || !soundEnabled)
        return;
    try {
        const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContextCtor();
        if (audioCtx.state === 'suspended')
            audioCtx.resume();
        const buffer = audioCtx.createBuffer(1, 1, 22050);
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start(0);
        audioUnlocked = true;
        ['click', 'touchstart', 'keydown', 'scroll'].forEach(evt => document.body.removeEventListener(evt, unlockAudio, { capture: true }));
    }
    catch (e) {
        /* noop */
    }
};
['click', 'touchstart', 'keydown', 'scroll'].forEach(evt => {
    document.body.addEventListener(evt, unlockAudio, { capture: true, once: true });
});
function playSound(type) {
    if (!soundEnabled || !audioUnlocked || !audioCtx)
        return;
    if (audioCtx.state === 'suspended')
        audioCtx.resume();
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        const now = audioCtx.currentTime;
        if (type === 'click') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(450, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
            gain.gain.setValueAtTime(0.0, now);
            gain.gain.linearRampToValueAtTime(0.05, now + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        }
        else if (type === 'success') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.setValueAtTime(659.25, now + 0.08);
            osc.frequency.setValueAtTime(783.99, now + 0.16);
            gain.gain.setValueAtTime(0.0, now);
            gain.gain.linearRampToValueAtTime(0.06, now + 0.05);
            gain.gain.setValueAtTime(0.06, now + 0.2);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        }
        else if (type === 'message') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(750, now);
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.04, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        }
        else if (type === 'hover') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(900, now);
            gain.gain.setValueAtTime(0.0, now);
            gain.gain.linearRampToValueAtTime(0.015, now + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
            osc.start(now);
            osc.stop(now + 0.04);
        }
    }
    catch (e) {
        /* noop */
    }
}
document.getElementById('soundToggle').addEventListener('click', function () {
    soundEnabled = !soundEnabled;
    this.classList.toggle('muted', !soundEnabled);
    this.textContent = soundEnabled ? '🔊' : '🔇';
    if (soundEnabled && !audioUnlocked)
        unlockAudio();
});
/* ================= TABS & ANIMACIONES ================= */
function openTab(tabId) {
    document.body.setAttribute('data-theme', tabId);
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.links a').forEach(el => el.classList.remove('active-link'));
    document.getElementById('tab-' + tabId).classList.add('active');
    const navLink = document.getElementById('nav-' + tabId);
    if (navLink)
        navLink.classList.add('active-link');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const elements = document.getElementById('tab-' + tabId).querySelectorAll('.reveal');
    elements.forEach(el => {
        el.style.animation = 'none';
        void el.offsetHeight;
        el.style.animation = '';
    });
}
/* ================= SLIDERS ================= */
function initSlider(sliderId) {
    const root = document.getElementById(sliderId);
    if (!root)
        return;
    const range = root.querySelector('.ba-range');
    const before = root.querySelector('.ba-before');
    const after = root.querySelector('.ba-after');
    const divider = root.querySelector('.ba-divider');
    const handle = root.querySelector('.ba-handle');
    function update(v) {
        before.style.clipPath = 'inset(0 ' + (100 - Number(v)) + '% 0 0)';
        after.style.clipPath = 'inset(0 0 0 ' + v + '%)';
        divider.style.left = v + '%';
        handle.style.left = v + '%';
    }
    range.addEventListener('input', e => update(e.target.value));
    update(range.value);
}
initSlider('slider-win');
initSlider('slider-mac');
initSlider('slider-xbox');
/* ================= MODAL ================= */
let selectedService = '';
const WHATSAPP_NUMBER = '525632093598';
function promptService(serviceName) {
    selectedService = serviceName;
    document.getElementById('modal-service-display').innerText = serviceName;
    document.getElementById('service-modal').classList.add('active');
    playSound('click');
}
function closeModal() {
    document.getElementById('service-modal').classList.remove('active');
}
function sendServiceWa() {
    const msg = 'Hola Técnico, estoy interesado en el servicio de: ' + selectedService + '. ¿Podemos agendar?';
    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg), '_blank');
    closeModal();
}
function openServiceBot() {
    closeModal();
    openBotWithFlow(selectedService);
}
/* ================= CHATBOT ================= */
const panel = document.getElementById('botPanel');
const msgsEl = document.getElementById('botMsgs');
const suggEl = document.getElementById('botSuggestions');
const inputEl = document.getElementById('botInput');
let botState = 'init';
let userData = { nombre: '', equipo: '', servicio: '', puntoEncuentro: '', horario: '' };
function scrollToBottom() {
    msgsEl.scrollTop = msgsEl.scrollHeight;
}
function addBotMsg(text) {
    const d = document.createElement('div');
    d.className = 'msg bot';
    d.textContent = text;
    msgsEl.appendChild(d);
    scrollToBottom();
    playSound('message');
}
function addUserMsg(text) {
    const d = document.createElement('div');
    d.className = 'msg user';
    d.textContent = text;
    msgsEl.appendChild(d);
    scrollToBottom();
}
function setChips(chips) {
    suggEl.innerHTML = '';
    chips.forEach(chip => {
        const b = document.createElement('button');
        b.className = 'chip-btn';
        b.textContent = chip.label;
        b.onclick = function () {
            playSound('click');
            chip.fn();
        };
        b.addEventListener('mouseenter', () => playSound('hover'));
        suggEl.appendChild(b);
    });
}
function clearChips() {
    suggEl.innerHTML = '';
}
function openBotWithFlow(preSelectedService) {
    panel.classList.add('open');
    if (preSelectedService) {
        // Viene de un botón de precio: reiniciamos SIEMPRE la conversación con
        // ese servicio exacto, aunque ya hubiera una charla previa en curso.
        // Esto corrige el bug donde el bot seguía la conversación vieja y no
        // atendía el servicio que el usuario acababa de seleccionar.
        msgsEl.innerHTML = '';
        clearChips();
        botFlow(preSelectedService);
    }
    else if (botState === 'init' && msgsEl.innerHTML === '') {
        botFlow();
    }
}
function botFlow(preSelectedService) {
    userData = { nombre: '', equipo: '', servicio: '', puntoEncuentro: '', horario: '' };
    addBotMsg('¡Hola! Soy el Técnico de ChipFresco. Para poder ayudarte mejor, ¿Me podrías decir tu nombre?');
    botState = 'esperando_nombre';
    if (preSelectedService)
        userData.servicio = preSelectedService;
    inputEl.disabled = false;
    inputEl.placeholder = 'Escribe tu nombre...';
    inputEl.focus();
    setTimeout(() => {
        if (window.innerWidth <= 640)
            inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
}
function ubicacionHermosillo(esLocal) {
    clearChips();
    addUserMsg(esLocal ? 'Sí' : 'No');
    if (!esLocal) {
        setTimeout(() => {
            addBotMsg('Lo siento, actualmente estamos limitados al área de Hermosillo, Sonora. 🌵');
            botState = 'end';
            inputEl.disabled = true;
            inputEl.placeholder = 'Servicio no disponible en tu zona.';
        }, 400);
    }
    else {
        if (userData.servicio) {
            userData.equipo = 'Equipo especificado en el servicio';
            setTimeout(() => {
                addBotMsg('Perfecto. Vi que seleccionaste el servicio: "' + userData.servicio + '".');
                explicarHorarios();
            }, 400);
        }
        else {
            setTimeout(() => {
                addBotMsg('Perfecto. Ahora dime, ¿Para qué tipo de equipo necesitas ayuda?');
                botState = 'esperando_equipo';
                inputEl.disabled = true;
                inputEl.placeholder = 'Selecciona una opción arriba 👆';
                setChips([
                    { label: 'Mac / MacBook', fn: () => selectEquipo('Mac / MacBook') },
                    { label: 'Laptop Windows', fn: () => selectEquipo('Laptop Windows') },
                    { label: 'PC de Escritorio', fn: () => selectEquipo('PC de Escritorio') },
                    { label: 'Consola', fn: () => selectEquipo('Consola') },
                    { label: 'Armado PC', fn: () => selectEquipo('Armado de PC Nuevo') },
                ]);
            }, 400);
        }
    }
}
function handleUserInput(text) {
    if (!text.trim())
        return;
    addUserMsg(text);
    inputEl.value = '';
    if (botState === 'esperando_nombre') {
        userData.nombre = text;
        setTimeout(() => {
            addBotMsg('Mucho gusto ' + userData.nombre + '. Para confirmar cobertura, ¿te encuentras en Hermosillo, Sonora?');
            botState = 'esperando_ubicacion';
            inputEl.disabled = true;
            inputEl.placeholder = 'Selecciona una opción arriba 👆';
            setChips([
                { label: 'Sí, soy de Hermosillo', fn: () => ubicacionHermosillo(true) },
                { label: 'No, soy de fuera', fn: () => ubicacionHermosillo(false) },
            ]);
        }, 400);
    }
    else if (botState === 'esperando_resumen_pc') {
        userData.servicio = 'Armado Custom: ' + text;
        finalizarFlujoArmado(); // Salta ubicación y horarios directo a enviar WhatsApp
    }
}
function selectEquipo(equipoStr) {
    addUserMsg(equipoStr);
    userData.equipo = equipoStr;
    clearChips();
    if (equipoStr === 'Armado de PC Nuevo') {
        inputEl.disabled = false;
        inputEl.placeholder = 'Escribe tu respuesta...';
        setTimeout(() => {
            addBotMsg('Perfecto, dame un breve resumen de lo que quieres hacer con tu pc custom para encontrarte la mejor configuración y armar tu presupuesto.');
            botState = 'esperando_resumen_pc';
        }, 400);
        return;
    }
    // Windows tanto para laptop como para PC de escritorio.
    let servicios;
    if (equipoStr === 'Mac / MacBook')
        servicios = SERVICIOS_MAC;
    else if (equipoStr === 'Consola')
        servicios = SERVICIOS_CONSOLAS;
    else
        servicios = SERVICIOS_WINDOWS;
    inputEl.disabled = true;
    inputEl.placeholder = 'Selecciona una opción arriba 👆';
    setTimeout(() => {
        addBotMsg('Entendido. Estos son los servicios disponibles para tu ' + equipoStr + ', elige el que necesitas:');
        botState = 'esperando_servicio';
        setChips(servicios.map(s => ({
            label: s.label + ' — $' + s.price + ' MXN' + (s.note ? ' (' + s.note + ')' : ''),
            fn: () => selectServicio(s.label),
        })));
    }, 400);
}
function selectServicio(servicioLabel) {
    addUserMsg(servicioLabel);
    clearChips();
    userData.servicio = servicioLabel;
    explicarHorarios();
}
function finalizarFlujoArmado() {
    clearChips();
    inputEl.disabled = true;
    inputEl.placeholder = 'Enviando información...';
    setTimeout(() => {
        addBotMsg('¡Perfecto! Ya tengo los detalles. Toca el botón de abajo para mandarme esta info por WhatsApp y armar tu cotización.');
        const resumen = '¡Hola Técnico! Quiero armar una PC Custom 🖥️\n\n👤 Nombre: ' + userData.nombre + '\n📝 Detalles: ' + userData.servicio;
        const btnLink = document.createElement('a');
        btnLink.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(resumen);
        btnLink.target = '_blank';
        btnLink.className = 'chip-confirm';
        btnLink.textContent = 'Cotizar por WhatsApp ✅';
        msgsEl.appendChild(btnLink);
        scrollToBottom();
        playSound('success');
        botState = 'init';
    }, 600);
}
function explicarHorarios() {
    botState = 'explicando_horarios';
    setTimeout(() => {
        addBotMsg('Tomo nota.\n\nTe explico nuestros horarios:\n🔹 Lun y Mar: Todo el día (9:00 AM a 5:00 PM).\n🔹 Mié a Dom: Recolección después de las 4:30 PM. Entrega al día siguiente a las 6:00 PM.\n\nSabiendo esto, ¿qué día prefieres?');
        inputEl.disabled = false;
        inputEl.placeholder = 'Escribe tu preferencia de día...';
        inputEl.focus();
        botState = 'esperando_horario';
        if (window.innerWidth <= 640)
            setTimeout(() => inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
    }, 500);
}
function interceptInput(text) {
    if (botState === 'esperando_horario') {
        addUserMsg(text);
        inputEl.value = '';
        userData.horario = text;
        setTimeout(() => {
            addBotMsg('IMPORTANTE: Las recolecciones y entregas se hacen **Únicamente en punto medio**.\n\nTenemos dos opciones. ¿Cuál te queda mejor?');
            inputEl.disabled = true;
            inputEl.placeholder = 'Selecciona un punto medio 👇';
            setChips([
                { label: 'Walmart Solidaridad Reforma', fn: () => finalizarFlujo('Walmart Solidaridad Reforma') },
                { label: 'Unison', fn: () => finalizarFlujo('Unison') },
            ]);
        }, 500);
    }
    else {
        handleUserInput(text);
    }
}
function finalizarFlujo(punto) {
    addUserMsg(punto);
    userData.puntoEncuentro = punto;
    clearChips();
    inputEl.disabled = true;
    inputEl.placeholder = 'Enviando información...';
    setTimeout(() => {
        addBotMsg('¡Todo listo! Toca el botón de abajo para enviarme este resumen directo a mi WhatsApp y confirmar tu cita.');
        const resumen = '¡Hola Técnico! Quiero confirmar una cita 🛠️\n\n👤 Nombre: ' +
            userData.nombre +
            '\n🔧 Servicio: ' +
            userData.servicio +
            '\n⏰ Día/Hora: ' +
            userData.horario +
            '\n🤝 Punto de Encuentro: ' +
            userData.puntoEncuentro;
        const btnLink = document.createElement('a');
        btnLink.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(resumen);
        btnLink.target = '_blank';
        btnLink.className = 'chip-confirm';
        btnLink.textContent = 'Confirmar por WhatsApp ✅';
        msgsEl.appendChild(btnLink);
        scrollToBottom();
        playSound('success');
        botState = 'init';
    }, 600);
}
/* ================= EVENT LISTENERS ================= */
document.getElementById('fabBot').addEventListener('click', () => {
    playSound('click');
    const isOpen = panel.classList.contains('open');
    if (isOpen)
        panel.classList.remove('open');
    else
        openBotWithFlow();
});
document.getElementById('botClose').addEventListener('click', () => {
    playSound('click');
    panel.classList.remove('open');
});
document.getElementById('botSend').addEventListener('click', () => {
    playSound('click');
    interceptInput(inputEl.value);
});
inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        playSound('click');
        interceptInput(inputEl.value);
    }
});
document
    .querySelectorAll('.price-card, .type-card, .btn-ghost, .btn-wa, .info-box, .hero-text-block, .feature-card')
    .forEach(el => {
    el.addEventListener('mouseenter', () => playSound('hover'));
});
document.getElementById('service-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget)
        closeModal();
});
/* Exponer al scope global las funciones invocadas desde atributos onclick= en el HTML */
const globalWindow = window;
globalWindow.openTab = openTab;
globalWindow.promptService = promptService;
globalWindow.sendServiceWa = sendServiceWa;
globalWindow.openServiceBot = openServiceBot;
globalWindow.closeModal = closeModal;
globalWindow.playSound = playSound;
