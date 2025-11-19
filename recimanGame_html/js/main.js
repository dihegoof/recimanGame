'use strict';

function loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
}

function getItemSprite(type){
    if(type === "Plástico") return imgTrashPlastic;
    if(type === "Papel")   return imgTrashPaper;
    if(type === "Metal")   return imgTrashMetal;
    if(type === "Orgânico")return imgTrashOrganic;
    return imgTrashPlastic;
}

const imgCage = loadImage("assets/cage.png");

const imgPlayerIdle = loadImage("assets/player_idle_2.png");
const imgPlayerWalk = loadImage("assets/player_walk_1.png");

const imgRatIdle = loadImage("assets/rat.png");
const imgRatWalk = loadImage("assets/rat_run.png");

const imgRatKingIdle = loadImage("assets/rat_king.png");
const imgRatKingRun  = loadImage("assets/rat_king_run.png");

const imgWallSolid = loadImage("assets/wall_solid.png");

const imgBinPlastic = loadImage("assets/bin_plastic.png");
const imgBinPaper   = loadImage("assets/bin_paper.png");
const imgBinMetal   = loadImage("assets/bin_metal.png");
const imgBinOrganic = loadImage("assets/bin_organic.png");

const imgTrashPlastic = loadImage("assets/trash_plastic.png");
const imgTrashPaper   = loadImage("assets/trash_paper.png");
const imgTrashMetal   = loadImage("assets/trash_metal.png");
const imgTrashOrganic = loadImage("assets/trash_organic.png");

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE = 32;
const COLS = 20;
const ROWS = 15;

let fase = 1;
let inimigosPorFase = 2;     
let itensPorFase = 1;        
let incrementoVelocidade = 10;
let estado = 'menu';
let score = 0;
let player = null;

let playerLives = 5;
let invulnerable = 0;
let damageFlash = 0;

let inimigos = [];
let items = [];
let cages = [];
let lixeiras = [];
let walls = [];
let keys = {};
let messageTimeout = null;

function randInt(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
}
function gridToPos(c, r) {
    return { x: c * TILE + TILE / 2, y: r * TILE + TILE / 2 };
}
function posToGrid(x, y) {
    return { c: Math.floor(x / TILE), r: Math.floor(y / TILE) };
}
function isWall(c, r) {
    if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return true;
    return walls.some(w => w.c === c && w.r === r);
}

function flashDamageEffect() {
    damageFlash = 0.6;
}

function dist(aX, aY, bX, bY) {
    return Math.hypot(aX - bX, aY - bY);
}

function overlapsGrid(c, r, list, threshold = 0.8) {
    for (const obj of list) {
        if (!obj || typeof obj.x === 'undefined' || typeof obj.y === 'undefined') 
			continue;
        const g = posToGrid(obj.x, obj.y);
        if (Math.abs(g.c - c) < threshold && Math.abs(g.r - r) < threshold) {
            return true;
        }
    }
    return false;
}

function initLevel() {
    playerLives = 5;
    score = 0;
    fase = 1;

    items = [];
    inimigos = [];
    cages = [];
    lixeiras = [];
    walls = [];

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1) {
                walls.push({ c, r });
                continue;
            }
            if (r % 2 === 0 && c % 2 === 0) {
                walls.push({ c, r });
                continue;
            }
            if (Math.random() < 0.08) {
                walls.push({ c, r });
            }
        }
    }

    player = {
        x: TILE * 2 + TILE / 2,
        y: TILE * 2 + TILE / 2,
        carrying: null,
        speed: 120,
        moving: false
    };

    for (let i = 0; i < itensPorFase; i++) 
		spawnItem();
	
	spawnLixeiras();
    spawnEnemy('king'); 
    
	for (let i = 1; i < inimigosPorFase; i++) 
		spawnEnemy('thief');
	
    spawnCage(); 
    updateHUD();
	teleportPlayer();
}

function spawnItem() {
    const types = ['Plástico', 'Papel', 'Metal', 'Orgânico'];
    const t = types[randInt(0, types.length - 1)];

    for (let attempts = 0; attempts < 50; attempts++) {
        const c = randInt(1, COLS - 2);
        const r = randInt(1, ROWS - 2);
        if (isWall(c, r)) continue;
        if (overlapsGrid(c, r, lixeiras)) continue;
        if (overlapsGrid(c, r, items)) continue;
        if (overlapsGrid(c, r, cages)) continue;
        if (overlapsGrid(c, r, inimigos)) continue;
        if (overlapsGrid(c, r, [player])) continue;

        const p = gridToPos(c, r);
        items.push({ x: p.x, y: p.y, type: t });
        return;
    }
}

