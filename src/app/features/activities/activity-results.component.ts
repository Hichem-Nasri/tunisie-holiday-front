import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { ActivityCategory, ActivityResult } from '../../core/models';
import { ACTIVITY_LABELS, entries } from '../../core/labels';
import { SearchFormComponent } from '../search/search-form.component';
import { MoneyPipe } from '../../shared/money.pipe';
import { LabelPipe } from '../../shared/label.pipe';
import { SearchPage } from '../../shared/search-page';

@Component({
  selector: 'th-activity-results',
  standalone: true,
  imports: [SearchFormComponent, MoneyPipe, LabelPipe, DecimalPipe],
  templateUrl: './activity-results.component.html',
  styleUrl: '../../shared/listing.scss'
})
export class ActivityResultsComponent {
  private readonly api = inject(ApiService);
  readonly page = new SearchPage<ActivityResult>(['participants'], (q, currency) =>
    this.api.searchActivities({ ...q, currency })
  );

  readonly categories = entries(ACTIVITY_LABELS);
  readonly category = signal<ActivityCategory | 'ALL'>('ALL');

  readonly availableCategories = computed(() => {
    const present = new Set((this.page.response()?.results ?? []).map((a) => a.category));
    return this.categories.filter((c) => present.has(c.value));
  });

  readonly filtered = computed(() =>
    (this.page.response()?.results ?? []).filter((a) => this.category() === 'ALL' || a.category === this.category())
  );
}
