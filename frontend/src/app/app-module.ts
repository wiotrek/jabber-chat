import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgOptimizedImage } from '@angular/common';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { AuthModule } from './auth/auth-module';
import { Dashboard } from './dashboard/dashboard';
import { LeftPanel } from './dashboard/left-panel/left-panel';

@NgModule({
  declarations: [App, Dashboard, LeftPanel],
  imports: [BrowserModule, AppRoutingModule, AuthModule, NgOptimizedImage],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [App],
})
export class AppModule {}
