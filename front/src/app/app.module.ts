import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpService } from './services/http.service';
import { TaskService } from './services/task.service';

import { LoginComponent } from './components/login/login.component';
import { AlertService } from './services/alert.service';
import { AuthenticationService } from './services/authentication.service';

import {AuthGuard} from '@app/guards/auth.guard';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [HttpService, TaskService, AlertService, AuthenticationService, AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
