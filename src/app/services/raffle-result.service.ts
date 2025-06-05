import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RaffleResultService {

  private winningNumberSubject = new ReplaySubject<number>(1);
  winningNumber$ = this.winningNumberSubject.asObservable();

  setWinningNumber(num: number): void {
    this.winningNumberSubject.next(num);
  }

  resetWinningNumber(): void {
    // Podrías emitir un valor null o 0, según lo que prefieras
    this.winningNumberSubject.next(0);
  }
}
