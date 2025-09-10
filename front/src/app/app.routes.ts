import {RouterModule, Routes} from '@angular/router';
import { LoginComponent } from '@components/login/login.component';
import {NgModule} from "@angular/core";

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'main', loadChildren: () => import('@components/main/main.module').then(m => m.MainModule) },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
