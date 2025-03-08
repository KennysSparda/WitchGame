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
        this.entities.forEach(entity => entity.update && entity.update());
    
        const allMagics = [];
    
        this.entities.forEach(entity => {
            if (entity instanceof Player) {
                allMagics.push(...entity.magics);
            }
        });
    
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
    
        for (let i = 0; i < allMagics.length; i++) {
            for (let j = i + 1; j < allMagics.length; j++) {
                if (this.checkCollision(allMagics[i], allMagics[j])) {
                    const magicA = allMagics[i];
                    const magicB = allMagics[j];
                    
                    const MAX_MAGIC_SIZE = 256;
                    if (magicA.owner === magicB.owner) {
                        if (magicA.size < MAX_MAGIC_SIZE) {
                            magicA.size *= 1.5;
                        }
                        magicB.owner.magics.splice(magicB.owner.magics.indexOf(magicB), 1);
                    } else {
                        // Se forem de donos diferentes, a maior destrói a menor
                        if (magicA.size > magicB.size) {
                            magicB.owner.magics.splice(magicB.owner.magics.indexOf(magicB), 1);
                        } else if (magicB.size > magicA.size) {
                            magicA.owner.magics.splice(magicA.owner.magics.indexOf(magicA), 1);
                        } else {
                            // Se forem do mesmo tamanho, se cancelam
                            magicA.owner.magics.splice(magicA.owner.magics.indexOf(magicA), 1);
                            magicB.owner.magics.splice(magicB.owner.magics.indexOf(magicB), 1);
                        }
                    }
                }
            }
        }
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