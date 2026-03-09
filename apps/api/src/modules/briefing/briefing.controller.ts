import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  Redirect,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { BriefingService } from './briefing.service';
import { SubmitBriefingDto } from './dto/submit-briefing.dto';

@ApiTags('Briefing')
@Controller('briefing')
export class BriefingController {
  private readonly logger = new Logger(BriefingController.name);

  constructor(private readonly briefingService: BriefingService) {}

  @Get('demo')
  @Redirect()
  @ApiOperation({ summary: 'Gera link de demonstração do formulário de briefing' })
  async demo() {
    const { token } = await this.briefingService.getOrCreateDemoToken();
    const baseUrl = process.env.BRIEFING_FORM_URL || 'https://briefing.koriastudio.com';
    const url = `${baseUrl}/briefing/${token}`;
    this.logger.log(`Demo briefing redirect → ${url}`);
    return { url, statusCode: 302 };
  }

  @Get(':token/schema')
  @ApiOperation({ summary: 'Get dynamic form schema for a briefing token' })
  async getFormSchema(@Param('token') token: string) {
    return this.briefingService.getFormSchema(token);
  }

  @Get(':token')
  @ApiOperation({ summary: 'Get briefing form config by upload token' })
  async getFormConfig(@Param('token') token: string) {
    return this.briefingService.getFormConfig(token);
  }

  @Post('submit')
  @ApiOperation({ summary: 'Submit briefing form data' })
  async submit(@Body() dto: SubmitBriefingDto) {
    return this.briefingService.submitBriefing(dto);
  }

  @Post('upload-logo')
  @ApiOperation({ summary: 'Upload logo file' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(
    @UploadedFile() file: Express.Multer.File,
    @Body('token') token: string,
  ) {
    return this.briefingService.uploadLogo(token, file);
  }
}
