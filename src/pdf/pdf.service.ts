import { Injectable } from '@nestjs/common';
import * as pdfParse from 'pdf-parse';

@Injectable()
export class PdfService {
  async extractTextFromPdf(buffer: Buffer): Promise<string> {
    const data = await pdfParse(buffer);
    return data.text;
  }
  async extractValueContMun(text: string): Promise<string> {
    const regex = /Contrib Ilum Publica Municipal\s+(\d+,\d+)/;
    const match = text.match(regex);
    return match ? match[1] : null;
  }
  async extractEnergiaEletricaQnt(text: string): Promise<string> {
    const regex = /Energia ElétricakWh\s+(\d+)/;
    const match = text.match(regex);
    return match ? match[1] : null;
  }

  async extractEnergiaSCEEsICMSQnt(text: string): Promise<string> {
    const regex = /Energia SCEE s\/ ICMSkWh\s+(\d+)/;
    const match = text.match(regex);
    return match ? match[1] : null;
  }

  async extractEnergiaCompensadaGDIQnt(text: string): Promise<string> {
    const regex = /Energia compensada GD IkWh\s+(\d+)/;
    const match = text.match(regex);
    return match ? match[1] : null;
  }

  async extractNumeroCliente(text: string): Promise<string> {
    const regex = /\n\s*(\d+)\s+\d+/;
    const match = text.match(regex);
    const numeroCliente = match ? match[1] : null;
    return numeroCliente;
  }

  async extractMesReferencia(text: string): Promise<string> {
    const match = text.match(
      /\b(?:JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\/\d{4}\b/,
    );
    return match ? match[0] : null;
  }

  async extractValEnergiaEletrica(text: string): Promise<string> {
    const regex = /Energia ElétricakWh\s+\d+\s+\S+\s+([\d,]+)/;
    const match = text.match(regex);
    return match ? match[1] : null;
  }

  async extractValEnergiaSCEEsICMS(text: string): Promise<string> {
    const regex = /Energia SCEE ISENTAkWh\s+\d+\s+[\d,.]+\s+(-?\d+,\d+)/;
    const match = text.match(regex);
    return match ? match[1] : null;
  }

  async extractValEnergiaCompensadaGDI(text: string): Promise<string> {
    const regex = /Energia compensada GD IkWh\s+\d+\s+[\d,.]+\s+(-?\d+,\d+)/;

    const match = text.match(regex);

    if (match && match[1]) {
      return match[1];
    } else {
      return null;
    }
  }

  async extractValContribuicao(text: string): Promise<string> {
    const inicioLinha = text.indexOf('Contrib Ilum Publica Municipal');
    if (inicioLinha === -1) return null;

    const substring = text.substring(inicioLinha);

    const quebraDeLinha = substring.indexOf('\n');

    const valorString = substring.substring(0, quebraDeLinha).trim();

    const partes = valorString.split(/\s+/);

    const valor = partes[partes.length - 1];

    return valor;
  }

  async extrairQuantidadeEnergia(texto: string, tipoEnergia: string) {
    const regex = new RegExp(`${tipoEnergia}\\s+(\\d+)`, 'g');
    const match = regex.exec(texto);
    if (match) {
      return parseInt(match[1]);
    } else {
      return null;
    }
  }

  async extrairValoresEnergia(texto: string, tipoEnergia: string) {
    const regex = new RegExp(
      `${tipoEnergia}\\s+(-?\\d+(?:,\\d+)*(?:\\.\\d+)?)`,
      'g',
    );
    const matches = texto.match(regex);
    if (matches) {
      return matches.map((match) =>
        parseFloat(match.split(/\s+/).pop().replace(',', '.')),
      );
    } else {
      return [];
    }
  }

  async valorEnergiaEspecifica(texto: string, tipoEnergia: string) {
    const valores = await this.extrairValoresEnergia(texto, tipoEnergia);
    if (valores.length > 0) {
      return valores[0];
    } else {
      return 0;
    }
  }
}
