import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMeetingCreateComponent } from './user-meeting-create.component';

describe('UserMeetingCreateComponent', () => {
  let component: UserMeetingCreateComponent;
  let fixture: ComponentFixture<UserMeetingCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserMeetingCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserMeetingCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
