import { Component, OnInit } from '@angular/core';
import { TaskService } from '@services/task.service';
import { Analytics } from '@models/point.model';
import { ParamsFilter, ParentFilter } from '@models/filter.model';

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
  parentFilter = ParentFilter;

  constructor(private taskService: TaskService) { }

  ngOnInit(): void { }

  private getPoints(params: ParamsFilter) {
    this.loading = true;
    this.taskService.getPoints(params).then(result => {
      this.points = result;
      this.loading = false;
    });
  }

  onSearch($event: ParamsFilter) {
    if ($event) {
      this.sprints = $event.sprints;
      const params: ParamsFilter = $event;
      this.getPoints(params);
    } else {
      this.points = null;
    }
  }
}
