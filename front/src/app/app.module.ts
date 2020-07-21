import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpService } from './services/http.service';
import { TaskService } from './services/task.service';
import { HttpClientModule } from '@angular/common/http';
import { TasksComponent } from './components/tasks/tasks.component';
import { PointsComponent } from './components/points/points.component';
import { FiltersComponent } from './components/filters/filters.component';
import { LoginComponent } from './components/login/login.component';
import { AlertService } from './services/alert.service';
import { AuthenticationService } from './services/authentication.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertComponent } from './components/alert/alert.component';

@NgModule({
  declarations: [
    AppComponent,
    TasksComponent,
    PointsComponent,
    FiltersComponent,
    LoginComponent,
    AlertComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [HttpService, TaskService, AlertService, AuthenticationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
