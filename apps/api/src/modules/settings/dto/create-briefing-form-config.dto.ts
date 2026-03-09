import { IsString, IsOptional, IsArray, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBriefingFormConfigDto {
  @ApiProperty({ description: 'Nome da configuração' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ description: 'Array de steps (JSONB)', type: 'array', items: { type: 'object' } })
  @IsArray()
  steps!: unknown[];

  @ApiPropertyOptional({ description: 'Configurações gerais (tema, comportamento, integrações)' })
  @IsOptional()
  settings?: Record<string, unknown>;
}
