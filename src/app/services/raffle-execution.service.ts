import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, ReplaySubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { WebSocketService } from './web-socket.service';

@Injectable({
  providedIn: 'root'
})
export class RaffleExecutionService {

  private countdownSubject = new BehaviorSubject<number | null>(null);
  countdown$ = this.countdownSubject.asObservable();

    constructor(private webSocketService: WebSocketService) {
    this.listenToCountdownUpdates();
  }

   private listenToCountdownUpdates(): void {
    // 🔥 Escuchar eventos de cuenta regresiva desde el backend
    this.webSocketService.listen(`/topic/countdown`).subscribe((countdownValue: number) => {
      this.countdownSubject.next(countdownValue);
      console.log(`⏳ Contador actualizado desde backend: ${countdownValue}`);
    });
  }


  startCountdown(start: number = 5): void {
    interval(1000).pipe(take(start + 1)).subscribe(val => {
      const currentCount = start - val;
      this.countdownSubject.next(currentCount);

      localStorage.setItem('countdown', currentCount.toString());
      if (currentCount === 0) {

        setTimeout(() => {
          this.countdownSubject.next(null);
          localStorage.removeItem('countdown');
        }, 1000);
      }
    });
  }


  resetCountdown(): void {
    this.countdownSubject.next(null);
    localStorage.removeItem('countdown');
  }
}
