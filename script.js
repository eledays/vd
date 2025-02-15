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
var particles = [];

let isPaused = false;

const CELL_SIZE = 100;
let coins = [];
let score = 0;
var gameLoopWork = true;
var wavesAnimationWork = true;
var redInterval;
var scaleInterval;
var playerScale = 1;
var coinInterval;
var noControl = false;
var clickingInterval;
var delta = 0;
window.stepCodes = [];

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

class Particle {
    constructor(x, y, color = 'red', size = 10, transition = 2) {
        this.element = document.createElement('div');
        this.element.className = 'particle';
        this.element.style.width = size + 'px';
        this.element.style.height = size + 'px';
        this.element.style.backgroundColor = color;
        this.element.style.left = x + 'px';
        this.element.style.top = y + 'px';
        this.element.style.transition = `all ${transition}s`;
        this.element.style.setProperty('--duration', transition + 's');
        document.body.appendChild(this.element);

        this.x = x;
        this.y = y;
        this.size = size;
        particles.push(this);
    }

    move(angle, distance) {
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        this.x = x;
        this.y = y;
        this.element.style.transform = `translate(${x}px, ${y}px)`;
    }

    moveTo(x, y) {
        this.x = x;
        this.y = y;
        this.element.style.transform = `translate(${x}px, ${y}px)`;
    }

    setSize(size) {
        this.element.style.width = size + 'px';
        this.element.style.height = size + 'px';
    }

    remove() {
        document.body.removeChild(this.element);
        particles.splice(particles.indexOf(this), 1);
    }
}

function generateCoin() {
    if (coins.length >= COINS_COUNT) {
        return;
    }

    // Получаем количество ячеек по ширине и высоте
    const gridWidth = Math.floor((window.innerWidth / 2 - CELL_SIZE / 2) / CELL_SIZE) * 2 + 1;
    const gridHeight = Math.floor((window.innerHeight / 2 - CELL_SIZE / 2) / CELL_SIZE) * 2 + 1;
    
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
    if (noControl) {
        return;
    }

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

    if (wavesAnimationWork) {
        requestAnimationFrame(waveAnimation);
    }
}

function sizeUp() {
    delta += 3;
    player.style.width = PLAYER_SIZE + delta + 'px';
    player.style.height = PLAYER_SIZE + delta + 'px';
}

