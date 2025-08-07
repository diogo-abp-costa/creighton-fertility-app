import {FertilityRecord} from "./fertility-record.model";
import {Stamp} from "./stamp.model";

export interface DayRecord {
  date: string;
  records: FertilityRecord[];
  selectedRecord?: FertilityRecord;
  stamp: Stamp;
}