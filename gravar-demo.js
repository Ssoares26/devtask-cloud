/**
 * gravar-demo.js - Gravação automática da demonstração do DevTask Cloud
 * Navegação direta por URLs + gravação em .webm (sem ffmpeg)
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const WIDTH = 1280;
const HEIGHT = 720;
const VIDEO_DIR = path.join(__dirname, 'recordings');
const RECORDING_FILE = path.join(VIDEO_DIR, 'raw.webm');
const OUTPUT_VIDEO = path.join(__dirname, 'demonstracao-devtask.webm');

const PAUSE_A = 6000;
const PAUSE_B = 7000;
const PAUSE_C = 6000;
const PAUSE_D = 7000;
const PAUSE_E = 5000;

async function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function main() {
    if (!fs.existsSync(VIDEO_DIR)) {
        fs.mkdirSync(VIDEO_DIR, { recursive: true });
    }
    if (fs.existsSync(RECORDING_FILE)) {
        fs.unlinkSync(RECORDING_FILE);
    }

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: WIDTH, height: HEIGHT },
        recordVideo: { dir: VIDEO_DIR, mimeType: 'video/webm' }
    });
    const page = await context.newPage();

    console.log('Iniciando gravação...');

    try {
        // FASE A: Página inicial do repositório
        console.log('[Fase A] https://github.com/Ssoares26/devtask-cloud');
        await page.goto('https://github.com/Ssoares26/devtask-cloud', { waitUntil: 'domcontentloaded' });
        await sleep(PAUSE_A);

        // FASE B: Histórico de commits
        console.log('[Fase B] https://github.com/Ssoares26/devtask-cloud/commits/main');
        await page.goto('https://github.com/Ssoares26/devtask-cloud/commits/main', { waitUntil: 'domcontentloaded' });
        await sleep(PAUSE_B);

        // FASE C: Dockerfile
        console.log('[Fase C] Dockerfile');
        await page.goto('https://github.com/Ssoares26/devtask-cloud/blob/main/Dockerfile', { waitUntil: 'domcontentloaded' });
        await sleep(PAUSE_C);

        // FASE C: ci-cd.yml
        console.log('[Fase C] ci-cd.yml');
        await page.goto('https://github.com/Ssoares26/devtask-cloud/blob/main/.github/workflows/ci-cd.yml', { waitUntil: 'domcontentloaded' });
        await sleep(PAUSE_D);

        // FASE D: Actions
        console.log('[Fase D] https://github.com/Ssoares26/devtask-cloud/actions');
        await page.goto('https://github.com/Ssoares26/devtask-cloud/actions', { waitUntil: 'domcontentloaded' });
        await sleep(PAUSE_D);

        // FASE E: App na nuvem (se disponível)
        console.log('[Fase E] https://devtask-cloud.pages.dev');
        try {
            await page.goto('https://devtask-cloud.pages.dev', { waitUntil: 'domcontentloaded', timeout: 15000 });
        } catch {
            console.log('[Fase E] URL nao disponivel - pulando interacao');
        }
        await sleep(PAUSE_E);

        // Tentar interagir com a app (se carregou)
        const input = await page.$('#task-input');
        if (input) {
            await input.fill('Estudar Docker Compose');
            await page.keyboard.press('Enter');
            await sleep(3000);
            const checkbox = await page.$('.task-checkbox');
            if (checkbox) await checkbox.click();
            await sleep(PAUSE_E);
        } else {
            console.log('[Fase E] Campo de input nao encontrado (app pode nao ter carregado)');
        }

        console.log('\nGravao concluida!');

    } catch (err) {
        console.error('Erro:', err.message);
    } finally {
        await page.close();
        await browser.close();
    }

    // Mover arquivo gravado da pasta recordings/ para raiz
    const files = fs.readdirSync(VIDEO_DIR).filter(f => f.endsWith('.webm')).sort();
    if (files.length > 0) {
        const src = path.join(VIDEO_DIR, files[0]);
        if (fs.existsSync(OUTPUT_VIDEO)) fs.unlinkSync(OUTPUT_VIDEO);
        fs.renameSync(src, OUTPUT_VIDEO);
        console.log('Video movido para:', OUTPUT_VIDEO);
    }

    // Limpar pasta temporaria
    try { fs.rmSync(VIDEO_DIR, { recursive: true, force: true }); } catch {}
}

main().catch(e => { console.error(e); process.exit(1); });