class Sound {
  constructor(type) {
    this.type = type;
    this.audioElement = new Audio(); // Apenas um elemento de áudio

    if (this.type === 'magic') {
      this.audioElement.src = '/audio/castMagic.mp3';
    } else if (this.type === 'step') {
      this.audioElement.src = '/audio/running-in-grass.mp3';
      this.audioElement.loop = true; // Faz o som de passos tocar continuamente
    } else if (this.type === 'hit') {
      this.audioElement.src = '/audio/magic-hit.mp3';
      this.audioElement.loop = false; // Faz o som de passos tocar continuamente
    } else if (this.type === 'die') {
      this.audioElement.src = '/audio/scream.mp3';
      this.audioElement.loop = false; // Faz o som de passos tocar continuamente
    }
  }

  play() {
    if (this.audioElement.paused) { // Só toca se estiver pausado
      this.audioElement.play();
    }
  }

  pause() {
    if (!this.audioElement.paused) { // Só pausa se estiver tocando
      this.audioElement.pause();
    }
  }
}
