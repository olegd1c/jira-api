import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

import {TeamService} from './team.service';
import { ITeam } from '@shared_models/team.model';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent implements OnInit {
  items: ITeam[] = [];
  loading = false;
  url = '/main/reminder/teams';

  constructor(private service: TeamService, private router: Router ) { }

  ngOnInit(): void {
    this.loading = true;
    this.getItems();
  }

  getItems() {
    this.loading = true;
    this.service.getTeams().then(result => {
      this.items = result;
      this.loading = false;
    }).catch(error => {
      this.loading = false;
    });
  }

  createItem() {
    this.router.navigate([`${this.url}/create`]);
  }

  editItem(item) {
    this.router.navigate([`${this.url}/update/${item._id}`]);
  }

  deleteItem(item) {
    const resultConfirm = confirm(`Видалити команду: ${item.name}`);
    if (resultConfirm) {
      this.loading = true;
      this.service.deleteTeam(item._id).then((result) => {
        this.getItems();
      });
    }
  }
}
