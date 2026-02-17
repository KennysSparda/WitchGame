class Enemy extends Character {
  constructor(x, y, speed, color, engine, type) {
    super(x, y, speed, color, engine);
    this.type = type;

    this.magics = [];
    this.lastMagicTime = 0;
    this.isCastingMagic = false;
    this.castingDuration = 30;
    this.castingLoop = this.castingDuration;

    // balance por tipo
    const cfg = {
      1: { cooldown: 900, range: 420, chance: 0.35 },
      2: { cooldown: 700, range: 450, chance: 0.45 },
      3: { cooldown: 600, range: 480, chance: 0.6 },
      4: { cooldown: 450, range: 520, chance: 0.75 },
    }[type] || { cooldown: 800, range: 450, chance: 0.4 };

    this.magicCooldown = cfg.cooldown;
    this.magicRange = cfg.range;
    this.magicChance = cfg.chance;
  }

  update() {
    if (this.isDead) {
      this.handleDeath();
      return;
    }

    this.handleBlinking();
    this.handleMagic();
    this.handleMovement();

    this.updateAnimation();
  }

  handleDeath() {
    if (this.deathTimer > 0) {
      this.deathTimer--;
    }
    this.frameIndex = 2;
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
  handleMagic() {
    const currentTime = Date.now();
    const player = this.engine.getPlayer();
    if (!player) return;

    const offCooldown = currentTime - this.lastMagicTime > this.magicCooldown;

    // sempre atualiza mira antes de decidir
    this.aimAt(player);

    const okShot = this.canCastAtPlayer(player);

    // entra em modo de cast só se tiver condição boa
    if (
      !this.isCastingMagic &&
      offCooldown &&
      okShot &&
      Math.random() < this.magicChance
    ) {
      this.isCastingMagic = true;
      this.castingLoop = this.castingDuration;
      this.lastMagicTime = currentTime;
    }

    // solta a magia perto do fim do cast (telegráfico e mais preciso)
    if (this.isCastingMagic) {
      this.castingLoop--;

      // lança quando faltar pouco (ex: 1/3 final)
      if (this.castingLoop === Math.floor(this.castingDuration / 3)) {
        // mira de novo na hora do disparo (evita sair pro lado errado)
        this.aimAt(player);

        // se perdeu condição (player saiu do range/linha), cancela
        if (this.canCastAtPlayer(player)) {
          this.castMagic();
        }
      }

      if (this.castingLoop <= 0) {
        this.isCastingMagic = false;
      }
    }

    this.magics = this.magics.filter((magic) => magic.update());
  }

  handleMovement() {
    this.vx = 0;
    this.vy = 0;
    this.moving = false;

    if (this.isCastingMagic) {
      // durante o cast, anda devagar (ou strafando)
      const player = this.engine.getPlayer();
      if (player) {
        // strafe leve pra ajustar posição e não ficar plantado
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.hypot(dx, dy) || 1;

        // perpendicular (strafe)
        const px = -dy / dist;
        const py = dx / dist;

        const strafeSpeed = this.speed * 0.35;
        let nextX = this.x + px * strafeSpeed;
        let nextY = this.y + py * strafeSpeed;

        if (this.checkCollisions(nextX, nextY)) {
          this.x = nextX;
          this.y = nextY;
          this.moving = true;
        }
      }

      // não faz o movimento normal enquanto castando
      return;
    }

    if (this.movementCounter >= 40) {
      this.movementCounter = 0;
    }

    let nextX = this.x;
    let nextY = this.y;

    switch (this.type) {
      case 1:
        ({ nextX, nextY } = this.moveType1(nextX, nextY));
        break;
      case 2:
        ({ nextX, nextY } = this.moveType2(nextX, nextY));
        break;
      case 3:
        ({ nextX, nextY } = this.moveType3(nextX, nextY));
        break;
      case 4:
        ({ nextX, nextY } = this.moveType4(nextX, nextY));
        break;
      default:
        console.warn(`Tipo de movimento desconhecido: ${this.type}`);
        break;
    }

    this.movementCounter++;

    if (this.checkCollisions(nextX, nextY)) {
      this.x = nextX;
      this.y = nextY;
    } else {
      this.vx = 0;
      this.vy = 0;
    }
  }

  moveType1(nextX, nextY) {
    let player = this.engine.getPlayer();
    if (!player) return { nextX, nextY };

    let dx = player.x - this.x;
    let dy = player.y - this.y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 10) {
      let moveX = (dx / dist) * this.speed;
      let moveY = (dy / dist) * this.speed;

      nextX += moveX;
      nextY += moveY;

      this.vx = moveX;
      this.vy = moveY;
      this.moving = true;

      if (Math.abs(dx) > Math.abs(dy)) {
        this.direction = "side";
        this.flipped = dx < 0;
      } else {
        this.direction = dy < 0 ? "up" : "down";
      }
    }

    return { nextX, nextY };
  }

  moveType2(nextX, nextY) {
    let player = this.engine.getPlayer();
    if (!player) return { nextX, nextY };

    let futureX = player.x + player.vx * 10;
    let futureY = player.y + player.vy * 10;

    let dx = futureX - this.x;
    let dy = futureY - this.y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 10) {
      let moveX = (dx / dist) * this.speed;
      let moveY = (dy / dist) * this.speed;

      nextX += moveX;
      nextY += moveY;

      this.vx = moveX;
      this.vy = moveY;
      this.moving = true;

      if (Math.abs(dx) > Math.abs(dy)) {
        this.direction = "side";
        this.flipped = dx < 0;
      } else {
        this.direction = dy < 0 ? "up" : "down";
      }
    }

    return { nextX, nextY };
  }

  moveType3(nextX, nextY) {
    let player = this.engine.getPlayer();
    if (!player) return { nextX, nextY };

    let dx = player.x - this.x;
    let dy = player.y - this.y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 10) {
      let moveX = (dx / dist) * this.speed;
      let moveY = (dy / dist) * this.speed;

      nextX += moveX;
      nextY += moveY;

      this.vx = moveX;
      this.vy = moveY;
      this.moving = true;

      if (Math.abs(dx) > Math.abs(dy)) {
        this.direction = "side";
        this.flipped = dx < 0;
      } else {
        this.direction = dy < 0 ? "up" : "down";
      }
    }

    return { nextX, nextY };
  }

  moveType4(nextX, nextY) {
    let player = this.engine.getPlayer();
    if (!player) return { nextX, nextY };

    let dx = player.x - this.x;
    let dy = player.y - this.y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 10) {
      let moveX = (dx / dist) * (this.speed * 1.5);
      let moveY = (dy / dist) * (this.speed * 1.5);

      nextX += moveX;
      nextY += moveY;

      this.vx = moveX;
      this.vy = moveY;
      this.moving = true;

      if (Math.abs(dx) > Math.abs(dy)) {
        this.direction = "side";
        this.flipped = dx < 0;
      } else {
        this.direction = dy < 0 ? "up" : "down";
      }
    }

    return { nextX, nextY };
  }

  canCastAtPlayer(player) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);

    // faixa ideal (não muito perto, não muito longe)
    const min = 140;
    const max = this.magicRange;

    if (dist < min || dist > max) return false;

    // precisa ter direção definida (pra não sair "right" default)
    if (!this.direction) return false;

    // opcional: só atira se tiver "linha de visão" (sem parede/box no caminho)
    if (!this.hasLineOfSight(player)) return false;

    return true;
  }

  hasLineOfSight(player) {
    const steps = 8; // barato
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const x = this.x + (player.x - this.x) * t;
      const y = this.y + (player.y - this.y) * t;

      const blocked = this.engine.entities.some(
        (e) =>
          e instanceof Box &&
          this.engine.checkEntityCollision({ x, y, width: 4, height: 4 }, e),
      );

      if (blocked) return false;
    }
    return true;
  }

  aimAt(player) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      this.direction = "side";
      this.flipped = dx < 0;
    } else {
      this.direction = dy < 0 ? "up" : "down";
    }
  }

  checkCollisions(nextX, nextY) {
    return !this.engine.entities.some(
      (entity) =>
        entity instanceof Box &&
        this.engine.checkEntityCollision(
          { x: nextX, y: nextY, width: this.width, height: this.height },
          entity,
        ),
    );
  }

  updateAnimation() {
    if (this.isCastingMagic) {
      this.frameIndex = 3 + (this.frameIndex % 2);
    } else if (this.moving) {
      this.frameIndex = 1 + (this.frameIndex % 2);
    } else {
      this.frameIndex = 0;
    }
  }

  castMagic() {
    console.log("Inimigo usando magic");
    if (this.isDead) return;

    const magicSize = 16;
    const spriteOffset = 32;

    let magicX = this.x + this.width / 2 - magicSize / 2;
    let magicY = this.y + this.height / 2 - magicSize / 2;

    let direction = "right";

    if (this.direction === "side") {
      direction = this.flipped ? "left" : "right";
      magicX += this.flipped ? -spriteOffset : spriteOffset;
    } else if (this.direction === "up") {
      direction = "up";
      magicY -= spriteOffset;
    } else if (this.direction === "down") {
      direction = "down";
      magicY += spriteOffset;
    }

    this.magics.push(new Magic(magicX, magicY, direction, this, this.engine));
  }

  renderHealthBar(context) {
    if (this.isDead) return;

    context.fillStyle = "black";
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
      col = this.deathTimer > 0 ? 1 : 1;
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
      context.drawImage(
        imgToRender,
        col * 64,
        row * 64,
        64,
        64,
        -this.x - this.width,
        this.y,
        this.width,
        this.height,
      );
    } else {
      context.drawImage(
        imgToRender,
        col * 64,
        row * 64,
        64,
        64,
        this.x,
        this.y,
        this.width,
        this.height,
      );
    }

    context.restore();

    this.magics.forEach((magic) => magic.render(context));
    this.renderHealthBar(context);
  }
}
