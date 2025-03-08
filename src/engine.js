// Engine.js - Gerencia a renderização e atualização das entidades

class Engine {
    constructor() {
        this.canvas = document.createElement('canvas')
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
        this.resize()
        window.addEventListener('resize', () => this.resize())
        this.entities = []

        this.backgroundImage = new Image();
        this.backgroundImage.src = 'img/background.png';

        this.backgroundPattern = null;
        this.backgroundImage.onload = () => {
            this.backgroundPattern = this.context.createPattern(this.backgroundImage, 'repeat');
        };
    }

    resize() {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
    }

    checkCollision(player, magic) {
        const margin = 0
        return (
            magic.x + magic.width > player.x - margin &&
            magic.x < player.x + player.width + margin &&
            magic.y + magic.height > player.y - margin &&
            magic.y < player.y + player.height + margin
        )
    }
    update() {
        this.updateEntities();
        this.handleMagicCollisions();
        this.handlePlayerBoxCollisions()
    }
    
    updateEntities() {
        this.entities.forEach(entity => {
            if (entity instanceof Player) {
                entity.update();
                // Remove magias inativas
                entity.magics = entity.magics.filter(magic => magic.update());
            }
        });
    }
    
    handleMagicCollisions() {
        this.allMagics = this.collectAllMagics();
    
        this.checkPlayerMagicCollisions(this.allMagics);
        this.checkMagicVsMagicCollisions(this.allMagics);
    }
    
    collectAllMagics() {
        const allMagics = [];
        
        this.entities.forEach(entity => {
            if (entity instanceof Player) {
                allMagics.push(...entity.magics);
            }
        });
    
        return allMagics;
    }
    
    checkPlayerMagicCollisions(allMagics) {
        this.entities.forEach(entity => {
            if (entity instanceof Player && !entity.isDead) { // Evita colisão se estiver morto
                allMagics.forEach(magic => {
                    if (magic.owner !== entity && this.checkCollision(entity, magic)) {
                        const damage = magic.getDamage();
                        entity.takeDamage(damage);
                        magic.owner.magics.splice(magic.owner.magics.indexOf(magic), 1);
                    }
                });
            }
        });
    }
    
    checkMagicVsMagicCollisions(allMagics) {
        for (let i = 0; i < allMagics.length; i++) {
            for (let j = i + 1; j < allMagics.length; j++) {
                if (this.checkCollision(allMagics[i], allMagics[j])) {
                    const magicA = allMagics[i];
                    const magicB = allMagics[j];
    
                    this.resolveMagicCollision(magicA, magicB);
                }
            }
        }
    }
    
    resolveMagicCollision(magicA, magicB) {
        const MAX_MAGIC_SIZE = 256;
    
        if (magicA.owner === magicB.owner) {
            if (magicA.size < MAX_MAGIC_SIZE) {
                magicA.size *= 1.5;
            }
            magicB.owner.magics.splice(magicB.owner.magics.indexOf(magicB), 1);
        } else {
            if (magicA.size > magicB.size) {
                magicB.owner.magics.splice(magicB.owner.magics.indexOf(magicB), 1);
            } else if (magicB.size > magicA.size) {
                magicA.owner.magics.splice(magicA.owner.magics.indexOf(magicA), 1);
            } else {
                magicA.owner.magics.splice(magicA.owner.magics.indexOf(magicA), 1);
                magicB.owner.magics.splice(magicB.owner.magics.indexOf(magicB), 1);
            }
        }
    }
    handlePlayerBoxCollisions() {
        this.entities.forEach(entity => {
            if (entity instanceof Player && !entity.isDead) { // Verifica se o player está vivo
                // Calcula a próxima posição do jogador
                let nextX = entity.x + entity.vx;
                let nextY = entity.y + entity.vy;
    
                // Verifica colisão com as caixas
                let canMoveX = true; // Permite movimento horizontal
                let canMoveY = true; // Permite movimento vertical
    
                this.entities.forEach(box => {
                    if (box instanceof Box) {
                        // Verifica colisão no eixo X
                        if (this.checkEntityCollision({ x: nextX, y: entity.y, width: entity.width, height: entity.height }, box)) {
                            canMoveX = false; // Colisão no eixo X
                        }
    
                        // Verifica colisão no eixo Y
                        if (this.checkEntityCollision({ x: entity.x, y: nextY, width: entity.width, height: entity.height }, box)) {
                            canMoveY = false; // Colisão no eixo Y
                        }
                    }
                });
    
                // Aplica o movimento no eixo X se não houver colisão
                if (canMoveX) {
                    entity.x = nextX; // Move o jogador no eixo X
                } else {
                    entity.vx = 0; // Para o movimento horizontal
                }
    
                // Aplica o movimento no eixo Y se não houver colisão
                if (canMoveY) {
                    entity.y = nextY; // Move o jogador no eixo Y
                } else {
                    entity.vy = 0; // Para o movimento vertical
                }
    
                // Restaura a velocidade e a direção do jogador
                if (entity.direction === 'right') {
                    entity.vx = entity.speed; // Movimento para a direita
                } else if (entity.direction === 'left') {
                    entity.vx = -entity.speed; // Movimento para a esquerda
                }
    
                if (entity.direction === 'up') {
                    entity.vy = -entity.speed; // Movimento para cima
                } else if (entity.direction === 'down') {
                    entity.vy = entity.speed; // Movimento para baixo
                }
            }
        });
    }
    
    
    checkEntityCollision(entity, box) {
        return (
            entity.x + entity.width > box.x &&
            entity.x < box.x + box.width &&
            entity.y + entity.height > box.y &&
            entity.y < box.y + box.height
        );
    }

    render() {
        if (this.backgroundPattern) {
            this.context.fillStyle = this.backgroundPattern;
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        this.entities.sort((a, b) => a.y - b.y)
        this.entities.forEach(entity => entity.render(this.context))
    }

    addEntity(entity) {
        this.entities.push(entity)
    }

    start() {
        let lastTime = 0;
        const loop = (currentTime) => {
            const deltaTime = currentTime - lastTime;
            if (deltaTime >= (1000 / 30)) { // 60 FPS
                lastTime = currentTime;
                this.update();
                this.render();
            }
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}