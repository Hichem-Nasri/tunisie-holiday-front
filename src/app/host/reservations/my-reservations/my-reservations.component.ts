import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reservation } from '../../../models/reservation.model';
import { ReservationService } from '../../../core/services/reservation.service';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-reservations.component.html',
  styleUrls: ['./my-reservations.component.scss'],
})
export class MyReservationsComponent implements OnInit {
  reservations: Reservation[] = [];
  loading = false;

  constructor(private reservationService: ReservationService) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations() {
    this.loading = true;
    this.reservationService.getMyReservations().subscribe({
      next: (data) => {
        this.reservations = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Erreur lors du chargement des réservations');
      },
    });
  }

  accept(r: Reservation) {
    this.changeStatus(r, 'CONFIRMED');
  }

  reject(r: Reservation) {
    if (!confirm('Refuser cette réservation ?')) return;
    this.changeStatus(r, 'CANCELLED');
  }

  cancel(r: Reservation) {
    if (!confirm('Annuler cette réservation ?')) return;
    this.changeStatus(r, 'CANCELLED');
  }

  private changeStatus(r: Reservation, status: string) {
    this.reservationService.updateStatus(r.id, status).subscribe((updated) => {
      r.status = updated.status;
    });
  }

  markAsPaid(r: Reservation) {
    if (!confirm('Confirmer le paiement ?')) return;

    this.reservationService.markAsPaid(r.id).subscribe((updated) => {
      r.paymentStatus = updated.paymentStatus;
    });
  }
}
