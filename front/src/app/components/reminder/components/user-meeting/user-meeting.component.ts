import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

import {UserMeetingService} from '@app/components/reminder/components/user-meeting/user-meeting.service';

@Component({
  selector: 'app-user-meeting',
  templateUrl: './user-meeting.component.html',
  styleUrls: ['./user-meeting.component.scss']
})
export class UserMeetingComponent implements OnInit {

  loading = false;
  items;
  url = '/main/reminder/users';

  constructor(
    private service: UserMeetingService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.getItems();
  }

  getItems() {
    this.service.getUserMeetings().then(result => {
      this.items = result;
      this.loading = false;
    }).catch(error => {
      this.loading = false;
    });
  }

  createUser() {
    this.router.navigate([`${this.url}/create`]);
  }

  editItem(item) {
    this.router.navigate([`${this.url}/update/${item._id}`]);
  }

  deleteItem(item) {
    const resultConfirm = confirm(`Видалити користувача: ${item.name}`);
    if (resultConfirm) {
      this.loading = true;
      this.service.deleteUserMeeting(item._id).then((result) => {
        this.getItems();
      });
    }
  }

  copyItem(item) {
    this.router.navigate([`${this.url}/copy/${item._id}`]);
  }
}
