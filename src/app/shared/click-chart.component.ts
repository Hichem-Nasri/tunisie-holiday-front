import { Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DayCount } from '../core/models';

@Component({
  selector: 'th-click-chart',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (days().length) {
      <div class="chart" role="img" [attr.aria-label]="'Clics par jour sur 30 jours, total ' + total()">
        @for (d of bars(); track d.date) {
          <div class="bar-wrap" [title]="(d.date | date: 'd MMM') + ' : ' + d.clicks + ' clic(s)'">
            <div class="bar" [style.height.%]="d.height"></div>
          </div>
        }
      </div>
      <div class="axis"><span>{{ bars()[0].date | date: 'd MMM' }}</span><span>{{ bars()[bars().length - 1].date | date: 'd MMM' }}</span></div>
    } @else {
      <p class="muted small">Aucun clic sur les 30 derniers jours.</p>
    }
  `,
  styles: [`
    .chart { display: flex; align-items: flex-end; gap: 4px; height: 140px; padding-top: 8px; }
    .bar-wrap { flex: 1; height: 100%; display: flex; align-items: flex-end; }
    .bar { width: 100%; min-height: 3px; background: #1660C8; border-radius: 4px 4px 0 0; }
    .axis { display: flex; justify-content: space-between; font-size: 12px; color: #4A5568; margin-top: 6px; }
  `]
})
export class ClickChartComponent {
  readonly days = input<DayCount[]>([]);
  readonly total = computed(() => this.days().reduce((s, d) => s + d.clicks, 0));
  readonly bars = computed(() => {
    const filled = this.fill(this.days());
    const max = Math.max(1, ...filled.map((d) => d.clicks));
    return filled.map((d) => ({ ...d, height: (d.clicks / max) * 100 }));
  });

  private fill(days: DayCount[]): DayCount[] {
    const map = new Map(days.map((d) => [d.date, d.clicks]));
    const result: DayCount[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      result.push({ date: key, clicks: map.get(key) ?? 0 });
    }
    return result;
  }
}
