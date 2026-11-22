import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header.component';
import { FooterComponent } from './layout/footer.component';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'th-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <th-header />
    <main id="contenu">
      <router-outlet />
    </main>
    <th-footer />
  `,
  styles: [`main { min-height: 60vh; }`]
})
export class AppComponent {
  constructor() {
    inject(AuthService).refreshMe();
  }
}
