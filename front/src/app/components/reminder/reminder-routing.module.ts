import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AuthGuard} from '@app/guards/auth.guard';

import {MeetingComponent} from './components/meeting/meeting.component';
import {UserMeetingComponent} from './components/user-meeting/user-meeting.component';
import {UserMeetingCreateComponent} from './components/user-meeting/user-meeting-create/user-meeting-create.component';
import {TeamComponent} from './components/team/team.component';
import {MeetingCreateComponent} from './components/meeting/meeting-create/meeting-create.component';
import {TeamCreateComponent} from './components/team/team-create/team-create.component';

const routes: Routes = [
  {
    path: '', canActivate: [ AuthGuard ],
    children: [
      {path: '', redirectTo: 'meeting', pathMatch: 'full'},
      { path: 'meetings', component: MeetingComponent , canActivate: [AuthGuard], data: {permissions: ['view']}},
      { path: 'meetings/create', component: MeetingCreateComponent , canActivate: [AuthGuard], data: {permissions: ['notify']}},
      { path: 'meetings/update/:id', component: MeetingCreateComponent , canActivate: [AuthGuard], data: {permissions: ['notify']}},
      { path: 'meetings/copy/:copy_id', component: MeetingCreateComponent , canActivate: [AuthGuard], data: {permissions: ['notify']}},
      { path: 'users', component: UserMeetingComponent, canActivate: [AuthGuard], data: {permissions: ['notify']}},
      { path: 'users/create', component: UserMeetingCreateComponent, canActivate: [AuthGuard], data: {permissions: ['notify']}},
      { path: 'users/update/:id', component: UserMeetingCreateComponent, canActivate: [AuthGuard], data: {permissions: ['notify']}},
      { path: 'users/copy/:copy_id', component: UserMeetingCreateComponent, canActivate: [AuthGuard], data: {permissions: ['notify']}},
      { path: 'teams', component: TeamComponent, canActivate: [AuthGuard], data: {permissions: ['notify']}},
      { path: 'teams/create', component: TeamCreateComponent, canActivate: [AuthGuard], data: {permissions: ['notify']}},
      { path: 'teams/update/:id', component: TeamCreateComponent, canActivate: [AuthGuard], data: {permissions: ['notify']}},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReminderRoutingModule { }
