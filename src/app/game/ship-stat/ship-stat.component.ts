import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChildren
} from '@angular/core';

@Component({
  selector: 'app-ship-stat',
  templateUrl: './ship-stat.component.html',
  styleUrls: ['./ship-stat.component.css']
})
export class ShipStatComponent implements AfterViewInit {
  @ViewChildren('ship_stat') shipStat!: QueryList<ElementRef>;

  @Input() ships: any[] = [];
  @Input() isRival: boolean = false;

  mapShipStat: Map<string, HTMLElement> = new Map();

  @Output() mapShipStatEvent = new EventEmitter<Map<string, HTMLElement>>;

  ngAfterViewInit(): void {
    this.initShips();
  }

  initShips() : void {
    for (let i= 0; i< this.ships.length; i++) {
      this.mapShipStat.set(this.ships[i].type, this.shipStat.get(i)!.nativeElement);
    }
    this.mapShipStatEvent.emit(this.mapShipStat);
  }

}
