import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'th-stars',
  standalone: true,
  template: `<span class="stars" [attr.aria-label]="count() + ' étoiles'">{{ text() }}</span>`,
  styles: [`.stars { color: #A15C00; font-size: 14px; letter-spacing: .1em; font-weight: 700; }`]
})
export class StarsComponent {
  readonly count = input(0);
  readonly text = computed(() => '★'.repeat(Math.max(0, Math.min(5, this.count()))));
}
