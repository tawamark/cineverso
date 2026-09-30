import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsUUID,
  ValidateNested,
} from 'class-validator';

class ItemCompraDto {
  @IsUUID() assentoId: string;
  @IsUUID() tipoIngressoId: string;
}

export class CriarCompraDto {
  @IsUUID() sessaoId: string;
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ItemCompraDto)
  itens: ItemCompraDto[];
}
