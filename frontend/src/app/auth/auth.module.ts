import { NgModule } from "@angular/core";
import { Route, RouterModule } from "@angular/router";

import { SignInComponent } from './sign-in/sign-in.component';
import { RegisterComponent } from './register/register.component';
import { AuthComponent } from "./auth.component";


const routes: Route[] = [
  {
    path: '',
    component: AuthComponent,
    children: [
      { path: '', component: SignInComponent },
      { path: 'register', component: RegisterComponent },
    ]
  }
];

@NgModule({
  declarations: [
    SignInComponent,
    RegisterComponent,
    AuthComponent
  ],
  imports: [
    RouterModule.forChild(routes)
  ]
})
export class AuthModule {}
