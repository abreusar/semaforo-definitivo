/* 
   lógica do semáforo inteligente
   cérebro do semáforo (estados, timer, controles)*/

// definição dos estados conforme o documento 
// verde = 26s, amarelo = 4s, vermelho = 30s, ciclo = 60s
var STATES = {
  E1: {                    // via A aberta
    duration: 26,
    viaA: 'green',         // via A: verde
    viaB: 'red',           // via B: vermelho
    pedA: false,           // pedestres Via A: vermelho
    pedB: true,            // pedestres Via B: verde
    next: 'E2'
  },
  E2: {                    // transição Via A
    duration: 4,
    viaA: 'yellow',        // via A: amarelo
    viaB: 'red',           // via B: vermelho
    pedA: false,           // pedestres Via A: vermelho
    pedB: true,            // pedestres Via B: verde
    next: 'E3'
  },
  E3: {                    // via B aberta
    duration: 26,
    viaA: 'red',           // via A: vermelho
    viaB: 'green',         // via B: verde
    pedA: true,            // pedestres Via A: verde
    pedB: false,           // pedestres Via B: vermelho
    next: 'E4'
  },
  E4: {                    // transição Via B
    duration: 4,
    viaA: 'red',           // via A: vermelho
    viaB: 'yellow',        // via B: amarelo
    pedA: true,            // pedestres via A: verde
    pedB: false,           // pedestres via B: vermelho
    next: 'E1'
  }
};

// variáveis globais 
var currentState = 'E1';
var timeLeft = STATES.E1.duration;
var timerInterval = null;
var isEmergency = false;        // flag de emergência
var pedestrianRequest = false;  // flag de pedestre solicitou

// FUNÇÕES VISUAIS - semáforos

// limpa todas as luzes de veículos
function clearAllLights() {
  var allLights = document.querySelectorAll('.light');
  for (var i = 0; i < allLights.length; i++) {
    allLights[i].classList.remove('on');
  }
}

// aplica o estado visual no cruzamento
function applyState(stateKey) {
  var state = STATES[stateKey];

  // limpa luzes
  clearAllLights();

  //  semáforo via A 
  if (state.viaA === 'green') {
    document.getElementById('tl-a-green').classList.add('on');
  } else if (state.viaA === 'yellow') {
    document.getElementById('tl-a-yellow').classList.add('on');
  } else {
    document.getElementById('tl-a-red').classList.add('on');
  }

  // semáforo via B 
  if (state.viaB === 'green') {
    document.getElementById('tl-b-green').classList.add('on');
  } else if (state.viaB === 'yellow') {
    document.getElementById('tl-b-yellow').classList.add('on');
  } else {
    document.getElementById('tl-b-red').classList.add('on');
  }

  // pedestres 
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

  // atualiza label do estado 
  var stateLabel = document.getElementById('currentStateLabel');
  if (stateLabel) {
    stateLabel.textContent = stateKey;
  }
}

// FUNÇÕES VISUAIS - emergência

// coloca todos os semáforos em vermelho
function applyAllRed() {
  clearAllLights();

  // todos em vermelho
  document.getElementById('tl-a-red').classList.add('on');
  document.getElementById('tl-b-red').classList.add('on');

  // todos os pedestres bloqueados
  document.getElementById('ped-a-indicator').classList.remove('walk');
  document.getElementById('ped-b-indicator').classList.remove('walk');
}

// mostra/esconde o overlay de emergência
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

// FUNÇÕES VISUAIS — badge de pedestre

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

// FUNÇÕES VISUAIS — grafo SVG

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

// CONTADOR / TIMER

// atualiza o contador visual
function updateCountdown() {
  var countdownLabel = document.getElementById('countdownLabel');
  if (countdownLabel) {
    countdownLabel.textContent = timeLeft + 's';
  }
}

