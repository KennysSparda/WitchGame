// game.js

class Game {
    constructor(mode) {
        this.engine = new Engine()

        if (mode === 'single') {
            this.player1 = new Player(100, 100, 4, {
                up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight'
            }, 'white', 'Enter')

            this.engine.addEntity(this.player1)
        } else if (mode === 'multi') {
            this.player1 = new Player(100, 100, 4, {
                up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight'
            }, 'red', 'Enter')

            this.player2 = new Player(300, 100, 4, {
                up: 'w', down: 's', left: 'a', right: 'd'
            }, 'blue', ' ')

            this.engine.addEntity(this.player1)
            this.engine.addEntity(this.player2)
        }
    }

    start() {
        this.engine.start()
    }
}