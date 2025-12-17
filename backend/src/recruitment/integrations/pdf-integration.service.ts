import { Injectable, Logger } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PdfIntegrationService {
  private readonly logger = new Logger(PdfIntegrationService.name);
  private readonly uploadsDir = path.join(process.cwd(), 'uploads', 'pdfs');

  constructor() {
    // Ensure uploads directory exists
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Generate offer PDF
   */
  async generateOfferPDF(offer: any, candidate: any): Promise<string> {
    try {
      const fileName = `offer-${offer._id.toString()}.pdf`;
      const filePath = path.join(this.uploadsDir, fileName);

      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(20).text('Job Offer Letter', { align: 'center' });
      doc.moveDown();

      // Candidate Information
      doc.fontSize(14).text('Dear ' + (candidate.fullName || `${candidate.firstName} ${candidate.lastName}`) + ',', { align: 'left' });
      doc.moveDown();
      doc.fontSize(12).text('We are pleased to offer you the following position:');
      doc.moveDown();

      // Offer Details
      doc.fontSize(12);
      doc.text(`Position: ${offer.role || 'N/A'}`, { indent: 20 });
      doc.text(`Start Date: ${offer.startDate ? new Date(offer.startDate).toLocaleDateString() : 'TBD'}`);
      doc.text(`Gross Salary: ${offer.grossSalary || 'N/A'}`);
      if (offer.signingBonus) {
        doc.text(`Signing Bonus: ${offer.signingBonus}`);
      }
      if (offer.benefits && offer.benefits.length > 0) {
        doc.text(`Benefits: ${offer.benefits.join(', ')}`);
      }
      doc.moveDown();

      // Terms
      doc.text('Terms and Conditions:', { underline: true });
      doc.text('This offer is subject to your acceptance and the completion of all pre-employment requirements.', { indent: 20 });
      doc.moveDown();

      // Footer
      doc.fontSize(10).text('Please review and respond to this offer through the candidate portal.', { align: 'center' });
      doc.text('Best regards,', { align: 'left' });
      doc.text('HR Team', { align: 'left' });
      doc.text(`Offer ID: ${offer._id.toString()}`, { align: 'right' });
      doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });

      doc.end();

      return new Promise((resolve, reject) => {
        stream.on('finish', () => {
          this.logger.log(`Offer PDF generated: ${filePath}`);
          resolve(`/uploads/pdfs/${fileName}`);
        });
        stream.on('error', reject);
      });
    } catch (error) {
      this.logger.error(
        `Failed to generate offer PDF for offer ${offer._id}:`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Generate contract PDF
   */
  async generateContractPDF(contract: any, employee: any): Promise<string> {
    try {
      const fileName = `contract-${contract._id.toString()}.pdf`;
      const filePath = path.join(this.uploadsDir, fileName);

      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(20).text('Employment Contract', { align: 'center' });
      doc.moveDown();

      // Parties
      doc.fontSize(14).text('Employment Agreement', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12);
      doc.text(`Employee: ${employee.fullName || `${employee.firstName} ${employee.lastName}`}`);
      doc.text(`Employee Number: ${employee.employeeNumber || 'N/A'}`);
      doc.moveDown();

      // Contract Details
      doc.text('Contract Terms:', { underline: true });
      doc.text(`Role: ${contract.role || 'N/A'}`, { indent: 20 });
      doc.text(`Gross Salary: ${contract.grossSalary || 'N/A'}`);
      if (contract.signingBonus) {
        doc.text(`Signing Bonus: ${contract.signingBonus}`);
      }
      doc.text(`Start Date: ${contract.acceptanceDate ? new Date(contract.acceptanceDate).toLocaleDateString() : 'N/A'}`);
      if (contract.benefits && contract.benefits.length > 0) {
        doc.text(`Benefits: ${contract.benefits.join(', ')}`);
      }
      doc.moveDown();

      // Signatures
      doc.text('Signatures:', { underline: true });
      doc.moveDown(2);
      doc.text('Employee Signature: _________________', { indent: 20 });
      if (contract.employeeSignedAt) {
        doc.text(`Signed: ${new Date(contract.employeeSignedAt).toLocaleDateString()}`);
      }
      doc.moveDown();
      doc.text('Employer Signature: _________________', { indent: 20 });
      if (contract.employerSignedAt) {
        doc.text(`Signed: ${new Date(contract.employerSignedAt).toLocaleDateString()}`);
      }

      doc.end();

      return new Promise((resolve, reject) => {
        stream.on('finish', () => {
          this.logger.log(`Contract PDF generated: ${filePath}`);
          resolve(`/uploads/pdfs/${fileName}`);
        });
        stream.on('error', reject);
      });
    } catch (error) {
      this.logger.error(
        `Failed to generate contract PDF for contract ${contract._id}:`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}

