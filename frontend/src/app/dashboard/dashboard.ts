import { Component, inject } from '@angular/core';
import { AuthService } from '../auth/_service/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
