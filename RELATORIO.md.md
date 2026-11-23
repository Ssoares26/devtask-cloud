# RELATÓRIO TÉCNICO
## DevTask Cloud — Gerenciador de Tarefas com CI/CD Automatizado

---

### INFORMAÇÕES GERAIS

* **Projeto:** DevTask Cloud
* **Curso:** Desenvolvimento Web Full Stack / DevOps
* **Integrantes:**
  * Rebeka Natália
  * Nayara G. Freire
  * André Soares Gomes (`Ssoares26`)
* **Data:** Novembro 2026
* **Versão:** 1.0
* **Repositório GitHub:** [https://github.com/Ssoares26/devtask-cloud](https://github.com/Ssoares26/devtask-cloud)
* **Aplicação em Produção:** [https://devtask-cloud.17251365.workers.dev](https://devtask-cloud.17251365.workers.dev)

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

O **DevTask Cloud** é uma aplicação web progressiva (PWA-ready) voltada ao gerenciamento de tarefas pessoais, desenvolvida integralmente com tecnologias web nativas (HTML5, CSS3 e JavaScript ES6+), sem dependência de frameworks ou bibliotecas externas. O projeto consolida competências práticas nas seguintes frentes:

- **Frontend responsivo:** Interface com tema escuro, acessibilidade e transições CSS nativas.
- **Persistência no navegador:** Uso de `localStorage` com serialização em JSON.
- **Containerização:** Imagem Docker baseada em Nginx Alpine para testes isolados e produção.
- **CI/CD:** Pipeline automatizado no GitHub Actions com validação HTTP e deploy contínuo.
- **Deploy Serverless:** Publicação na rede de borda global da Cloudflare ([devtask-cloud.17251365.workers.dev](https://devtask-cloud.17251365.workers.dev)).

### 1.1 Funcionalidades Implementadas

| Funcionalidade | Descrição | Tecnologia |
|----------------|-----------|------------|
| CRUD de tarefas | Criar, listar, atualizar status (toggle) e deletar | JavaScript ES6+, DOM API |
| Filtros dinâmicos | Alternância entre Todas / Pendentes / Concluídas | Classes CSS + Estado JS |
| Contador inteligente | Contabilização dinâmica de tarefas por estado | Propriedades computadas |
| Persistência | Salvamento automático no `localStorage` | Web Storage API |
| Tema escuro | Variáveis CSS com contraste adequado | Custom Properties |
| Responsividade | Layout mobile-first com breakpoint em 480px | Flexbox, Media Queries |
| Acessibilidade | Atributos ARIA, foco visível e HTML semântico | HTML5, CSS |

### 1.2 Requisitos Não-Funcionais Atendidos

- **Performance:** First Contentful Paint inferior a 100ms, com pacote total de arquivos menor que 50KB.
- **Disponibilidade:** Deploy na rede global da Cloudflare (300+ PoPs).
- **Segurança:** Sanitização contra XSS, ausência de dependências externas e isolamento de segredos no CI/CD.
- **Manutenibilidade:** Código modular organizado em classe ES6 com separação de responsabilidades.
- **Observabilidade:** Validação automatizada de resposta HTTP 200 no pipeline de integração contínua.

---

## 2. DIVISÃO DE TAREFAS

A divisão seguiu o modelo **feature-based** com responsabilidades definidas e commits atômicos distribuídos entre os integrantes no repositório [github.com/Ssoares26/devtask-cloud](https://github.com/Ssoares26/devtask-cloud).

### 2.1 Matriz de Responsabilidades (RACI)

| Entregável | Rebeka Natália | Nayara G. Freire | André Soares (`Ssoares26`) |
|------------|----------------|------------------|----------------------------|
| `index.html` | **R/A** | I | C |
| `style.css` | **R/A** | I | C |
| `app.js` | **R/A** | I | C |
| `Dockerfile` | C | **R/A** | C |
| `.dockerignore` | C | **R/A** | C |
| `.github/workflows/ci-cd.yml` | **R/A** | C | **R/A** |
| `README.md` | C | **R/A** | C |
| `RELATORIO.md` | C | **R/A** | C |
| `docker-compose.yml` | I | I | **R/A** |

### 2.2 Justificativa da Divisão

- **Rebeka Natália (Frontend + Pipeline Base):** Desenvolvimento da interface web, estilização responsiva, lógica em JavaScript puro e estruturação inicial do workflow YAML.
- **Nayara G. Freire (DevOps + Documentação):** Containerização com Nginx Alpine, otimização do contexto de build e redação da documentação técnica e relatórios.
- **André Soares Gomes / `Ssoares26` (Orquestração + Infra + Deploy):** Configuração do `docker-compose.yml` para ambiente local, validação de health checks, configuração dos segredos na Cloudflare e estabilização do pipeline de CI/CD.

---

## 3. ARQUITETURA DETALHADA

### 3.1 Visão Geral do Sistema

```text
┌────────────────────────────────────────────────────────────────────┐
│                         USUÁRIO FINAL                               │
│                    (Navegador / Mobile)                             │
└────────────────────────────┬───────────────────────────────────────┘
                             │ HTTPS (TLS 1.3 / HTTP/3)
                             ▼
┌────────────────────────────────────────────────────────────────────┐
│                 CLOUDFLARE EDGE NETWORK (DEPLOY)                   │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  URL: https://devtask-cloud.17251365.workers.dev             │  │
│  │  CDN Global (300+ PoPs) — Compressão Brotli/Gzip             │  │
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
│  │  • sleep 2s             │  │  • deploy em produção           │  │
│  │  • curl -f localhost    │  │  • Secrets: API_TOKEN, ACCOUNT  │  │
│  │  • docker rm -f         │  │                                 │  │
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
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  docker-compose.yml                                          │  │
│  │  • devtask-cloud: build + port 8080 + healthcheck            │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

### 3.2 Arquitetura Frontend (SPA)

#### 3.2.1 Modelo de Dados

```javascript
// Task Schema (localStorage)
{
  "id": "1700000000000",
  "text": "Finalizar o projeto",
  "completed": true,
  "createdAt": "2026-11-22T10:00:00.000Z"
}
```

#### 3.2.2 Estado da Aplicação

```text
DevTaskCloud (Class)
├── tasks: Task[]
├── currentFilter: 'all' | 'pending' | 'completed'
├── DOM References
│   ├── taskInput: HTMLInputElement
│   ├── taskForm: HTMLFormElement
│   ├── taskList: HTMLUListElement
│   ├── filterButtons: NodeList<HTMLButtonElement>
│   └── counterText: HTMLSpanElement
└── Methods
    ├── init()
    ├── loadTasks() / saveTasks()
    ├── bindEvents()
    ├── addTask() / deleteTask() / toggleTask()
    ├── setFilter()
    ├── getFilteredTasks()
    ├── updateCounter()
    └── render()
```

### 3.3 Containerização (Docker)

#### 3.3.1 Dockerfile

```dockerfile
FROM nginx:alpine
COPY index.html style.css app.js /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 3.3.2 Otimizações Aplicadas

| Otimização | Impacto |
|------------|---------|
| Base `alpine` | Redução de ~90% no tamanho em relação à imagem `nginx:latest` |
| Cópia seletiva | Evita copiar `.git`, `.github` e documentos para dentro do contêiner |
| `.dockerignore` | Reduz o contexto de build enviado ao daemon Docker |

#### 3.3.3 `.dockerignore`

```text
.git
.github
README.md
RELATORIO.md
```

### 3.4 Pipeline CI/CD (GitHub Actions)

#### 3.4.1 Job 1: `ci-docker-test`

Executa o checkout do código, constrói a imagem `devtask-cloud:test`, inicia o contêiner na porta `8080` e valida a disponibilidade da aplicação com `curl -f http://localhost:8080`, garantindo a remoção do contêiner ao término da execução (`if: always()`).

#### 3.4.2 Job 2: `cd-cloudflare-deploy`

Executado após a aprovação do `ci-docker-test` em eventos de `push` na branch `main`. Utiliza `cloudflare/wrangler-action@v3` autenticado pelos segredos configurados no repositório:

| Secret | Onde obter | Permissões mínimas |
|--------|------------|---------------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare Dashboard → My Profile → API Tokens | Account → Cloudflare Pages / Workers → Edit |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard → Overview | Leitura |

---

## 4. FERRAMENTAS UTILIZADAS

### 4.1 Desenvolvimento

| Ferramenta | Finalidade |
|------------|------------|
| VS Code | Editor principal |
| Git | Controle de versão |
| Node.js | Servidor local de desenvolvimento |
| Docker & Docker Compose | Containerização e orquestração local |

### 4.2 CI/CD & Cloud

| Ferramenta / Serviço | Finalidade |
|----------------------|------------|
| GitHub Actions | Orquestração da esteira CI/CD |
| `actions/checkout@v4` | Clonagem do repositório no runner |
| `cloudflare/wrangler-action@v3` | Deploy automatizado na infraestrutura Cloudflare |
| `curl` | Teste de saúde HTTP 200 |
| Cloudflare Edge Network | Hospedagem serverless com HTTPS automático |

---

## 5. PASSO A PASSO DA IMPLEMENTAÇÃO

### 5.1 Preparação do Ambiente

```bash
mkdir devtask-cloud && cd devtask-cloud
git init -b main
```

### 5.2 Desenvolvimento do Frontend (`index.html`, `style.css`, `app.js`)

- **`index.html`:** Estrutura semântica com `header`, `main`, `form`, `ul` e `footer`.
- **`style.css`:** Variáveis CSS para tema escuro, layout flexível mobile-first e estados visuais de foco e conclusão.
- **`app.js`:** Implementação da classe `DevTaskCloud` com persistência em `localStorage`, filtros derivados e sanitização `escapeHtml()`.

```bash
git add index.html style.css app.js
git commit -m "feat: cria interface e logica da aplicacao DevTask Cloud"
```

### 5.3 Containerização (`Dockerfile` e `.dockerignore`)

```bash
docker build -t devtask-cloud .
docker run -d -p 8080:80 --name test-devtask devtask-cloud
curl -f http://localhost:8080
docker rm -f test-devtask
```

```bash
git add Dockerfile .dockerignore
git commit -m "build: adiciona Dockerfile com Nginx Alpine"
```

### 5.4 Pipeline CI/CD e Deploy em Produção

Após a criação do workflow em `.github/workflows/ci-cd.yml` e o cadastro dos segredos `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID` no GitHub, o push na branch `main` executou os dois estágios com sucesso (duração total de 51s), publicando a aplicação em [https://devtask-cloud.17251365.workers.dev](https://devtask-cloud.17251365.workers.dev).

---

## 6. DIFICULDADES ENCONTRADAS

### 6.1 Técnicas e Processuais

| Dificuldade | Solução |
|-------------|---------|
| **Serialização de objetos `Date` no `localStorage`** | Conversão para string ISO (`toISOString()`) ao salvar e leitura controlada ao carregar. |
| **Indentação e estrutura do workflow YAML** | Revisão completa da estrutura do arquivo `ci-cd.yml` (commit `4b5c342`) para encadear corretamente os jobs de teste e deploy. |
| **Arquivos auxiliares de gravação na raiz** | Remoção dos scripts temporários de demonstração e atualização do `.gitignore` antes da publicação final. |
| **Contexto de build Docker extenso** | Configuração do `.dockerignore` para ignorar `.git`, `.github` e arquivos Markdown. |

---

## 7. SEGURANÇA E CUSTOS

### 7.1 Segurança

- **Aplicação:** Sanitização de entradas do usuário via `escapeHtml()` antes da inserção no DOM, prevenindo ataques XSS.
- **Contêiner:** Uso de imagem mínima `nginx:alpine` sem segredos embutidos.
- **CI/CD:** Credenciais da Cloudflare armazenadas exclusivamente no GitHub Secrets com escopo restrito.
- **Transporte:** Criptografia TLS automática fornecida pela rede de borda da Cloudflare.

### 7.2 Custos Operacionais

| Recurso | Plano | Custo Mensal | Observação |
|---------|-------|--------------|------------|
| GitHub Actions | Free (repositório público) | $0,00 | 2.000 minutos/mês incluídos |
| Cloudflare Pages / Workers | Free Tier | $0,00 | 500 mil requisições/dia e banda ilimitada |
| **Total** | | **$0,00/mês** | **Custo operacional zero** |

---

## 8. CONCLUSÃO

O **DevTask Cloud** foi concluído atendendo a todos os requisitos funcionais e de infraestrutura, integrando desenvolvimento frontend nativo, containerização com Docker e entrega contínua automatizada na Cloudflare.

### 8.1 Próximos Passos

- **P0:** Adicionar arquivo `nginx.conf` customizado com cabeçalhos de segurança HTTP (`X-Frame-Options`, `X-Content-Type-Options` e `Content-Security-Policy`).
- **P1:** Implementar `manifest.json` e *Service Worker* para funcionamento offline completo como PWA.
- **P1:** Integrar testes automatizados de interface (E2E) ao pipeline de CI antes do deploy.