function spawnLixeiras() {
    lixeiras = [];
    const types = ['Plástico', 'Papel', 'Metal', 'Orgânico'];
    for (const t of types) {
        for (let attempts = 0; attempts < 50; attempts++) {
            const c = randInt(1, COLS - 2);
            const r = randInt(1, ROWS - 2);
            if (isWall(c, r)) continue;
            if (overlapsGrid(c, r, lixeiras)) continue;
            if (overlapsGrid(c, r, [player])) continue;
            if (overlapsGrid(c, r, inimigos)) continue;
            if (overlapsGrid(c, r, cages)) continue;
            if (overlapsGrid(c, r, items)) continue;

            const p = gridToPos(c, r);
            lixeiras.push({ x: p.x, y: p.y, type: t });
            break;
        }
    }
}

function spawnEnemy(forceType) {
    for (let attempts = 0; attempts < 80; attempts++) {
        const c = randInt(1, COLS - 2);
        const r = randInt(1, ROWS - 2);
        if (isWall(c, r)) continue;
        if (overlapsGrid(c, r, inimigos)) continue;

        const p = gridToPos(c, r);
        const type = forceType ? forceType : 'thief';

        inimigos.push({
            x: p.x,
            y: p.y,
            dir: { x: randInt(-1, 1), y: randInt(-1, 1) },
            speed: 60,
            stealCooldown: 0,
            moving: false,
            type: type 
        });
        return;
    }
}

function spawnCage() {
    if (fase === 1) {
        forceSpawnCage();
        return;
    }
    const chance = Math.min(0.7, 0.35 + fase * 0.05);
    if (Math.random() <= chance) {
        forceSpawnCage();
    }
}

function forceSpawnCage() {
    for (let attempts = 0; attempts < 50; attempts++) {
        const c = randInt(1, COLS - 2);
        const r = randInt(1, ROWS - 2);
        if (isWall(c, r)) continue;
        const p = gridToPos(c, r);
        if (lixeiras.some(l => Math.hypot(l.x - p.x, l.y - p.y) < 20)) continue;
        if (inimigos.some(e => Math.hypot(e.x - p.x, e.y - p.y) < 26)) continue;
        if (items.some(it => Math.hypot(it.x - p.x, it.y - p.y) < 20)) continue;
        cages.push({ x: p.x, y: p.y });
        return;
    }
}

function draw() {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            ctx.fillStyle = '#1e1e1e';
            ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
        }
    }

    for (const w of walls) {
        ctx.drawImage(imgWallSolid, w.c * TILE, w.r * TILE);
    }

    for (const b of lixeiras) {
        let img = imgBinPlastic;
        if (b.type === 'Papel') img = imgBinPaper;
        if (b.type === 'Metal') img = imgBinMetal;
        if (b.type === 'Orgânico') img = imgBinOrganic;
        ctx.drawImage(img, b.x - 16, b.y - 16, 32, 32);
    }

    for (const it of items) {
        let img = imgTrashPlastic;
        if (it.type === 'Papel') img = imgTrashPaper;
        if (it.type === 'Metal') img = imgTrashMetal;
        if (it.type === 'Orgânico') img = imgTrashOrganic;
        ctx.drawImage(img, it.x - 16, it.y - 16, 32, 32);
    }

    for (const g of cages) {
        ctx.drawImage(imgCage, g.x - 16, g.y - 16, 32, 32);
    }

    for (const e of inimigos) {
        const frame = Math.floor(Date.now() / 200) % 2;
        let sprite;
        if (e.type === 'king') {
			const kingFrames = [imgRatKingIdle, imgRatKingRun];
			sprite = kingFrames[frame];
		} else {
			const thiefFrames = [imgRatIdle, imgRatWalk];
			sprite = thiefFrames[frame];
		}
        ctx.drawImage(sprite, e.x - 16, e.y - 16, 32, 32);
    }

    drawPlayer();
}

