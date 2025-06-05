import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { interval, Subscription, take } from 'rxjs';

@Component({
  selector: 'app-countdown',
  standalone: true,
  imports: [CommonModule],
 // templateUrl: './countdown.component.html',
  //styleUrl: './countdown.component.scss'
  template: `
  <div class="countdown-container">
    <h1>{{ count }}</h1>
  </div>
`,
styles: [`
  .countdown-container {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    padding: 2rem;
    border-radius: 10px;
    z-index: 10000;
    text-align: center;
  }
  h1 {
    font-size: 4rem;
    margin: 0;
  }
`]

})
export class CountdownComponent  {
  @Input() start: number = 5;
  @Output() finished = new EventEmitter<void>();

  count!: number;
  subscription!: Subscription;


  ngOnInit(): void {
    this.count = this.start;
    this.subscription = interval(1000).pipe(
      take(this.start + 1)
    ).subscribe(val => {
      this.count = this.start - val;
      if (this.count === 0) {
        this.finished.emit();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }


}
