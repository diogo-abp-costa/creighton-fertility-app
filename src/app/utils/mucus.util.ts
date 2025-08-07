import {
  MucusColor,
  MucusColorCode,
  MucusConsistency,
  MucusConsistencyCode,
  MucusType,
  MucusTypeCode
} from "../models/mucus.model";

export const MucusPriority = [
  MucusType.DRY,
  MucusType.MOIST_NO_LUBRICATION,
  MucusType.WET_NO_LUBRICATION,
  MucusType.SHINY_NO_LUBRICATION,
  MucusType.LOW_STRETCH,
  MucusType.MEDIUM_STRETCH,
  MucusType.HIGH_STRETCH,
  MucusType.MOIST_WITH_LUBRICATION,
  MucusType.SHINY_WITH_LUBRICATION,
  MucusType.WET_WITH_LUBRICATION
];

const MucusCodeMap: Record<MucusType, MucusTypeCode> = {
  [MucusType.DRY]: MucusTypeCode.DRY,
  [MucusType.MOIST_NO_LUBRICATION]: MucusTypeCode.MOIST_NO_LUBRICATION,
  [MucusType.WET_NO_LUBRICATION]: MucusTypeCode.WET_NO_LUBRICATION,
  [MucusType.SHINY_NO_LUBRICATION]: MucusTypeCode.SHINY_NO_LUBRICATION,
  [MucusType.LOW_STRETCH]: MucusTypeCode.LOW_STRETCH,
  [MucusType.MEDIUM_STRETCH]: MucusTypeCode.MEDIUM_STRETCH,
  [MucusType.HIGH_STRETCH]: MucusTypeCode.HIGH_STRETCH,
  [MucusType.MOIST_WITH_LUBRICATION]: MucusTypeCode.MOIST_WITH_LUBRICATION,
  [MucusType.SHINY_WITH_LUBRICATION]: MucusTypeCode.SHINY_WITH_LUBRICATION,
  [MucusType.WET_WITH_LUBRICATION]: MucusTypeCode.WET_WITH_LUBRICATION,
};

export function getMucusCode(type: MucusType): string {
  return MucusCodeMap[type];
}

export function getMucusTypeText(value: MucusType) {
  switch (value) {
    case MucusType.DRY:
      return `Seco [${MucusTypeCode.DRY}]`;
    case MucusType.MOIST_NO_LUBRICATION:
      return `Húmido sem lubrificação [${MucusTypeCode.MOIST_NO_LUBRICATION}]`;
    case MucusType.WET_NO_LUBRICATION:
      return `Molhado sem lubrificação [${MucusTypeCode.WET_NO_LUBRICATION}]`;
    case MucusType.SHINY_NO_LUBRICATION:
      return `Brilhante sem lubrificação [${MucusTypeCode.SHINY_NO_LUBRICATION}]`;
    case MucusType.LOW_STRETCH:
      return `Elasticidade pequena [${MucusTypeCode.LOW_STRETCH}]`;
    case MucusType.MEDIUM_STRETCH:
      return `Elasticidade média [${MucusTypeCode.MEDIUM_STRETCH}]`;
    case MucusType.HIGH_STRETCH:
      return `Elasticidade alta [${MucusTypeCode.HIGH_STRETCH}]`;
    case MucusType.MOIST_WITH_LUBRICATION:
      return `Húmido com lubrificação [${MucusTypeCode.MOIST_WITH_LUBRICATION}]`;
    case MucusType.SHINY_WITH_LUBRICATION:
      return `Brilhante com lubrificação [${MucusTypeCode.SHINY_WITH_LUBRICATION}]`;
    case MucusType.WET_WITH_LUBRICATION:
      return `Molhado com lubrificação [${MucusTypeCode.WET_WITH_LUBRICATION}]`;
  }
}

const MucusColorCodeMap: Record<MucusColor, MucusColorCode> = {
  [MucusColor.NONE]: MucusColorCode.NONE,
  [MucusColor.CLEAR]: MucusColorCode.CLEAR,
  [MucusColor.WHITE]: MucusColorCode.WHITE,
  [MucusColor.CLOUDY_CLEAR]: MucusColorCode.CLOUDY_CLEAR,
  [MucusColor.YELLOW]: MucusColorCode.YELLOW,
  [MucusColor.BROWN]: MucusColorCode.BROWN,
};

export function getMucusColorCode(color: MucusColor): string {
  return MucusColorCodeMap[color];
}

export function getMucusColorText(value: MucusColor) {
  switch (value) {
    case MucusColor.NONE:
      return '';
    case MucusColor.CLEAR:
      return `Transparente [${MucusColorCode.CLEAR}]`;
    case MucusColor.WHITE:
      return `Opaco (branco) [${MucusColorCode.WHITE}]`;
    case MucusColor.CLOUDY_CLEAR:
      return `Opaco e transparente [${MucusColorCode.CLOUDY_CLEAR}]`;
    case MucusColor.YELLOW:
      return `Amarelo (ou amarelo claro) [${MucusColorCode.YELLOW}]`;
    case MucusColor.BROWN:
      return `Castanho (ou negro) [${MucusColorCode.BROWN}]`;
  }
}

const MucusConsistencyCodeMap: Record<MucusConsistency, MucusConsistencyCode> = {
  [MucusConsistency.NONE]: MucusConsistencyCode.NONE,
  [MucusConsistency.PASTY]: MucusConsistencyCode.PASTY,
  [MucusConsistency.GUMMY]: MucusConsistencyCode.GUMMY
};

export function getMucusConsistencyCode(consistency: MucusConsistency): string {
  return MucusConsistencyCodeMap[consistency];
}

export function getMucusConsistencyText(value: MucusConsistency) {
  switch (value) {
    case MucusConsistency.NONE:
      return '';
    case MucusConsistency.PASTY:
      return `Pastoso [${MucusConsistencyCode.PASTY}]`;
    case MucusConsistency.GUMMY:
      return `Goma [${MucusConsistencyCode.GUMMY}]`;
  }
}