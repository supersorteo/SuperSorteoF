import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
export interface WinnerInfo {
  raffleId: number;
  winningNumber: number;
  winningParticipant: string;
}
@Injectable({
  providedIn: 'root'
})
export class RaffleNotificationService {

  private winnerSubject = new Subject<WinnerInfo>();
  winner$ = this.winnerSubject.asObservable();

  notifyWinner(info: WinnerInfo) {
    this.winnerSubject.next(info);
  }
}
