import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrSubmissionComponent } from './pr-submission.component';

describe('PrSubmissionComponent', () => {
  let component: PrSubmissionComponent;
  let fixture: ComponentFixture<PrSubmissionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrSubmissionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
