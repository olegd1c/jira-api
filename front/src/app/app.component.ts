import {Component, OnInit, ChangeDetectorRef, AfterContentChecked} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService} from '@services/authentication.service';
import {User} from '@models/user.model';
import {Permissions} from '@shared_models/permission.enum';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterContentChecked {
  title = 'jira-front';
  currentUser: User;
  permissions = Permissions;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private route: ActivatedRoute,
    private cdref: ChangeDetectorRef,
  ) {

  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }

  ngOnInit() {
    this.authenticationService.currentUser.subscribe(x => {
      this.currentUser = x;
    });
  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }
}
