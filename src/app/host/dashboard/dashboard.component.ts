import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ListingService } from '../../core/services/listing.service';
import { Listing } from '../../models/listing.model';
import { ReservationService } from '../../core/services/reservation.service';
import { HostRevenue } from '../../models/host-revenue.model';
import { MonthlyRevenue } from '../../models/monthly-revenue.model';
import ApexCharts from 'apexcharts';
import { TopListingRevenue } from '../../models/top-listing-revenue.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  stats = {
    properties: 0,
    published: 0,
    draft: 0,
    noImage: 0,
  };

  revenues: HostRevenue = {
    totalRevenue: 0,
    monthlyRevenue: 0,
    confirmedReservations: 0,
  };
  monthlyChart: any;
  monthlyRevenues: MonthlyRevenue[] = [];

  recentListings: Listing[] = [];

  topListings: TopListingRevenue[] = [];

  constructor(
    private listingService: ListingService,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadRevenues();
    this.loadMonthlyChart();
    this.loadTopListings();
  }

  loadStats(): void {
    this.listingService.getMyListings().subscribe({
      next: (listings) => {
        this.computeStats(listings);
        this.computeRecent(listings);
      },
      error: () => {
        console.error('Failed to load dashboard data');
      },
    });
  }

  computeStats(listings: Listing[]): void {
    this.stats.properties = listings.length;
    this.stats.published = listings.filter(
      (l) => l.status === 'PUBLISHED'
    ).length;
    this.stats.draft = listings.filter((l) => l.status === 'DRAFT').length;
    this.stats.noImage = listings.filter(
      (l) => !l.images || l.images.length === 0
    ).length;
  }

  computeRecent(listings: Listing[]): void {
    this.recentListings = [...listings]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);
  }

  loadRevenues(): void {
    this.reservationService.getRevenues().subscribe({
      next: (data) => {
        this.revenues = data;
      },
      error: () => {
        console.error('Failed to load revenues');
      },
    });
  }
  loadTopListings(): void {
    this.reservationService.getTopListings().subscribe({
      next: (data) => {
        this.topListings = data;
      },
      error: () => console.error('Failed to load top listings'),
    });
  }
  loadMonthlyChart() {
    this.reservationService.getMonthlyRevenues().subscribe((data) => {
      this.monthlyRevenues = data;
      this.renderMonthlyChart();
    });
  }

  renderMonthlyChart() {
    const months = [
      'Jan',
      'Fév',
      'Mar',
      'Avr',
      'Mai',
      'Juin',
      'Juil',
      'Aoû',
      'Sep',
      'Oct',
      'Nov',
      'Déc',
    ];

    const series = this.monthlyRevenues.map((m) => m.revenue);

    const options = {
      chart: {
        type: 'area',
        height: 300,
      },
      series: [
        {
          name: 'Revenus (TND)',
          data: series,
        },
      ],
      xaxis: {
        categories: months,
      },
      colors: ['#198754'],
      stroke: {
        curve: 'smooth',
      },
    };

    if (this.monthlyChart) {
      this.monthlyChart.destroy();
    }

    this.monthlyChart = new ApexCharts(
      document.querySelector('#monthlyRevenueChart'),
      options
    );
    this.monthlyChart.render();
  }
}
