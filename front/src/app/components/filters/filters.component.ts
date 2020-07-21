import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-filters',
    templateUrl: './filters.component.html',
    styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit {
    @Output() search: EventEmitter<any> = new EventEmitter();

    loading = false;
    loadingSprint = false;
    sprints: any[];
    boards: any[];
    selectedSprints: number[] = [];
    boardSelect: FormControl = new FormControl('');
    private boarId;

    constructor(private taskService: TaskService) { }

    ngOnInit(): void {
        this.getBoards();
    }

    private getBoards() {
        this.loading = true;
        this.taskService.getBoards().then(result => {
            //console.log(result);
            this.boards = result;
            this.loading = false;
        });
    }

    private getSprints(boardId) {
        this.loadingSprint = true;
        this.taskService.getSprints(boardId).then(result => {
            //console.log(result);
            this.sprints = result;
            this.loadingSprint = false;
        });
    }

    onChange(id: number, isChecked: boolean) {
        if(isChecked) {
          this.selectedSprints.push(id);
        } else {
          let index = this.selectedSprints.indexOf(id);
          this.selectedSprints.splice(index,1);
        }
    }

    find() {
        this.search.emit({boardId: this.boarId, sprints: this.selectedSprints});
    }

    onChangeBoard(id) {
        this.boarId = id;
        this.getSprints(id);
    }
}
