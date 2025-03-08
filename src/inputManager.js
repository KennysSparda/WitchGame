// inputManager.js

class InputManager {
  constructor() {
      this.keys = {}

      window.addEventListener('keydown', (e) => this.keys[e.key] = true)
      window.addEventListener('keyup', (e) => this.keys[e.key] = false)
  }

  isKeyPressed(key) {
      return this.keys[key] || false
  }
}

const inputManager = new InputManager()
