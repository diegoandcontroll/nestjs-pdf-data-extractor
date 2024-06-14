/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}
  async create(data: Prisma.InvoiceCreateInput) {
    return await this.prisma.invoice.create({ data });
  }

  async findAll(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const [invoices, totalCount] = await Promise.all([
      this.prisma.invoice.findMany({
        skip,
        take: 5,
      }),
      await this.prisma.invoice.count(),
    ]);

    if (invoices.length === 0) {
      throw new NotFoundException('INVOICES NOT FOUND');
    }

    const invoiceDetailsList = [];

    for (const invoice of invoices) {
      const energyElectricityQuantity: string =
        invoice.energyElectricityQuantity.toString();
      const energySCEEEQuantity: string =
        invoice.energySCEEEQuantity.toString();
      const energyCompensatedQuantity: string =
        invoice.energyCompensatedQuantity.toString();
      const energyElectricityValue: number = parseFloat(
        invoice.energyElectricityValue.replace(',', '.'),
      );
      const energySCEEEValue: number = parseFloat(
        invoice.energySCEEEValue.replace(',', '.'),
      );
      const energyCompensatedValue: number = parseFloat(
        invoice.energyCompensatedValue.replace(',', '.'),
      );
      const publicLightingContribution: number = parseFloat(
        invoice.publicLightingContribution.replace(',', '.'),
      );

      const totalElectricityConsumptionKWh =
        parseFloat(energyElectricityQuantity) + parseFloat(energySCEEEQuantity);

      const compensatedEnergyKWh = parseFloat(energyCompensatedQuantity);

      const totalValueWithoutGD =
        energyElectricityValue + energySCEEEValue + publicLightingContribution;

      const GDCompensationSavings = energyCompensatedValue;

      const invoiceDetails = {
        invoice,
        details: {
          totalElectricityConsumptionKWh,
          compensatedEnergyKWh,
          totalValueWithoutGD,
          GDCompensationSavings,
        },
      };

      invoiceDetailsList.push(invoiceDetails);
    }

    return { invoices: invoiceDetailsList, totalCount };
  }

  async findDate(date: string, number: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { referenceMonth: date, customerNumber: number },
    });
    if (invoice) {
      const energyElectricityQuantity: string =
        invoice.energyElectricityQuantity.toString();
      const energySCEEEQuantity: string =
        invoice.energySCEEEQuantity.toString();
      const energyCompensatedQuantity: string =
        invoice.energyCompensatedQuantity.toString();
      const energyElectricityValue: number = parseFloat(
        invoice.energyElectricityValue.replace(',', '.'),
      );
      const energySCEEEValue: number = parseFloat(
        invoice.energySCEEEValue.replace(',', '.'),
      );
      const energyCompensatedValue: number = parseFloat(
        invoice.energyCompensatedValue.replace(',', '.'),
      );
      const publicLightingContribution: number = parseFloat(
        invoice.publicLightingContribution.replace(',', '.'),
      );

      const totalElectricityConsumptionKWh =
        parseFloat(energyElectricityQuantity) + parseFloat(energySCEEEQuantity);

      const compensatedEnergyKWh = parseFloat(energyCompensatedQuantity);

      const totalValueWithoutGD =
        energyElectricityValue + energySCEEEValue + publicLightingContribution;

      const GDCompensationSavings = energyCompensatedValue;
      return {
        invoice,
        details: {
          totalElectricityConsumptionKWh,
          compensatedEnergyKWh,
          totalValueWithoutGD,
          GDCompensationSavings,
        },
      };
    } else {
      throw new NotFoundException('INVOICE NOT FOUND');
    }
  }
  async findAllByNumber(idNumber: string, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const [invoices, totalCount] = await Promise.all([
      this.prisma.invoice.findMany({
        where: { customerNumber: idNumber },
        skip,
        take: 5,
      }),
      this.prisma.invoice.count({
        where: { customerNumber: idNumber },
      }),
    ]);

    if (invoices.length === 0) {
      throw new NotFoundException('INVOICES NOT FOUND');
    }

    const invoiceDetailsList = [];

    for (const invoice of invoices) {
      const energyElectricityQuantity: string =
        invoice.energyElectricityQuantity.toString();
      const energySCEEEQuantity: string =
        invoice.energySCEEEQuantity.toString();
      const energyCompensatedQuantity: string =
        invoice.energyCompensatedQuantity.toString();
      const energyElectricityValue: number = parseFloat(
        invoice.energyElectricityValue.replace(',', '.'),
      );
      const energySCEEEValue: number = parseFloat(
        invoice.energySCEEEValue.replace(',', '.'),
      );
      const energyCompensatedValue: number = parseFloat(
        invoice.energyCompensatedValue.replace(',', '.'),
      );
      const publicLightingContribution: number = parseFloat(
        invoice.publicLightingContribution.replace(',', '.'),
      );

      const totalElectricityConsumptionKWh =
        parseFloat(energyElectricityQuantity) + parseFloat(energySCEEEQuantity);

      const compensatedEnergyKWh = parseFloat(energyCompensatedQuantity);

      const totalValueWithoutGD =
        energyElectricityValue + energySCEEEValue + publicLightingContribution;

      const GDCompensationSavings = energyCompensatedValue;

      const invoiceDetails = {
        invoice,
        details: {
          totalElectricityConsumptionKWh,
          compensatedEnergyKWh,
          totalValueWithoutGD,
          GDCompensationSavings,
        },
      };

      invoiceDetailsList.push(invoiceDetails);
    }

    return { invoices: invoiceDetailsList, totalCount };
  }
  async findOne(id: string) {
    return await this.prisma.invoice.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.InvoiceUpdateInput) {
    return await this.prisma.invoice.update({ where: { id }, data });
  }

  async remove(id: string) {
    return await this.prisma.invoice.delete({ where: { id } });
  }
}
