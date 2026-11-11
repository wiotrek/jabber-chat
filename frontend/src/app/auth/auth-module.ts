import { NgModule } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { FormField, FormRoot } from '@angular/forms/signals';
import { RouterLink, RouterModule } from '@angular/router';
import { Login } from './views/login/login';
import { Register } from './views/register/register';
import { authInterceptor } from './_service/auth.interceptor';
import { SharedCmpHelper } from './_helpers/shared-cmp.helper';

@NgModule({
  declarations: [
    Login,
    Register,
    SharedCmpHelper
  ],
  imports: [
    RouterModule.forChild([
      { path: 'login', component: Login },
      { path: 'register', component: Register },
    ]),
    FormField,
    FormRoot,
    RouterLink,
  ],
  providers: [provideHttpClient(withInterceptors([authInterceptor]))],
})
export class AuthModule {}