function main(step = 0) {
    if (step === 0) {
        if (localStorage.getItem('step') == 3) {
            main(3);
            return;
        }
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
        window.removeEventListener('resize', reload);
        window.addEventListener('resize', () => reload(true));
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
        localStorage.clear();
    }
    else if (step === 4) {
        message.style.opacity = '0';
        setTimeout(() => {
            message.innerHTML = 'Если всё готово, кликни на экран';
            message.style.opacity = '1';
            window.addEventListener('click', startAnimation);
        }, 500);
        window.removeEventListener('resize', reload);
    }
    else if (step === 5) {
        console.log('step 5');
        if (player.style.opacity == 0) {
            player.style.opacity = '1';
        }
        initPlayerControl();
        gameLoop();
        coinInterval = setInterval(generateCoin, 3000);
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
        let opacity = 0.3;
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
        console.log('step 15');
        let opacity = 0.5;
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
        noControl = true;
        window.removeEventListener('keydown', keyDownHandler);
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
        noControl = true;
        window.removeEventListener('keydown', keyDownHandler);
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
        window.removeEventListener('keydown', keyDownHandler);
        player.style.transform = 'translate(-50%, -50%) translate(0, 400px)';
    }
    else if (step === 22) {
        gameLoopWork = false;
        clearInterval(coinInterval);
        for (let coin of coins) {
            coin.element.style.transition = 'all 1s';
            coin.element.style.opacity = '0';
            setTimeout(() => {
                coin.element.remove();
            }, 1000);
        }
        scoreBlock.style.opacity = '0';
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
    else if (step === 23) {
        player.style.transform = 'translate(-50%, -50%) translate(0, 400px) rotateX(90deg)';
        player.style.backgroundColor = 'rgb(40, 40, 40)';
    }
    else if (step === 24) {
        message.style.opacity = '1';
        message.innerHTML = '';
        message.style.transition = 'all 1s';
        const words = 'Я тебя люблю наперекор гороскопам, будто бы нет правил, знаков препинания.'.split(' ');
        
        // Create all spans at once
        words.forEach((word, index) => {
            const span = document.createElement('span');
            span.textContent = (index > 0 ? ' ' : '') + word;
            span.style.opacity = '0';
            span.style.transition = 'opacity 0.5s';
            span.style.marginRight = '2px';
            message.appendChild(span);
        });

        // Add line break after all words
        const br = document.createElement('br');
        message.appendChild(br);

        // Animate opacity for each word
        words.forEach((_, index) => {
            setTimeout(() => {
                message.children[index].style.opacity = '1';
            }, index * 500);
        });
    }
    else if (step === 25) {
        message.style.transition = 'opacity 15s';
        message.style.opacity = '0';
    }
    else if (step === 26) {
        player.style.transform = 'translate(-50%, -50%) rotateX(0deg)';
        window.playerRedLevel = 40;
    }
    else if (step === 27) {
        redInterval = setInterval(() => {
            player.style.transition = 'all .2s';
            let currentColor = window.playerRedLevel || 104;
            player.style.backgroundColor = `rgb(${currentColor}, 40, 40)`;
            window.playerRedLevel = Math.min(255, currentColor + 5);
        }, 700);
    }
    else if (step === 28) {
        scaleInterval = setInterval(() => {
            player.style.transition = 'all .3s';
            player.style.transform = 'translate(-50%, -50%) scale(1.05) scale(' + playerScale + ')';
            setTimeout(() => {
                player.style.transform = 'translate(-50%, -50%) scale(1) scale(' + playerScale + ')';
            }, 300);
        }, 700);
    }
    else if (step === 29) {
        // clearInterval(redInterval);
        clearInterval(scaleInterval);
        setTimeout(() => {
            player.style.transition = 'all 8s';
            player.style.transform = 'translate(-50%, -50%) scale(0.2)';
        }, 1000);
    }
    else if (step === 30) {
        player.style.transition = 'all 1s';
        player.style.opacity = '0';
        for (let i = 0; i < 750; i++) {
            let color = `rgb(${Math.random() * 100 + 155}, 0, 0`;
            let size = Math.random() * 10 + 3;
            let transition = Math.random() * 5 + 1;
            const particle = new Particle(window.innerWidth / 2, window.innerHeight / 2, color, size, transition);
            
            // Random angle and distance
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 1600 + 10;
            
            setTimeout(() => {
                particle.move(angle, distance);
            }, 100);
    
            // Remove particle after animation
            setTimeout(() => {
                particle.remove();
            }, 60000);
        }
        wavesAnimationWork = false;
        for (let spot of spots.children) {
            spot.style.transition = 'all 1s';
            spot.style.opacity = '0';
            setTimeout(() => {
                spot.remove();
            }, 1000);
        }
    }
    else if (step === 31) {
        console.log('step 31');
        for (let particle of particles) {
            // particle.element.style.transition = 'all .5s';
            particle.moveTo(particle.x - 300, particle.y + Math.random() * 50 - 25);
        }
    }
    else if (step === 32) {
        for (let particle of particles) {
            particle.moveTo(particle.x + 300, particle.y + 300);
        }
    }
    else if (step === 33) {
        for (let particle of particles) {
            particle.moveTo(particle.x, particle.y - 300);
        }
    }
    else if (step === 34) {
        console.log('step 34');
        for (let particle of particles) {
            // Scale down particles by moving them 20% closer to center
            const centerX = 0;
            const centerY = 0;
            particle.setSize(particle.size * 0.7);
            particle.element.style.transition = 'all 2s';
            const newX = particle.x * 0.7 + centerX * 0.3;
            const newY = particle.y * 0.7 + centerY * 0.3;
            particle.moveTo(newX, newY);
        }
    }
    else if (step === 35) {
        for (let particle of particles) {
            particle.element.style.backgroundColor = 'rgb(81, 33, 255)';
        }
        setTimeout(() => {
            for (let particle of particles) {
                particle.element.style.backgroundColor = 'rgb(255, 0, 0)';
            }
        }, 1000);
        message.style.top = '150px';
    }
    else if (step === 36) {
        noControl = true;
        clearInterval(scaleInterval);
        clearInterval(redInterval);

        player.style.transform = 'translate(-50%, -50%)';
        player.style.backgroundColor = 'rgb(255, 255, 255)';
        player.style.opacity = '1';
        player.style.transition = 'all 0s, background-color 50s, transform 50s';

        let k = 0.01;
        
        scaleInterval = setInterval(() => {
            delta -= k * (PLAYER_SIZE + delta);
            player.style.width = PLAYER_SIZE + delta + 'px';
            player.style.height = PLAYER_SIZE + delta + 'px';
        }, 50);

        window.addEventListener('click', sizeUp);
        window.addEventListener('keydown', sizeUp);

        for (let particle of particles) {
            particle.element.style.transition = 'all 50s';
            particle.moveTo(0, 0);
        }   
        player.style.backgroundColor = 'rgb(255, 0, 0)';
        player.style.transform = 'translate(-50%, -50%) rotateZ(360deg)';

        message.innerHTML = 'Кликай, чтобы кубик не сжался';
        message.style.top = '100px';
        message.style.opacity = '1';

        setTimeout(() => {
            message.style.transition = 'all 10s';
            message.style.opacity = '0';
            setTimeout(() => {
                message.style.transition = 'none';
                message.style.top = '100px';
                message.style.left = '100px';
                message.style.transform = 'none';
            }, 10000);
        }, 30000);
    }
    else if (step === 38) {
        clearInterval(scaleInterval);
        window.removeEventListener('click', sizeUp);
        window.removeEventListener('keydown', sizeUp);
        player.style.transition = 'all 10s';
        player.style.transform = 'translate(-50%, -50%) scale(0.00001)';    
        setTimeout(() => {
            player.style.opacity = '0';
        }, 10000);
    }
    else if (step === 39) {
        message.style.transition = 'none';
        message.style.top = '100px';
        message.style.left = '100px';
        message.style.transform = 'none';
        message.style.opacity = '1';
        message.innerHTML = '';
        message.style.transition = 'all 1s';
        const words = 'Твои глаза подходят к обоям.'.split(' ');
        
        // Create all spans at once
        words.forEach((word, index) => {
            const span = document.createElement('span');
            span.textContent = (index > 0 ? ' ' : '') + word;
            span.style.opacity = '0';
            span.style.transition = 'opacity 0.5s';
            span.style.marginRight = '2px';
            message.appendChild(span);
        });

        const br = document.createElement('br');
        message.appendChild(br);

        words.forEach((_, index) => {
            setTimeout(() => {
                message.children[index].style.opacity = '1';
            }, index * 400);
        });
    }
    else if (step === 40) {
        for (let child of message.children) {
            child.style.transition = 'all 5s';
            child.style.opacity = '.3';
        }
        const words = 'Палец к губам - тише -'.split(' ');
        let indexDelta = message.children.length;
        
        words.forEach((word, index) => {
            const span = document.createElement('span');
            span.textContent = (index > 0 ? ' ' : '') + word;
            span.style.opacity = '0';
            span.style.transition = 'opacity 0.5s';
            span.style.marginRight = '2px';
            message.appendChild(span);
        });

        const br = document.createElement('br');
        message.appendChild(br);

        words.forEach((_, index) => {
            setTimeout(() => {
                message.children[index + indexDelta].style.opacity = '1';
            }, index * 400);
        });
    }
    else if (step === 41) {
        for (let child of message.children) {
            child.style.transition = 'all 5s';
            child.style.opacity = '.3';
        }
        const words = 'Так будет лучше нам обоим,'.split(' ');
        let indexDelta = message.children.length;
        
        words.forEach((word, index) => {
            const span = document.createElement('span');
            span.textContent = (index > 0 ? ' ' : '') + word;
            span.style.opacity = '0';
            span.style.transition = 'opacity 0.5s';
            span.style.marginRight = '2px';
            message.appendChild(span);
        });

        const br = document.createElement('br');
        message.appendChild(br);

        words.forEach((_, index) => {
            setTimeout(() => {
                message.children[index + indexDelta].style.opacity = '1';
            }, index * 400);
        });
    }
    else if (step === 42) {
        for (let child of message.children) {
            child.style.transition = 'all 5s';
            child.style.opacity = '.3';
        }
        const words = 'Просто поверь мне, слышишь...'.split(' ');
        let indexDelta = message.children.length;
        
        words.forEach((word, index) => {
            const span = document.createElement('span');
            span.textContent = (index > 0 ? ' ' : '') + word;
            span.style.opacity = '0';
            span.style.transition = 'opacity 0.5s';
            span.style.marginRight = '2px';
            message.appendChild(span);
        });

        const br = document.createElement('br');
        message.appendChild(br);

        words.forEach((_, index) => {
            setTimeout(() => {
                message.children[index + indexDelta].style.opacity = '1';
            }, index * 400);
        });
    }
    else if (step === 43) {
        for (let child of message.children) {
            child.style.transition = 'all 5s';
            child.style.opacity = '.3';
        }
        const words = 'Как за окном дышит море прибоем'.split(' ');
        let indexDelta = message.children.length;
        
        words.forEach((word, index) => {
            const span = document.createElement('span');
            span.textContent = (index > 0 ? ' ' : '') + word;
            span.style.opacity = '0';
            span.style.transition = 'opacity 0.5s';
            span.style.marginRight = '2px';
            message.appendChild(span);
        });

        const br = document.createElement('br');
        message.appendChild(br);

        words.forEach((_, index) => {
            setTimeout(() => {
                message.children[index + indexDelta].style.opacity = '1';
            }, index * 400);
        });
    }
    else if (step === 44) {
        for (let child of message.children) {
            child.style.transition = 'all 5s';
            child.style.opacity = '.3';
        }
        const words = 'И дает пульс фальшивой ночи.'.split(' ');
        let indexDelta = message.children.length;
        
        words.forEach((word, index) => {
            const span = document.createElement('span');
            span.textContent = (index > 0 ? ' ' : '') + word;
            span.style.opacity = '0';
            span.style.transition = 'opacity 0.5s';
            span.style.marginRight = '2px';
            message.appendChild(span);
        });

        const br = document.createElement('br');
        message.appendChild(br);

        words.forEach((_, index) => {
            setTimeout(() => {
                message.children[index + indexDelta].style.opacity = '1';
            }, index * 400);
        });
    }
    else if (step === 45) {
        for (let child of message.children) {
            child.style.transition = 'all 5s';
            child.style.opacity = '.3';
        }
        const words = 'Знаешь, моя любовь'.split(' ');
        let indexDelta = message.children.length;
        
        words.forEach((word, index) => {
            const span = document.createElement('span');
            span.textContent = (index > 0 ? ' ' : '') + word;
            span.style.opacity = '0';
            span.style.transition = 'opacity 0.5s';
            span.style.marginRight = '2px';
            message.appendChild(span);
        });

        words.forEach((_, index) => {
            setTimeout(() => {
                message.children[index + indexDelta].style.opacity = '1';
            }, index * 400);
        });
    }
    else if (step === 46) {
        for (let child of message.children) {
            child.style.transition = 'all 5s';
            child.style.opacity = '.3';
        }
        const words = 'так похожа на многоточие.'.split(' ');
        let indexDelta = message.children.length;
        
        words.forEach((word, index) => {
            const span = document.createElement('span');
            span.textContent = (index > 0 ? ' ' : '') + word;
            span.style.opacity = '0';
            span.style.transition = 'opacity 0.5s';
            span.style.marginRight = '2px';
            message.appendChild(span);
        });

        const br = document.createElement('br');
        message.appendChild(br);

        words.forEach((_, index) => {
            setTimeout(() => {
                message.children[index + indexDelta].style.opacity = '1';
            }, index * 400);
        });
        setTimeout(() => {
            message.style.transition = 'all 5s';
            message.style.opacity = '0';
        }, words.length * 400 + 1000);
    }
    else if (step === 47) {
        message.style.transition = 'all 5s';
        message.style.opacity = '0';
        setTimeout(() => {
            message.style.transition = 'none';
        }, 5000);
    }
    else if (step === 48) {
        const heartParticles = [];
        const heartPoints = [];
        const numPoints = 750;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const scale = 300;
        const offset = 80;
        
        // Generate points in heart shape including inner points
        for (let i = 0; i < numPoints; i++) {
            // Generate random points and check if they're inside the heart
            let x, y;
            do {
                // Generate points in a 2x2 square centered at (0,0)
                x = (Math.random() * 4 - 2) * 0.8;
                y = (Math.random() * 4 - 2) * 0.8;
            } while ((x*x + y*y - 1)**3 - x*x * y*y*y > 0);

            // Scale and center the points
            heartPoints.push({
                x: centerX + x * scale,
                y: centerY - y * scale + offset
            });
        }

        // Create particles
        for (let i = 0; i < numPoints; i++) {
            const particle = new Particle();
            particle.element.style.animation = 'none';
            particle.element.style.transition = `all ${Math.random() * 5 + 1}s`;
            particle.element.style.opacity = '1';
            particle.moveTo(centerX, centerY);  // Start at center of screen
            heartParticles.push(particle);
        }

        // Move particles to heart shape positions
        setTimeout(() => {
            heartParticles.forEach((particle, i) => {
                // Add random offset to final positions
                const randomOffset = 20; // pixels
                const offsetX = (Math.random() - 0.5) * randomOffset;
                const offsetY = (Math.random() - 0.5) * randomOffset;
                particle.moveTo(
                    heartPoints[i].x + offsetX,
                    heartPoints[i].y + offsetY
                );
            });
        }, 100);

        // Fade out particles
        setTimeout(() => {
            heartParticles.forEach(particle => {
                particle.element.style.opacity = '0';
            });
        }, 10000);
    }
}

var timeCodes = [
    { time: 47, step: 9 },
    { time: 72, step: 10 },
    { time: 75.2, step: 11 },
    { time: 78.5, step: 12 },
    { time: 81.5, step: 13 },
    { time: 84.3, step: 14 },
    { time: 88, step: 15 },
    { time: 95, step: 16 },
    { time: 123.4, step: 17 },
    { time: 126.2, step: 18 },
    { time: 129, step: 19 },
    { time: 131.7, step: 20 },
    { time: 133, step: 21 },
    { time: 135, step: 22 },
    { time: 138, step: 23 },
    { time: 139, step: 24 },
    { time: 146, step: 25 },
    { time: 165, step: 26 },
    { time: 168.1, step: 27 },
    { time: 179.3, step: 28 },
    { time: 185, step: 29 },
    { time: 190.7, step: 30 },
    { time: 193.8, step: 31 },
    { time: 196.8, step: 32 },
    { time: 199.7, step: 33 },
    { time: 202.4, step: 34 },
    { time: 205.3, step: 35 },
    { time: 207, step: 36 },
    { time: 207.4, step: 37 },
    { time: 255, step: 38 },
    { time: 257.5, step: 39 },
    { time: 260.9, step: 40 },
    { time: 263.6, step: 41 },
    { time: 267.2, step: 42 },
    { time: 269.9, step: 43 },
    { time: 273, step: 44 },
    { time: 276.7, step: 45 },
    { time: 279.4, step: 46 },
    { time: 280, step: 47 },
    { time: 282, step: 48 },
];

setInterval(() => {
    let time = Math.floor(music.currentTime * 10) / 10;
    for (let i = 0; i < timeCodes.length; i++) {
        if (time === timeCodes[i].time && !window.stepCodes[timeCodes[i].step]) {
            window.stepCodes[timeCodes[i].step] = true;
            main(timeCodes[i].step);
        }
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

function reload(ls=false) {
    if (ls) {
        localStorage.setItem('step', 3);
    }
    location.reload();  
}

window.addEventListener('resize', reload);

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
main();
// music.currentTime = 206;