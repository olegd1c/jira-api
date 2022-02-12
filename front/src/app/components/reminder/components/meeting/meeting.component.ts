import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

import {MeetingService} from '@app/components/reminder/components/meeting/meeting.service';

import {weeksTypeArray, daysCronArray} from '@shared_models/meeting.model';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.scss']
})
export class MeetingComponent implements OnInit {
  items;
  loading = false;
  url = '/main/reminder/meetings';

  tmpWeeksType = weeksTypeArray();
  tmpDaysCron = daysCronArray();

  constructor(private meetingService: MeetingService, private router: Router ) { }

  ngOnInit(): void {
    this.loading = true;
    this.getItems();
  }

  getItems() {
    this.loading = true;
    this.meetingService.getMeetings().then(result => {
      this.items = result;
      this.loading = false;
    }).catch(error => {
      this.loading = false;
    });
  }

  createMeeting() {
    this.router.navigate([`${this.url}/create`]);
  }

  editMeeting(item) {
    this.router.navigate([`${this.url}/update/${item._id}`]);
  }

  copyMeeting(item) {
    this.router.navigate([`${this.url}/copy/${item._id}`]);
  }

  deleteMeeting(item) {
    const resultConfirm = confirm(`Видалити нагадування: ${item.name}`);
    if (resultConfirm) {
      this.loading = true;
      this.meetingService.deleteMeeting(item._id).then((result) => {
        this.getItems();
      });
    }
  }
}
