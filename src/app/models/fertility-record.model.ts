import {Bleeding} from "./bleeding.model";
import {Mucus} from "./mucus.model";
import {FrequencyType} from "./frequency.model";

export interface FertilityRecord {
  id: string;
  date: string;
  time: string;
  mucus: Mucus;
  bleeding: Bleeding;
  intercourse: boolean;
  frequency: FrequencyType;
  notes?: string;
}