import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TasksComponent } from '@components/tasks/tasks.component';
import { PointsComponent } from '@components/points/points.component';
import { AnnouncementsComponent } from '@components/announcements/announcements.component';
import {AuthGuard} from '@app/guards/auth.guard';
import {MainComponent} from './main.component';


const routes: Routes = [
  {
    path: '', component: MainComponent, canActivate: [ AuthGuard ],
    children: [
      { path: '', redirectTo: 'tasks', pathMatch: 'full' },
      { path: 'tasks', component: TasksComponent , canActivate: [AuthGuard], data: {permissions: ['view']}},
      { path: 'points', component: PointsComponent, canActivate: [AuthGuard], data: {permissions: ['view']}},
      { path: 'announcements', component: AnnouncementsComponent, canActivate: [AuthGuard], data: {permissions: ['notify']}},
      { path: 'reminder', loadChildren: () => import('@components/reminder/reminder.module').then(m => m.ReminderModule) },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
