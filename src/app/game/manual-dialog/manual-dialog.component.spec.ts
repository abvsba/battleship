import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualDialogComponent } from './manual-dialog.component';

describe('ManualDialogComponent', () => {
  let component: ManualDialogComponent;
  let fixture: ComponentFixture<ManualDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManualDialogComponent]
    });
    fixture = TestBed.createComponent(ManualDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
