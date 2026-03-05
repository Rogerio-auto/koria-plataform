import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { BriefingService } from './briefing.service';
import { SubmitBriefingDto } from './dto/submit-briefing.dto';

@ApiTags('Briefing')
@Controller('briefing')
export class BriefingController {
  constructor(private readonly briefingService: BriefingService) {}

  @Get(':leadId')
  @ApiOperation({ summary: 'Get briefing form config for a lead' })
  async getFormConfig(@Param('leadId', ParseUUIDPipe) leadId: string) {
    return this.briefingService.getFormConfig(leadId);
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
    @Body('leadId', ParseUUIDPipe) leadId: string,
  ) {
    return this.briefingService.uploadLogo(leadId, file);
  }
}
