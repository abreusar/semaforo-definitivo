
/* ============================================================
   ACADEMIC.JS — Seção Acadêmica (tabelas, lógica, MEF, conjuntos)
   A3 – Projeto Matemática Computacional Aplicada
   ============================================================ */

// ── Variáveis binárias de cada estado ──
// A=1 → Via A verde, B=1 → Via B verde
// PA=1 → Pedestre Via A livre, PB=1 → Pedestre Via B livre
// YA=1 → Via A amarelo, YB=1 → Via B amarelo
var STATE_VARS = {
  E1: { A: 1, B: 0, PA: 0, PB: 1, YA: 0, YB: 0 },
  E2: { A: 0, B: 0, PA: 0, PB: 1, YA: 1, YB: 0 },
  E3: { A: 0, B: 1, PA: 1, PB: 0, YA: 0, YB: 0 },
  E4: { A: 0, B: 0, PA: 1, PB: 0, YA: 0, YB: 1 }
};

// ── Conjuntos: estados onde cada variável = 1 ──
var SETS_ACAD = {
  A:  ['E1'],
  B:  ['E3'],
  PA: ['E3', 'E4'],
  PB: ['E1', 'E2'],
  YA: ['E2'],
  YB: ['E4']
};

// ============================================================
// 1. TABELAS — Destaca a linha do estado atual
// ============================================================

function highlightTableRows(stateKey) {
  // Tabela binária
  var binaryRows = document.querySelectorAll('#binaryTable tbody tr');
  for (var i = 0; i < binaryRows.length; i++) {
    if (binaryRows[i].dataset.state === stateKey) {
      binaryRows[i].classList.add('active-row');
    } else {
      binaryRows[i].classList.remove('active-row');
    }
  }

  // Tabela-verdade
  var truthRows = document.querySelectorAll('#truthTable tbody tr');
  for (var j = 0; j < truthRows.length; j++) {
    if (truthRows[j].dataset.state === stateKey) {
      truthRows[j].classList.add('active-row');
    } else {
      truthRows[j].classList.remove('active-row');
    }
  }
}

// ============================================================
// 2. LÓGICA PROPOSICIONAL — Valida regras em tempo real
// ============================================================

function updateLogicRules(stateKey) {
  var v = STATE_VARS[stateKey];

  // ── Regra 1: ¬(A ∧ B) — duas vias nunca abrem juntas ──
  var r1 = !(v.A && v.B);
  var el1 = document.getElementById('rule1');
  var icon1 = document.getElementById('rule1-icon');
  var eval1 = document.getElementById('rule1-eval');

  if (el1) {
    el1.className = r1 ? 'logic-rule valid' : 'logic-rule invalid';
  }
  if (icon1) {
    icon1.textContent = r1 ? '\u2713' : '\u2717';
  }
  if (eval1) {
    var aAndB = (v.A && v.B) ? 1 : 0;
    var notAandB = r1 ? 1 : 0;
    var r1text = r1 ? 'VERDADEIRO' : 'FALSO';
    eval1.textContent = 'A=' + v.A + ', B=' + v.B +
      ' | A\u2227B=' + aAndB +
      ' | \u00AC(A\u2227B)=' + notAandB +
      ' | ' + r1text;
  }

  // ── Regra 2: PA = ¬A ∧ ¬YA ──
  var expectedPA = (!v.A && !v.YA) ? 1 : 0;
  var r2 = (v.PA === expectedPA);
  var el2 = document.getElementById('rule2');
  var icon2 = document.getElementById('rule2-icon');
  var eval2 = document.getElementById('rule2-eval');

  if (el2) {
    el2.className = r2 ? 'logic-rule valid' : 'logic-rule invalid';
  }
  if (icon2) {
    icon2.textContent = r2 ? '\u2713' : '\u2717';
  }
  if (eval2) {
    var r2text = r2 ? 'VERDADEIRO' : 'FALSO';
    eval2.textContent = 'A=' + v.A + ', YA=' + v.YA +
      ' | \u00ACA\u2227\u00ACYA=' + expectedPA +
      ' | PA=' + v.PA +
      ' | ' + r2text;
  }

  // ── Regra 3: PB = ¬B ∧ ¬YB ──
  var expectedPB = (!v.B && !v.YB) ? 1 : 0;
  var r3 = (v.PB === expectedPB);
  var el3 = document.getElementById('rule3');
  var icon3 = document.getElementById('rule3-icon');
  var eval3 = document.getElementById('rule3-eval');

  if (el3) {
    el3.className = r3 ? 'logic-rule valid' : 'logic-rule invalid';
  }
  if (icon3) {
    icon3.textContent = r3 ? '\u2713' : '\u2717';
  }
  if (eval3) {
    var r3text = r3 ? 'VERDADEIRO' : 'FALSO';
    eval3.textContent = 'B=' + v.B + ', YB=' + v.YB +
      ' | \u00ACB\u2227\u00ACYB=' + expectedPB +
      ' | PB=' + v.PB +
      ' | ' + r3text;
  }
}

