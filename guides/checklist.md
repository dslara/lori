# ✅ Checklist de Validação

> Valide sua preparação antes de cada sessão. 2 minutos que economizam 30.

**Última atualização**: 2026-03-07

---

## 🔧 Verificação de Ambiente

Confirme antes de começar:

- [ ] **OpenCode instalado**
  ```bash
  opencode --version
  # Deve retornar versão (ex: 0.5.1)
  ```

- [ ] **Make disponível**
  ```bash
  make help
  # Deve listar 21 comandos
  ```

- [ ] **Módulo ativo definido**
  ```bash
  make status
  # Deve mostrar: M1-math-foundations, M2-zig-foundations, etc.
  ```

- [ ] **Dados inicializados**
  ```bash
  ls data/*.csv
  # Deve listar: sessions.csv, insights.csv, etc.
  ```

---

## 🧠 Checklist Mental Pré-Sessão

Responda mentalmente antes de `make start`:

- [ ] **Objetivo claro**: O que vou aprender/praticar hoje? (1 frase)
- [ ] **Duração definida**: Quanto tempo vou estudar? (recomendado: 1h)
- [ ] **Distrações eliminadas**:
  - [ ] Celular no modo Não Perturbe
  - [ ] Notificações desligadas
  - [ ] Abas irrelevantes fechadas
- [ ] **Materiais prontos**:
  - [ ] Café/água à mão
  - [ ] Caderno/digital para anotações rápidas
  - [ ] Ambiente configurado ([environment-design.md](tecnicas/environment-design.md))

---

## ⚠️ Armadilhas Comuns (Alertas Visuais)

### 🔴 NÃO COMECE SE:

```
┌──────────────────────────────────────────────────────────────┐
│ ❌ NÃO TENHO OBJETIVO ESPECÍFICO                             │
│    "Vou estudar Python" → VAGO                               │
│    "Vou implementar binary search em Python" → BOM           │
├──────────────────────────────────────────────────────────────┤
│ ❌ VOU PULAR O WARM-UP                                       │
│    O quiz ativa memória do dia anterior                      │
│    Sem warm-up = perde 20% de eficiência                     │
├──────────────────────────────────────────────────────────────┤
│ ❌ PLANEJO ESTUDAR +2 HORAS SEM PAUSA                        │
│    Use pomodoro: 50 min foco + 10 min break                   │
│    Ou: make break (15 min modo difuso - Oakley)              │
├──────────────────────────────────────────────────────────────┤
│ ❌ VOU ENCERRAR SEM LOGAR O QUE APRENDI                      │
│    make end = streak + memória consolidada                   │
│    Não logar = esquece 40% em 24h                           │
└──────────────────────────────────────────────────────────────┘
```

---

## 📊 Auto-Avaliação Rápida

**Leiainess de 1 a 10:** ___/10

| Score | Ação Recomendada |
|-------|------------------|
| **8-10** | 🚀 Vá para `make start` |
| **5-7** | 🐢 Use `#zombie` mode (Two-Minute Rule) |
| **1-4** | 💤 Considere descansar e remarcar |

**Se score < 7:**
```bash
opencode run --agent @tutor "#zombie"
# Agente vai te guiar para começar ridiculamente pequeno
```

---

## ✅ Validação Pós-Sessão

Confirme antes de sair:

- [ ] **Sessão salva no CSV**
  ```bash
  tail -3 data/sessions.csv
  # Deve conter sua sessão de hoje
  ```

- [ ] **Streak atualizado**
  ```bash
  make status
  # Confirme que o streak incrementou
  ```

- [ ] **Próxima sessão agendada**
  - Data/hora definida no calendário
  - Objetivo pré-definido (anotado)

- [ ] **Conceitos difíceis marcados**
  ```bash
  make review
  # Adicione ao SRS o que não dominou 100%
  ```

---

## 🎯 Checklist de Qualidade (Semanal)

Todo domingo, verifique:

- [ ] **Retrospectiva feita**
  ```bash
  make retro
  ```

- [ ] **Plano da semana criado**
  ```bash
  make plan
  ```

- [ ] **Streak mantido** (7 dias seguidos?)
  ```bash
  make status
  ```

- [ ] **SRS revisado** (mínimo 3x na semana)
  ```bash
  make review
  ```

- [ ] **Projetos avançando**
  - Algum projeto prático em andamento?
  - Não ficou só na teoria?

---

## 🚨 Troubleshooting Rápido

### Travou no meio do estudo?
```bash
make break  # 15 min modo difuso (Oakley)
```

### Não consegue focar?
```bash
opencode run --agent @tutor "#diffuse"
# Ou verifique: [pomodoro.md](tecnicas/pomodoro.md)
```

### Erros recorrentes no drill?
```bash
make drill-extra  # Overlearning: 5 variações de dificuldade
```

### Procrastinando?
```bash
opencode run --agent @tutor "#zombie"
# Ou leia: [procrastination-zombie.md](tecnicas/procrastination-zombie.md)
```

---

## 📋 Versão Imprimível

Cópia curta para deixar na mesa:

```
PRÉ-SESSÃO:
☐ OpenCode ok | ☐ Objetivo definido | ☐ Distrações off
☐ Materiais prontos | ☐ 1h disponível

PÓS-SESSÃO:
☐ Sessão salva | ☐ Streak ok | ☐ Próxima marcada
☐ Difíceis no SRS

SE TRAVAR: make break
SE NÃO CONSEGUIR COMEÇAR: #zombie
```

---

**2 minutos de preparação = sessão 3x mais produtiva**
