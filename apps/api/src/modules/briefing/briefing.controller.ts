import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BriefingService } from './briefing.service';

@ApiTags('Briefing')
@Controller('briefing')
export class BriefingController {
  constructor(readonly briefingService: BriefingService) {}

  @Get(':leadId')
  @ApiOperation({ summary: 'Get briefing form config for a lead' })
  async getFormConfig(@Param('leadId') _leadId: string) {
    // TODO: Return form config and lead info
    return { message: 'Get briefing config — not yet implemented' };
  }

  @Post('submit')
  @ApiOperation({ summary: 'Submit briefing form data' })
  async submit(@Body() _body: unknown) {
    // TODO: Validate with SubmitBriefingDto, save to lead_qualification
    return { message: 'Submit briefing — not yet implemented' };
  }

  @Post('upload-logo')
  @ApiOperation({ summary: 'Upload logo file' })
  async uploadLogo() {
    // TODO: Handle file upload via Multer, save to S3
    return { message: 'Upload logo — not yet implemented' };
  }
}
