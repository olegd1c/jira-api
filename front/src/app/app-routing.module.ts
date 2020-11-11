import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TasksComponent } from '@components/tasks/tasks.component';
import { PointsComponent } from '@components/points/points.component';
import { LoginComponent } from '@components/login/login.component';
import { AnnouncementsComponent } from './components/announcements/announcements.component';
import {AuthGuard} from "@app/guards/auth.guard";


const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'tasks', component: TasksComponent , canActivate: [AuthGuard], data: {permissions: ['view']}},
  { path: 'points', component: PointsComponent, canActivate: [AuthGuard], data: {permissions: ['view']}},
  { path: 'login', component: LoginComponent },
  { path: 'announcements', component: AnnouncementsComponent, canActivate: [AuthGuard], data: {permissions: ['notify']}},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
