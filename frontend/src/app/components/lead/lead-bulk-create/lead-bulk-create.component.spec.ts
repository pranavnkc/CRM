import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadBulkCreateComponent } from './lead-bulk-create.component';

describe('LeadBulkCreateComponent', () => {
  let component: LeadBulkCreateComponent;
  let fixture: ComponentFixture<LeadBulkCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeadBulkCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeadBulkCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
