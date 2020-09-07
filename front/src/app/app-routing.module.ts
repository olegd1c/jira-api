import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TasksComponent } from '@components/tasks/tasks.component';
import { PointsComponent } from '@components/points/points.component';
import { LoginComponent } from '@components/login/login.component';


const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'tasks', component: TasksComponent},
  { path: 'points', component: PointsComponent},
  { path: 'login', component: LoginComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
