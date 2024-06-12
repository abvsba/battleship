import {Ship} from "./ship.model";
import {Cell} from "./cell.model";

export interface Game {
  id?: number,
  name?: string,
  totalHits : number,
  fireDirection : number,
  selfShips : Ship[],
  rivalShips : Ship[],
  selfBoard : Cell[],
  rivalBoard : Cell[],
  previousShots : Cell[],
  date?: Date
}


