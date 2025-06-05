import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import confetti from 'canvas-confetti';


@Component({
  selector: 'app-confetti',
  standalone: true,
  imports: [],
  //templateUrl: './confetti.component.html',
  template: `<canvas #canvasConfetti class="confetti-canvas"></canvas>`,
 // styleUrl: './confetti.component.scss'
 styles: [`
  .confetti-canvas {
    position: fixed;
    pointer-events: none;
    top: 0; left: 0;
    width: 100%; height: 100%;
    z-index: 10000;
  }
`]
})
export class ConfettiComponent implements OnChanges{
  @Input() fire: boolean = false;
  @Input() active = false;
/*  ngOnChanges(changes: SimpleChanges) {
    if (changes['fire'] && this.fire) {
      this.launch();
    }
  }*/

  ngOnChanges() {
    if (this.active) {
      // Dispara un tiro amplio de confetti que dura varios segundos
      const duration = 5 * 1000; // 5 segundos
      const animationEnd = Date.now() + duration;
      const defaults = { spread: 60, ticks: 200, gravity: 0.5, scalar: 1.2 };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        confetti({
          ...defaults,
          origin: { x: Math.random(), y: Math.random() * 0.6 + 0.2 }
        });
      }, 250);
    }
  }

  private launch() {
    // configuración básica, puedes ajustar colores, spread, etc.
    confetti({
      particleCount: 150,
      spread: 60,
      origin: { y: 0.6 }
    });
  }

}
