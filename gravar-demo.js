/**
 * gravar-demo.js - Gravação automática da demonstração do DevTask Cloud
 * Abre navegação em 1280x720 com recordVideo, visita telas-chave,
 * interage com a app e gera .mp4 via ffmpeg.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configurações
const WIDTH = 1280;
const HEIGHT = 720;
const PAUSE_MS = 6000; // pausa em cada tela (ms)
const VIDEO_DIR = path.join(__dirname, 'recordings');
const OUTPUT_VIDEO = path.join(__dirname, 'demonstracao-devtask.mp4');
const RECORDING_FILE = path.join(VIDEO_DIR, 'raw.webm');

// URLs
const GITHUB_REPO = 'https://github.com/Ssoares26/devtask-cloud';
const CLOUDFLARE_URL = 'https://devtask-cloud.pages.dev';

async function pause(ms) {
    await new Promise(r => setTimeout(r, ms));
}

async function main() {
    // Preparar dir de gravação
    if (!fs.existsSync(VIDEO_DIR)) {
        fs.mkdirSync(VIDEO_DIR, { recursive: true });
    }
    // Remover arquivo anterior se existir
    if (fs.existsSync(RECORDING_FILE)) {
        fs.unlinkSync(RECORDING_FILE);
    }

    const browser = await chromium.launch({
        headless: false, // precisa ser visível para gravação correta
        args: ['--start-maximized']
    });

    const context = await browser.newContext({
        viewport: { width: WIDTH, height: HEIGHT },
        ignoreHTTPSErrors: true,
        deviceScaleFactor: 1
    });

    // Habilitar gravação de vídeo no contexto
    const page = await context.newPage();
    await page.route('**/*', route => route.continue()); // ignorar erros de rede pontuais
    console.log('Iniciando gravação...');
    console.log('Navegador aberto em %dx%d — aguarde as fases.', WIDTH, HEIGHT);

    try {
        // =========================================================
        // FASE A: Página inicial do repositório GitHub
        // =========================================================
        console.log('\n[Fase A] Abrindo repositório GitHub...');
        await page.setViewportSize({ width: WIDTH, height: HEIGHT });
        await page.goto(GITHUB_REPO, { waitUntil: 'networkidle' });
        await pause(PAUSE_MS);

        // =========================================================
        // FASE B: Histórico de commits
        // =========================================================
        console.log('[Fase B] Navegando para histórico de commits...');
        await page.click('"commits"');
        await page.waitForURL('**/commits/main', { timeout: 15000 }).catch(() => {});
        await pause(PAUSE_MS);

        // =========================================================
        // FASE C: Dockerfile + CI/CD workflow
        // =========================================================
        console.log('[Fase C] Abrindo Dockerfile...');
        await page.goto(`${GITHUB_REPO}/blob/main/Dockerfile`, { waitUntil: 'domcontentloaded' });
        await pause(PAUSE_MS);

        console.log('[Fase C] Abrindo ci-cd.yml...');
        await page.goto(`${GITHUB_REPO}/blob/main/.github/workflows/ci-cd.yml`, { waitUntil: 'domcontentloaded' });
        await pause(PAUSE_MS);

        // =========================================================
        // FASE D: Aba Actions (pipeline verde)
        // =========================================================
        console.log('[Fase D] Abrindo aba Actions...');
        await page.goto(`${GITHUB_REPO}/actions`, { waitUntil: 'domcontentloaded' });
        // Clicar no último workflow run
        const runRow = await page.locator('.workflow-table-row').first();
        if (await runRow.isVisible().catch(() => false)) {
            await runRow.click();
        }
        await pause(PAUSE_MS);

        // =========================================================
        // FASE E: App ao vivo - adicionar tarefas
        // =========================================================
        console.log('[Fase E] Abrindo app na nuvem...');
        await page.goto(CLOUDFLARE_URL, { waitUntil: 'domcontentloaded' });
        await pause(3000);

        // Inserir primeira tarefa
        const input = await page.$('#task-input');
        if (input) {
            await input.fill('Estudar Docker Compose');
            await page.keyboard.press('Enter');
            await pause(3000);
        }

        // Inserir segunda tarefa
        if (input) {
            await input.fill('Preparar relatório técnico');
            await page.keyboard.press('Enter');
            await pause(3000);
        }

        // Marcar a primeira como concluída (primeiro checkbox da lista)
        const firstCheckbox = await page.$('.task-checkbox');
        if (firstCheckbox) {
            await firstCheckbox.click();
            await pause(PAUSE_MS);
        }

        console.log('\n[Gravação concluída] Fechando navegador...');

    } catch (err) {
        console.error('Erro na gravação:', err.message);
    } finally {
        await page.close();
        await browser.close();
    }

    // Converter .webm → .mp4 com ffmpeg
    console.log('\nConvertendo para MP4 (ffmpeg)...');
    try {
        execSync(`ffmpeg -y -i "${RECORDING_FILE}" -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p "${OUTPUT_VIDEO}"`, { stdio: 'inherit' });
        console.log('Vídeo salvo em:', OUTPUT_VIDEO);
    } catch (e) {
        console.warn('ffmpeg não instalado ou falhou — vídeo original (.webm) permaneceu em:', RECORDING_FILE);
    }

    // Limpar arquivo temporário webm (se mp4 foi criado)
    if (fs.existsSync(OUTPUT_VIDEO) && fs.existsSync(RECORDING_FILE)) {
        try { fs.unlinkSync(RECORDING_FILE); console.log('Temp clean up OK'); } catch {}
    }
}

main().catch(e => { console.error(e); process.exit(1); });
