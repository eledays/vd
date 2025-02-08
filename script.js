let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');

let player = document.querySelector('.player');
let playerFlash = document.querySelector('.player-flash');

let flash = document.getElementById('flash');
let music = document.getElementById('music');
let waterTouch = document.getElementById('water_touch');

let message = document.querySelector('.message');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var posX = window.innerWidth / 2;
var posY = window.innerHeight / 2;
const PLAYER_SIZE = 100;
const STEP = 100;

let waves = [];

class Wave {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.opacity = 0.5;
        this.maxRadius = 50;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    update() {
        this.radius += 1;
        this.opacity -= 0.01;
        return this.opacity > 0;
    }
}

function createWave(x, y) {
    waves.push(new Wave(x, y));
    console.log(waves);
}

function animateWaves() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    waves = waves.filter(wave => {
        wave.draw();
        return wave.update();
    });
    requestAnimationFrame(animateWaves);
}

function startAnimation() {
    window.removeEventListener('click', startAnimation);
    message.style.opacity = '0';
    flash.play();
    waterTouch.play();
    playerFlash.style.opacity = '0.5';
    playerFlash.style.transform = 'translate(-50%, -50%) scale(1.5)';
    setTimeout(() => {
        player.style.opacity = '1';
        playerFlash.style.opacity = '0';
        playerFlash.style.transform = 'translate(-50%, -50%) scale(1.5)';
        main(5);
    }, 280);
}

function initPlayerControl() {
    window.addEventListener('keydown', keyDownHandler);
}

function keyDownHandler(e) {
    createWave(posX, posY);
    animateWaves(); 
    
    switch(e.key) {
        case 'ArrowUp':
            if (posY - STEP - PLAYER_SIZE / 2 > 0) posY = Math.max(posY - STEP, 0);
            break;
        case 'ArrowDown':
            if (posY + STEP + PLAYER_SIZE / 2 < window.innerHeight) posY = Math.min(posY + STEP, window.innerHeight);
            break;
        case 'ArrowLeft':
            if (posX - STEP - PLAYER_SIZE / 2 > 0) posX = Math.max(posX - STEP, 0);
            break;
        case 'ArrowRight':
            if (posX + STEP + PLAYER_SIZE / 2 < window.innerWidth) posX = Math.min(posX + STEP, window.innerWidth);
            break;
    }
    
    // Обновляем позицию игрока
    let oldTransform = player.style.transform;
    let newTransform = `translate(${posX - window.innerWidth / 2}px, ${posY - window.innerHeight / 2}px) translate(-50%, -50%)`;
    player.style.transform = newTransform;

    if (newTransform !== oldTransform) {
        window.removeEventListener('keydown', keyDownHandler);
        setTimeout(() => {
            window.addEventListener('keydown', keyDownHandler);
        }, 500);
    }

    console.log(posX, posY);
}

function main(step = 0) {
    if (step === 0) {
        setTimeout(() => {
            message.style.opacity = '1';
            message.innerText = 'Привет)';
            setTimeout(main, 3000, 1);
        }, 300);
    }
    else if (step === 1) {
        message.style.opacity = '0';
        setTimeout(() => {
            message.innerHTML = '<span class="material-icons">headphones</span>Советую использовать наушники и играть в тишине';
            message.style.opacity = '1';
            setTimeout(main, 5000, 2);
        }, 500);
    }
    else if (step === 2) {
        message.style.opacity = '0';
        setTimeout(() => {
            message.innerHTML = '<span class="material-icons">fullscreen</span>И развернуть на весь экран (F11)';
            message.style.opacity = '1';
            setTimeout(main, 5000, 3);
        }, 500);
    }
    else if (step === 3) {
        message.style.opacity = '0';
        setTimeout(() => {
            message.innerHTML = '<span class="material-icons">dark_mode</span>И приглушить свет';
            message.style.opacity = '1';
            setTimeout(main, 5000, 4);
        }, 500);
    }
    else if (step === 4) {
        message.style.opacity = '0';
        setTimeout(() => {
            message.innerHTML = 'Если всё готово, кликни на экран';
            message.style.opacity = '1';
            window.addEventListener('click', startAnimation);
        }, 500);
    }
    else if (step === 5) {
        initPlayerControl();
    }
    else if (step === 100) {
        startAnimation();
    }
}

main(4);