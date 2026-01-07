import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-host-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './host-layout.component.html'
})
export class HostLayoutComponent implements OnInit {

  user?: User;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: user => this.user = user
    });
  }
}
