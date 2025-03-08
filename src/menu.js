// menu.js

class Menu {
  constructor(startGameCallback) {
    this.startGameCallback = startGameCallback
    this.createMenu()
  }

  createMenu() {
    this.menuElement = document.createElement('div')
    this.menuElement.classList.add('menu')

    const title = document.createElement('h1')
    title.innerText = 'Escolha o Modo de Jogo'
    this.menuElement.appendChild(title)

    const singlePlayerButton = document.createElement('button')
    singlePlayerButton.innerText = 'Single Player'
    singlePlayerButton.onclick = () => this.startGame('single')
    this.menuElement.appendChild(singlePlayerButton)

    const multiplayerButton = document.createElement('button')
    multiplayerButton.innerText = 'Multiplayer Local'
    multiplayerButton.onclick = () => this.startGame('multi')
    this.menuElement.appendChild(multiplayerButton)

    document.body.appendChild(this.menuElement)
  }

  startGame(mode) {
    this.menuElement.style.display = 'none'
    this.startGameCallback(mode)
  }
}
