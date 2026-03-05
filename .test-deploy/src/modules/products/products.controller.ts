import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List all products with prices' })
  async findAll() {
    // TODO: Return products joined with product_prices
    return { message: 'List products — not yet implemented' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product details' })
  async findOne(@Param('id') _id: string) {
    // TODO: Return product with prices
    return { message: 'Get product — not yet implemented' };
  }
}
