import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { authGuard } from './auth/_service/auth.guard';
import { Channel } from './dashboard/channel/channel';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/auth-module').then((m) => m.AuthModule),
  },
  {
    path: '',
    component: Dashboard,
    canActivate: [authGuard],
    children: [
      { path: ':id', component: Channel }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
