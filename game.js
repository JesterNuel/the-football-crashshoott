const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let scoreHome = 0;
let scoreAway = 0;

// Status Animasi Bankai
let isBankaiActive = false;
let bankaiTimer = 0;

let teamHome = [
    { name: "GK", role: "GK", x: 60, y: 220, width: 26, height: 60, color: "#ffd700", vx: 0, vy: 0 },
    { name: "MID", role: "MID", x: 280, y: 240, width: 26, height: 64, color: "#00ffcc", vx: 0, vy: 0 },
    { name: "ST", role: "AIZEN", x: 400, y: 230, width: 28, height: 68, color: "#e040fb", vx: 0, vy: 0, jumping: false }
];

let teamAway = [
    { name: "ST", role: "ST", x: 500, y: 230, width: 28, height: 68, color: "#ff7675", vx: 0, vy: 0 },
    { name: "MID", role: "MID", x: 620, y: 240, width: 26, height: 64, color: "#74b9ff", vx: 0, vy: 0 },
    { name: "GK", role: "GK", x: 830, y: 220, width: 26, height: 60, color: "#ffeaa7", vx: 0, vy: 0 }
];

let ball = {
    x: 450,
    y: 150,
    radius: 11,
    vx: 0,
    vy: 0,
    gravity: 0.38,
    friction: 0.985
};

const goalLeft = { x: 0, y: 160, width: 15, height: 160 };
const goalRight = { x: 885, y: 160, width: 15, height: 160 };

let input = { left: false, right: false, jump: false, pass: false, shoot: false };

window.addEventListener("keydown", (e) => {
    if (e.code === "ArrowLeft" || e.code === "KeyA") input.left = true;
    if (e.code === "ArrowRight" || e.code === "KeyD") input.right = true;
    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") input.jump = true;
    if (e.code === "KeyJ") input.pass = true;
    if (e.code === "KeyK") input.shoot = true;
    if (e.code === "KeyL") activateBankai(); // Shortcut tombol L untuk Bankai
});

window.addEventListener("keyup", (e) => {
    if (e.code === "ArrowLeft" || e.code === "KeyA") input.left = false;
    if (e.code === "ArrowRight" || e.code === "KeyD") input.right = false;
    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") input.jump = false;
    if (e.code === "KeyJ") input.pass = false;
    if (e.code === "KeyK") input.shoot = false;
});

function setControl(action, state) {
    input[action] = state;
}

// Fungsi Mengaktifkan Bankai Kyoka Suigetsu (Dijamin Gol!)
function activateBankai() {
    if (isBankaiActive) return; // Cegah spam saat aktif
    isBankaiActive = true;
    bankaiTimer = 60; // Durasi animasi ilusi (frame)

    // Teleport bola ke dekat Aizen lalu lesatkan kilat ungu langsung ke gawang lawan!
    let aizen = teamHome[2];
    ball.x = aizen.x + 20;
    ball.y = aizen.y + 20;
    ball.vx = 25; // Kecepatan super tinggi menembus kiper
    ball.vy = -3;
}

function startGame() {
    document.getElementById("menu-screen").classList.add("hidden");
    document.getElementById("play-screen").classList.add("flex");
    document.getElementById("play-screen").classList.remove("hidden");
    resetBall();
    loop();
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = 120;
    ball.vx = (Math.random() - 0.5) * 5;
    ball.vy = -2;
}

function update() {
    let playerST = teamHome[2];

    // Jika Bankai aktif, kurangi timer efek ilusi
    if (isBankaiActive) {
        bankaiTimer--;
        if (bankaiTimer <= 0) {
            isBankaiActive = false;
        }
    }

    // Gerakan Player Aizen
    let speed = 5.5;
    if (input.left) playerST.vx = -speed;
    else if (input.right) playerST.vx = speed;
    else playerST.vx = 0;

    if (input.jump && !playerST.jumping) {
        playerST.vy = -9.5;
        playerST.jumping = true;
    }

    playerST.vy += 0.4;
    playerST.x += playerST.vx;
    playerST.y += playerST.vy;

    const groundLevel = 210;
    if (playerST.y > groundLevel) {
        playerST.y = groundLevel;
        playerST.vy = 0;
        player.jumping = false;
    }
    if (playerST.x < 30) playerST.x = 30;
    if (playerST.x > canvas.width / 2 - 40) playerST.x = canvas.width / 2 - 40;

    // AI Lawan & Teman Tim
    teamHome[1].x += (ball.x - 150 - teamHome[1].x) * 0.05;
    teamAway[0].x += (ball.x - teamAway[0].x) * 0.04;
    teamAway[1].x += (ball.x - teamAway[1].x) * 0.03;

    // Fisika Bola
    ball.vy += ball.gravity;
    ball.vx *= ball.friction;
    ball.vy *= ball.friction;
    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.y > groundLevel + 70) {
        ball.y = groundLevel + 70;
        ball.vy = -ball.vy * 0.6;
    }
    if (ball.x < 15 || ball.x > canvas.width - 15) {
        ball.vx = -ball.vx * 0.8;
    }

    // Deteksi Gol Masuk Gawang Lawan
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

function drawPlayer(p, roleName, isHome) {
    let px = p.x;
    let py = p.y;
    
    // Badan Jas Putih Aizen / Pemain
    ctx.fillStyle = p.color;
    ctx.fillRect(px + 3, py + 12, p.width - 6, 28);

    // Kepala
    ctx.fillStyle = "#ffdbac";
    ctx.fillRect(px + 5, py - 4, p.width - 10, 16);

    // Rambut Aizen / Tim
    ctx.fillStyle = isHome ? "#3e2723" : "#333";
    ctx.fillRect(px + 4, py - 12, p.width - 8, 10);

    // Kaki Full Body
    ctx.fillStyle = "#222";
    ctx.fillRect(px + 4, py + 40, 7, 26);
    ctx.fillRect(px + p.width - 11, py + 40, 7, 26);

    // Label Nama/Role
    ctx.fillStyle = "#fff";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText(`${roleName}`, px - 2, py - 18);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Stadion Background
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 220, canvas.width, 200);

    // Lapangan
    ctx.fillStyle = "#1e3a5f";
    ctx.fillRect(0, 275, canvas.width, 145);
    ctx.fillStyle = "#2b4c7e";
    ctx.fillRect(0, 265, canvas.width, 10);

    // Garis Tengah
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 265);
    ctx.lineTo(canvas.width / 2, 100);
    ctx.stroke();

    // Gawang
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(goalLeft.x, goalLeft.y, goalLeft.width, goalLeft.height);
    ctx.fillRect(goalRight.x, goalRight.y, goalRight.width, goalRight.height);

    // Render Pemain (3 Home, 3 Away)
    drawPlayer(teamHome[0], "GK", true);
    drawPlayer(teamHome[1], "MID", true);
    drawPlayer(teamHome[2], "AIZEN", true);

    drawPlayer(teamAway[0], "ST", false);
    drawPlayer(teamAway[1], "MID", false);
    drawPlayer(teamAway[2], "GK", false);

    // Bola
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = isBankaiActive ? "#e040fb" : "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();

    // --- EFEK VISUAL KINEMATIK BANKAI (KYOKA SUIGETSU) ---
    if (isBankaiActive) {
        ctx.fillStyle = "rgba(106, 27, 154, 0.4)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#e040fb";
        ctx.font = "bold 32px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("BANKAI: KYOKA SUIGETSU - HADE", canvas.width / 2, 130);
        ctx.textAlign = "left"; // Reset align
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}
