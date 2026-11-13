const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let selectedRole = "ST"; // Default role
let scoreHome = 0;
let scoreAway = 0;

// Objek Pemain (Player)
let player = {
    x: 150,
    y: 320,
    width: 30,
    height: 50,
    speed: 5,
    vx: 0,
    vy: 0,
    jumping: false,
    color: "#ff007f"
};

// Objek Bola (Ball)
let ball = {
    x: 400,
    y: 200,
    radius: 12,
    vx: 0,
    vy: 0,
    gravity: 0.4,
    friction: 0.98
};

// Objek Gawang Kiri & Kanan
const goalLeft = { x: 0, y: 220, width: 10, height: 150 };
const goalRight = { x: 790, y: 220, width: 10, height: 150 };

// Kontrol Keyboard
let keys = {};

window.addEventListener("keydown", (e) => { keys[e.code] = true; });
window.addEventListener("keyup", (e) => { keys[e.code] = false; });

function selectRole(role) {
    selectedRole = role;
    document.querySelectorAll(".role-card").forEach(card => card.classList.remove("selected"));
    event.currentTarget.classList.add("selected");
    
    // Sesuaikan atribut pemain berdasarkan role pilihan
    if (role === 'ST') { player.color = "#ff007f"; player.speed = 6; } // Striker lincah & bertenaga
    else if (role === 'MID') { player.color = "#00ffcc"; player.speed = 5; } // Gelandang seimbang
    else if (role === 'GK') { player.color = "#ffcc00"; player.speed = 4; } // GK bertahan kuat
}

function startGame() {
    document.getElementById("menu-screen").classList.add("hidden");
    document.getElementById("play-screen").classList.remove("hidden");
    resetBall();
    loop();
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = 150;
    ball.vx = (Math.random() - 0.5) * 6;
    ball.vy = -2;
}

// Loop Utama Game (60 FPS)
function update() {
    // Gerakan Player (Kiri / Kanan)
    if (keys["ArrowLeft"] || keys["KeyA"]) {
        player.vx = -player.speed;
    } else if (keys["ArrowRight"] || keys["KeyD"]) {
        player.vx = player.speed;
    } else {
        player.vx = 0;
    }

    // Lompat
    if ((keys["Space"] || keys["ArrowUp"] || keys["KeyW"]) && !player.jumping) {
        player.vy = -11;
        player.jumping = true;
    }

    // Terapkan Gravitasi ke Player
    player.vy += 0.5;
    player.x += player.vx;
    player.y += player.vy;

    // Batas Tanah Lapangan
    const groundLevel = 370;
    if (player.y > groundLevel) {
        player.y = groundLevel;
        player.vy = 0;
        player.jumping = false;
    }

    // Batas Layar Kiri Kanan
    if (player.x < 10) player.x = 10;
    if (player.x > canvas.width - 40) player.x = canvas.width - 40;

    // Fisika Bola
    ball.vy += ball.gravity;
    ball.vx *= ball.friction;
    ball.vy *= ball.friction;
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Pantulan Tanah & Dinding Lapangan
    if (ball.y > groundLevel + 20) {
        ball.y = groundLevel + 20;
        ball.vy = -ball.vy * 0.7;
    }
    if (ball.x < 15 || ball.x > canvas.width - 15) {
        ball.vx = -ball.vx * 0.8;
    }

    // Deteksi Tendangan / Sundulan Bola oleh Pemain
    let dx = ball.x - (player.x + player.width / 2);
    let dy = ball.y - (player.y + player.height / 2);
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 30) {
        let powerMultiplier = selectedRole === 'ST' ? 1.5 : (selectedRole === 'MID' ? 1.2 : 1.0);
        ball.vx = player.vx * 0.8 + (dx / distance) * 8 * powerMultiplier;
        ball.vy = player.vy * 0.8 + (dy / distance) * 8 * powerMultiplier;
    }

    // Deteksi Gol Masuk
    // Gol ke Gawang Kanan (Pemain Mencetak Gol)
    if (ball.x >= goalRight.x && ball.y >= goalRight.y && ball.y <= goalRight.y + goalRight.height) {
        scoreHome++;
        document.getElementById("score-home").innerText = scoreHome;
        resetBall();
    }
    // Gol ke Gawang Kiri (Lawan Mencetak Gol)
    else if (ball.x <= goalLeft.x + goalLeft.width && ball.y >= goalLeft.y && ball.y <= goalLeft.y + goalLeft.height) {
        scoreAway++;
        document.getElementById("score-away").innerText = scoreAway;
        resetBall();
    }
}

function draw() {
    // Bersihkan Layar Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gambar Rumput Lapangan
    ctx.fillStyle = "#2e8b57";
    ctx.fillRect(0, 370, canvas.width, 80);

    // Garis Tengah & Lingkaran Tengah Lapangan
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 370);
    ctx.lineTo(canvas.width / 2, 150);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(canvas.width / 2, 260, 60, 0, Math.PI * 2);
    ctx.stroke();

    // Gambar Gawang Kiri & Kanan
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(goalLeft.x, goalLeft.y, goalLeft.width, goalLeft.height);
    ctx.fillRect(goalRight.x, goalRight.y, goalRight.width, goalRight.height);

    // Jaring Gawang (Efek Garis-garis)
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 1;
    for(let i = goalLeft.y; i < goalLeft.y + goalLeft.height; i += 10) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(15, i); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(785, i); ctx.lineTo(800, i); ctx.stroke();
    }

    // Gambar Karakter Pemain (Sesuai Role)
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    // Kepala Pemain
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y - 10, 12, 0, Math.PI * 2);
    ctx.fillStyle = "#ffdbac";
    ctx.fill();

    // Teks Label Role di atas Pemain
    ctx.fillStyle = "#fff";
    ctx.font = "12px sans-serif";
    ctx.fillText(selectedRole, player.x - 2, player.y - 28);

    // Gambar Bola Sepak
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
