import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimplexTableComponent } from './simplex-table.component';

describe('SimplexTableComponent', () => {
  let component: SimplexTableComponent;
  let fixture: ComponentFixture<SimplexTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimplexTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimplexTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
