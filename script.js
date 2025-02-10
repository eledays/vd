let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');

let player = document.querySelector('.player');
let playerFlash = document.querySelector('.player-flash');
let spots = document.querySelector('.spots');
let flash = document.getElementById('flash');
let music = document.getElementById('music');
let waterTouch = document.getElementById('water_touch');
let wavesSound = document.getElementById('waves');
wavesSound.loop = true;
let message = document.querySelector('.message');
let score = document.querySelector('.score');
let coin = document.querySelector('.coin');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var posX = window.innerWidth / 2;
var posY = window.innerHeight / 2;
const PLAYER_SIZE = 100;
const STEP = 100;

var waves = [];

let isPaused = false;

function startAnimation() {
    window.removeEventListener('click', startAnimation);
    message.style.opacity = '0';
    score.style.opacity = '1';
    flash.play();
    waterTouch.play();
    playerFlash.style.opacity = '0.5';
    playerFlash.style.transform = 'translate(-50%, -50%) scale(1.5)';
    setTimeout(() => {
        player.style.opacity = '1';
        playerFlash.style.opacity = '0';
        playerFlash.style.transform = 'translate(-50%, -50%) scale(1.5)';
        message.style.top = '25vh';

        setTimeout(() => {
            message.innerHTML = 'Используй стрелки для перемещения';
            message.style.opacity = '1';
            setTimeout(() => {
                message.style.opacity = '0';
                setTimeout(() => {
                    message.innerHTML = 'Собери как можно больше монеток';
                    message.style.opacity = '1';
                    setTimeout(() => {
                        message.style.opacity = '0';
                        main(5);
                    }, 5000);
                }, 500);
            }, 5000);
        }, 300);
    }, 280);
}

function initPlayerControl() {
    window.addEventListener('keydown', keyDownHandler);
}

function keyDownHandler(e) {
    let oldPosX = posX;
    let oldPosY = posY;

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
        waterTouch.currentTime = 0;
        waterTouch.play();
        waves.push({
            x: oldPosX, 
            y: oldPosY, 
            radius: 50, 
            v: {
                x: (posX - oldPosX) / 35, 
                y: (posY - oldPosY) / 35
            },
            maxSize: 150}
        );
        waves.push({
            x: oldPosX, 
            y: oldPosY, 
            radius: 10, 
            v: {
                x: (posX - oldPosX) / 30, 
                y: (posY - oldPosY) / 30
            },
            maxSize: 80}
        );
        window.removeEventListener('keydown', keyDownHandler);
        setTimeout(() => {
            window.addEventListener('keydown', keyDownHandler);
        }, 500);
    }
}

function waveAnimation() {
    for (let spot of spots.children) {
        // Update opacity
        if (Math.random() > 0.5 && Number(spot.style.opacity) > 0.1) {  
            spot.style.opacity = Number(spot.style.opacity) - .005;
        }
        else if (Number(spot.style.opacity) < 0.9) {
            spot.style.opacity = Number(spot.style.opacity) + .005;
        }

        // Add random movement
        let currentLeft = parseFloat(spot.style.left);
        let currentTop = parseFloat(spot.style.top);
        
        // Random movement between -0.5 and 0.5 pixels
        let dx = (Math.random() - 0.5);
        let dy = (Math.random() - 0.5);
        
        spot.style.left = (currentLeft + dx) + 'px';
        spot.style.top = (currentTop + dy) + 'px';
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    waves.forEach(wave => {
        let opacity = Math.max(0, (.3 * (1 - wave.radius / wave.maxSize)));
        ctx.beginPath();
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffffff';
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.lineWidth = 3;
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
        ctx.shadowBlur = 0;
        if (opacity > 0) {
            wave.radius += 2;
            wave.x += wave.v.x;
            wave.y += wave.v.y;
        }
        else {
            waves.splice(waves.indexOf(wave), 1);
        }
    });

    requestAnimationFrame(waveAnimation);
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
        if (player.style.opacity == 0) {
            player.style.opacity = '1';
        }
        initPlayerControl();
        wavesSound.volume = 0.2;
        wavesSound.play();
    }
    else if (step === 100) {
        startAnimation();
    }
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'з') {
        isPaused = !isPaused;
        
        if (isPaused) {
            flash.pause();
            music.pause();
            waterTouch.pause();
            wavesSound.pause();
        } else {
            wavesSound.play(); // Возобновляем фоновые звуки
        }
    }
});

const numSpots = spots.children.length;
const gridSize = Math.ceil(Math.sqrt(numSpots));
const cellWidth = window.innerWidth / gridSize;
const cellHeight = window.innerHeight / gridSize;

Array.from(spots.children).forEach((spot, i) => {
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;
    
    // Add some randomness within each cell
    const offsetX = (Math.random() - 0.5) * cellWidth * 0.5;
    const offsetY = (Math.random() - 0.5) * cellHeight * 0.5;
    
    const left = col * cellWidth + cellWidth/2 + offsetX;
    const top = row * cellHeight + cellHeight/2 + offsetY;
    
    const size = Math.random() * 200 + 1000;
    const rotate = Math.random() * 360;
    
    spot.style.top = top + 'px';
    spot.style.left = left + 'px';
    spot.style.width = size + 'px';
    spot.style.height = size + 'px';
    spot.style.transform = `rotate(${rotate}deg)`;
    spot.style.opacity = .5;
});

waveAnimation();
main(4);