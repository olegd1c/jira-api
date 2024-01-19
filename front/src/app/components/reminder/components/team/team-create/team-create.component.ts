import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

import {TeamService} from '@app/components/reminder/components/team/team.service';
import { StatusTeam } from '@shared_models/team.model';

@Component({
  selector: 'app-team-create',
  templateUrl: './team-create.component.html',
  styleUrls: ['./team-create.component.scss']
})
export class TeamCreateComponent implements OnInit {

  loading = false;
  dataForm: FormGroup;
  submitted = false;

  itemId;
  url = '/main/reminder/teams';
  statuses = [StatusTeam.active, StatusTeam.blocked];

  constructor(
    private service: TeamService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.itemId = this.route.snapshot.params?.id;

    this.createForm();
    const tmpId = this.itemId;
    if (tmpId) {
      this.getItem(tmpId);
    } else {
      this.loading = false;
    }
  }

  get f() { return this.dataForm.controls; }

  createForm() {
    this.dataForm = this.fb.group({
      name: [''],
      reviewChatId: [''],
      teamChatId: [''],
      boardId: [''],
      checkReview: [false],
      checkMeeting: [false],
      status: [''],
    });
  }

  create() {
    const data = this.dataForm.value;
    let req;
    if (this.itemId) {
      req = this.service.updateTeam(Object.assign(data, {id: this.itemId}));
    } else {
      req = this.service.createTeam(data);
    }
    req.then((result) => {
      this.router.navigate([this.url]);
    });
  }

  getItem(id) {
    this.service.getTeams(id).then(result => {
      this.dataForm.patchValue(result);
      this.loading = false;
    }).catch(error => {
      this.loading = false;
    });
  }

  Cancel(){
    this.router.navigate([this.url]);
  }

}
