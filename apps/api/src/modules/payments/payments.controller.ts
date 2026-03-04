import { Controller, Get, Post, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List payment intents' })
  async findAll() {
    // TODO: Return paginated payment intents
    return { message: 'List payments — not yet implemented' };
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment details' })
  async findOne(@Param('id') _id: string) {
    // TODO: Return payment intent with events
    return { message: 'Get payment — not yet implemented' };
  }

  @Post('webhooks/stripe')
  @ApiOperation({ summary: 'Stripe webhook handler' })
  async stripeWebhook(@Req() _req: unknown) {
    // TODO: Validate Stripe signature, process event
    return { received: true };
  }

  @Post('webhooks/wise')
  @ApiOperation({ summary: 'Wise webhook handler' })
  async wiseWebhook(@Req() _req: unknown) {
    // TODO: Validate Wise signature, process event
    return { received: true };
  }
}
