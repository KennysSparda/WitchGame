class Player extends Character {
  constructor(x, y, speed, controls, color, magicKey, engine) {
      super(x, y, speed, color, engine);
      this.controls = controls;
      this.magicKey = magicKey;
      this.magics = [];
      this.magicCooldown = 100;
      this.lastMagicTime = 0;
      this.isCastingMagic = false;
      this.castingDuration = 30;
      this.castingLoop = this.castingDuration;
  }

  update() {
    
    if (this.isDead) {
        this.handleDeath()
        return
    }

    this.handleBlinking()
    this.handleMagic()
    this.handleMovement()

    this.updateAnimation()
  }

  handleDeath() {
    if (this.deathTimer > 0) {
      this.deathTimer--
    }
    this.frameIndex = 2
  }

  handleBlinking() {
    if (this.isBlinking) {
      this.blinkLoop--
      if (this.blinkLoop <= 0) {
        this.isBlinking = false
        this.isVisible = true
      } else {
        this.isVisible = this.blinkLoop % 4 < 2
      }
    }
  }

  handleMagic() {
    const currentTime = Date.now()
    if (inputManager.isKeyPressed(this.magicKey) && (currentTime - this.lastMagicTime) > this.magicCooldown) {
        this.isCastingMagic = true
        this.castingLoop = this.castingDuration
        this.castMagic()
        this.lastMagicTime = currentTime
    }

    this.magics = this.magics.filter(magic => magic.update())

    if (this.isCastingMagic) {
        this.castingLoop--
        if (this.castingLoop <= 0) {
            this.isCastingMagic = false
        }
    }
  }

  handleMovement() {
    this.vx = 0
    this.vy = 0
    this.moving = false

    if (this.movementCounter >= 40) {
        this.movementCounter = 0
    }

    let nextX = this.x
    let nextY = this.y

    switch (this.type) {
        case 1:
            ({ nextX, nextY } = this.moveType1(nextX, nextY))
            break
        case 2:
            ({ nextX, nextY } = this.moveType2(nextX, nextY))
            break
        case 3:
            ({ nextX, nextY } = this.moveType3(nextX, nextY))
            break
        case 4:
            ({ nextX, nextY } = this.moveType4(nextX, nextY))
            break
        default:
            console.warn(`Tipo de movimento desconhecido: ${this.type}`)
            break
    }

    this.movementCounter++

    if (this.checkCollisions(nextX, nextY)) {
        this.x = nextX
        this.y = nextY
    } else {
        this.vx = 0
        this.vy = 0
    }
  }

  moveType1(nextX, nextY) {
    let player = this.engine.getPlayer()
    if (!player) return { nextX, nextY } 

    let dx = player.x - this.x
    let dy = player.y - this.y
    let dist = Math.sqrt(dx * dx + dy * dy)

    if (dist > 10) {
        let moveX = (dx / dist) * this.speed
        let moveY = (dy / dist) * this.speed

        nextX += moveX
        nextY += moveY

        this.vx = moveX
        this.vy = moveY
        this.moving = true

        
        if (Math.abs(dx) > Math.abs(dy)) {
            this.direction = "side"
            this.flipped = dx < 0 
        } else {
            this.direction = dy < 0 ? "up" : "down"
        }
    }

    
    if (dist < 500 && this.movementCounter % 20 === 0) {
        let attackDirection = "right"
        if (Math.abs(dx) > Math.abs(dy)) {
            attackDirection = dx < 0 ? "left" : "right"
        } else {
            attackDirection = dy < 0 ? "up" : "down"
        }

        this.castMagic(attackDirection)
    }

    return { nextX, nextY }
  }


  
  moveType2(nextX, nextY) {
    let player = this.engine.getPlayer()
    if (!player) return { nextX, nextY }
  
    let futureX = player.x + player.vx * 10 
    let futureY = player.y + player.vy * 10
  
    let dx = futureX - this.x
    let dy = futureY - this.y
    let dist = Math.sqrt(dx * dx + dy * dy)
  
    if (dist > 10) {
        let moveX = (dx / dist) * this.speed
        let moveY = (dy / dist) * this.speed
  
        nextX += moveX
        nextY += moveY
  
        this.vx = moveX
        this.vy = moveY
        this.moving = true
  
        if (Math.abs(dx) > Math.abs(dy)) {
            this.direction = "side"
            this.flipped = dx < 0
        } else {
            this.direction = dy < 0 ? "up" : "down"
        }
    }
  
    return { nextX, nextY }
  }
  
  moveType3(nextX, nextY) {
    let player = this.engine.getPlayer()
    if (!player) return { nextX, nextY }
  
    let dx = player.x - this.x
    let dy = player.y - this.y
    let dist = Math.sqrt(dx * dx + dy * dy)
  
    if (dist > 10) {
        let moveX = (dx / dist) * this.speed
        let moveY = (dy / dist) * this.speed
  
        nextX += moveX
        nextY += moveY
  
        this.vx = moveX
        this.vy = moveY
        this.moving = true
  
        if (Math.abs(dx) > Math.abs(dy)) {
            this.direction = "side"
            this.flipped = dx < 0
        } else {
            this.direction = dy < 0 ? "up" : "down"
        }
    }
  
    
    if (this.movementCounter % 5 === 0) this.castMagic()
  
    return { nextX, nextY }
  }
  
  moveType4(nextX, nextY) {
    let player = this.engine.getPlayer()
    if (!player) return { nextX, nextY }
  
    let dx = player.x - this.x
    let dy = player.y - this.y
    let dist = Math.sqrt(dx * dx + dy * dy)
  
    if (dist > 10) {
        let moveX = (dx / dist) * (this.speed * 1.5) 
        let moveY = (dy / dist) * (this.speed * 1.5)
  
        nextX += moveX
        nextY += moveY
  
        this.vx = moveX
        this.vy = moveY
        this.moving = true
  
        if (Math.abs(dx) > Math.abs(dy)) {
            this.direction = "side"
            this.flipped = dx < 0
        } else {
            this.direction = dy < 0 ? "up" : "down"
        }
    }
  
    
    if (this.movementCounter % 3 === 0) this.castMagic()
  
    return { nextX, nextY }
  }
  


  checkCollisions(nextX, nextY) {
    return !this.engine.entities.some(entity => 
      entity instanceof Box && 
      this.engine.checkEntityCollision({ x: nextX, y: nextY, width: this.width, height: this.height }, entity)
    )
  }

  updateAnimation() {
    if (this.isCastingMagic) {
      this.frameIndex = 3 + (this.frameIndex % 2) 
    } else if (this.moving) {
      this.frameIndex = 1 + (this.frameIndex % 2)
    } else {
      this.frameIndex = 0
    }
  }


  castMagic() {
    if (this.isDead) return 

    const magicSize = 16 
    const spriteOffset = 32 

    let magicX = this.x + this.width / 2 - magicSize / 2 
    let magicY = this.y + this.height / 2 - magicSize / 2 

    let direction = 'right'

    if (this.direction === 'side') {
      direction = this.flipped ? 'left' : 'right'
      magicX += this.flipped ? -spriteOffset : spriteOffset 
    } else if (this.direction === 'up') {
      direction = 'up'
      magicY -= spriteOffset
    } else if (this.direction === 'down') {
      direction = 'down'
      magicY += spriteOffset
    }

    this.magics.push(new Magic(magicX, magicY, direction, this, this.engine))
  }

  renderHealthBar(context) {
      if (this.isDead) return 

      context.fillStyle = 'black'
      context.fillRect(this.x, this.y - 10, this.width, 5)
      context.fillStyle = this.color
      context.fillRect(this.x, this.y - 10, (this.hp / 100) * this.width, 5)
  }

  render(context) {
      if (!this.imageLoaded || !this.isVisible) return

      let row, col
      const imgToRender = this.coloredImage || this.image

      if (this.isDead) {
          row = 3
          col = this.deathTimer > 0 ? 1 : 1
      } else if (this.isCastingMagic) {
          const directions = { down: 0, up: 1, side: 2 }
          row = directions[this.direction]
          col = this.frameIndex

      } else {
          const directions = { down: 0, up: 1, side: 2 }
          row = directions[this.direction]
          col = this.frameIndex
      }

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
