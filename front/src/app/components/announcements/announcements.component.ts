import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskService } from '@services/task.service';
import { TaskAnnouncement } from '@shared_models/task.model';
import { Params } from '@app/params';
import { ParamsFilter, ParentFilter } from '@models/filter.model';

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.scss']
})
export class AnnouncementsComponent implements OnInit {

  searchForm: FormGroup;
  announcementForm: FormGroup;
  announcementText = '';
  confirmList = Params.confirmList;
  executorList = Params.executorList;
  links = '';
  sending = false;
  taskForBuild = [];
  parentFilter = ParentFilter;

  get tasksForm(): FormArray { return this.announcementForm.get('tasks') as FormArray; }

  loading = false;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService
  ) { }

  ngOnInit(): void {

    this.searchForm = this.fb.group({
      number: ['', Validators.required],
    });

    this.announcementForm = this.fb.group({
      date: ['', Validators.required],
      executor: [null, Validators.required],
      tasks: this.fb.array([], Validators.required)
    });

    this.announcementForm.valueChanges.subscribe(
      data => this.onValueChanged());
    this.onValueChanged();
  }

  onValueChanged() {
    this.prepareText();
  }

  search(number?: string) {
    this.loading = true;
    const numberTask: string = this.searchForm.controls.number.value || number;
    let numbers = [];

    if (numberTask.split(';').length) {
      numbers = numberTask.split(';');
    } else {
      numbers.push(numberTask);
    }

    numbers.map(n => {
      this.taskService.getTaskAnnouncement({ number: n })
        .then(result => {
          this.addToForm(result);

          this.links = result?.links;

          this.searchForm.reset();
          this.loading = false;
        }).catch(() => this.loading = false);
    });
  }

  addToForm(task: any) {
    if (!task.isAdd) {
      this.tasksForm.push(this.initTaskForm(task));
      task.isAdd = true;
    }
  }

  private initTaskForm(item: TaskAnnouncement): FormGroup {

    return this.fb.group({
      key: [item.key, [Validators.required]],
      devName: [item.devName, [
        Validators.required
      ]],
      testName: [item.testName, [
        Validators.required
      ]],
      confirm: ['', [
        Validators.required
      ]],
      link: [item.link, [
        Validators.required
      ]],
      summary: [item.summary, [
        Validators.required
      ]],
      info: [item.info, [
        
      ]]
    });
  }

  sendAnnouncement() {
    this.sending = true;
    this.taskService.sendAnnouncement({message: this.announcementText}).then(
      result => {
        if (result) {
          this.announcementForm.reset();

          while (this.tasksForm.length > 0) {
            this.tasksForm.removeAt(this.tasksForm.length - 1);
          }
          this.announcementText = '';
        }
        this.sending = false;
      }).catch(() => {
        this.sending = true;
    });

  }

  deleteTask(index, key) {
    const task = this.taskForBuild.filter(item => item.key === key);
    if (task.length) {
      task[0].isAdd = false;
    }  
    this.tasksForm.removeAt(index);
  }

  prepareText() {
    const data = this.announcementForm.value;
    const date = data.date ? new Date(data.date).toLocaleString() : '';
    this.announcementText =
      'Запланована дата виливки ' + date + '\n\n';
    data.tasks.map(item => {
      this.announcementText = this.announcementText +
      item.link + ' ' +
      item.summary + '\n' +
      (item.info ? (item.info + '\n') : '') +
      'Виконавець: ' + item.devName + '\n' +
      'Тестувальник: ' + item.testName + '\n' +
      'Підтвердження бізнесу: ' + item.confirm + '\n';
    });
    this.announcementText = this.announcementText +
      'Виливає: ' + data.executor + '\n\n';
  }

  changeConfirm(event) {

    this.tasksForm.controls.map(elem => {
      if (!elem.get('confirm').value) {
        elem.patchValue({confirm: event.target.value});
      }
    });
  }

  onSearch($event: ParamsFilter) {
    if ($event) {
      const params: ParamsFilter = $event;
      this.getTasksForBuild(params);
    } else {
      this.taskForBuild = [];
    }
  }

  private getTasksForBuild(params: ParamsFilter) {
    this.loading = true;
    this.taskService.getTasksForBuild(params).then(result => {
      this.taskForBuild = result;
      this.loading = false;
    }).catch(() => {
      this.taskForBuild = [];
      this.loading = false;
    });
  }

}
