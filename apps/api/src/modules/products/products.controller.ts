import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List all products with prices' })
  async findAll(
    @TenantId() tenantId: string,
    @Query('search') search?: string,
  ) {
    return this.productsService.findAll(tenantId, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product details with prices' })
  async findOne(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.productsService.findOne(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  async create(
    @TenantId() tenantId: string,
    @Body() body: { name: string; category?: string; defaultCurrency?: string; metadata?: Record<string, unknown>; prices?: Array<{ currency: string; priceAmount: string; isDefault?: boolean }> },
  ) {
    return this.productsService.create(tenantId, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  async update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() body: { name?: string; category?: string; defaultCurrency?: string; metadata?: Record<string, unknown> },
  ) {
    return this.productsService.update(tenantId, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  async remove(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.productsService.remove(tenantId, id);
  }

  // --- Price endpoints ---

  @Post(':id/prices')
  @ApiOperation({ summary: 'Add a price to a product' })
  async addPrice(
    @TenantId() tenantId: string,
    @Param('id') productId: string,
    @Body() body: { currency: string; priceAmount: string; isDefault?: boolean },
  ) {
    return this.productsService.addPrice(tenantId, productId, body);
  }

  @Patch(':id/prices/:priceId')
  @ApiOperation({ summary: 'Update a product price' })
  async updatePrice(
    @TenantId() tenantId: string,
    @Param('id') productId: string,
    @Param('priceId') priceId: string,
    @Body() body: { currency?: string; priceAmount?: string; isDefault?: boolean },
  ) {
    return this.productsService.updatePrice(tenantId, productId, priceId, body);
  }

  @Delete(':id/prices/:priceId')
  @ApiOperation({ summary: 'Delete a product price' })
  async removePrice(
    @TenantId() tenantId: string,
    @Param('id') productId: string,
    @Param('priceId') priceId: string,
  ) {
    return this.productsService.removePrice(tenantId, productId, priceId);
  }
}
