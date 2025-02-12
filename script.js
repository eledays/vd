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
let scoreBlock = document.querySelector('.score');
let coin = document.querySelector('.coin');
let coin1 = document.getElementById('coin1');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.zIndex = '1';
canvas.style.pointerEvents = 'none';

var posX = window.innerWidth / 2;
var posY = window.innerHeight / 2;
const PLAYER_SIZE = 100;
const STEP = 100;
var COINS_COUNT = 10;
var coinColor = 'gold';
var coinShadow = '0 0 10px rgba(255, 215, 0, 0.5)';

var waves = [];

let isPaused = false;

const CELL_SIZE = 100;
let coins = [];
let score = 0;
var gameLoopWork = true;

class Coin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.element = document.createElement('div');
        this.element.className = 'coin';
        this.element.style.position = 'absolute';
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
        this.element.style.transform = 'translate(-50%, -50%)';
        this.element.style.backgroundColor = coinColor;
        this.element.style.boxShadow = coinShadow;
        document.body.appendChild(this.element);
    }

    remove() {
        this.element.remove();
    }
}

function generateCoin() {
    if (coins.length >= COINS_COUNT) {
        return;
    }

    // Получаем количество ячеек по ширине и высоте
    const gridWidth = Math.floor((window.innerWidth / 2 - CELL_SIZE / 2) / CELL_SIZE) * 2 + 1;
    const gridHeight = Math.floor(window.innerHeight / CELL_SIZE);
    
    // Выбираем случайную ячейку
    const cellX = Math.floor(Math.random() * gridWidth);
    const cellY = Math.floor(Math.random() * gridHeight);
    
    // Переводим координаты ячейки в пиксели (центр ячейки)
    const x = cellX * CELL_SIZE + CELL_SIZE / 2 + (window.innerWidth - gridWidth * CELL_SIZE) / 2;
    const y = cellY * CELL_SIZE + CELL_SIZE / 2 + (window.innerHeight - gridHeight * CELL_SIZE) / 2;
    
    // Проверяем, нет ли уже монетки в этой ячейке
    if (!coins.some(coin => coin.x === x && coin.y === y)) {
        const coin = new Coin(x, y);
        coins.push(coin);
    }
}

function checkCoinCollision() {
    const playerRadius = PLAYER_SIZE / 2;
    coins.forEach((coin, index) => {
        const distance = Math.hypot(posX - coin.x, posY - coin.y);
        if (distance < playerRadius + 20) { // 20 - примерный радиус монетки
            coin.remove();
            coins.splice(index, 1);
            score++;
            scoreBlock.innerHTML = score;
            coin1.currentTime = 0;
            coin1.play();
            
            if (score === COINS_COUNT) {
                main(8);
            }

            // if (coins.length === 0) {
            //     for (let i = 0; i < COINS_COUNT; i++) {
            //         generateCoin();
            //     }
            // }
        }
    });
}

function startAnimation() {
    window.removeEventListener('click', startAnimation);
    message.style.opacity = '0';
    scoreBlock.style.opacity = '1';
    flash.play();
    waterTouch.play();
    playerFlash.style.opacity = '0.5';
    playerFlash.style.transform = 'translate(-50%, -50%) scale(1.5)';
    main(5);
    setTimeout(() => {
        player.style.opacity = '1';
        playerFlash.style.opacity = '0';
        playerFlash.style.transform = 'translate(-50%, -50%) scale(1.5)';
        message.style.top = '25vh';

        setTimeout(() => {
            message.innerHTML = 'Используй стрелки для перемещения';
            message.style.opacity = '1';
            setTimeout(() => main(6), 3000);
        }, 300);
    }, 280);
}
    
function gameLoop() {
    if (!isPaused) {
        checkCoinCollision();
    }
    if (!gameLoopWork) {
        for (let coin of coins) {
            coin.remove();
        }
        return;
    }
    requestAnimationFrame(gameLoop);
}

function initPlayerControl() {
    window.removeEventListener('keydown', keyDownHandler);
    player.style.opacity = '1';
    window.addEventListener('keydown', keyDownHandler);
}

