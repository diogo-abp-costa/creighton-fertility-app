import {FertilityRecord} from "./fertility-record.model";
import {Stamp} from "./stamp.model";
import ObjectID from "bson-objectid";

export interface DayRecord {
  id: ObjectID;
  date: string;
  records: FertilityRecord[];
  selectedRecord?: FertilityRecord;
  stamp: Stamp;
}