function drawPlayer() {
    const frame = Math.floor(Date.now() / 200) % 2;

    let sprite;
    if (player.moving) {
        const walkFrames = [imgPlayerWalk, imgPlayerIdle];
        sprite = walkFrames[frame];
    } else {
        sprite = imgPlayerIdle;
    }

    ctx.drawImage(sprite, player.x - 16, player.y - 16, 32, 32);

    if (damageFlash > 0) {
        damageFlash -= 0.03;
        if (Math.floor(Date.now() / 80) % 2 === 0) {
            ctx.fillStyle = "rgba(255, 0, 0, 0.45)";
            ctx.fillRect(player.x - 16, player.y - 16, 32, 32);
        }
    }

    if (player.carrying) {
        if (player.carrying.type === "Gaiola") {
            ctx.drawImage(imgCage, player.x - 10, player.y - 28, 20, 20);
        } else {
            const itemImg = getItemSprite(player.carrying.type);
            ctx.drawImage(itemImg, player.x - 8, player.y - 28, 16, 16);
        }
    }
}

function teleportPlayer() {
    for (let attempts = 0; attempts < 80; attempts++) {
        const c = randInt(1, COLS - 2);
        const r = randInt(1, ROWS - 2);
        if (isWall(c, r)) continue;
        const p = gridToPos(c, r);

        if (inimigos.some(e => dist(e.x, e.y, p.x, p.y) < 40)) continue;
        if (lixeiras.some(b => dist(b.x, b.y, p.x, p.y) < 40)) continue;
        if (items.some(i => dist(i.x, i.y, p.x, p.y) < 40)) continue;
        if (cages.some(g => dist(g.x, g.y, p.x, p.y) < 40)) continue;

        player.x = p.x;
        player.y = p.y;
        return;
    }
}

function update(dt) {
    handleInput(dt);

    for (const e of inimigos) {
        const grid = posToGrid(e.x, e.y);
        const center = gridToPos(grid.c, grid.r);
        const distToCenter = Math.hypot(e.x - center.x, e.y - center.y);

        if (distToCenter < 2) {
            const dirs = [
                {x: 1, y: 0},
                {x: -1, y: 0},
                {x: 0, y: 1},
                {x: 0, y: -1},
            ];

            const validDirs = dirs.filter(d => {
                const nc = grid.c + d.x;
                const nr = grid.r + d.y;
                return !isWall(nc, nr);
            });

            if (validDirs.length > 0) {
                e.dir = validDirs[randInt(0, validDirs.length - 1)];
            }
        }

        e.x += e.dir.x * e.speed * dt;
        e.y += e.dir.y * e.speed * dt;

        e.moving = (e.dir.x !== 0 || e.dir.y !== 0);

        const g2 = posToGrid(e.x, e.y);
        if (isWall(g2.c, g2.r)) {
            e.x = center.x;
            e.y = center.y;
        }

        if (e.type === 'thief') {
            if (e.stealCooldown > 0) e.stealCooldown -= dt;
            if (e.stealCooldown <= 0 && player.carrying && player.carrying.type !== "Gaiola") {
                const dx = e.x - player.x;
                const dy = e.y - player.y;
                if (dx * dx + dy * dy < 20 * 20) {
                    const nx = randInt(TILE, canvas.width - TILE);
                    const ny = randInt(TILE, canvas.height - TILE);
                    player.carrying.x = nx;
                    player.carrying.y = ny;
                    player.carrying = null;
                    e.stealCooldown = 1.8;
                    showMessage("Um rato roubou seu lixo!", false);
                    spawnItem();
                }
            }
        }
    }

    if (invulnerable > 0) {
        invulnerable -= dt;
    } else {
        for (const e of inimigos) {
            if (e.type !== 'king') continue;
            const dx = e.x - player.x;
            const dy = e.y - player.y;
            if (dx * dx + dy * dy < 25 * 25) {
                if (!player.carrying || player.carrying.type !== "Gaiola") {
                    takeDamage();
                    break;
                }
            }
        }
    }
}

