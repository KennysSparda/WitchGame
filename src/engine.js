// Engine.js - Gerencia a renderização e atualização das entidades

class Engine {
    constructor() {
        this.canvas = document.createElement('canvas')
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
        this.resize()
        window.addEventListener('resize', () => this.resize())
        this.entities = []
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
                        entity.takeDamage(20);
                        magic.owner.magics.splice(magic.owner.magics.indexOf(magic), 1);
                    }
                });
            }
        });
    
        for (let i = 0; i < allMagics.length; i++) {
            for (let j = i + 1; j < allMagics.length; j++) {
                if (this.checkCollision(allMagics[i], allMagics[j])) {
                    allMagics[i].owner.magics.splice(allMagics[i].owner.magics.indexOf(allMagics[i]), 1);
                    allMagics[j].owner.magics.splice(allMagics[j].owner.magics.indexOf(allMagics[j]), 1);
                }
            }
        }
    }
    
        

    render() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.entities.sort((a, b) => a.y - b.y)
        this.entities.forEach(entity => entity.render(this.context))
        requestAnimationFrame(() => this.render())
    }

    addEntity(entity) {
        this.entities.push(entity)
    }

    start() {
        const loop = () => {
            this.update()
            this.render()
            requestAnimationFrame(loop)
        }
        loop()
    }
}