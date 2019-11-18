import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrHtSalesReportComponent } from './pr-ht-sales-report.component';

describe('PrHtSalesReportComponent', () => {
  let component: PrHtSalesReportComponent;
  let fixture: ComponentFixture<PrHtSalesReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrHtSalesReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrHtSalesReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