function keyDownHandler(e) {
    console.log(e.key);
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
        console.log('step 5');
        if (player.style.opacity == 0) {
            player.style.opacity = '1';
        }
        initPlayerControl();
        gameLoop();
        var coinInterval = setInterval(generateCoin, 3000);
        wavesSound.volume = 0.2;
        wavesSound.play();
    }
    else if (step === 6) {
        message.style.opacity = '0';
        setTimeout(() => {
            message.innerHTML = 'Собери как можно больше монеток';
            message.style.opacity = '1';
            setTimeout(() => {
                main(7);
            }, 3000);
        }, 500);
    }
    else if (step === 7) {
        message.style.opacity = '0';
        for (let i = 0; i < COINS_COUNT; i++) {
            setTimeout(generateCoin, 100 * i);
        }
    }
    else if (step === 8) {
        gameLoop();
        coinColor = 'rgb(45 45 45)';
        coinShadow = '';
        initPlayerControl();
        wavesSound.pause();
        music.play();

        for (let coin of coins) {
            coin.element.style.transition = 'all 5s';
            coin.element.style.backgroundColor = coinColor;
            coin.element.style.boxShadow = coinShadow;
            setTimeout(() => {
                coin.element.style.transition = 'all 1s';
            }, 5000);
        }

        waterTouch.volume = 0;
        setTimeout(() => {
            coin1.volume = 0;
        }, 1000);

        player.style.transition = 'all 1s, background-color 15s';
        player.style.backgroundColor = '#424242';
    }
    else if (step === 9) {
        // let yellowSpot = document.createElement('img');
        // yellowSpot.src = 'data/yellow_spot.png';
        // yellowSpot.style.position = 'absolute';
        // yellowSpot.style.left = '50%';
        // yellowSpot.style.top = '50%';
        // yellowSpot.style.transform = 'translate(-50%, -50%)';
        // yellowSpot.style.zIndex = '100';
        // yellowSpot.style.opacity = '0';
        // document.body.appendChild(yellowSpot);
        // setTimeout(() => {  
        //     yellowSpot.style.transition = 'all 1s';
        //     yellowSpot.style.opacity = '0.6';
        //     setTimeout(() => {
        //         yellowSpot.style.transition = 'all 1.5s';
        //         yellowSpot.style.opacity = '0';
        //     }, 1000);
        // }, 1000);
        player.style.transition = 'all 5s';
        player.style.backgroundColor = 'rgb(65, 57, 35)';
        setTimeout(() => {
            player.style.backgroundColor = 'rgb(45 45 45)';
            setTimeout(() => {
                player.style.transition = 'all 1s';
            }, 5000);
        }, 5000);
    }
    else if (step === 10) {
        let colorSpot = document.createElement('div');
        colorSpot.className = 'color-spot';
        colorSpot.style.setProperty('--color', 'rgb(63, 56, 42)');
        colorSpot.style.setProperty('--size', '6');
        colorSpot.style.bottom = '20vh';
        colorSpot.style.left = '20vw';
        document.body.appendChild(colorSpot);
        setTimeout(() => {
            colorSpot.remove();
        }, 5000);
    }
    else if (step === 11) {
        let colorSpot = document.createElement('div');
        colorSpot.className = 'color-spot';
        colorSpot.style.setProperty('--color', 'rgb(83, 67, 34)');
        colorSpot.style.setProperty('--size', '10');
        colorSpot.style.top = '20vh';
        colorSpot.style.right = '20vw';
        document.body.appendChild(colorSpot);
        setTimeout(() => {
            colorSpot.remove();
        }, 5000);
    }
    else if (step === 12) {
        let colorSpot = document.createElement('div');
        colorSpot.className = 'color-spot';
        colorSpot.style.setProperty('--color', 'rgb(114, 84, 23)');
        colorSpot.style.setProperty('--size', '14');
        colorSpot.style.top = '40vh';
        colorSpot.style.left = '40vw';
        document.body.appendChild(colorSpot);
        setTimeout(() => {
            colorSpot.remove();
        }, 5000);
    }
    else if (step === 13) {
        let colorSpot = document.createElement('div');
        colorSpot.className = 'color-spot';
        colorSpot.style.setProperty('--color', 'rgb(145, 96, 0)');
        colorSpot.style.setProperty('--size', '18');
        colorSpot.style.bottom = '40vh';
        colorSpot.style.right = '40vw';
        document.body.appendChild(colorSpot);
        setTimeout(() => {
            colorSpot.remove();
        }, 5000);
    }
    else if (step === 14) {
        let opacity = 0.05;
        let duration = 3;

        console.log('step 14');
        let windowImg = document.createElement('img');
        windowImg.src = 'data/window.png';
        windowImg.style.setProperty('--opacity', opacity);
        windowImg.style.setProperty('--duration', duration + 's');
        windowImg.className = 'big-img';
        document.body.appendChild(windowImg);
        setTimeout(() => {
            windowImg.remove();
        }, duration * 1000);
    }
    else if (step === 15) {
        let opacity = 0.2;
        let duration = 7;

        let nightImg = document.createElement('img');
        nightImg.src = 'data/night.png';
        nightImg.style.setProperty('--opacity', opacity);
        nightImg.style.setProperty('--duration', duration + 's');
        nightImg.className = 'big-img';
        document.body.appendChild(nightImg);
        setTimeout(() => {
            nightImg.remove();
        }, duration * 1000);
    }
    else if (step === 16) {
        let p = document.createElement('p');
        p.style.fontSize = '40px';
        p.style.color = 'white';
        p.style.position = 'absolute';
        p.style.top = '-100px';
        p.style.left = '0';
        p.style.width = '100vw';
        p.style.height = '100vh';
        p.style.zIndex = '99';
        p.style.whiteSpace = 'pre-wrap';
        p.style.wordBreak = 'break-all';
        p.style.overflowWrap = 'break-word';
        p.style.lineHeight = '1';
        p.style.color = 'rgb(34, 34, 34)';
        document.body.appendChild(p);
        for (let i = 0; i < 10000; i++) {
            setTimeout(() => {
                p.innerHTML += '•';
            }, 1 * i);
        }
        setTimeout(() => {
            p.style.transition = 'all 1s';
            p.style.opacity = '0';
        }, 1000);
    }
    else if (step === 17) {
        player.style.transition = 'all 2S';
        player.style.backgroundColor = 'rgb(104, 40, 40)';
        player.style.filter = 'drop-shadow(0 0 10px rgb(104, 40, 40))';
        setTimeout(() => {
            player.style.backgroundColor = 'rgb(83, 83, 83)';
            player.style.transition = 'all 2s';
            player.style.filter = 'drop-shadow(0 0 0px rgb(104, 40, 40))';
        }, 1000);
    }
    else if (step === 18) {
        player.style.transition = 'all 2s';
        player.style.backgroundColor = 'rgb(134, 47, 47)';
        player.style.filter = 'drop-shadow(0 0 30px rgb(134, 47, 47))';
        setTimeout(() => {
            player.style.backgroundColor = 'rgb(110, 110, 110)';
            player.style.transition = 'all 2s';
            player.style.filter = 'drop-shadow(0 0 0px rgb(134, 47, 47))';
        }, 1000);
    }
    else if (step === 19) {
        player.style.transition = 'all 2s';
        player.style.backgroundColor = 'rgb(161, 43, 43)';
        player.style.filter = 'drop-shadow(0 0 50px rgb(161, 43, 43))';
        setTimeout(() => {
            player.style.backgroundColor = 'rgb(138, 138, 138)';
            player.style.transition = 'all 2s';
            player.style.filter = 'drop-shadow(0 0 0px rgb(161, 43, 43))';
        }, 1000);
    }
    else if (step === 20) {
        player.style.transition = 'all 2s';
        player.style.backgroundColor = 'rgb(199, 34, 34)';
        player.style.filter = 'drop-shadow(0 0 70px rgb(199, 34, 34))';
        setTimeout(() => {
            player.style.backgroundColor = 'rgb(206, 206, 206)';
            player.style.transition = 'all 2s';
            player.style.filter = 'drop-shadow(0 0 0px rgb(199, 34, 34))';
        }, 1000);
    }   
    else if (step === 21) {
        let forestImg = document.createElement('img');
        forestImg.src = 'data/forest.png';
        forestImg.className = 'big-img';
        forestImg.style.setProperty('--opacity', 0.5);
        forestImg.style.setProperty('--duration', '5s');
        document.body.appendChild(forestImg);
        setTimeout(() => {
            forestImg.remove();
        }, 5000);
    }
}

