import { IsString, IsOptional, IsArray, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBriefingFormConfigDto {
  @ApiPropertyOptional({ description: 'Nome da configuração' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ description: 'Array de steps (JSONB)', type: 'array', items: { type: 'object' } })
  @IsOptional()
  @IsArray()
  steps?: unknown[];

  @ApiPropertyOptional({ description: 'Configurações gerais' })
  @IsOptional()
  settings?: Record<string, unknown>;
}
