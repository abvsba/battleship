import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestartGameDialogComponent } from './restart-game-dialog.component';

describe('RestartGameDialogComponent', () => {
  let component: RestartGameDialogComponent;
  let fixture: ComponentFixture<RestartGameDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RestartGameDialogComponent]
    });
    fixture = TestBed.createComponent(RestartGameDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
