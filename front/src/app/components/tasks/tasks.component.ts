import { Component, OnInit } from '@angular/core';
import { TaskService } from '@services/task.service';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {

  title = 'tasks';
  public tasks = [];
  loading = false;

  constructor(private taskService: TaskService) { }

  ngOnInit(): void {
    this.loading = true;
    this.taskService.getTasks({}).then(result => {
      this.tasks = result;
      this.loading = false;
    });
  }

}
