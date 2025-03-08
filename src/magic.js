class Magic {
  constructor(x, y, direction, owner, engine) {
      this.engine = engine; // Referência ao Engine
      this.image = new Image();
      this.image.src = 'img/foguitu.png';

      this.x = x;
      this.y = y;
      this.initialSize = 16;
      this.size = this.initialSize;
      this.width = this.size;
      this.height = this.size;
      this.speed = 5;
      this.owner = owner;
      this.direction = direction;

      this.color = this.owner.color;

      this.coloredImage = null;
      this.imageLoaded = false;

      this.image.onload = () => {
          this.imageLoaded = true;
          this.applyColorFilter();
      };
  }

  getDamage() {
      return Math.round((this.size / 16) * 20); // O dano base é 20 para magias de tamanho 64
  }

  applyColorFilter() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = this.image.width;
      canvas.height = this.image.height;

      ctx.drawImage(this.image, 0, 0);

      ctx.globalAlpha = 0.7;
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = this.color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      this.coloredImage = new Image();
      this.coloredImage.src = canvas.toDataURL();
  }

  update() {
      // Antes de mover, guarda a posição antiga do centro
      const oldCenterX = this.x + this.width / 2;
      const oldCenterY = this.y + this.height / 2;

      // Calcula a próxima posição da magia
      let nextX = this.x;
      let nextY = this.y;

      if (this.direction === 'right') {
          nextX += this.speed;
      } else if (this.direction === 'left') {
          nextX -= this.speed;
      } else if (this.direction === 'up') {
          nextY -= this.speed;
      } else if (this.direction === 'down') {
          nextY += this.speed;
      }

      // Verifica colisão com caixas antes de atualizar a posição
      let canMove = true;
      this.engine.entities.forEach(entity => {
          if (entity instanceof Box) {
              if (this.engine.checkEntityCollision(
                  { x: nextX, y: nextY, width: this.width, height: this.height },
                  entity
              )) {
                  canMove = false; // Colisão detectada
              }
          }
      });

      // Aplica o movimento apenas se não houver colisão
      if (canMove) {
          this.x = nextX;
          this.y = nextY;
      } else {
          // Se houver colisão, a magia é destruída
          return false;
      }

      // Após a colisão e crescimento, recalcula a posição
      if (this.size !== this.width) {
          const sizeIncrease = this.size - this.width;
          this.width = this.size;
          this.height = this.size;

          // Ajusta para manter o centro no mesmo lugar
          this.x = oldCenterX - this.width / 2;
          this.y = oldCenterY - this.height / 2;
      }

      // Retorna true para indicar que a magia ainda está ativa
      return !(this.x < 0 || this.x > window.innerWidth || this.y < 0 || this.y > window.innerHeight);
  }

  render(context) {
      if (!this.imageLoaded) return;

      context.save();
      context.translate(this.x + this.width / 2, this.y + this.height / 2);

      let angle = 0;
      if (this.direction === 'left') angle = Math.PI;
      if (this.direction === 'up') angle = -Math.PI / 2;
      if (this.direction === 'down') angle = Math.PI / 2;

      context.rotate(angle);

      context.drawImage(this.coloredImage || this.image, -this.width / 2, -this.height / 2, this.width, this.height);
      context.restore();
  }
}