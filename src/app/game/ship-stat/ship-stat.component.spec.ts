import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipStatComponent } from './ship-stat.component';

describe('ShipStatComponent', () => {
  let component: ShipStatComponent;
  let fixture: ComponentFixture<ShipStatComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShipStatComponent]
    });
    fixture = TestBed.createComponent(ShipStatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
