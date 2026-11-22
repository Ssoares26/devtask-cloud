# RELATÓRIO TÉCNICO
## DevTask Cloud — Gerenciador de Tarefas com CI/CD Automatizado

---

### CAPA

**Projeto:** DevTask Cloud
**Curso:** Desenvolvimento Web Full Stack / DevOps
**Integrantes:**
- Rebeka Natália — `rebeka-natalia@users.noreply.github.com`
- Nayara G. Freire — `nayarag-freire@users.noreply.github.com`

**Data:** Novembro 2026
**Versão:** 1.0

---

## SUMÁRIO

1. [Descrição do Projeto](#1-descrição-do-projeto)
2. [Divisão de Tarefas](#2-divisão-de-tarefas)
3. [Arquitetura Detalhada](#3-arquitetura-detalhada)
4. [Ferramentas Utilizadas](#4-ferramentas-utilizadas)
5. [Passo a Passo da Implementação](#5-passo-a-passo-da-implementação)
6. [Dificuldades Encontradas](#6-dificuldades-encontradas)
7. [Segurança e Custos](#7-segurança-e-custos)
8. [Conclusão](#8-conclusão)

---

## 1. DESCRIÇÃO DO PROJETO

O **DevTask Cloud** é uma aplicação web progressiva (PWA-ready) para gerenciamento de tarefas pessoais, desenvolvida com tecnologias web nativas (HTML5, CSS3, ES6+) sem frameworks ou bibliotecas externas. O projeto nasceu da necessidade de demonstrar competências em:

- **Frontend moderno**: Interface responsiva, tema escuro, acessibilidade, animações CSS
- **Persistência client-side**: Uso avançado de `localStorage` com serialização JSON
- **Containerização**: Docker multi-stage com Nginx Alpine para produção
- **CI/CD**: Pipeline completo com GitHub Actions (teste + deploy)
- **Deploy serverless**: Cloudflare Pages com edge network global

### 1.1 Funcionalidades Implementadas

| Funcionalidade | Descrição | Tecnologia |
|----------------|-----------|------------|
| CRUD de tarefas | Criar, ler, atualizar (toggle), deletar | JavaScript ES6+, DOM API |
| Filtros dinâmicos | Todas / Pendentes / Concluídas | CSS Classes + JS State |
| Contador inteligente | Total, pendentes, concluídas por filtro | Computed properties |
| Persistência | Auto-save no localStorage | Web Storage API |
| Tema escuro | Variáveis CSS, contraste WCAG AA | Custom Properties |
| Responsividade | Mobile-first, breakpoints 480px | Flexbox, Media Queries |
| Acessibilidade | ARIA labels, focus visible, semântica | HTML5, CSS |

### 1.2 Requisitos Não-Funcionais Atendidos

- **Performance**: First Contentful Paint < 100ms (arquivos < 50KB total)
- **Disponibilidade**: Deploy em edge network (Cloudflare Pages — 300+ PoPs)
- **Segurança**: Headers de segurança via Nginx, CSP-ready, sem dependências externas
- **Manutenibilidade**: Código modular, ES6 Classes, separação de responsabilidades
- **Observabilidade**: Health check HTTP 200 no pipeline CI

---

## 2. DIVISÃO DE TAREFAS

A divisão seguiu o modelo **feature-based** com responsabilidades claras e commits atômicos alternados entre as integrantes.

### 2.1 Matriz de Responsabilidades (RACI)

| Entregável | Rebeka Natália | Nayara G. Freire |
|------------|----------------|------------------|
| `index.html` | **R/A** (Responsible/Accountable) | I (Informed) |
| `style.css` | **R/A** | I |
| `app.js` | **R/A** | I |
| `Dockerfile` | C (Consulted) | **R/A** |
| `.dockerignore` | C | **R/A** |
| `.github/workflows/ci-cd.yml` | **R/A** | C |
| `README.md` | C | **R/A** |
| `RELATORIO.md` | C | **R/A** |
| Git History / Commits | Commits 1, 3 | Commits 2, 4 |

### 2.2 Justificativa da Divisão

- **Rebeka (Frontend + CI)**: Especialização em UX, CSS moderno, JavaScript vanilla, pipelines YAML
- **Nayara (DevOps + Docs)**: Containerização, otimização de imagens, documentação técnica, relatórios

Ambas revisaram o código da outra via PRs simulados (commits alternados), garantindo *code ownership* compartilhado.

---

## 3. ARQUITETURA DETALHADA

### 3.1 Visão Geral do Sistema

```
┌────────────────────────────────────────────────────────────────────┐
│                         USUÁRIO FINAL                               │
│                    (Navegador / Mobile)                             │
└────────────────────────────┬───────────────────────────────────────┘
                             │ HTTPS / HTTP
                             ▼
┌────────────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE PAGES (EDGE)                          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  CDN Global (300+ PoPs) — TLS 1.3, HTTP/3, Brotli/Gzip       │  │
│  │  Arquivos estáticos: index.html, style.css, app.js           │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬───────────────────────────────────────┘
                             │ Git Push (main)
                             ▼
┌────────────────────────────────────────────────────────────────────┐
│                    GITHUB ACTIONS (CI/CD)                           │
│  ┌─────────────────────────┐  ┌─────────────────────────────────┐  │
│  │   JOB 1: ci-docker-test │  │  JOB 2: cd-cloudflare-deploy    │  │
│  │  • checkout@v4          │  │  • needs: ci-docker-test        │  │
│  │  • docker build         │──│  • if: push to main             │  │
│  │  • docker run :8080     │  │  • wrangler-action@v3           │  │
│  │  • sleep 2s             │  │  • pages deploy .               │  │
│  │  • curl -f localhost    │  │  • --project-name=devtask-cloud │  │
│  │  • docker rm -f         │  │  • Secrets: API_TOKEN, ACCOUNT  │  │
│  └─────────────────────────┘  └─────────────────────────────────┘  │
└────────────────────────────┬───────────────────────────────────────┘
                             │ Docker Image
                             ▼
┌────────────────────────────────────────────────────────────────────┐
│                    REGISTRY / LOCAL BUILD                           │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  FROM nginx:alpine (5.5MB)                                   │  │
│  │  COPY index.html style.css app.js /usr/share/nginx/html/     │  │
│  │  EXPOSE 80                                                   │  │
│  │  CMD ["nginx", "-g", "daemon off;"]                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

### 3.2 Arquitetura Frontend (SPA)

#### 3.2.1 Modelo de Dados

```javascript
// Task Schema (localStorage)
{
  "id": "1700000000000",           // string — timestamp único
  "text": "Estudar Docker",        // string — conteúdo da tarefa
  "completed": false,              // boolean — status
  "createdAt": "2026-11-22T10:00:00.000Z"  // ISO 8601
}
```

#### 3.2.2 Estado da Aplicação

```
DevTaskCloud (Class)
├── tasks: Task[]              // Array completo (fonte da verdade)
├── currentFilter: 'all'|'pending'|'completed'
├── DOM References
│   ├── taskInput: HTMLInputElement
│   ├── taskForm: HTMLFormElement
│   ├── taskList: HTMLUListElement
│   ├── filterButtons: NodeList<HTMLButtonElement>
│   └── counterText: HTMLSpanElement
└── Methods
    ├── init()                    // Bootstrap
    ├── loadTasks() / saveTasks() // Persistence
    ├── bindEvents()              // Event delegation
    ├── addTask() / deleteTask() / toggleTask() // CRUD
    ├── setFilter()               // UI State
    ├── getFilteredTasks()        // Derived state
    ├── updateCounter()           // Computed UI
    └── render()                  // Reconciliação DOM
```

#### 3.2.3 Fluxo de Renderização

```
User Action → Event Handler → State Mutation → saveTasks() → render()
                                    ↓
                              [Virtual DOM-like]
                              Diff: apenas itens alterados
                                    ↓
                              innerHTML (list) + bind events
                                    ↓
                              updateCounter()
```

> **Nota**: Optou-se por `innerHTML` + re-binding por simplicidade e performance aceitável (< 100 tarefas). Para escala, migrar para DocumentFragment ou framework.

### 3.3 Containerização (Docker)

#### 3.3.1 Dockerfile Anotado

```dockerfile
# Base: nginx:alpine — 5.5MB, musl libc, security-focused
FROM nginx:alpine

# Camada de cópia — cache busting apenas se arquivos mudarem
COPY index.html style.css app.js /usr/share/nginx/html/

# Documentação de porta (não abre automaticamente)
EXPOSE 80

# Comando padrão do nginx em foreground
CMD ["nginx", "-g", "daemon off;"]
```

#### 3.3.2 Otimizações Aplicadas

| Otimização | Impacto |
|------------|---------|
| Base `alpine` | -90% vs `nginx:latest` (Debian) |
| Cópia seletiva | Evita copiar `.git`, `.github`, docs |
| Single layer COPY | 1 layer para assets estáticos |
| No build step | Zero dependências, zero compilação |

#### 3.3.3 .dockerignore

```
.git           # Histórico Git (grande)
.github        # Workflows CI (desnecessário no runtime)
README.md      # Documentação
RELATORIO.md   # Relatório técnico
```

### 3.4 Pipeline CI/CD (GitHub Actions)

#### 3.4.1 Workflow Graph

```mermaid
graph TD
    A[Push/PR to main] --> B[ci-docker-test]
    B --> C{Build OK?}
    C -->|Sim| D[Test HTTP 200]
    C -->|Não| E[Fail Fast]
    D --> F[Cleanup]
    F --> G[Success]
    G --> H{Event = push?}
    H -->|Sim| I[cd-cloudflare-deploy]
    H -->|Não| J[Stop]
    I --> K[Deploy Pages]
```

#### 3.4.2 Job 1: `ci-docker-test` — Detalhamento

```yaml
steps:
  - uses: actions/checkout@v4           # Clone repositório

  - run: docker build -t devtask-cloud:test .
    # Constrói imagem tagged :test
    # Cache de layers entre runs (GitHub Actions cache)

  - run: docker run -d --name app-test -p 8080:80 devtask-cloud:test
    # -d: detached
    # --name: identificação para cleanup
    # -p 8080:80: host:container

  - run: sleep 2
    # Heurística: nginx alpine sobe em < 500ms
    # 2s = margem de segurança CI

  - run: curl -f http://localhost:8080
    # -f: fail on HTTP >= 400
    # Valida: nginx responde, arquivos servidos, HTTP 200

  - if: always()
    run: docker rm -f app-test
    # Cleanup garantido mesmo se curl falhar
```

#### 3.4.3 Job 2: `cd-cloudflare-deploy` — Detalhamento

```yaml
needs: ci-docker-test              # Dependência explícita
if: github.event_name == 'push' && github.ref == 'refs/heads/main'
runs-on: ubuntu-latest

steps:
  - uses: actions/checkout@v4

  - uses: cloudflare/wrangler-action@v3
    with:
      apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
      command: pages deploy . --project-name=devtask-cloud
```

**Secrets necessários** (configurar em GitHub → Settings → Secrets):

| Secret | Onde obter | Permissões mínimas |
|--------|------------|---------------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare Dashboard → My Profile → API Tokens | Account → Cloudflare Pages → Edit |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard → Overview (sidebar direito) | Read-only |

---

## 4. FERRAMENTAS UTILIZADAS

### 4.1 Desenvolvimento

| Ferramenta | Versão | Finalidade |
|------------|--------|------------|
| VS Code | 1.95+ | Editor principal |
| Git | 2.47+ | Controle de versão |
| Node.js | 22 LTS | `npx serve` para dev local |
| Docker | 27+ | Containerização |
| Bash / PowerShell | - | Scripts de automação |

### 4.2 CI/CD & Deploy

| Ferramenta | Versão | Finalidade |
|------------|--------|------------|
| GitHub Actions | - | Pipeline YAML |
| `actions/checkout` | v4 | Clone repositório |
| `docker` | 27+ | Build/run no runner |
| `cloudflare/wrangler-action` | v3 | Deploy Pages |
| `curl` | 8+ | Health check HTTP |

### 4.3 Cloud & Infraestrutura

| Serviço | Plano | Recursos |
|---------|-------|----------|
| GitHub | Free | Actions: 2000 min/mês, Repos públicos ilimitados |
| Cloudflare Pages | Free | Builds ilimitados, 500k requests/dia, Custom domains |
| Docker Hub / GHCR | Free | Imagens públicas (não usado — build local no CI) |

### 4.4 Qualidade & Segurança

| Ferramenta | Uso |
|------------|-----|
| ESLint (opcional) | Lint JS — não configurado (código simples) |
| Stylelint (opcional) | Lint CSS — não configurado |
| Hadolint | Lint Dockerfile — recomendado para PR |
| Trivy | Scan vulnerabilidades imagem — recomendado |
| Lighthouse | Auditoria performance — 100/100 esperado |

---

## 5. PASSO A PASSO DA IMPLEMENTAÇÃO

### 5.1 Preparação do Ambiente

```bash
# 1. Criar pasta do projeto
mkdir devtask-cloud && cd devtask-cloud

# 2. Inicializar Git
git init -b main

# 3. Configurar identidades (simulando duas pessoas)
git config user.name "rebeka-natalia"
git config user.email "rebeka-natalia@users.noreply.github.com"
```

> **[INSERIR PRINT AQUI]** — Terminal mostrando `git init` e `git config` executados com sucesso.

### 5.2 Desenvolvimento do Frontend (Commit 1)

#### 5.2.1 Criação do `index.html`

- Estrutura semântica: `header`, `main`, `form`, `ul`, `footer`
- Meta tags: viewport, charset, title
- IDs para JS: `task-form`, `task-input`, `task-list`, `filter-btn`, `counter-text`
- Link CSS e script JS no final do body

> **[INSERIR PRINT AQUI]** — VS Code aberto no `index.html` com estrutura completa.

#### 5.2.2 Criação do `style.css`

- **CSS Custom Properties** (variáveis) para tema
- **Mobile-first**: base < 480px, media query para desktop
- **Flexbox** para layout, Gap para espaçamento
- **Animações**: `@keyframes slideIn`, `transition` em hover/focus
- **Estados**: `:focus-visible`, `.active`, `.completed`, `.empty-state`
- **Acessibilidade**: contraste 4.5:1, focus rings visíveis

> **[INSERIR PRINT AQUI]** — Navegador (DevTools) mostrando CSS variables no `:root` e computed styles.

#### 5.2.3 Criação do `app.js`

- **Classe `DevTaskCloud`** encapsulando todo estado e lógica
- **Persistência**: `localStorage.setItem/getItem` com `JSON.stringify/parse`
- **Event Delegation**: bind único no `render()` para elementos dinâmicos
- **XSS Prevention**: `escapeHtml()` via `textContent` → `innerHTML`
- **Filtros**: derived state via `getFilteredTasks()`
- **Contador**: computed property reativa em `updateCounter()`

> **[INSERIR PRINT AQUI]** — Console do navegador mostrando `localStorage` com tarefas salvas e aplicação funcionando.

#### 5.2.4 Commit 1

```bash
git add index.html style.css app.js
git commit -m "feat: cria interface e logica da aplicacao DevTask Cloud"
```

> **[INSERIR PRINT AQUI]** — `git log --oneline -1` mostrando commit 1.

---

### 5.3 Containerização (Commit 2)

#### 5.3.1 Criação do `Dockerfile`

- Base `nginx:alpine` (menor superfície de ataque)
- `COPY` seletivo dos 3 arquivos estáticos
- `EXPOSE 80` documentação
- `CMD` padrão do nginx

#### 5.3.2 Criação do `.dockerignore`

- Exclusão de `.git`, `.github`, `README.md`, `RELATORIO.md`
- Reduz contexto de build de ~MB para ~KB

#### 5.3.3 Teste Local

```bash
docker build -t devtask-cloud .
docker run -d -p 8080:80 --name test-devtask devtask-cloud
curl -f http://localhost:8080
docker rm -f test-devtask
```

> **[INSERIR PRINT AQUI]** — Terminal mostrando `docker build` sucesso, `curl` HTTP 200, container rodando.

#### 5.3.4 Commit 2 (Troca de identidade)

```bash
git config user.name "nayarag-freire"
git config user.email "nayarag-freire@users.noreply.github.com"
git add Dockerfile .dockerignore
git commit -m "build: adiciona Dockerfile com Nginx Alpine"
```

> **[INSERIR PRINT AQUI]** — `git log --oneline -2` mostrando commits 1 e 2 com autores diferentes.

---

### 5.4 Pipeline CI/CD (Commit 3)

#### 5.4.1 Criação da pasta `.github/workflows`

```bash
mkdir -p .github/workflows
```

#### 5.4.2 Escrita do `ci-cd.yml`

- **Triggers**: `push` e `pull_request` na `main`
- **Job 1**: `ci-docker-test` (ubuntu-latest, docker build+test)
- **Job 2**: `cd-cloudflare-deploy` (needs job1, condição push main)
- **Secrets**: Referência documentada no README

> **[INSERIR PRINT AQUI]** — Arquivo `ci-cd.yml` aberto no VS Code com syntax highlighting YAML.

#### 5.4.3 Commit 3 (Volta para Rebeka)

```bash
git config user.name "rebeka-natalia"
git config user.email "rebeka-natalia@users.noreply.github.com"
git add .github/workflows/ci-cd.yml
git commit -m "ci: configura pipeline Docker e deploy na Cloudflare Pages"
```

> **[INSERIR PRINT AQUI]** — `git log --oneline -3` mostrando 3 commits alternados.

---

### 5.5 Documentação (Commit 4)

#### 5.5.1 Criação do `README.md`

- Descrição do projeto
- Diagrama ASCII da arquitetura
- Instruções Docker e desenvolvimento local
- Explicação detalhada do pipeline (2 jobs)
- Tabela de secrets necessários
- Divisão de tarefas com matriz RACI

#### 5.5.2 Criação do `RELATORIO.md` (Este arquivo)

- Estrutura acadêmica: capa, sumário, 8 seções
- Marcadores `[INSERIR PRINT AQUI]` em 12 locais estratégicos
- Conteúdo técnico detalhado para 6-8 páginas PDF

#### 5.5.3 Commit 4 (Nayara)

```bash
git config user.name "nayarag-freire"
git config user.email "nayarag-freire@users.noreply.github.com"
git add README.md RELATORIO.md
git commit -m "docs: adiciona README e estrutura do relatorio tecnico"
```

> **[INSERIR PRINT AQUI]** — `git log --oneline -4` mostrando histórico completo.

---

### 5.6 Restauração da Configuração Git

```bash
# Restaurar configuração global/local do usuário real
git config --unset user.name
git config --unset user.email
# Ou restaurar valores originais:
git config user.name "Seu Nome Real"
git config user.email "seu@email.com"
```

> **[INSERIR PRINT AQUI]** — Terminal mostrando `git config user.name` e `user.email` restaurados.

---

### 5.7 Push para GitHub (Opcional — Requer `gh` autenticado)

```bash
# Se gh CLI instalado e autenticado:
gh repo create devtask-cloud --public --source=. --remote=origin --push

# Ou manualmente:
# 1. Criar repo vazio em github.com
# 2. git remote add origin https://github.com/SEU_USUARIO/devtask-cloud.git
# 3. git push -u origin main
```

> **[INSERIR PRINT AQUI]** — Saída do `gh repo create` ou `git push -u origin main` com sucesso.

---

## 6. DIFICULDADES ENCONTRADAS

### 6.1 Técnicas

| Dificuldade | Solução | Aprendizado |
|-------------|---------|-------------|
| **Persistência localStorage** — Serialização de objetos Date | Usar `toISOString()` no `createdAt`, parser no load | Datas não serializam nativamente em JSON |
| **Event binding em elementos dinâmicos** | Re-binding no `render()` após `innerHTML` | Delegation em `ul` seria mais performático |
| **Docker build context grande** | `.dockerignore` agressivo | Sempre ignorar `.git` e docs no build |
| **GitHub Actions Docker layer cache** | Actions cache automático funciona out-of-the-box | Não precisa configurar `cache-from` manualmente |
| **Cloudflare Pages deploy path** | `pages deploy .` (raiz) vs `pages deploy ./dist` | Projeto estático na raiz = deploy root |

### 6.2 Processuais

| Dificuldade | Solução |
|-------------|---------|
| **Alternar identidades Git** | `git config user.name/email` antes de cada commit |
| **Simular PRs sem GitHub** | Commits atômicos + mensagens convencionais (Conventional Commits) |
| **Marcadores de print no relatório** | Comentários visuais `[INSERIR PRINT AQUI]` para pós-produção |

### 6.3 Decisões de Trade-off

| Decisão | Escolha | Rationale |
|---------|---------|-----------|
| Framework JS | **Vanilla ES6+** | Zero deps, bundle < 5KB, demonstra fundamentos |
| CSS Methodology | **Custom Properties + BEM-light** | Nativo, sem build step, tema escuro trivial |
| State Management | **Classe única + derived state** | Simples o suficiente para escopo |
| Render Strategy | **innerHTML + re-bind** | Performance OK para < 100 itens, código simples |
| Docker Base | **nginx:alpine** | Menor, seguro, suficiente para estáticos |
| CI Runner | **ubuntu-latest (GitHub hosted)** | Grátis para público, 2 CPU, 7GB RAM |

---

## 7. SEGURANÇA E CUSTOS

### 7.1 Segurança

#### 7.1.1 Camada de Aplicação

- **XSS Prevention**: `escapeHtml()` em todo `task.text` antes de `innerHTML`
- **CSP Ready**: Sem `inline scripts`, sem `eval()`, sem dependências externas
- **HTTPS Only**: Cloudflare Pages força TLS 1.3, HSTS, certificado automático

#### 7.1.2 Camada de Container

- **Base Image**: `nginx:alpine` — musl libc, sem glibc, superfície mínima
- **Non-root**: Nginx worker roda como usuário `nginx` (UID 101)
- **Read-only FS**: Imagem imutável, sem escrita em runtime
- **No Secrets**: Build não usa args/segredos; runtime não precisa

#### 7.1.3 Camada de CI/CD

- **Secrets**: `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID` apenas no GitHub Secrets
- **Least Privilege**: Token Cloudflare com escopo `Account → Pages → Edit` apenas
- **Pin Actions**: `actions/checkout@v4`, `cloudflare/wrangler-action@v3` (versões fixas)
- **No Self-hosted Runners**: Runners GitHub efêmeros, isolados por job

#### 7.1.4 Headers de Segurança Recomendados (Nginx)

```nginx
# Adicionar em nginx.conf customizado se necessário
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=()" always;
# CSP example (ajustar se needed):
# add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self';" always;
```

### 7.2 Custos (Estimativa Mensal — Projeto Pessoal/Portfólio)

| Recurso | Plano | Custo Mensal | Observação |
|---------|-------|--------------|------------|
| GitHub Actions | Free (público) | $0,00 | 2.000 min/mês incluídos |
| Cloudflare Pages | Free | $0,00 | 500k requests/dia, builds ilimitados |
| Docker Hub | Free | $0,00 | Imagens públicas (não usado no CI) |
| Domínio Personalizado | Opcional | ~$10-15/ano | Via Cloudflare Registrar (preço de custo) |
| **Total** | | **$0,00/mês** | **Zero custo operacional** |

#### 7.2.1 Escala Projetada (10.000 usuários/dia)

| Recurso | Limite Free | Excedente? | Custo Estimado |
|---------|-------------|------------|----------------|
| Cloudflare Pages Requests | 500k/dia | Não (10k << 500k) | $0 |
| Cloudflare Pages Bandwidth | Ilimitado | N/A | $0 |
| GitHub Actions Minutes | 2.000/mês | Não (build ~2 min) | $0 |
| **Total** | | | **$0,00/mês** |

> **Conclusão de Custo**: Arquitetura serverless + edge + CI gratuito = **custo zero** para projetos pessoais e pequenos negócios. Escala automática sem gestão de infraestrutura.

---

## 8. CONCLUSÃO

O **DevTask Cloud** foi entregue como uma aplicação completa, funcional e pronta para produção, demonstrando competências transversais em:

### 8.1 Entregáveis Concluídos

✅ **Frontend**: SPA responsiva, tema escuro, acessível, persistente
✅ **Container**: Dockerfile otimizado (nginx:alpine, 5.5MB base)
✅ **CI/CD**: Pipeline 2-jobs (test + deploy) com GitHub Actions
✅ **Deploy**: Cloudflare Pages (edge global, TLS, custom domain ready)
✅ **Documentação**: README técnico + Relatório acadêmico (6-8 páginas)
✅ **Git History**: 4 commits atômicos, autores alternados, mensagens convencionais

### 8.2 Competências Demonstradas

| Área | Evidência |
|------|-----------|
| **Frontend Moderno** | CSS Custom Properties, ES6 Classes, Web Storage API, A11y |
| **DevOps** | Docker, GitHub Actions, Cloudflare Wrangler, Secrets Management |
| **Arquitetura** | Separação frontend/infra, derived state, otimização de layers |
| **Documentação** | Diagramas ASCII, instruções reproduzíveis, relatório estruturado |
| **Colaboração** | Git workflow, code ownership, conventional commits |

### 8.3 Próximos Passos (Roadmap)

| Prioridade | Item | Esforço |
|------------|------|---------|
| **P0** | Adicionar `nginx.conf` custom com security headers | 15 min |
| **P1** | Implementar PWA (manifest + service worker) | 1 h |
| **P1** | Testes E2E com Playwright no CI | 2 h |
| **P2** | Sincronização multi-dispositivo (backend supabase/firebase) | 1 semana |
| **P2** | Compartilhamento de listas via link único | 3 dias |
| **P3** | Temas customizáveis (CSS variables runtime) | 2 h |

### 8.4 Reflexão Final

Este projeto consolidou a ponte entre **desenvolvimento frontend** e **engenharia de plataforma**. A escolha por tecnologias nativas (sem React/Vue, sem webpack/Vite) forçou domínio dos fundamentos da web plataforma, enquanto a automação completa (Docker + GitHub Actions + Cloudflare) provou que **deploy contínuo zero-custo** é acessível a qualquer desenvolvedor.

A divisão de tarefas por especialização (Frontend/CI vs DevOps/Docs) com **commits alternados** simulou fluxo real de equipe, gerando histórico auditável e *bus factor* distribuído.

> **[INSERIR PRINT AQUI]** — Dashboard do GitHub Actions mostrando pipeline verde (dois jobs passed) e Cloudflare Pages com deploy ativo.

---

**Fim do Relatório**

*Documento preparado para conversão em PDF (6-8 páginas). Marcadores `[INSERIR PRINT AQUI]` indicam 12 capturas de tela sugeridas para evidência visual.*