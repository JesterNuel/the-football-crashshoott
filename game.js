const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let selectedRole = "ST";
let scoreHome = 0;
let scoreAway = 0;

// Karakter Aizen (Full-Body Sprite Dimensi Ditingkatkan)
let player = {
    x: 120,
    y: 195,
    width: 28,
    height: 68, // Proporsi Full-Body dari ujung rambut hingga kaki
    speed: 5.8,
    vx: 0,
    vy: 0,
    jumping: false
};

let ball = {
    x: 400,
    y: 80,
    radius: 10,
    vx: 0,
    vy: 0,
    gravity: 0.4,
    friction: 0.985
};

const goalLeft = { x: 0, y: 120, width: 12, height: 150 };
const goalRight = { x: 788, y: 120, width: 12, height: 150 };

let input = {
    left: false,
    right: false,
    jump: false,
    pass: false,
    shoot: false
};

let isCharging = false;
let chargePower = 0;
let chargeDirection = 1;

window.addEventListener("keydown", (e) => {
    if (e.code === "ArrowLeft" || e.code === "KeyA") input.left = true;
    if (e.code === "ArrowRight" || e.code === "KeyD") input.right = true;
    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") input.jump = true;
    if (e.code === "KeyJ" || e.code === "KeyZ") input.pass = true;
    if (e.code === "KeyK" || e.code === "KeyX") input.shoot = true;
});

window.addEventListener("keyup", (e) => {
    if (e.code === "ArrowLeft" || e.code === "KeyA") input.left = false;
    if (e.code === "ArrowRight" || e.code === "KeyD") input.right = false;
    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") input.jump = false;
    if (e.code === "KeyJ" || e.code === "KeyZ") input.pass = false;
    if (e.code === "KeyK" || e.code === "KeyX") input.shoot = false;
});

function setControl(action, state) {
    input[action] = state;
}

function selectRole(role) {
    selectedRole = role;
    document.querySelectorAll(".role-card").forEach(card => card.classList.remove("selected"));
    event.currentTarget.classList.add("selected");
    
    document.getElementById("p1-name-text").innerText = `AIZEN (${role})`;
    document.getElementById("p1-avatar").innerText = role;

    if (role === 'ST') player.speed = 6.2;
    else if (role === 'MID') player.speed = 5.5;
    else if (role === 'GK') player.speed = 4.8;
}

function startGame() {
    document.getElementById("menu-screen").classList.add("hidden");
    document.getElementById("play-screen").classList.remove("hidden");
    resetBall();
    loop();
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = 70;
    ball.vx = (Math.random() - 0.5) * 4;
    ball.vy = -1;
}

