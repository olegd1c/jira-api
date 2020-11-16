import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AlertService } from '@services/alert.service';
import { AuthenticationService } from '@services/authentication.service';

@Component({ templateUrl: 'login.component.html' })
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string = 'points';

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private alertService: AlertService
    ) {
    }

    ngOnInit() {
        this.authenticationService.currentUser.subscribe(x => {
            if (x) {
                this.router.navigate(['/points']);
            }
        });

        const exit = this.route.snapshot.queryParamMap.get('exit');
        if(exit && exit == '1' && AuthenticationService.getAuthLogin()) {
          this.authenticationService.logout();
        }

        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });

        // get return url from route parameters or default to '/'
        //this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    // convenience getter for easy access to form fields
    get f() { return this.loginForm.controls; }

    login() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;
        this.authenticationService.login(this.f.username.value, this.f.password.value)
            //.pipe(first())
            .then(
                data => {
                    if (data) {
                        this.router.navigate([this.returnUrl]);
                    } else {
                        this.alertService.error('Помилка авторизації');
                        this.loading = false;
                    }
                },
                error => {
                    this.alertService.error(error);
                    this.loading = false;
                });
    }
}
