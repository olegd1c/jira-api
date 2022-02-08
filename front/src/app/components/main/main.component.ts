import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {User} from '@models/user.model';

import {Permissions} from '@shared_models/permission.enum';

import {AuthenticationService} from '@services/authentication.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  title = 'jira-front';

  currentUser: User;
  permissions = Permissions;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
  ) {

  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }

  ngOnInit() {
    this.currentUser = this.authenticationService.getCurrentUser();
  }

}