function interact() {
    if (player.carrying && player.carrying.type === "Gaiola") {
        for (const e of inimigos) {
            const dx = player.x - e.x;
            const dy = player.y - e.y;
            if (Math.hypot(dx, dy) < 28) {
                inimigos = inimigos.filter(r => r !== e);
                player.carrying = null;
                showMessage("Rato capturado!", true);
                updateHUD();
                return;
            }
        }
    }

    if (player.carrying && player.carrying.type !== "Gaiola") {
        for (const b of lixeiras) {
            const dx = player.x - b.x;
            const dy = player.y - b.y;
            if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
                if (player.carrying.type === b.type) {
                    score++;
                    nextPhase();
                    spawnItem();
                    spawnLixeiras();
                    showMessage("Resíduo descartado com sucesso!", true);
                } else {
                    showMessage("Lixeira errada!", false);
                    spawnItem();
                    spawnLixeiras();
                }
                player.carrying = null;
                updateHUD();
                return;
            }
        }
        return;
    }

    for (const it of items) {
        const dx = player.x - it.x;
        const dy = player.y - it.y;
        if (dx * dx + dy * dy < 20 * 20) {
            player.carrying = it;
            showMessage("Você pegou: " + it.type);
            items = [];
            return;
        }
    }

    for (const g of cages) {
        const dx = player.x - g.x;
        const dy = player.y - g.y;
        if (dx * dx + dy * dy < 20 * 20) {
            player.carrying = { type: "Gaiola" };
            cages = cages.filter(c => c !== g);
            showMessage("Você pegou uma gaiola!", true);
            return;
        }
    }
}

function updateHUD() {
    document.getElementById('score').innerText = "🎯: " + score;
    document.getElementById('level').innerText = "🚀: " + fase;
    document.getElementById('rats').innerText = "🐭: " + inimigos.length;
    let hearts = "";
    for (let i = 0; i < 5; i++) {
        hearts += i < playerLives ? "❤️" : "🖤";
    }
    document.getElementById('lives').innerHTML = hearts;
}

function nextPhase() {
    fase++;

    for (let i = 0; i < itensPorFase; i++) spawnItem();
    for (let i = 0; i < inimigosPorFase; i++) spawnEnemy('thief'); 

    if (!inimigos.some(e => e.type === 'king')) {
        spawnEnemy('king');
    }

    for (const e of inimigos) {
        e.speed += incrementoVelocidade;
    }

    spawnCage();
    showMessage("Fase " + fase + "! Mais desafios chegando!", true);
    updateHUD();
}

function takeDamage() {
    playerLives--;
    showMessage("Você levou dano!", false);
    updateHUD();

    flashDamageEffect();
    invulnerable = 1.2;
    teleportPlayer();
	player.carrying = null;
	spawnItem();
	spawnLixeiras();

    if (playerLives <= 0) {
        showMessage("Game Over!", false);
        estado = 'menu';
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('menu').classList.remove('hidden');
    }
}

function showMessage(text, positive = true) {
    const el = document.getElementById('message');
    el.classList.remove('hidden', 'msg-green', 'msg-red');
    if (positive) el.classList.add('msg-green'); else el.classList.add('msg-red');
    el.textContent = text;
    if (messageTimeout) clearTimeout(messageTimeout);
    messageTimeout = setTimeout(() => el.classList.add('hidden'), 2000);
}

window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

document.getElementById('startBtn').addEventListener('click', () => {
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    estado = 'playing';
    initLevel();
});

document.getElementById('backToMenu').addEventListener('click', () => {
    estado = 'menu';
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('menu').classList.remove('hidden');
});

function handleInput(dt) {
    const speed = player.speed;
    let vx = 0, vy = 0;

    if (keys['ArrowLeft'] || keys['a']) vx = -1;
    if (keys['ArrowRight'] || keys['d']) vx = 1;
    if (keys['ArrowUp'] || keys['w']) vy = -1;
    if (keys['ArrowDown'] || keys['s']) vy = 1;

    if (vx !== 0 && vy !== 0) {
        vx *= 0.7071;
        vy *= 0.7071;
    }

    player.x += vx * speed * dt;
    player.y += vy * speed * dt;

    player.moving = (vx !== 0 || vy !== 0);

    const g = posToGrid(player.x, player.y);
    if (isWall(g.c, g.r)) {
        if (vx > 0) player.x -= 4;
        if (vx < 0) player.x += 4;
        if (vy > 0) player.y -= 4;
        if (vy < 0) player.y += 4;
    }

    if (keys[' ']) {
        keys[' '] = false;
        interact();
    }
}

let last = null;
function gameLoop(ts) {
    if (!last) last = ts;
    const dt = Math.min(0.05, (ts - last) / 1000);
    last = ts;

    if (estado === 'playing') {
        update(dt);
        draw();
    } else {
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

