import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { AuthModule } from './auth/auth-module';
import { Dashboard } from './dashboard/dashboard';
import { LeftPanel } from './dashboard/left-panel/left-panel';
import { Header } from './dashboard/header/header';
import { errorInterceptor } from './_interceptors/error.interceptor';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { Channel } from './dashboard/channel/channel';

@NgModule({
  declarations: [App, Dashboard, LeftPanel, Header, Channel],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AuthModule,
    NgOptimizedImage,
    DatePipe
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([errorInterceptor])),
  ],
  bootstrap: [App],
})
export class AppModule {}
