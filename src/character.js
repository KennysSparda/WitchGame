class Character {
  constructor(x, y, speed, color, engine) {
      this.engine = engine
      this.image = new Image();
      this.image.src = 'img/player.png';

      this.x = x;
      this.y = y;
      this.width = 64;
      this.height = 64;
      this.initialSpeed = speed;
      this.speed = this.initialSpeed;
      this.moving = false;
      this.vx = 0;
      this.vy = 0;
      
      this.direction = 'down';
      this.flipped = false;

      this.frameIndex = 0;
      this.frameTimer = 0;
      this.frameSpeed = 10;

      this.color = color;
      
      this.coloredImage = null;
      this.imageLoaded = false;
      
      this.controls = {};
      this.magicKey = '';
      this.magics = [];
      this.magicCooldown = 100;
      this.lastMagicTime = 0;

      this.hp = 100;
      this.isDead = false;
      this.deathTimer = 50; // Tempo para a animação de "cair" antes de deitar

      this.isCastingMagic = false;
      this.castingDuration = 30
      this.castingLoop = this.castingDuration

      // Controle do piscar
      this.isBlinking = false;
      this.blinkDuration = 10; // Tempo total piscando (frames)
      this.blinkLoop = 0;
      this.isVisible = true;

      this.image.onload = () => {
          this.imageLoaded = true;
          this.applyColorFilter();
      };

      // 🎵 Inicialização dos sons
      this.sounds = {
          step: new Sound('step'),
          hit: new Sound('hit'),
          die: new Sound('die'),
      };
      
  }

  takeDamage(amount) {
      if (this.isDead) return;
  
      this.sounds.hit.play()
  
      this.hp -= amount;
      if (this.hp <= 0) {
          console.log(`${this.color} morreu!`);
          this.hp = 0;
          this.die();
      } else {
          this.startBlinking();
      }
  }

  startBlinking() {
      this.isBlinking = true;
      this.blinkLoop = this.blinkDuration;
      this.isVisible = false;
  }

  die() {
      this.sounds.die.play();
      this.color = 'white'
      this.applyColorFilter()
      this.isVisible = true;
      this.isBlinking = false;
      this.isDead = true;
      this.direction = 'dead'; // Nova direção para renderizar a sprite de morte
      this.frameIndex = 0; // Começa a animação de morte
  }

  applyColorFilter() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = this.image.width;
      canvas.height = this.image.height;

      ctx.drawImage(this.image, 0, 0);

      ctx.globalAlpha = 0.5;
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = this.color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      this.coloredImage = new Image();
      this.coloredImage.src = canvas.toDataURL();
  }
  update() {
    this.resetMovement();
    
    if (this.handleDeath()) return;
    this.handleBlinking();
    this.handleMagicCasting();
    
    this.handleMovement();
    this.checkCollisions();
    this.updatePosition();
    this.handleStepSound();
    this.handleMagicAction();
    this.updateFrame();
}

resetMovement() {
    this.vx = 0;
    this.vy = 0;
    this.moving = false;
}

handleDeath() {
    if (this.isDead) {
        if (this.deathTimer > 0) this.deathTimer--;
        this.frameIndex = 2;
        return true;
    }
    return false;
}

handleBlinking() {
    if (this.isBlinking) {
        this.blinkLoop--;
        if (this.blinkLoop <= 0) {
            this.isBlinking = false;
            this.isVisible = true;
        } else {
            this.isVisible = this.blinkLoop % 4 < 2;
        }
    }
}

handleMagicCasting() {
    if (this.isCastingMagic) {
        this.castingLoop--;
        if (this.castingLoop <= 0) this.isCastingMagic = false;
    }
}

handleMovement() {
    if (inputManager.isKeyPressed(this.controls.right)) this.moveRight();
    if (inputManager.isKeyPressed(this.controls.left)) this.moveLeft();
    if (inputManager.isKeyPressed(this.controls.up)) this.moveUp();
    if (inputManager.isKeyPressed(this.controls.down)) this.moveDown();
}

moveRight() {
    this.vx = this.speed;
    this.direction = 'side';
    this.flipped = false;
    this.moving = true;
}

