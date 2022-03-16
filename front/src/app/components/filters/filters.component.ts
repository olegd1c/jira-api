import {Component, OnInit, Output, EventEmitter, Input, OnChanges, OnDestroy} from '@angular/core';
import {TaskService} from '@services/task.service';
import {FormControl} from '@angular/forms';
import {SprintSearch} from 'src/app/models/search.model';
import {debounceTime, distinctUntilChanged, switchMap, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {LocalStorageHelper} from '@app/helpers/localStorage.helper';
import {ParamsFilter, ParentFilter, statusesTask} from '@models/filter.model';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit, OnChanges, OnDestroy {
  @Input() reload: boolean;
  @Input() parent: ParentFilter;
  @Output() search: EventEmitter<ParamsFilter> = new EventEmitter();

  loading = false;
  loadingSprint = false;
  sprints: any[];
  boards: any[];
  selectedSprints: number[] = [];
  nameBoard: FormControl = new FormControl('');
  parentFilter = ParentFilter;
  private nameFilter = 'nameBoard';
  private alive$: Subject<void> = new Subject<void>();
  private boarId;
  metaSearch = {
    isLast: true,
    start: 0,
    pageSize: 50
  };

  statusesTask = statusesTask;
  selectedStatus: string[] = [];

  constructor(private taskService: TaskService) {
  }

  ngOnInit(): void {
    this.getBoards();
    this.setNameBoard();
  }

  ngOnChanges(): void {
    if (this.reload) {
      this.find();
    }
  }

  private getBoards() {
    this.nameBoard.valueChanges.pipe(
      takeUntil(this.alive$),
      debounceTime(1000),
      distinctUntilChanged(),
      switchMap(stock => {
        if (stock.trim().length >= 3) {
          this.setFilterNameBoard(stock);
          this.loading = true;
          return this.taskService.getBoards(stock);
        }
        return [];
      }))
      .subscribe(res => {
        this.boards = res;
        this.loading = false;
      }, err => {
        this.loading = false;
        this.boards = [];
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
    if (isChecked) {
      this.selectedSprints.push(id);
    } else {
      const index = this.selectedSprints.indexOf(id);
      this.selectedSprints.splice(index, 1);
    }
  }

  onChangeStatus(id: string, isChecked: boolean) {
    if (isChecked) {
      this.selectedStatus.push(id);
    } else {
      const index = this.selectedStatus.indexOf(id);
      this.selectedStatus.splice(index, 1);
    }
  }

  find() {
    let params = {boardId: this.boarId, sprints: this.selectedSprints};
    if (this.parent && this.parent === this.parentFilter.point && this.selectedStatus.length) {
      params = Object.assign(params, {statusesTask: this.selectedStatus});
    }
    this.search.emit(params);
  }

  onChangeBoard(id) {
    this.boarId = id;
    this.getSprints({boardId: id});
    this.sprints = [];
    this.search.emit(null);
  }

  addSprints() {
    this.getSprints(
      {
        boardId: this.boarId,
        start: this.metaSearch.start + this.metaSearch.pageSize,
        pageSize: this.metaSearch.pageSize
      }
      , true);
  }

  ngOnDestroy() {
    this.alive$.next();
    this.alive$.complete();
  }

  private setNameBoard() {
    const value = LocalStorageHelper.getFilters(this.nameFilter) ?? 'market';
    this.nameBoard.setValue(value);
  }

  private setFilterNameBoard(value: string) {
    LocalStorageHelper.setFilters(this.nameFilter, value);
  }
}
