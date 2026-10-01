import { ValidateIf } from 'class-validator';

export const OptionalField = (): PropertyDecorator =>
  ValidateIf((_object, value) => value !== undefined);
