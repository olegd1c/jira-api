import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskService } from '@services/task.service';
import { TaskAnnouncement } from '@shared_models/task.model';

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.scss']
})
export class AnnouncementsComponent implements OnInit {

  searchForm: FormGroup;
  announcementForm: FormGroup;
  announcementText = '';
  confirmList = [];

  get tasksForm(): FormArray { return this.announcementForm.get('tasks') as FormArray };

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
      tasks: this.fb.array([], Validators.required)
    });

    this.announcementForm.valueChanges.subscribe(
      data => this.onValueChanged());
    this.onValueChanged();
  }

  onValueChanged() {
    this.prepareText();
  }

  search() {
    this.loading = true;
    this.taskService.getTaskAnnouncement({ number: this.searchForm.controls.number.value })
    .then(result => {
      let tempV: any[] = this.tasksForm.value;
      let fItem = tempV.find(item => item.key ===  result.key);
      if(!fItem) {
        this.tasksForm.push(this.initTaskForm(result));
      }

      this.searchForm.reset();
      this.loading = false;
    }).catch(() => this.loading = false);
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
      ]]
    });
  }

  announcement() {
    this.taskService.sendAnnouncement({message: this.announcementText}).then(
      result => {
        if (result) {
          this.announcementForm.reset();
          this.announcementText = '';
        }
      });

  }

  deleteTask(index) {
    this.tasksForm.removeAt(index);
  }

  prepareText() {
    const data = this.announcementForm.value;
    const date = data.date ? new Date(data.date).toLocaleString() : '';
    this.announcementText =
      'Планируемая дата выливки ' + date + "\n\n";
    data.tasks.map(item => {
      this.announcementText = this.announcementText +
      item.link + ' ' +
      item.summary + "\n\n" +
      'Исполнитель: ' + item.devName + "\n\n" +
      'Тестировщик: ' + item.testName + "\n\n" +
      'Подтверждение бизнеса: ' + item.confirm + "\n\n";
    });
  }

}
