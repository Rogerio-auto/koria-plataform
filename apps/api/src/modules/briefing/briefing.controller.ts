import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { BriefingService } from './briefing.service';
import { SubmitBriefingDto } from './dto/submit-briefing.dto';

@ApiTags('Briefing')
@Controller('briefing')
export class BriefingController {
  constructor(private readonly briefingService: BriefingService) {}

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
