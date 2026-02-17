class Game {
  constructor(mode) {
    this.engine = new Engine();
    this.level = 1; // Começa no nível 1
    this.maxLevels = 15; // Define quantas fases o jogo terá

    if (mode === "single") {
      this.spawnLevelEnemies();
      this.setupSingleplayer();
    } else if (mode === "multi") {
      this.setupMultiplayer();
    }
  }

  spawnLevelEnemies() {
    // Remove todos os inimigos anteriores
    this.engine.entities = this.engine.entities.filter(
      (entity) => !(entity instanceof Enemy),
    );

    // Configuração dos inimigos
    const enemyConfigs = [
      { x: 200, y: 100, type: 1 },
      { x: 300, y: 200, type: 2 },
      { x: 400, y: 300, type: 3 },
      { x: 500, y: 400, type: 4 },
      { x: 600, y: 500, type: 2 },
      { x: 250, y: 150, type: 3 },
      { x: 350, y: 250, type: 1 },
      { x: 450, y: 350, type: 4 },
      { x: 550, y: 450, type: 2 },
      { x: 650, y: 550, type: 3 },
      { x: 700, y: 600, type: 1 },
      { x: 750, y: 650, type: 4 },
      { x: 800, y: 700, type: 3 },
      { x: 850, y: 750, type: 2 },
      { x: 900, y: 800, type: 1 },
      { x: 950, y: 850, type: 4 },
      { x: 1000, y: 900, type: 3 },
      { x: 1050, y: 950, type: 2 },
      { x: 1100, y: 1000, type: 1 },
      { x: 1150, y: 1050, type: 4 },
    ];

    function getEnemyColor(type) {
      const colorMap = {
        1: "blue",
        2: "green",
        3: "yellow",
        4: "red",
      };
      return colorMap[type] || "white";
    }

    // Aumenta a dificuldade a cada fase
    for (let i = 0; i < this.level; i++) {
      const config = enemyConfigs[i % enemyConfigs.length];
      const enemyColor = getEnemyColor(config.type);
      this.engine.addEntity(
        new Enemy(config.x, config.y, 3, enemyColor, this.engine, config.type),
      );
    }
  }

  checkNextLevel() {
    if (this.engine.allEnemiesDefeated()) {
      if (this.level < this.maxLevels) {
        this.level++;
        console.log(`🏆 Fase ${this.level}!`);
        this.spawnLevelEnemies();
      } else {
        console.log("🎉 Parabéns! Você zerou o jogo!");
      }
    }
  }

  setupSingleplayer() {
    this.player1 = new Player(
      100,
      100,
      3,
      {
        up: "ArrowUp",
        down: "ArrowDown",
        left: "ArrowLeft",
        right: "ArrowRight",
      },
      "red",
      "Enter",
      this.engine,
    );
    this.engine.addEntity(this.player1);
    this.addWalls();
  }

  setupMultiplayer() {
    this.player1 = new Player(
      100,
      100,
      3,
      {
        up: "ArrowUp",
        down: "ArrowDown",
        left: "ArrowLeft",
        right: "ArrowRight",
      },
      "red",
      "Enter",
      this.engine,
    );

    this.player2 = new Player(
      300,
      100,
      3,
      {
        up: "w",
        down: "s",
        left: "a",
        right: "d",
      },
      "blue",
      " ",
      this.engine,
    );

    this.engine.addEntity(this.player1);
    this.engine.addEntity(this.player2);

    this.addWalls();
  }

  addWalls() {
    for (let i = 0; i < window.innerWidth; i += 16) {
      this.engine.addEntity(new Box(i, 0));
      this.engine.addEntity(new Box(i, window.innerHeight - 16));
    }

    for (let j = 16; j < window.innerHeight - 16; j += 16) {
      this.engine.addEntity(new Box(0, j));
      this.engine.addEntity(new Box(window.innerWidth - 16, j));
    }
  }

  start() {
    this.engine.start();

    // Checa se pode avançar de fase a cada segundo
    setInterval(() => this.checkNextLevel(), 1000);
  }
}
