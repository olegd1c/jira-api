import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

import {UserMeetingService} from '@app/components/reminder/components/user-meeting/user-meeting.service';
import {TeamService} from '@app/components/reminder/components/team/team.service';
import { StatusUser } from '@shared_models/users.model';

@Component({
  selector: 'app-user-meeting-create',
  templateUrl: './user-meeting-create.component.html',
  styleUrls: ['./user-meeting-create.component.scss']
})
export class UserMeetingCreateComponent implements OnInit {

  loading = false;
  userForm: FormGroup;
  submitted = false;
  teams;
  userId;
  userCopyId;
  url = '/main/reminder/users';
  statuses = [StatusUser.active, StatusUser.blocked];

  constructor(
    private service: UserMeetingService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private teamService: TeamService
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.userId = this.route.snapshot.params?.id;
    this.userCopyId = this.route.snapshot.params?.copy_id;

    this.createForm();
    this.getTeams();
  }

  get f() { return this.userForm.controls; }

  createForm() {
    this.userForm = this.fb.group({
      name: [''],
      team: [''],
      jiraLogin: [''],
      telegramLogin: [''],
      status: [''],
    });
  }

  create() {
    const data = this.userForm.value;
    let req;
    if (this.userId) {
      req = this.service.updateUserMeeting(Object.assign(data, {id: this.userId}));
    } else {
      req = this.service.createUserMeeting(data);
    }
    req.then((result) => {
      this.router.navigate([this.url]);
    });
  }

  getItem(id) {
    this.service.getUserMeetings(id).then(result => {
      this.userForm.patchValue(result);
      this.loading = false;
    }).catch(error => {
      this.loading = false;
    });
  }

  getTeams() {
    this.loading = true;
    this.teamService.getTeams().then(result => {
      this.teams = result;
      const tmpId = this.userId || this.userCopyId;
      if (tmpId) {
        this.getItem(tmpId);
      } else {
        this.loading = false;
      }
    }).catch(error => {
      this.loading = false;
    });
  }

  cancel(){
    this.router.navigate([this.url]);
  }

}
