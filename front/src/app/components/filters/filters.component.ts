import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef,
  AfterViewInit,
} from '@angular/core';
import {TaskService} from '@services/task.service';
import {FormControl} from '@angular/forms';
import {SprintSearch} from 'src/app/models/search.model';
import {debounceTime, distinctUntilChanged, filter, switchMap, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {LocalStorageHelper} from '@app/helpers/localStorage.helper';
import {ParamsFilter, ParentFilter, statusesTask} from '@models/filter.model';
import {ScrollDispatcher} from "@angular/cdk/overlay";
import {CdkVirtualScrollViewport} from "@angular/cdk/scrolling";

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() reload: boolean;
  @Input() parent: ParentFilter;
  @Output() search: EventEmitter<ParamsFilter> = new EventEmitter();

  @ViewChild(CdkVirtualScrollViewport) virtualScroll: CdkVirtualScrollViewport;
  virtualScrollHeight: number;
  suggestItemHeight = 52;
  currentPage = 1;
  maxCurrent = 0;

  loading = false;
  loadingSprint = false;
  sprints: any[] = [];
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

  constructor(
    private taskService: TaskService,
    private scrollDispatcher: ScrollDispatcher,
    private cd: ChangeDetectorRef,
    ) {
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
    this.taskService.getSprints(params)
      .pipe(takeUntil(this.alive$))
      .subscribe(result => {
        if (result) {
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

  private getAllSprintsReversed(params: SprintSearch, add = false) {
    this.loadingSprint = true;
    this.taskService.getAllSprintsReversed(params)
      .pipe(takeUntil(this.alive$))
      .subscribe(result => {
        if (result) {
            this.sprints = result;
            this.metaSearch.isLast = true;
        }

        this.loadingSprint = false;
      });
  }

  loadMoreSprints(): void {
    if (!this.metaSearch.isLast) {

      this.loadingSprint = true;
      this.currentPage++;
      this.taskService.getSprints(        {
        boardId: this.boarId,
        start: this.metaSearch.start + this.metaSearch.pageSize,
        pageSize: this.metaSearch.pageSize
      })
        .pipe(takeUntil(this.alive$))
        .subscribe(result => {
          this.metaSearch = result.meta;
          const data = result.values;
          this.sprints = [...this.sprints, ...data];
          this.loadingSprint = false;
          this.cd.detectChanges();
        });
    }
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
    if (this.parent === this.parentFilter.announcement) {
      this.search.emit({boardId: id});
    } else {
      this.getAllSprintsReversed({boardId: id});
      this.sprints = [];
      this.search.emit(null);
    }
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

  setVirtualScrollHeight(): void {
    if (this.sprints.length > 10) {
      this.virtualScrollHeight = 400;
    } else {
      this.virtualScrollHeight = (this.sprints.length * this.suggestItemHeight) / 1.3;
    }
  }

  ngAfterViewInit(): void {
    this.scrollDispatcher.scrolled()
      .pipe(
        takeUntil(this.alive$),
        debounceTime(100), // щоб зменшити частоту
        filter(() => !this.loadingSprint), // не запускати, поки ще не завершив попереднє
        filter(() => this.virtualScroll.measureScrollOffset('bottom') === 0)
      )
      .subscribe(() => {
        this.loadMoreSprints();
      });
  }
}
