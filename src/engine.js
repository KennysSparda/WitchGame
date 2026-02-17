// Engine.js - Gerencia a renderização e atualização das entidades

class Engine {
  constructor() {
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    document.body.appendChild(this.canvas);
    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.entities = [];

    this.backgroundImage = new Image();
    this.backgroundImage.src = "img/background.png";

    this.backgroundPattern = null;
    this.backgroundImage.onload = () => {
      this.backgroundPattern = this.context.createPattern(
        this.backgroundImage,
        "repeat",
      );
    };
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  checkCollision(player, magic) {
    const margin = 0;
    return (
      magic.x + magic.width > player.x - margin &&
      magic.x < player.x + player.width + margin &&
      magic.y + magic.height > player.y - margin &&
      magic.y < player.y + player.height + margin
    );
  }

  update() {
    this.updateEntities();
    this.handleMagicCollisions();
    this.handlePlayerBoxCollisions();
  }

  updateEntities() {
    this.entities.forEach((entity) => {
      if (entity instanceof Player) {
        entity.update();

        entity.magics = entity.magics.filter((magic) => magic.update());
      }
      if (entity instanceof Enemy) {
        entity.update();

        entity.magics = entity.magics.filter((magic) => magic.update());
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

    this.entities.forEach((entity) => {
      if (entity instanceof Player || entity instanceof Enemy) {
        allMagics.push(...entity.magics);
      }
    });

    return allMagics;
  }

  checkPlayerMagicCollisions(allMagics) {
    this.entities.forEach((entity) => {
      if (
        (entity instanceof Player && !entity.isDead) ||
        (entity instanceof Enemy && !entity.isDead)
      ) {
        allMagics.forEach((magic) => {
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
      if (magicA.size > magicB.size) {
        magicA.size *= 1.2;
        magicB.owner.magics.splice(magicB.owner.magics.indexOf(magicB), 1);
      } else {
        magicB.size *= 1.5;
        magicA.owner.magics.splice(magicA.owner.magics.indexOf(magicA), 1);
      }
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
    this.entities.forEach((entity) => {
      if (entity instanceof Player && !entity.isDead) {
        let nextX = entity.x + entity.vx;
        let nextY = entity.y + entity.vy;

        let canMoveX = true;
        let canMoveY = true;

        this.entities.forEach((box) => {
          if (box instanceof Box) {
            if (
              this.checkEntityCollision(
                {
                  x: nextX,
                  y: entity.y,
                  width: entity.width,
                  height: entity.height,
                },
                box,
              )
            ) {
              canMoveX = false;
            }

            if (
              this.checkEntityCollision(
                {
                  x: entity.x,
                  y: nextY,
                  width: entity.width,
                  height: entity.height,
                },
                box,
              )
            ) {
              canMoveY = false;
            }
          }
        });

        if (canMoveX) {
          entity.x = nextX;
        } else {
          entity.vx = 0;
        }

        if (canMoveY) {
          entity.y = nextY;
        } else {
          entity.vy = 0;
        }

        if (entity.direction === "right") {
          entity.vx = entity.speed;
        } else if (entity.direction === "left") {
          entity.vx = -entity.speed;
        }

        if (entity.direction === "up") {
          entity.vy = -entity.speed;
        } else if (entity.direction === "down") {
          entity.vy = entity.speed;
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
    this.entities.sort((a, b) => a.y - b.y);
    this.entities.forEach((entity) => entity.render(this.context));
  }

  addEntity(entity) {
    this.entities.push(entity);
  }

  getPlayer() {
    let player = null;
    this.entities.forEach((entity) => {
      if (entity instanceof Player) {
        player = entity;
      }
    });
    return player;
  }

  allEnemiesDefeated() {
    return this.entities.every(
      (entity) => !(entity instanceof Enemy) || entity.isDead,
    );
  }

  start() {
    let lastTime = 0;
    const loop = (currentTime) => {
      const deltaTime = currentTime - lastTime;
      if (deltaTime >= 1000 / 30) {
        lastTime = currentTime;
        this.update();
        this.render();
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}
