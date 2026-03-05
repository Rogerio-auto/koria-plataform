import {
  Controller,
  Get,
  Post,
  Param,
  UploadedFiles,
  UseInterceptors,
  Body,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { UploadsService } from './uploads.service';

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  private readonly logger = new Logger(UploadsController.name);

  constructor(private readonly uploadsService: UploadsService) {}

  @Get('validate/:token')
  @ApiOperation({ summary: 'Validar token de upload e obter dados da OS' })
  async validateToken(@Param('token') token: string) {
    if (!token || token.length < 5) {
      throw new BadRequestException('Token inválido');
    }

    const result = await this.uploadsService.validateUploadToken(token);

    if (!result) {
      throw new NotFoundException('Token não encontrado ou expirado');
    }

    return result;
  }

  @Post('files')
  @ApiOperation({ summary: 'Upload de arquivos (multipart/form-data)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 20))
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('token') token: string,
  ) {
    if (!token) {
      throw new BadRequestException('Token é obrigatório');
    }

    if (!files || files.length === 0) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    this.logger.log(
      `Recebendo ${files.length} arquivo(s) para token: ${token.substring(0, 8)}...`,
    );

    const result = await this.uploadsService.processUploadedFiles(token, files);
    return result;
  }
}
