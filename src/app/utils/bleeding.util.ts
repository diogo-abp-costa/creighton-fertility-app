import {BleedingType, BleedingTypeCode} from "../models/bleeding.model";

export const BleedingPriority = [
  BleedingType.NONE,
  BleedingType.VERY_LIGHT,
  BleedingType.LIGHT,
  BleedingType.MODERATE,
  BleedingType.HEAVY,
  BleedingType.BROWN
];

const BleedingTypeCodeMap: Partial<Record<BleedingType, BleedingTypeCode>> = {
  [BleedingType.VERY_LIGHT]: BleedingTypeCode.VERY_LIGHT,
  [BleedingType.LIGHT]: BleedingTypeCode.LIGHT,
  [BleedingType.MODERATE]: BleedingTypeCode.MODERATE,
  [BleedingType.HEAVY]: BleedingTypeCode.HEAVY,
  [BleedingType.BROWN]: BleedingTypeCode.BROWN
};

export function getBleedingTypeCode(type: BleedingType): string | null {
  return BleedingTypeCodeMap[type] ?? null;
}

export function getBleedingTypeText(value: BleedingType)  {
  switch (value) {
    case BleedingType.NONE:
      return 'Nenhum';
    case BleedingType.VERY_LIGHT:
      return `Muito ligeiro (spotting) [${BleedingTypeCode.VERY_LIGHT}]`;
    case BleedingType.LIGHT:
      return `Ligeiro [${BleedingTypeCode.LIGHT}]`;
    case BleedingType.MODERATE:
      return `Moderado [${BleedingTypeCode.MODERATE}]`;
    case BleedingType.HEAVY:
      return `Abundante [${BleedingTypeCode.HEAVY}]`;
    case BleedingType.BROWN:
      return `Castanho/Preto [${BleedingTypeCode.BROWN}]`;
  }
}