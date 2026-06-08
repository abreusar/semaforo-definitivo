/* ============================================================
   MAIN.JS — Lógica do Semáforo Inteligente
   A3 – Projeto Matemática Computacional Aplicada
   ============================================================ */

// ── Definição dos estados conforme o documento ──
// Verde = 26s, Amarelo = 4s, Vermelho = 30s, Ciclo = 60s
var STATES = {
  E1: {                    // Via A aberta
    duration: 26,
    viaA: 'green',         // Via A: verde
    viaB: 'red',           // Via B: vermelho
    pedA: false,           // Pedestres Via A: vermelho
    pedB: true,            // Pedestres Via B: verde
    next: 'E2'
  },
  E2: {                    // Transição Via A
    duration: 4,
    viaA: 'yellow',        // Via A: amarelo
    viaB: 'red',           // Via B: vermelho
    pedA: false,           // Pedestres Via A: vermelho
    pedB: true,            // Pedestres Via B: verde
    next: 'E3'
  },
  E3: {                    // Via B aberta
    duration: 26,
    viaA: 'red',           // Via A: vermelho
    viaB: 'green',         // Via B: verde
    pedA: true,            // Pedestres Via A: verde
    pedB: false,           // Pedestres Via B: vermelho
    next: 'E4'
  },
  E4: {                    // Transição Via B
    duration: 4,
    viaA: 'red',           // Via A: vermelho
    viaB: 'yellow',        // Via B: amarelo
    pedA: true,            // Pedestres Via A: verde
    pedB: false,           // Pedestres Via B: vermelho
    next: 'E1'
  }
};

// ── Variáveis globais ──
var currentState = 'E1';
var timeLeft = STATES.E1.duration;
var timerInterval = null;
var isEmergency = false;        // flag de emergência
var pedestrianRequest = false;  // flag de pedestre solicitou

// ============================================================
// FUNÇÕES VISUAIS — Semáforos
// ============================================================

// Limpa todas as luzes de veículos
function clearAllLights() {
  var allLights = document.querySelectorAll('.light');
  for (var i = 0; i < allLights.length; i++) {
    allLights[i].classList.remove('on');
  }
}

// Aplica o estado visual no cruzamento
function applyState(stateKey) {
  var state = STATES[stateKey];

  // Limpa luzes
  clearAllLights();

  // ── Semáforo Via A ──
  if (state.viaA === 'green') {
    document.getElementById('tl-a-green').classList.add('on');
  } else if (state.viaA === 'yellow') {
    document.getElementById('tl-a-yellow').classList.add('on');
  } else {
    document.getElementById('tl-a-red').classList.add('on');
  }

  // ── Semáforo Via B ──
  if (state.viaB === 'green') {
    document.getElementById('tl-b-green').classList.add('on');
  } else if (state.viaB === 'yellow') {
    document.getElementById('tl-b-yellow').classList.add('on');
  } else {
    document.getElementById('tl-b-red').classList.add('on');
  }

  // ── Pedestres ──
  var pedAIndicator = document.getElementById('ped-a-indicator');
  var pedBIndicator = document.getElementById('ped-b-indicator');

  if (state.pedA) {
    pedAIndicator.classList.add('walk');
  } else {
    pedAIndicator.classList.remove('walk');
  }

  if (state.pedB) {
    pedBIndicator.classList.add('walk');
  } else {
    pedBIndicator.classList.remove('walk');
  }

  // ── Atualiza label do estado ──
  var stateLabel = document.getElementById('currentStateLabel');
  if (stateLabel) {
    stateLabel.textContent = stateKey;
  }
}

// ============================================================
// FUNÇÕES VISUAIS — Emergência
// ============================================================

// Coloca todos os semáforos em vermelho
function applyAllRed() {
  clearAllLights();

  // Todos em vermelho
  document.getElementById('tl-a-red').classList.add('on');
  document.getElementById('tl-b-red').classList.add('on');

  // Todos os pedestres bloqueados
  document.getElementById('ped-a-indicator').classList.remove('walk');
  document.getElementById('ped-b-indicator').classList.remove('walk');
}

// Mostra/esconde o overlay de emergência
function toggleEmergencyOverlay(show) {
  var overlay = document.getElementById('emergencyOverlay');
  var crossroad = document.getElementById('crossroad');
  var badge = document.getElementById('emergencyBadge');
  var btn = document.getElementById('btnEmergency');

  if (show) {
    overlay.classList.remove('hidden');
    crossroad.classList.add('emergency-active');
    badge.classList.remove('hidden');
    btn.classList.add('active');
  } else {
    overlay.classList.add('hidden');
    crossroad.classList.remove('emergency-active');
    badge.classList.add('hidden');
    btn.classList.remove('active');
  }
}

// ============================================================
// FUNÇÕES VISUAIS — Badge de pedestre
// ============================================================

function showPedestrianBadge() {
  var badge = document.getElementById('pedBadge');
  if (badge) {
    badge.classList.remove('hidden');
  }
}

function hidePedestrianBadge() {
  var badge = document.getElementById('pedBadge');
  if (badge) {
    badge.classList.add('hidden');
  }
}

// ============================================================
// FUNÇÕES VISUAIS — Grafo SVG
// ============================================================

