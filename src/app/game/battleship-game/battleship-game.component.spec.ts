import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BattleshipGameComponent } from './battleship-game.component';

describe('BattleshipGameComponent', () => {
  let component: BattleshipGameComponent;
  let fixture: ComponentFixture<BattleshipGameComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BattleshipGameComponent]
    });
    fixture = TestBed.createComponent(BattleshipGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
