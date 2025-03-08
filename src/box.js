class Box {
  constructor(x, y) {
      this.image = new Image();
      this.image.src = 'img/caixa.png';
      this.x = x;
      this.y = y;
      this.width = 64; // Define o tamanho da caixa
      this.height = 64;
  }

  render(context) {
      context.drawImage(this.image, this.x, this.y, this.width, this.height);
  }
}
