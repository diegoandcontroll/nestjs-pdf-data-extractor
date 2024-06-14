import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { Prisma } from '@prisma/client';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createInvoiceDto: Prisma.InvoiceCreateInput) {
    return this.invoiceService.create(createInvoiceDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query('page') page = 1, @Query('pageSize') pageSize = 5) {
    const { invoices, totalCount } = await this.invoiceService.findAll(
      page,
      pageSize,
    );

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      invoices,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/allnumber/:id')
  async findAllbyNumber(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 5,
  ) {
    const { invoices, totalCount } = await this.invoiceService.findAllByNumber(
      id,
      page,
      pageSize,
    );

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      invoices,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
      },
    };
  }
  @UseGuards(JwtAuthGuard)
  @Get('date/:number')
  async findByDateAndNumberUser(
    @Query('date') date: string,
    @Param('number') number: string,
  ) {
    return this.invoiceService.findDate(date, number);
  }
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: Prisma.InvoiceUpdateInput,
  ) {
    return this.invoiceService.update(id, updateInvoiceDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invoiceService.remove(id);
  }
}
