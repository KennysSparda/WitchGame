// magic.js

class Magic {
  constructor(x, y, direction, owner) {
      this.image = new Image()
      this.image.src = 'img/foguitu.png'

      this.x = x
      this.y = y
      this.width = 64
      this.height = 64
      this.speed = 5
      this.owner = owner
      this.direction = direction

      this.color = this.owner.color

      this.coloredImage = null 
      this.imageLoaded = false

      this.image.onload = () => {
          this.imageLoaded = true
          this.applyColorFilter()
      }
  }

  applyColorFilter() {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = this.image.width
    canvas.height = this.image.height

    ctx.drawImage(this.image, 0, 0)

    ctx.globalAlpha = 0.7

    ctx.globalCompositeOperation = 'source-atop'
    ctx.fillStyle = this.color
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    this.coloredImage = new Image()
    this.coloredImage.src = canvas.toDataURL()
  }

  update() {
      if (this.direction === 'right') this.x += this.speed
      if (this.direction === 'left') this.x -= this.speed
      if (this.direction === 'up') this.y -= this.speed
      if (this.direction === 'down') this.y += this.speed
    
      return !(this.x < 0 || this.x > window.innerWidth || this.y < 0 || this.y > window.innerHeight)
  }

  render(context) {
      if (!this.imageLoaded) return

      context.save()
      context.translate(this.x + this.width / 2, this.y + this.height / 2)

      let angle = 0
      if (this.direction === 'left') angle = Math.PI
      if (this.direction === 'up') angle = -Math.PI / 2
      if (this.direction === 'down') angle = Math.PI / 2

      context.rotate(angle)

      context.drawImage(this.coloredImage || this.image, -this.width / 2, -this.height / 2, this.width, this.height)
      context.restore()
  }
}
