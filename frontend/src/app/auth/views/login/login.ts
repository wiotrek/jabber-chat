import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { email, form, required } from '@angular/forms/signals';
import type { LoginCredentials } from '../../_models/auth.model';
import { SharedCmpHelper } from '../../_helpers/shared-cmp.helper';

@Component({
  selector: 'app-login',
  standalone: false,
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login extends SharedCmpHelper {
  private readonly model = signal<LoginCredentials>({ email: '', password: '' });

  protected readonly loginForm = form(
    this.model,
    (path) => {
      required(path.email, { message: 'Email is required.' });
      email(path.email, { message: 'Enter a valid email address.' });
      required(path.password, { message: 'Password is required.' });
    },
    {
      submission: {
        action: async () => {
          try {
            await this.authService.login(this.model());
            await this.router.navigateByUrl('/');
            return undefined;
          } catch (err) {
            if (err instanceof HttpErrorResponse && err.status === 401) {
              return [{ kind: 'server', message: 'Invalid email or password.' }];
            }
            return [{ kind: 'server', message: 'Something went wrong. Please try again.' }];
          }
        },
      },
    },
  );
}
