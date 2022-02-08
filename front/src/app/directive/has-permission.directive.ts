import {Directive, Input, ElementRef, TemplateRef, OnInit, ViewContainerRef} from '@angular/core';
import {AuthenticationService} from "../services/authentication.service";
//import { UserService } from './user.service';

@Directive({
  selector: '[hasPermission]'
})
export class HasPermissionDirective implements OnInit {
  private currentUser;
  private permissions = [];

  constructor(
    private element: ElementRef,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authenticationService: AuthenticationService
  ) {
  }

  ngOnInit() {
    this.currentUser = this.authenticationService.getCurrentUser();
    this.updateView();
  }

  @Input()
  set hasPermission(val) {
    this.permissions = val;
    //this.updateView();
  }

  private updateView() {
    if (this.checkPermission()) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

  private checkPermission() {
    let hasPermission = false;

    if (this.currentUser && this.currentUser.permissions) {
      for (const checkPermission of this.permissions) {
        const permissionFound = this.currentUser.permissions.find(x => x.toUpperCase() === checkPermission.toUpperCase());
        if (permissionFound) {
          hasPermission = true;
        }
      }
    }

    return hasPermission;
  }
}
