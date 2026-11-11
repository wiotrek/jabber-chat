import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../_service/auth.service';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  template: '',
})
export class SharedCmpHelper implements OnInit {
  protected readonly authService = inject(AuthService);
  protected readonly router = inject(Router);

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl('/');
    }
  }
}
