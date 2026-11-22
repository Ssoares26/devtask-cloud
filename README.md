# DevTask Cloud

Gerenciador de tarefas moderno, responsivo e funcional com tema escuro elegante, persistência em localStorage e deploy automatizado via CI/CD.

## 📋 Descrição

O **DevTask Cloud** é uma aplicação web single-page (SPA) para gerenciamento de tarefas pessoais, construída com tecnologias web puras (HTML, CSS, JavaScript) sem dependências externas. A aplicação oferece:

- ✅ Adição, marcação e exclusão de tarefas
- 🔍 Filtros: Todas / Pendentes / Concluídas
- 📊 Contador dinâmico de tarefas
- 💾 Persistência automática no `localStorage`
- 🌙 Tema escuro elegante e responsivo
- 🐳 Containerização com Docker (Nginx Alpine)
- ☁️ Deploy contínuo na Cloudflare Pages via GitHub Actions

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      DevTask Cloud                            │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Static)                                           │
│  ├── index.html    - Estrutura semântica                     │
│  ├── style.css     - Tema escuro, responsivo, animações      │
│  └── app.js        - Lógica SPA, localStorage, filtros       │
├─────────────────────────────────────────────────────────────┤
│  Container (Docker)                                          │
│  └── nginx:alpine   - Servidor web leve, porta 80            │
├─────────────────────────────────────────────────────────────┤
│  CI/CD (GitHub Actions)                                      │
│  ├── Job 1: ci-docker-test   - Build + teste HTTP 200        │
│  └── Job 2: cd-cloudflare    - Deploy na Cloudflare Pages    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Executando Localmente

### Com Docker (Recomendado)

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/devtask-cloud.git
cd devtask-cloud

# 2. Construa a imagem
docker build -t devtask-cloud .

# 3. Execute o container
docker run -d -p 8080:80 --name devtask-cloud devtask-cloud

# 4. Acesse em http://localhost:8080
```

### Sem Docker (Desenvolvimento)

```bash
# Apenas abra index.html no navegador
# Ou use um servidor local:
npx serve .
# Python: python -m http.server 8080
# Node: npx http-server .
```

---

## ⚙️ Pipeline CI/CD

O workflow `.github/workflows/ci-cd.yml` define dois jobs:

### Job 1: `ci-docker-test` (Executa em push/PR na `main`)
1. **Checkout** do código
2. **Build** da imagem Docker: `docker build -t devtask-cloud:test .`
3. **Run** do container na porta 8080: `docker run -d --name app-test -p 8080:80 devtask-cloud:test`
4. **Wait** 2 segundos para inicialização
5. **Test** HTTP 200: `curl -f http://localhost:8080`
6. **Cleanup** do container de teste

### Job 2: `cd-cloudflare-deploy` (Apenas push na `main`, após Job 1 passar)
- Usa `cloudflare/wrangler-action@v3`
- Requer secrets: `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID`
- Deploy: `pages deploy . --project-name=devtask-cloud`

### Secrets Necessários no GitHub

| Secret | Descrição |
|--------|-----------|
| `CLOUDFLARE_API_TOKEN` | Token da API Cloudflare com permissão Pages |
| `CLOUDFLARE_ACCOUNT_ID` | ID da conta Cloudflare |

---

## 👥 Divisão de Tarefas

| Integrante | Responsabilidades | Commits |
|------------|-------------------|---------|
| **Ssoares26** | Arquitetura geral, Integração CI/CD, Deploy Cloudflare, Docker Compose, Validação de infraestrutura, Monitoramento de deploy | 5, 6 |
| **Rebeka Natália** | Interface (HTML/CSS), Lógica da aplicação (JS), Pipeline CI/CD | 1, 3 |
| **Nayara G. Freire** | Dockerfile, .dockerignore, Documentação (README, RELATORIO) | 2, 4 |

---

## 📄 Licença

MIT License - Sinta-se livre para usar, modificar e distribuir.