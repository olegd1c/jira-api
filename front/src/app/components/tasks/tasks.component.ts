import { Component, OnInit } from '@angular/core';
import { TaskService } from '@services/task.service';
import { Task } from "@shared_models/task.model";
import { Permissions } from "@shared_models/permission.enum";

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {

  title = 'tasks';
  tasks: Task[] = [];
  loading = false;
  sprints;
  storySprintEmpty: string[] = [];
  reloadTasks = false;
  paramsSearch;
  loadingStoryPoints = false;
  permissions = Permissions;

  constructor(private taskService: TaskService) { }

  ngOnInit(): void {

  }

  updateStoryPoints() {
    this.loadingStoryPoints = true;
    this.taskService.updateStoryPoints({boardId: this.paramsSearch.boardId, keys: this.storySprintEmpty}).then(result => {
      this.reloadTasks = true;
      this.loadingStoryPoints = false;
    }).catch(error => {
      console.error(error);
      this.reloadTasks = false;
      this.loadingStoryPoints = false;
    });
  }

  onSearch($event) {
    if ($event) {
      this.sprints = $event.sprints;
      this.paramsSearch = {boardId: $event.boardId, sprints: $event.sprints};
      this.getTasks(this.paramsSearch);
    } else {
      this.tasks = null;
    }
  }

  private getTasks(params) {
    this.loading = true;
    this.taskService.getTasks(params).then(result => {
      this.tasks = result;
      this.storySprintEmpty = [];
      this.tasks.map(item => {
        if (!item.pointStory) {
          this.storySprintEmpty.push(item.key);
        }
      });
      this.loading = false;
    }).catch(() => {
      this.tasks = [];
      this.storySprintEmpty = [];
      this.loading = false;
    });
  }

}