function update() {
    if (input.left) {
        player.vx = -player.speed;
    } else if (input.right) {
        player.vx = player.speed;
    } else {
        player.vx = 0;
    }

    if (input.jump && !player.jumping) {
        player.vy = -10;
        player.jumping = true;
    }

    player.vy += 0.45;
    player.x += player.vx;
    player.y += player.vy;

    const groundLevel = 202; // Sesuaikan posisi berdiri di atas lapangan rumput
    if (player.y > groundLevel) {
        player.y = groundLevel;
        player.vy = 0;
        player.jumping = false;
    }

    if (player.x < 15) player.x = 15;
    if (player.x > canvas.width - 40) player.x = canvas.width - 40;

    // Passing
    if (input.pass) {
        let dx = ball.x - (player.x + player.width / 2);
        let dy = ball.y - (player.y + player.height / 2);
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 50) {
            ball.vx = (dx / distance) * 5 + player.vx * 0.5;
            ball.vy = -5.5;
        }
    }

    // Tendang dengan Timing Bar ala The Spike
    if (input.shoot) {
        isCharging = true;
        chargePower += 3.5 * chargeDirection;
        if (chargePower >= 100 || chargePower <= 0) {
            chargeDirection *= -1;
        }
    } else if (isCharging) {
        let dx = ball.x - (player.x + player.width / 2);
        let dy = ball.y - (player.y + player.height / 2);
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 55) {
            let timingBonus = (chargePower > 70 && chargePower < 95) ? 1.9 : 1.0;
            let roleMultiplier = selectedRole === 'ST' ? 1.6 : 1.15;
            
            ball.vx = (dx / distance) * 10 * timingBonus * roleMultiplier + (player.vx * 0.6);
            ball.vy = (dy / distance) * 10 * timingBonus * roleMultiplier + (player.vy * 0.6);
        }
        isCharging = false;
        chargePower = 0;
    }

    // Fisika Bola
    ball.vy += ball.gravity;
    ball.vx *= ball.friction;
    ball.vy *= ball.friction;
    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.y > groundLevel + 65) {
        ball.y = groundLevel + 65;
        ball.vy = -ball.vy * 0.65;
    }
    if (ball.x < 15 || ball.x > canvas.width - 15) {
        ball.vx = -ball.vx * 0.8;
    }

    // Cek Gol
    if (ball.x >= goalRight.x && ball.y >= goalRight.y && ball.y <= goalRight.y + goalRight.height) {
        scoreHome++;
        document.getElementById("score-home").innerText = scoreHome;
        resetBall();
    } else if (ball.x <= goalLeft.x + goalLeft.width && ball.y >= goalLeft.y && ball.y <= goalLeft.y + goalLeft.height) {
        scoreAway++;
        document.getElementById("score-away").innerText = scoreAway;
        resetBall();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Lapangan Rumput
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 270, canvas.width, 70);
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 260, canvas.width, 10);

    // Garis Tengah
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 260);
    ctx.lineTo(canvas.width / 2, 80);
    ctx.stroke();

    // Gawang Kiri & Kanan
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(goalLeft.x, goalLeft.y, goalLeft.width, goalLeft.height);
    ctx.fillRect(goalRight.x, goalRight.y, goalRight.width, goalRight.height);

    ctx.strokeStyle = "#888";
    ctx.lineWidth = 1;
    for(let i = goalLeft.y; i < goalLeft.y + goalLeft.height; i += 8) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(12, i); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(788, i); ctx.lineTo(800, i); ctx.stroke();
    }

    // --- RENDER SPRITE KARAKTER AIZEN FULL-BODY (Ujung Kepala hingga Kaki) ---
    let px = player.x;
    let py = player.y;

    // 1. Rambut Khas Aizen (Ke belakang / Slicked back coklat tua)
    ctx.fillStyle = "#3e2723";
    ctx.fillRect(px + 4, py - 14, 20, 12);

    // 2. Kepala & Wajah
    ctx.fillStyle = "#ffdbac";
    ctx.fillRect(px + 6, py - 4, 16, 16);
    // Kacamata khas Aizen (opsional / ikonik)
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 8, py, 12, 6);

    // 3. Badan (Jas Putih / Haori Kapten / Seragam Putih Aizen)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(px + 3, py + 12, 22, 28);
    // Sabuk / Inner hitam
    ctx.fillStyle = "#111";
    ctx.fillRect(px + 10, py + 24, 8, 4);

    // 4. Lengan & Tangan
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(px - 3, py + 14, 6, 22); // Lengan Kiri
    ctx.fillRect(px + 25, py + 14, 6, 22); // Lengan Kanan

    // 5. Celana & Kaki Full-Body (Ujung Kaki / Sepatu Hitam)
    ctx.fillStyle = "#222222";
    ctx.fillRect(px + 5, py + 40, 7, 28); // Kaki Kiri
    ctx.fillRect(px + 16, py + 40, 7, 28); // Kaki Kanan
    
    // Sepatu
    ctx.fillStyle = "#111";
    ctx.fillRect(px + 3, py + 64, 10, 4);
    ctx.fillRect(px + 15, py + 64, 10, 4);

    // Label Nama Role di atas Karakter
    ctx.fillStyle = "#a29bfe";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("AIZEN", px - 2, py - 22);

    // --- METERAN TIMING / POWER BAR (The Spike Style) ---
    if (isCharging) {
        let barW = 38;
        let barH = 5;
        let bx = px + player.width / 2 - barW / 2;
        let by = py - 35;

        ctx.fillStyle = "#111";
        ctx.fillRect(bx, by, barW, barH);

        let fillW = (chargePower / 100) * barW;
        ctx.fillStyle = (chargePower > 70 && chargePower < 95) ? "#00ffcc" : "#e84393";
        ctx.fillRect(bx, by, fillW, barH);
        
        ctx.strokeStyle = "#fff;
        ctx.strokeRect(bx, by, barW, barH);
    }

    // Bola Sepak
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}
