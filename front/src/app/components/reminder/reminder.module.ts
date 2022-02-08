import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';

import {ReminderRoutingModule} from './reminder-routing.module';

import {MeetingComponent} from './components/meeting/meeting.component';
import {TeamComponent} from './components/team/team.component';
import {TeamCreateComponent} from './components/team/team-create/team-create.component';
import {UserMeetingComponent} from './components/user-meeting/user-meeting.component';
import {UserMeetingCreateComponent} from './components/user-meeting/user-meeting-create/user-meeting-create.component';
import {MeetingCreateComponent} from './components/meeting/meeting-create/meeting-create.component';

import {MeetingService} from '@app/components/reminder/components/meeting/meeting.service';
import {TeamService} from '@app/components/reminder/components/team/team.service';
import {UserMeetingService} from '@app/components/reminder/components/user-meeting/user-meeting.service';

@NgModule({
  declarations: [
    MeetingComponent,
    MeetingCreateComponent,
    TeamComponent,
    TeamCreateComponent,
    UserMeetingComponent,
    UserMeetingCreateComponent
  ],
  imports: [
    CommonModule,
    ReminderRoutingModule,
    ReactiveFormsModule
  ],
  providers: [
    MeetingService,
    UserMeetingService,
    TeamService,
  ]
})
export class ReminderModule {
}