setInterval(() => {
    let time = Math.floor(music.currentTime * 10) / 10;
    if (time === 47 && !window.step9Triggered) {
        window.step9Triggered = true;
        main(9);
    }
    else if (time === 72 && !window.step10Triggered) {
        window.step10Triggered = true;
        main(10);
    }
    else if (time === 75.2 && !window.step11Triggered) {
        window.step11Triggered = true;
        main(11);
    }
    else if (time === 78.5 && !window.step12Triggered) {
        window.step12Triggered = true;
        main(12);
    }
    else if (time === 81.5 && !window.step13Triggered) {
        window.step13Triggered = true;
        main(13);
    } 
    else if (time === 84.3 && !window.step14Triggered) {
        window.step14Triggered = true;
        main(14);
    }
    else if (time === 88 && !window.step15Triggered) {
        window.step15Triggered = true;
        main(15);
    }
    else if (time === 95 && !window.step16Triggered) {
        window.step16Triggered = true;
        main(16);
    }
    else if (time === 123.4 && !window.step17Triggered) {
        window.step17Triggered = true;
        main(17);
    }
    else if (time === 126.2 && !window.step18Triggered) {
        window.step18Triggered = true;
        main(18);
    }
    else if (time === 129 && !window.step19Triggered) {
        window.step19Triggered = true;
        main(19);
    }
    else if (time === 131.7 && !window.step20Triggered) {
        window.step20Triggered = true;
        main(20);
    }
    else if (time === 135 && !window.step21Triggered) {
        window.step21Triggered = true;
        main(21);
    }
}, 50);

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
    
    const left = col * cellWidth + cellWidth / 2 + offsetX;
    const top = row * cellHeight + cellHeight / 2 + offsetY;
    
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
main(8);
music.currentTime = 132;

// Сейчас: сделать кубик в лесу