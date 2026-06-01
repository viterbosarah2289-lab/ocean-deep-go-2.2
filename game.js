// Ocean Deep GO - Complete Game Logic

const gameState = {
    currentLevel: 0,
    currentRound: 1,
    totalScore: 0,
    lives: 3,
    
    level1: {
        phase: 'reveal',
        fishList: ['CLOWNFISH', 'BLUE TANG', 'ANGELFISH', 'BUTTERFLYFISH', 'LIONFISH'],
        score: 0,
        round: 1,
        maxRounds: 3,
        timer: 20,
        timerInterval: null,
        
        nextPhase() {
            const phases = ['reveal', 'cover', 'check', 'bonus'];
            const currentIndex = phases.indexOf(this.phase);
            
            if (currentIndex < phases.length - 1) {
                this.phase = phases[currentIndex + 1];
                this.updateDisplay();
            } else {
                // Move to next round or level
                if (this.round < this.maxRounds) {
                    this.round++;
                    this.phase = 'reveal';
                    this.updateDisplay();
                } else {
                    // Level Complete
                    completeLevel(1);
                }
            }
        },
        
        updateDisplay() {
            // Hide all phases
            document.querySelectorAll('#level1-content .game-phase').forEach(phase => {
                phase.classList.remove('active');
            });
            
            // Show current phase
            const phaseMap = {
                'reveal': 'fish-reveal-phase',
                'cover': 'cover-eyes-phase',
                'check': 'reveal-check-phase',
                'bonus': 'bonus-round-phase'
            };
            
            const phaseElement = document.getElementById(phaseMap[this.phase]);
            if (phaseElement) {
                phaseElement.classList.add('active');
            }
            
            // Update UI
            document.getElementById('level1-round').textContent = this.round;
            document.getElementById('level1-score').textContent = this.score;
            
            // Start timer for cover phase
            if (this.phase === 'cover') {
                this.startTimer();
            }
        },
        
        startTimer() {
            this.timer = 20;
            document.getElementById('level1-timer').textContent = this.timer;
            
            this.timerInterval = setInterval(() => {
                this.timer--;
                document.getElementById('level1-timer').textContent = this.timer;
                
                if (this.timer <= 0) {
                    clearInterval(this.timerInterval);
                    this.nextPhase();
                }
            }, 1000);
        },
        
        checkAnswer() {
            const input = document.getElementById('fish-names').value.toUpperCase();
            const userFish = input.split(',').map(f => f.trim()).filter(f => f);
            
            let correct = 0;
            for (let fish of this.fishList) {
                if (userFish.includes(fish)) {
                    correct++;
                }
            }
            
            const points = Math.round((correct / this.fishList.length) * 100 * (this.round * 1.5));
            this.score += points;
            
            alert(`You remembered ${correct}/${this.fishList.length} fish!\nPoints earned: ${points}`);
            this.nextPhase();
        }
    },
    
    level2: {
        selectedTurtle: null,
        score: 0,
        round: 1,
        maxRounds: 3,
        turtlePositions: { shelly: 0, turbo: 0, coral: 0, wave: 0 },
        boardSpaces: 16,
        currentPlayer: 0,
        
        selectTurtle(turtle) {
            this.selectedTurtle = turtle;
            this.turtlePositions[turtle] = 0;
            
            // Hide selection and show board
            document.getElementById('turtle-select-phase').classList.remove('active');
            document.getElementById('board-game-phase').classList.add('active');
            
            this.drawBoard();
        },
        
        rollDice() {
            const roll = Math.floor(Math.random() * 6) + 1;
            document.getElementById('dice-result').textContent = `You rolled: ${roll}`;
            
            // Move turtle
            this.turtlePositions[this.selectedTurtle] += roll;
            
            // Check space effects
            this.checkSpaceEffect(this.turtlePositions[this.selectedTurtle]);
            
            // Redraw board
            this.drawBoard();
            
            // Check win condition
            if (this.turtlePositions[this.selectedTurtle] >= this.boardSpaces) {
                this.score += 1000;
                alert('You reached the FINISH! Level Complete!');
                completeLevel(2);
            }
        },
        
        checkSpaceEffect(position) {
            const treasureSpaces = [3, 7, 12, 14];
            const obstacleSpaces = [2, 5, 9, 15];
            const surpriseSpaces = [4, 8, 11, 13];
            
            if (treasureSpaces.includes(position)) {
                this.turtlePositions[this.selectedTurtle] += 2;
                this.score += 250;
                alert('🏆 TREASURE! Move forward 2 spaces!');
            } else if (obstacleSpaces.includes(position)) {
                this.turtlePositions[this.selectedTurtle] -= 2;
                this.score -= 50;
                alert('🚫 OBSTACLE! Move back 2 spaces!');
            } else if (surpriseSpaces.includes(position)) {
                this.score += 100;
                alert('❓ SURPRISE! You found bonus points!');
            }
        },
        
        drawBoard() {
            const canvas = document.getElementById('game-board');
            const ctx = canvas.getContext('2d');
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw board background
            ctx.fillStyle = 'rgba(0, 50, 100, 0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw spaces
            const spaceWidth = canvas.width / 4;
            const spaceHeight = canvas.height / 4;
            
            for (let i = 0; i < this.boardSpaces; i++) {
                const row = Math.floor(i / 4);
                const col = i % 4;
                const x = col * spaceWidth + 10;
                const y = row * spaceHeight + 10;
                
                // Draw space
                ctx.fillStyle = 'rgba(0, 212, 255, 0.2)';
                ctx.fillRect(x, y, spaceWidth - 20, spaceHeight - 20);
                ctx.strokeStyle = '#00d4ff';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, spaceWidth - 20, spaceHeight - 20);
                
                // Draw space number
                ctx.fillStyle = '#ffd700';
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(i + 1, x + (spaceWidth - 20) / 2, y + 20);
            }
            
            // Draw turtle at current position
            if (this.selectedTurtle && this.turtlePositions[this.selectedTurtle] < this.boardSpaces) {
                const pos = this.turtlePositions[this.selectedTurtle];
                const row = Math.floor(pos / 4);
                const col = pos % 4;
                const x = col * spaceWidth + spaceWidth / 2;
                const y = row * spaceHeight + spaceHeight / 2;
                
                ctx.fillStyle = '#00ff00';
                ctx.beginPath();
                ctx.arc(x, y, 20, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#00aa00';
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        }
    },
    
    level3: {
        phase: 'intro',
        fish: [
            { name: 'CLOWNFISH', x: 100, y: 100, color: '#ff6600' },
            { name: 'BLUE TANG', x: 200, y: 150, color: '#0066ff' },
            { name: 'ANGELFISH', x: 300, y: 100, color: '#ffff00' },
            { name: 'BUTTERFLYFISH', x: 400, y: 150, color: '#ff00ff' }
        ],
        squid: { x: 650, y: 200, size: 50, speed: 2 },
        score: 0,
        round: 1,
        maxRounds: 5,
        lives: 3,
        timer: 10,
        gameActive: false,
        
        nextPhase() {
            if (this.phase === 'intro') {
                this.phase = 'game';
                document.getElementById('squid-intro-phase').classList.remove('active');
                document.getElementById('squid-game-phase').classList.add('active');
                this.startGame();
            }
        },
        
        startGame() {
            this.gameActive = true;
            this.squid.x = 700;
            this.timer = 10;
            
            const canvas = document.getElementById('squid-canvas');
            canvas.onclick = (e) => this.handleClick(e);
            
            this.gameLoop();
        },
        
        handleClick(e) {
            const canvas = document.getElementById('squid-canvas');
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Check if clicked on a fish
            for (let fish of this.fish) {
                const distance = Math.hypot(x - fish.x, y - fish.y);
                if (distance < 30) {
                    this.score += 100 * this.round;
                    fish.x = Math.random() * 700;
                    fish.y = Math.random() * 350;
                }
            }
        },
        
        gameLoop() {
            if (!this.gameActive) return;
            
            const canvas = document.getElementById('squid-canvas');
            const ctx = canvas.getContext('2d');
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw background
            ctx.fillStyle = 'rgba(0, 50, 100, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Move squid towards fish
            if (this.fish.length > 0) {
                const targetFish = this.fish[0];
                this.squid.x -= (this.squid.x - targetFish.x) * 0.02 * (1 + this.round * 0.3);
                this.squid.y -= (this.squid.y - targetFish.y) * 0.02 * (1 + this.round * 0.3);
            }
            
            // Draw squid
            ctx.fillStyle = 'rgba(200, 50, 50, 0.8)';
            ctx.beginPath();
            ctx.ellipse(this.squid.x, this.squid.y, this.squid.size, this.squid.size * 0.7, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw tentacles
            ctx.strokeStyle = 'rgba(150, 30, 30, 0.8)';
            ctx.lineWidth = 5;
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 * i) / 8;
                const x = this.squid.x + Math.cos(angle) * this.squid.size;
                const y = this.squid.y + Math.sin(angle) * this.squid.size * 0.7;
                ctx.beginPath();
                ctx.moveTo(this.squid.x, this.squid.y);
                ctx.lineTo(x, y);
                ctx.stroke();
            }
            
            // Draw fish
            for (let fish of this.fish) {
                ctx.fillStyle = fish.color;
                ctx.beginPath();
                ctx.ellipse(fish.x, fish.y, 20, 15, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw fish name
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(fish.name.substring(0, 3), fish.x, fish.y + 25);
            }
            
            // Check collisions with squid
            for (let i = this.fish.length - 1; i >= 0; i--) {
                const distance = Math.hypot(this.fish[i].x - this.squid.x, this.fish[i].y - this.squid.y);
                if (distance < 50) {
                    this.lives--;
                    document.getElementById('level3-lives').textContent = this.lives;
                    this.fish.splice(i, 1);
                    
                    if (this.lives <= 0) {
                        this.gameActive = false;
                        alert('Game Over! The squid got all the fish!');
                        completeLevel(3);
                        return;
                    }
                }
            }
            
            document.getElementById('level3-score').textContent = this.score;
            
            requestAnimationFrame(() => this.gameLoop());
        }
    },
    
    level4: {
        phase: 'intro',
        score: 0,
        round: 1,
        maxRounds: 5,
        lives: 3,
        timer: 60,
        gameActive: false,
        player: { x: 400, y: 200, size: 20, health: 100 },
        shelters: [],
        powerups: [],
        dangers: [],
        
        startGame() {
            this.phase = 'survival';
            document.getElementById('dheer-intro-phase').classList.remove('active');
            document.getElementById('survival-game-phase').classList.add('active');
            
            this.gameActive = true;
            this.initializeGame();
            this.gameLoop();
        },
        
        initializeGame() {
            // Create shelters (rocks)
            this.shelters = [
                { x: 100, y: 100, width: 50, height: 50 },
                { x: 300, y: 350, width: 60, height: 40 },
                { x: 600, y: 200, width: 50, height: 60 }
            ];
            
            // Create power-ups
            this.powerups = [
                { x: 200, y: 150, type: 'shield', active: true },
                { x: 500, y: 300, type: 'speed', active: true },
                { x: 400, y: 100, type: 'health', active: true }
            ];
            
            // Create dangers
            this.dangers = [
                { x: 400, y: 300, type: 'bomb', size: 40, active: true }
            ];
        },
        
        gameLoop() {
            if (!this.gameActive) return;
            
            const canvas = document.getElementById('survival-canvas');
            const ctx = canvas.getContext('2d');
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw background
            ctx.fillStyle = 'rgba(0, 50, 100, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw shelters
            ctx.fillStyle = 'rgba(100, 100, 100, 0.6)';
            for (let shelter of this.shelters) {
                ctx.fillRect(shelter.x, shelter.y, shelter.width, shelter.height);
                ctx.strokeStyle = '#666';
                ctx.lineWidth = 2;
                ctx.strokeRect(shelter.x, shelter.y, shelter.width, shelter.height);
            }
            
            // Draw power-ups
            for (let pu of this.powerups) {
                if (!pu.active) continue;
                
                let color = '#00ff00';
                if (pu.type === 'speed') color = '#ffff00';
                if (pu.type === 'health') color = '#ff0000';
                
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(pu.x, pu.y, 15, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            
            // Draw player
            ctx.fillStyle = '#00d4ff';
            ctx.fillRect(this.player.x, this.player.y, this.player.size, this.player.size);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.player.x, this.player.y, this.player.size, this.player.size);
            
            // Draw nuclear bomb danger
            for (let danger of this.dangers) {
                if (!danger.active) continue;
                
                ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
                ctx.beginPath();
                ctx.arc(danger.x, danger.y, danger.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 3;
                ctx.stroke();
                
                // Expanding radiation
                ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
                ctx.lineWidth = 1;
                for (let i = 1; i <= 3; i++) {
                    ctx.beginPath();
                    ctx.arc(danger.x, danger.y, danger.size + i * 20, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
            
            // Update health display
            document.getElementById('level4-score').textContent = this.score;
            
            requestAnimationFrame(() => this.gameLoop());
        }
    }
};

// Screen Management Functions
function showMenu() {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById('menu-screen').classList.add('active');
}

function showLevel(level) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById(`level${level}-screen`).classList.add('active');
    
    if (level === 1) {
        gameState.level1.phase = 'reveal';
        gameState.level1.updateDisplay();
    }
}

function completeLevel(level) {
    setTimeout(() => {
        if (level === 4) {
            alert('🏆 YOU SURVIVED THE IMPOSSIBLE! GAME COMPLETE! 🏆');
        } else {
            alert(`Level ${level} Complete! Moving to next level...`);
        }
        
        if (level < 4) {
            showLevel(level + 1);
        } else {
            showGameOver();
        }
    }, 500);
}

function showGameOver() {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById('gameover-screen').classList.add('active');
    
    document.getElementById('final-score').textContent = gameState.totalScore;
    document.getElementById('final-level').textContent = 4;
}

// Event Listeners
document.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const level = e.currentTarget.getAttribute('data-level');
        showLevel(level);
    });
});

// Initialize game
window.addEventListener('load', () => {
    showMenu();
});
