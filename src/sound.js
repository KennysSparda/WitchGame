class Sound {
  constructor(type) {
    this.audioElement = new Audio();

    const soundMap = {
      magic: { src: "/audio/castMagic.mp3", loop: false },
      step: { src: "/audio/running-in-grass.mp3", loop: true },
      hit: { src: "/audio/magic-hit.mp3", loop: false },
      die: { src: "/audio/scream.mp3", loop: false }
    };

    const sound = soundMap[type] ?? {};
    this.audioElement.src = sound.src || "";
    this.audioElement.loop = sound.loop || false;
  }

  play() {
    if (this.audioElement.paused) this.audioElement.play();
  }

  pause() {
    if (!this.audioElement.paused) this.audioElement.pause();
  }
}