moveLeft() {
    this.vx = -this.speed;
    this.direction = 'side';
    this.flipped = true;
    this.moving = true;
}

moveUp() {
    this.vy = -this.speed;
    this.direction = 'up';
    this.moving = true;
}

moveDown() {
    this.vy = this.speed;
    this.direction = 'down';
    this.moving = true;
}

checkCollisions() {
    this.canMove = true;
    this.engine.entities.forEach(entity => {
        if (entity instanceof Box && this.engine.checkEntityCollision(this.getNextPosition(), entity)) {
            this.canMove = false;
        }
    });
}

getNextPosition() {
    return { x: this.x + this.vx, y: this.y + this.vy, width: this.width, height: this.height };
}

updatePosition() {
    if (this.canMove) {
        this.x += this.vx;
        this.y += this.vy;
    } else {
        this.vx = 0;
        this.vy = 0;
    }
}

handleStepSound() {
    if (this.moving) {
        console.log('sound moving');
        this.sounds.step.play();
    } else {
        this.sounds.step.pause();
    }
}

handleMagicAction() {
    const currentTime = Date.now();
    if (inputManager.isKeyPressed(this.magicKey) && (currentTime - this.lastMagicTime) > this.magicCooldown) {
        this.isCastingMagic = true;
        this.castingLoop = this.castingDuration;
        this.castMagic();
        this.lastMagicTime = currentTime;
    }
    this.magics = this.magics.filter(magic => magic.update());
}

updateFrame() {
    if (this.isCastingMagic) {
        this.frameIndex = 3 + (this.frameIndex % 2);
    } else if (this.moving) {
        this.frameIndex = 1 + (this.frameIndex % 2);
    } else {
        this.frameIndex = 0;
    }
}

  castMagic() {
      
      if (this.isDead) return; // Impede de lançar magias depois de morto
      const magicSize = 16; // Tamanho de colisão da magia
      const spriteOffset = 8; // Metade do tamanho do sprite da magia (exemplo: se for 64x64)
  
      let magicX = this.x + this.width / 2 - magicSize / 2; // Centraliza horizontalmente
      let magicY = this.y + this.height / 2 - magicSize / 2; // Centraliza verticalmente
  
      let direction = 'right';
  
      if (this.direction === 'side') {
          direction = this.flipped ? 'left' : 'right';
          magicX += this.flipped ? -spriteOffset : spriteOffset; // Ajusta a posição para sair da mão do player
      } else if (this.direction === 'up') {
          direction = 'up';
          magicY -= spriteOffset;
      } else if (this.direction === 'down') {
          direction = 'down';
          magicY += spriteOffset;
      }
  
      this.magics.push(new Magic(magicX, magicY, direction, this, this.engine));
  }

  renderHealthBar(context) {
      if (this.isDead) return; // Não exibe barra de vida se morto

      context.fillStyle = 'black';
      context.fillRect(this.x, this.y - 10, this.width, 5);
      context.fillStyle = this.color;
      context.fillRect(this.x, this.y - 10, (this.hp / 100) * this.width, 5);
  }

  render(context) {
      if (!this.imageLoaded || !this.isVisible) return;

      let row, col;
      const imgToRender = this.coloredImage || this.image;

      if (this.isDead) {
          row = 3;
          col = this.deathTimer > 0 ? 1 : 0;
      } else if (this.isCastingMagic) {
          const directions = { down: 0, up: 1, side: 2 };
          row = directions[this.direction];
          col = this.frameIndex;

      } else {
          const directions = { down: 0, up: 1, side: 2 };
          row = directions[this.direction];
          col = this.frameIndex;
      }

      context.save();

      if (this.flipped) {
          context.scale(-1, 1);
          context.drawImage(imgToRender, col * 64, row * 64, 64, 64, -this.x - this.width, this.y, this.width, this.height);
      } else {
          context.drawImage(imgToRender, col * 64, row * 64, 64, 64, this.x, this.y, this.width, this.height);
      }

      context.restore();

      this.magics.forEach(magic => magic.render(context));
      this.renderHealthBar(context);
  }
}
