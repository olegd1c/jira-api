import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {MainRoutingModule} from './main-routing.module';

import { MainComponent } from './main.component';
import {TasksComponent} from '@components/tasks/tasks.component';
import {PointsComponent} from '@components/points/points.component';
import {FiltersComponent} from '@components/filters/filters.component';
import {AlertComponent} from '@components/alert/alert.component';
import {AnnouncementsComponent} from '@components/announcements/announcements.component';
import {HasPermissionDirective} from '@app/directive/has-permission.directive';


@NgModule({
  declarations: [
    MainComponent,
    TasksComponent,
    PointsComponent,
    FiltersComponent,
    AlertComponent,
    AnnouncementsComponent,
    HasPermissionDirective
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MainRoutingModule
  ],
  exports: [
    MainRoutingModule
  ]
})
export class MainModule { }