function updateGraph(stateKey) {
  var nodeIds = ['graph-E1', 'graph-E2', 'graph-E3', 'graph-E4'];
  for (var i = 0; i < nodeIds.length; i++) {
    var node = document.getElementById(nodeIds[i]);
    if (node) {
      // Extrai o estado do id (ex: "graph-E1" → "E1")
      var nodeState = nodeIds[i].replace('graph-', '');
      if (nodeState === stateKey) {
        node.classList.add('active');
      } else {
        node.classList.remove('active');
      }
    }
  }
}

// ============================================================
// CONTADOR / TIMER
// ============================================================

// Atualiza o contador visual
function updateCountdown() {
  var countdownLabel = document.getElementById('countdownLabel');
  if (countdownLabel) {
    countdownLabel.textContent = timeLeft + 's';
  }
}

// Tick do timer — chamado a cada 1 segundo
function tick() {
  // Se está em emergência, não faz nada
  if (isEmergency) return;

  timeLeft--;
  updateCountdown();

  if (timeLeft <= 0) {
    // Transição para o próximo estado
    currentState = STATES[currentState].next;
    timeLeft = STATES[currentState].duration;

    // Se o pedestre solicitou e entramos num estado verde (E1 ou E3),
    // a solicitação é consumida (pedestre já está sendo atendido no próximo ciclo)
    if (pedestrianRequest && (currentState === 'E2' || currentState === 'E4')) {
      // Chegou no amarelo após o verde — pedestre será liberado no próximo estado
      pedestrianRequest = false;
      hidePedestrianBadge();
    }

    applyState(currentState);
    updateCountdown();

    // Atualiza seção acadêmica
    if (typeof updateAcademicSection === 'function') {
      updateAcademicSection(currentState);
    }

    // Atualiza grafo
    updateGraph(currentState);
  }
}

// ============================================================
// CONTROLES PRINCIPAIS
// ============================================================

// ── Iniciar sistema ──
window.startSystem = function () {
  // Se está em emergência, desativa primeiro
  if (isEmergency) {
    isEmergency = false;
    toggleEmergencyOverlay(false);
  }

  // Limpa timer anterior
  if (timerInterval) clearInterval(timerInterval);

  // Reset
  currentState = 'E1';
  timeLeft = STATES[currentState].duration;
  pedestrianRequest = false;
  hidePedestrianBadge();

  // Aplica estado visual
  applyState(currentState);
  updateCountdown();
  updateGraph(currentState);

  // Atualiza seção acadêmica
  if (typeof updateAcademicSection === 'function') {
    updateAcademicSection(currentState);
  }

  // Inicia timer
  timerInterval = setInterval(tick, 1000);
};

// ── Próximo estado (manual) ──
window.nextState = function () {
  // Se está em emergência, ignora
  if (isEmergency) return;

  currentState = STATES[currentState].next;
  timeLeft = STATES[currentState].duration;

  // Consome pedestre se aplicável
  if (pedestrianRequest && (currentState === 'E2' || currentState === 'E4')) {
    pedestrianRequest = false;
    hidePedestrianBadge();
  }

  applyState(currentState);
  updateCountdown();
  updateGraph(currentState);

  if (typeof updateAcademicSection === 'function') {
    updateAcademicSection(currentState);
  }
};

// ── Pedestre solicita travessia ──
// Lógica: se o sistema está num estado verde (E1 ou E3),
// reduz o tempo restante para 5s, acelerando a transição
// para liberar os pedestres mais rapidamente.
window.requestPedestrian = function () {
  // Se está em emergência, ignora
  if (isEmergency) return;

  // Se já solicitou, ignora
  if (pedestrianRequest) return;

  pedestrianRequest = true;
  showPedestrianBadge();

  // Se está num estado verde (E1 ou E3) com mais de 5s restantes,
  // reduz o tempo para acelerar a transição
  if ((currentState === 'E1' || currentState === 'E3') && timeLeft > 5) {
    timeLeft = 5;
    updateCountdown();
  }
};

// ── Modo emergência (toggle) ──
// Lógica: todos os semáforos ficam vermelho,
// todos os pedestres ficam bloqueados,
// o timer para. Clicar novamente retoma o ciclo.
window.toggleEmergency = function () {
  if (!isEmergency) {
    // ── ATIVAR EMERGÊNCIA ──
    isEmergency = true;

    // Para o timer
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    // Todos em vermelho
    applyAllRed();

    // Atualiza label
    var stateLabel = document.getElementById('currentStateLabel');
    if (stateLabel) {
      stateLabel.textContent = 'EMRG';
    }

    var countdownLabel = document.getElementById('countdownLabel');
    if (countdownLabel) {
      countdownLabel.textContent = '--';
    }

    // Mostra overlay
    toggleEmergencyOverlay(true);

    // Limpa pedestre
    pedestrianRequest = false;
    hidePedestrianBadge();

  } else {
    // ── DESATIVAR EMERGÊNCIA ──
    isEmergency = false;

    // Esconde overlay
    toggleEmergencyOverlay(false);

    // Retoma o ciclo do estado atual
    applyState(currentState);
    updateCountdown();
    updateGraph(currentState);

    if (typeof updateAcademicSection === 'function') {
      updateAcademicSection(currentState);
    }

    // Reinicia o timer
    timerInterval = setInterval(tick, 1000);
  }
};

// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
  // Aplica estado inicial (E1) sem iniciar o timer
  applyState(currentState);
  updateCountdown();
  updateGraph(currentState);

  if (typeof updateAcademicSection === 'function') {
    updateAcademicSection(currentState);
  }
});