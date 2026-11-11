import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { email, form, minLength, required } from '@angular/forms/signals';
import { RegisterFormModel } from '../../_models/auth.model';
import { SharedCmpHelper } from '../../_helpers/shared-cmp.helper';

@Component({
  selector: 'app-register',
  standalone: false,
  styleUrl: './register.scss',
  templateUrl: './register.html',
})
export class Register extends SharedCmpHelper {

  private readonly model = signal<RegisterFormModel>({
    email: '',
    username: '',
    password: '',
    displayName: '',
  });

  protected readonly registerForm = form(
    this.model,
    (path) => {
      required(path.email, { message: 'Email is required.' });
      email(path.email, { message: 'Enter a valid email address.' });
      required(path.username, { message: 'Username is required.' });
      minLength(path.username, 3, { message: 'Username must be at least 3 characters.' });
      required(path.password, { message: 'Password is required.' });
      minLength(path.password, 8, { message: 'Password must be at least 8 characters.' });
    },
    {
      submission: {
        action: async () => {
          try {
            const { displayName, ...credentials } = this.model();
            await this.authService.register({
              ...credentials,
              displayName: displayName.trim() ? displayName.trim() : undefined,
            });
            await this.router.navigateByUrl('/');
            return undefined;
          } catch (err) {
            if (err instanceof HttpErrorResponse && err.status === 409) {
              return [{ kind: 'server', message: 'Email is already registered.' }];
            }
            return [{ kind: 'server', message: 'Something went wrong. Please try again.' }];
          }
        },
      },
    },
  );
}
