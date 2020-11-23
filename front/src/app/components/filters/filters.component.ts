import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import { TaskService } from '@services/task.service';
import { FormControl } from '@angular/forms';
import { SprintSearch } from 'src/app/models/search.model';

@Component({
    selector: 'app-filters',
    templateUrl: './filters.component.html',
    styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit {
    @Input() reload: boolean;
    @Output() search: EventEmitter<any> = new EventEmitter();

    loading = false;
    loadingSprint = false;
    sprints: any[];
    boards: any[];
    selectedSprints: number[] = [];
    boardSelect: FormControl = new FormControl('');
    private boarId;
    metaSearch = {
        isLast: true,
        start: 0,
        pageSize: 50
    };

    constructor(private taskService: TaskService) { }

    ngOnInit(): void {
        this.getBoards();
    }

    ngOnChanges(): void {
        if (this.reload) {
          this.find();
        }
    }

    private getBoards() {
        this.loading = true;
        this.taskService.getBoards().then(result => {
            this.boards = result;
            this.loading = false;
        });
    }

    private getSprints(params: SprintSearch, add = false) {
        this.loadingSprint = true;
        this.taskService.getSprints(params).then(result => {
            if (result) {
                this.metaSearch = result.meta;
                if (add) {
                    result.values.map(item => {
                        this.sprints.push(item);
                    });
                } else {
                    this.sprints = result.values;
                }
            }

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
        this.getSprints({boardId: id});
        this.sprints = [];
        this.search.emit(null);
    }

    addSprints() {
        this.getSprints({boardId: this.boarId, start: this.metaSearch.start+this.metaSearch.pageSize, pageSize: this.metaSearch.pageSize}, true);
    }
}
