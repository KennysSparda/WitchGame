// game.js

class Game {
    constructor(mode) {
        this.engine = new Engine();

        if (mode === 'single') {
            this.player1 = new Player(100, 100, 3, {
                up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight'
            }, 'white', 'Enter', this.engine); // Passa o Engine

            this.engine.addEntity(this.player1);
        } else if (mode === 'multi') {
            this.player1 = new Player(100, 100, 3, {
                up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight'
            }, 'red', 'Enter', this.engine); // Passa o Engine

            this.player2 = new Player(300, 100, 3, {
                up: 'w', down: 's', left: 'a', right: 'd'
            }, 'blue', ' ', this.engine); // Passa o Engine

            this.engine.addEntity(this.player1);
            this.engine.addEntity(this.player2);

            this.engine.addEntity(new Box(200, 200));
            this.engine.addEntity(new Box(400, 300));
        }
    }

    start() {
        this.engine.start();
    }
}