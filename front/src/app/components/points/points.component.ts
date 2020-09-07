import { Component, OnInit } from '@angular/core';
import { TaskService } from '@services/task.service';
import { Analytics } from '@models/point.model';

@Component({
  selector: 'app-points',
  templateUrl: './points.component.html',
  styleUrls: ['./points.component.scss']
})
export class PointsComponent implements OnInit {
  
  title = 'points';
  points: Analytics;
  loading = false;
  showDetails = false;
  sprints;

  constructor(private taskService: TaskService) { }

  ngOnInit(): void {
    
  }

  private getPoints(params) {
    this.loading = true;
    this.taskService.getPoints(params).then(result => {
      //console.log(result);
      this.points = result;
      this.loading = false;
    });
  }

  onSearch($event) {
    if ($event) {
      this.sprints = $event.sprints;
      let params = {boardId: $event.boardId, sprints: $event.sprints};
      this.getPoints(params);
    } else {
      this.points = null;
    }
  }
}
