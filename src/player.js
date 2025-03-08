// player.js

class Player {
    constructor(x, y, speed, controls, color, magicKey) {
        this.image = new Image()
        this.image.src = 'img/player.png'

        this.x = x
        this.y = y
        this.width = 64
        this.height = 64
        this.speed = speed
        this.direction = 'down'
        this.flipped = false

        this.frameIndex = 0
        this.frameTimer = 0
        this.frameSpeed = 10

        this.controls = controls 
        this.color = color 

        this.coloredImage = null 
        this.imageLoaded = false

        this.magicKey = magicKey 
        this.magics = [] 
        this.magicCooldown = 500 
        this.lastMagicTime = 0

        this.hp = 100
        this.image.onload = () => {
            this.imageLoaded = true
            this.applyColorFilter()
        }
    }

    takeDamage(amount) {
        this.hp -= amount
        console.log(`${this.color} tomou dano! HP: ${this.hp}`)
        if (this.hp <= 0) {
            console.log(`${this.color} morreu!`)
            this.hp = 0
        }
    }

    applyColorFilter() {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
    
        canvas.width = this.image.width
        canvas.height = this.image.height
    
        ctx.drawImage(this.image, 0, 0)

        ctx.globalAlpha = 0.5
    
        ctx.globalCompositeOperation = 'source-atop'
        ctx.fillStyle = this.color
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    
        this.coloredImage = new Image()
        this.coloredImage.src = canvas.toDataURL()
    }

    update() {
        let moving = false

        if (inputManager.isKeyPressed(this.controls.right)) {
            this.x += this.speed
            this.direction = 'side'
            this.flipped = false
            moving = true
        }
        if (inputManager.isKeyPressed(this.controls.left)) {
            this.x -= this.speed
            this.direction = 'side'
            this.flipped = true
            moving = true
        }
        if (inputManager.isKeyPressed(this.controls.up)) {
            this.y -= this.speed
            this.direction = 'up'
            moving = true
        }
        if (inputManager.isKeyPressed(this.controls.down)) {
            this.y += this.speed
            this.direction = 'down'
            moving = true
        }

        const currentTime = Date.now() 

        if (inputManager.isKeyPressed(this.magicKey) && (currentTime - this.lastMagicTime) > this.magicCooldown) {
            this.castMagic()
            this.lastMagicTime = currentTime 
        }

        this.magics = this.magics.filter(magic => magic.update())

        this.frameIndex = moving ? (this.frameIndex % 2) + 1 : 0
    }

    castMagic() {
        let magicX = this.x
        let magicY = this.y

        let direction = 'right'
    
        if (this.direction === 'side') {
            direction = this.flipped ? 'left' : 'right'
        } else if (this.direction === 'up') {
            direction = 'up'
        } else if (this.direction === 'down') {
            direction = 'down'
        }
        
        this.magics.push(new Magic(magicX, magicY, direction, this))
    }
    
    renderHealthBar(context) {
        context.fillStyle = 'black'
        context.fillRect(this.x, this.y - 10, this.width, 5) 
        context.fillStyle = this.color
        context.fillRect(this.x, this.y - 10, (this.hp / 100) * this.width, 5) 
    }

    render(context) {
        if (!this.imageLoaded) return
        const directions = { down: 0, up: 1, side: 2 }
        const row = directions[this.direction]
        const col = this.frameIndex

        const imgToRender = this.coloredImage || this.image 

        context.save()

        if (this.flipped) {
            context.scale(-1, 1)
            context.drawImage(imgToRender, col * 64, row * 64, 64, 64, -this.x - this.width, this.y, this.width, this.height)
        } else {
            context.drawImage(imgToRender, col * 64, row * 64, 64, 64, this.x, this.y, this.width, this.height)
        }

        context.restore()

        this.magics.forEach(magic => magic.render(context))
        this.renderHealthBar(context)
    }
}