// ============================================================
// 3. MEF — Destaca o nó ativo no diagrama de estados
// ============================================================

function updateFSM(stateKey) {
  var nodes = document.querySelectorAll('.fsm-node');
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].dataset.state === stateKey) {
      nodes[i].classList.add('active');
    } else {
      nodes[i].classList.remove('active');
    }
  }
}

// ============================================================
// 4. GRAFO SVG — Destaca o nó ativo no grafo direcionado
// ============================================================

function updateGraphAcademic(stateKey) {
  var nodeIds = ['graph-E1', 'graph-E2', 'graph-E3', 'graph-E4'];
  for (var i = 0; i < nodeIds.length; i++) {
    var node = document.getElementById(nodeIds[i]);
    if (node) {
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
// 5. TEORIA DOS CONJUNTOS — Pertencimento dinâmico
// ============================================================

function updateSetMembership(stateKey) {
  // Atualiza o label do estado atual
  var elCurrent = document.getElementById('setCurrentState');
  if (elCurrent) {
    elCurrent.textContent = stateKey;
  }

  // Container de pertencimento
  var container = document.getElementById('setMembership');
  if (!container) return;

  // Labels descritivos de cada variável
  var labels = {
    A:  'A (Via A verde)',
    B:  'B (Via B verde)',
    PA: 'PA (Ped A livre)',
    PB: 'PB (Ped B livre)',
    YA: 'YA (Via A amarelo)',
    YB: 'YB (Via B amarelo)'
  };

  var varNames = ['A', 'B', 'PA', 'PB', 'YA', 'YB'];
  var html = '';

  for (var i = 0; i < varNames.length; i++) {
    var varName = varNames[i];

    // Verifica se o estado atual pertence ao conjunto
    var isMember = (SETS_ACAD[varName].indexOf(stateKey) !== -1);

    var symbol, cssClass;
    if (isMember) {
      symbol = '\u2208';     // ∈
      cssClass = 'member';
    } else {
      symbol = '\u2209';     // ∉
      cssClass = 'not-member';
    }

    html += '<div class="membership-line ' + cssClass + '">';
    html += '<span class="membership-symbol">' + symbol + '</span>';
    html += stateKey + ' ' + symbol + ' ' + labels[varName];
    html += ' = { ' + SETS_ACAD[varName].join(', ') + ' }';
    html += '</div>';
  }

  container.innerHTML = html;
}

// ============================================================
// 6. FUNÇÃO PRINCIPAL — Chamada pelo main.js a cada mudança
// ============================================================

function updateAcademicSection(stateKey) {
  // 1. Destaca linhas nas tabelas (binária + verdade)
  highlightTableRows(stateKey);

  // 2. Valida e exibe regras de lógica proposicional
  updateLogicRules(stateKey);

  // 3. Destaca nó ativo na MEF (diagrama CSS)
  updateFSM(stateKey);

  // 4. Destaca nó ativo no grafo SVG
  updateGraphAcademic(stateKey);

  // 5. Atualiza pertencimento na teoria dos conjuntos
  updateSetMembership(stateKey);
}