import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

import {MeetingService} from '@components/reminder/components/meeting/meeting.service';
import {TeamService} from '@components/reminder/components/team/team.service';
import {weeksType, daysCron } from '@shared_models/meeting.model';

@Component({
  selector: 'app-meeting-create',
  templateUrl: './meeting-create.component.html',
  styleUrls: ['./meeting-create.component.scss']
})
export class MeetingCreateComponent implements OnInit {

  loading = false;
  dataForm: FormGroup;
  submitted = false;

  meetingId;
  meetingCopyId;
  teams;
  url = '/main/reminder/meetings';
  tmpWeeksType = weeksType;
  tmpDaysCron = daysCron;

  constructor(
    private meetingService: MeetingService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private teamService: TeamService
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.meetingId = this.route.snapshot.params?.id;
    this.meetingCopyId = this.route.snapshot.params?.copy_id;

    this.createForm();
    this.getTeams();
  }

  get f() { return this.dataForm.controls; }

  createForm() {
    this.dataForm = this.fb.group({
      title: [''],
      team: [''],
      users: [''],
      time: [''],
      chatId: [''],
      cronTime: [daysCron[0].id],
      weekType: [weeksType[0].id]
    });
  }

  create() {
    const data = this.dataForm.value;
    let req;
    if (this.meetingId) {
      req = this.meetingService.updateMeeting(Object.assign(data, {id: this.meetingId}));
    } else {
      req = this.meetingService.createMeeting(data);
    }
    req.then((result) => {
      this.router.navigate([this.url]);
    });
  }

  getItem(id) {
    this.meetingService.getMeetings(id).then(result => {
      this.dataForm.patchValue(result);
      this.loading = false;
    }).catch(error => {
      this.loading = false;
    });
  }

  getTeams() {
    this.loading = true;
    this.teamService.getTeams().then(result => {
      this.teams = result;
      const tmpId = this.meetingId || this.meetingCopyId;
      if (tmpId) {
        this.getItem(tmpId);
      } else {
        this.loading = false;
      }
    }).catch(error => {
      this.loading = false;
    });
  }

  Cancel(){
    this.router.navigateByUrl(this.url);
  }
}
