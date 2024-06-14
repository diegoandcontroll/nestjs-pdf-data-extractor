/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Invoice, Prisma } from '@prisma/client';
import { Request } from 'express';
import * as fs from 'fs';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/enums/role.enum';
import { InvoiceService } from 'src/invoice/invoice.service';

import { PdfService } from 'src/pdf/pdf.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly pdfService: PdfService,
    private readonly invoiceService: InvoiceService,
    prismaService: PrismaService,
  ) {}
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('send')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any, @Req() req: Request) {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file uploaded');
    }

    const text = await this.pdfService.extractTextFromPdf(file.buffer);
    const num = await this.pdfService.extractNumeroCliente(text);
    const date = await this.pdfService.extractMesReferencia(text);
    const contribMun = await this.pdfService.extractValContribuicao(text);
    const patterns = {
      energiaEletrica: [
        /Energia ElétricakWh\s+(\d[\d.,]*)\s+([\d.,]+)\s+([\d.,]+)/,
        /Energia ElétricakWh\s+(\d+)\s+([\d.,]+)\s+([\d.,]+)/,
      ],
      energiaSCEE: [
        /Energia SCEE(?: ISENTA| s\/ ICMS)?kWh\s+(\d[\d.,]*)\s+([\d.,]+)\s+([\d.,]+)/,
        /Energia SCEE(?: ISENTA| s\/ ICMS)?kWh\s+(\d+)\s+([\d.,]+)\s+([\d.,]+)/,
      ],
      energiaCompensada: [
        /Energia compensada GD IkWh\s+(\d[\d.,]*)\s+([\d.,]+)\s+(-[\d.,]+)/,
        /Energia compensada GD IkWh\s+(\d+)\s+([\d.,]+)\s+(-[\d.,]+)/,
      ],
    };

    function findMatch(text, patterns) {
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          return match;
        }
      }
      return null;
    }

    // Attempt to match each pattern
    const energiaEletricaMatch = findMatch(text, patterns.energiaEletrica);
    const energiaSCEEMatch = findMatch(text, patterns.energiaSCEE);
    const energiaCompensadaMatch = findMatch(text, patterns.energiaCompensada);

    // Create results object
    const results = {
      energiaEletrica: {
        quantidade: energiaEletricaMatch
          ? parseInt(energiaEletricaMatch[1].replace(/[.,]/g, ''))
          : null,
        valor: energiaEletricaMatch ? energiaEletricaMatch[3] : null,
      },
      energiaSCEE: {
        quantidade: energiaSCEEMatch
          ? parseInt(energiaSCEEMatch[1].replace(/[.,]/g, ''))
          : null,
        valor: energiaSCEEMatch ? energiaSCEEMatch[3] : null,
      },
      energiaCompensada: {
        quantidade: energiaCompensadaMatch
          ? parseInt(energiaCompensadaMatch[1].replace(/[.,]/g, ''))
          : null,
        valor: energiaCompensadaMatch ? energiaCompensadaMatch[3] : null,
      },
    };

    const numeroCliente = num;
    const mesReferencia = date;
    if (!numeroCliente || !mesReferencia) {
      throw new BadRequestException(
        'Número do cliente ou mês de referência não encontrado no PDF',
      );
    }
    const clientDir = `uploads/${numeroCliente}`;

    if (!fs.existsSync(clientDir)) {
      fs.mkdirSync(clientDir, { recursive: true });
    }

    const newFilePath = `${clientDir}/${file.originalname}`;
    const fileUrl = `${req.protocol}://${req.get('host')}/${clientDir}/${
      file.originalname
    }`;
    fs.writeFileSync(newFilePath, file.buffer);
    const obj = {
      customerNumber: `${num}`,
      referenceMonth: date,
      url: fileUrl,
      publicLightingContribution: contribMun,
      energyCompensatedQuantity: results.energiaCompensada.quantidade,
      energyCompensatedValue: results.energiaCompensada.valor,
      energyElectricityQuantity: results.energiaEletrica.quantidade,
      energyElectricityValue: results.energiaEletrica.valor,
      energySCEEEQuantity: results.energiaSCEE.quantidade,
      energySCEEEValue: results.energiaSCEE.valor,
    } as Prisma.InvoiceCreateInput;
    const invoice = await this.invoiceService.create(obj);
    if (invoice) {
      return {
        originalname: file.originalname,
        filename: file.filename,
        path: newFilePath,
        numeroCliente,
        contribMun,
        mesReferencia: date,
        ...results,
        url: fileUrl,
      };
    }
  }
}