// tick do timer - chamado a cada 1 segundo
function tick() {
  // se está em emergência, não faz nada
  if (isEmergency) return;

  timeLeft--;
  updateCountdown();

  if (timeLeft <= 0) {
    // transição para o próximo estado
    currentState = STATES[currentState].next;
    timeLeft = STATES[currentState].duration;

    // se o pedestre solicitou e entramos num estado verde (E1 ou E3),
    // a solicitação é consumida (pedestre já está sendo atendido no próximo ciclo)
    if (pedestrianRequest && (currentState === 'E2' || currentState === 'E4')) {
      // chegou no amarelo após o verde = pedestre será liberado no próximo estado
      pedestrianRequest = false;
      hidePedestrianBadge();
    }

    applyState(currentState);
    updateCountdown();

    // atualiza seção acadêmica
    if (typeof updateAcademicSection === 'function') {
      updateAcademicSection(currentState);
    }

    // atualiza grafo
    updateGraph(currentState);
  }
}

// CONTROLES PRINCIPAIS

// iniciar sistema 
window.startSystem = function () {
  // Se está em emergência, desativa primeiro
  if (isEmergency) {
    isEmergency = false;
    toggleEmergencyOverlay(false);
  }

  // limpa timer anterior
  if (timerInterval) clearInterval(timerInterval);

  // reset
  currentState = 'E1';
  timeLeft = STATES[currentState].duration;
  pedestrianRequest = false;
  hidePedestrianBadge();

  // aplica estado visual
  applyState(currentState);
  updateCountdown();
  updateGraph(currentState);

  // atualiza seção acadêmica
  if (typeof updateAcademicSection === 'function') {
    updateAcademicSection(currentState);
  }

  // inicia timer
  timerInterval = setInterval(tick, 1000);
};

// próximo estado (manual) 
window.nextState = function () {
  // se está em emergência, ignora
  if (isEmergency) return;

  currentState = STATES[currentState].next;
  timeLeft = STATES[currentState].duration;

  // consome pedestre se aplicável
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

// pedestre solicita travessia 
// lógica: se o sistema está num estado verde (E1 ou E3),
// reduz o tempo restante para 5s, acelerando a transição
// para liberar os pedestres mais rapidamente.
window.requestPedestrian = function () {
  // se está em emergência, ignora
  if (isEmergency) return;

  // se já solicitou, ignora
  if (pedestrianRequest) return;

  pedestrianRequest = true;
  showPedestrianBadge();

  // se está num estado verde (E1 ou E3) com mais de 5s restantes,
  // reduz o tempo para acelerar a transição
  if ((currentState === 'E1' || currentState === 'E3') && timeLeft > 5) {
    timeLeft = 5;
    updateCountdown();
  }
};

// modo emergência (toggle) 
// Lógica: todos os semáforos ficam vermelho,
// todos os pedestres ficam bloqueados,
// o timer para. Clicar novamente retoma o ciclo.
window.toggleEmergency = function () {
  if (!isEmergency) {
    //  ATIVAR EMERGÊNCIA 
    isEmergency = true;

    // para o timer
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    // todos em vermelho
    applyAllRed();

    // atualiza label
    var stateLabel = document.getElementById('currentStateLabel');
    if (stateLabel) {
      stateLabel.textContent = 'EMRG';
    }

    var countdownLabel = document.getElementById('countdownLabel');
    if (countdownLabel) {
      countdownLabel.textContent = '--';
    }

    // mostra overlay
    toggleEmergencyOverlay(true);

    // limpa pedestre
    pedestrianRequest = false;
    hidePedestrianBadge();

  } else {
    // DESATIVAR EMERGÊNCIA 
    isEmergency = false;

    // esconde overlay
    toggleEmergencyOverlay(false);

    // retoma o ciclo do estado atual
    applyState(currentState);
    updateCountdown();
    updateGraph(currentState);

    if (typeof updateAcademicSection === 'function') {
      updateAcademicSection(currentState);
    }

    // reinicia o timer
    timerInterval = setInterval(tick, 1000);
  }
};

// INICIALIZAÇÃO

document.addEventListener('DOMContentLoaded', function () {
  // aplica estado inicial (E1) sem iniciar o timer
  applyState(currentState);
  updateCountdown();
  updateGraph(currentState);

  if (typeof updateAcademicSection === 'function') {
    updateAcademicSection(currentState);
  }
});