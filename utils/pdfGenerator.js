// // utils/pdfGenerator.js
// import PDFDocument from 'pdfkit';
// import QRCode from 'qrcode';
// import axios from 'axios';

// // Utility functions
// const formatCNIC = (cnic) => cnic ? cnic.replace(/(\d{5})(\d{7})(\d{1})/, '$1-$2-$3') : '';
// const formatPhone = (phone) => phone ? phone.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3') : '';

// const formatDate = (dateString) => {
//   if (!dateString) return 'Not specified';
//   const date = new Date(dateString);
//   return date.toLocaleDateString('en-GB', {
//     weekday: 'long',
//     day: 'numeric',
//     month: 'long',
//     year: 'numeric'
//   });
// };

// const formatCurrency = (amount) => amount ? `PKR ${amount.toLocaleString()}` : 'PKR 0';

// const getImageBuffer = async (url) => {
//   try {
//     if (url.startsWith('http')) {
//       const response = await axios.get(url, { responseType: 'arraybuffer' });
//       return Buffer.from(response.data, 'binary');
//     }
//     return null;
//   } catch (error) {
//     console.error('Error loading image:', error);
//     return null;
//   }
// };

// const generatePDF = async (loanData) => {
//   return new Promise(async (resolve, reject) => {
//     const doc = new PDFDocument({
//       size: 'A4',
//       margin: 40,
//       bufferPages: true
//     });

//     const buffers = [];
//     doc.on('data', buffers.push.bind(buffers));
//     doc.on('end', () => resolve(Buffer.concat(buffers)));
//     doc.on('error', reject);

//     // Colors
//     const colors = {
//       primary: '#1e40af',
//       darkGray: '#374151',
//       lightGray: '#f3f4f6',
//       lightBlue: '#dbeafe'
//     };

//     // Header
//     doc.fillColor(colors.primary)
//        .font('Helvetica-Bold')
//        .fontSize(20)
//        .text('Loan Application Receipt', 50, 50);
    
//     doc.fontSize(10)
//        .fillColor(colors.darkGray)
//        .text(`Application ID: ${loanData.tokenNumber || 'N/A'}`, 50, 80)
//        .text(`Submission Date: ${formatDate(loanData.createdAt)}`, 50, 95);

//     // Status - simple text without background
//     doc.fillColor(colors.primary)
//        .font('Helvetica-Bold')
//        .fontSize(12)
//        .text(`Status: ${loanData.status || 'Pending'}`, 450, 80);

//     let currentY = 130;

//     // Loan Information
//     doc.fillColor(colors.lightBlue)
//        .roundedRect(40, currentY - 10, 515, 120, 5)
//        .fill();
    
//     doc.fillColor(colors.primary)
//        .font('Helvetica-Bold')
//        .fontSize(14)
//        .text('Loan Details', 50, currentY);
    
//     currentY += 25;

//     const addField = (label, value, col = 1) => {
//       const x = col === 1 ? 50 : 300;
//       const width = 220;
      
//       doc.fillColor(colors.darkGray)
//          .font('Helvetica-Bold')
//          .fontSize(10)
//          .text(`${label}:`, x, currentY, { width, continued: true })
//          .fillColor('#4b5563')
//          .font('Helvetica')
//          .text(` ${value || ''}`, { width });
      
//       if (col === 2) currentY += 15;
//     };

//     addField('Loan Type', loanData.loanType);
//     addField('Subcategory', loanData.subcategory, 2);
//     addField('Amount', formatCurrency(loanData.amount));
//     addField('Max Amount', loanData.maxAmount ? formatCurrency(loanData.maxAmount) : '', 2);
//     addField('Tenure', `${loanData.tenure || 0} months`);
//     addField('Interest Rate', `${loanData.interestRate || 0}%`, 2);
//     addField('Monthly EMI', loanData.emi ? formatCurrency(loanData.emi) : '', 2);

//     currentY += 30;

//     // Applicant Information
//     doc.fillColor(colors.lightGray)
//        .roundedRect(40, currentY - 10, 515, 120, 5)
//        .fill();
    
//     doc.fillColor(colors.primary)
//        .font('Helvetica-Bold')
//        .fontSize(14)
//        .text('Applicant Information', 50, currentY);
    
//     currentY += 25;

//     addField('Full Name', loanData.applicantName);
//     addField('Email', loanData.applicantEmail, 2);
//     addField('CNIC', formatCNIC(loanData.applicantCNIC));
//     addField('Phone', formatPhone(loanData.phoneNumber), 2);
//     addField('Address', `${loanData.address || ''}, ${loanData.city || ''}, ${loanData.country || ''}`);

//     currentY += 30;

//     // Guarantor Information
//     doc.fillColor(colors.lightGray)
//        .roundedRect(40, currentY - 10, 515, 90, 5)
//        .fill();
    
//     doc.fillColor(colors.primary)
//        .font('Helvetica-Bold')
//        .fontSize(14)
//        .text('Guarantor Details', 50, currentY);
    
//     currentY += 25;

//     addField('Name', loanData.guarantorName);
//     addField('CNIC', formatCNIC(loanData.guarantorCNIC), 2);
//     addField('Email', loanData.guarantorEmail);
//     addField('Location', loanData.guarantorLocation, 2);

//     currentY += 30;

//     // Appointment
//     doc.fillColor(colors.lightBlue)
//        .roundedRect(40, currentY - 10, 515, 60, 5)
//        .fill();
    
//     doc.fillColor(colors.primary)
//        .font('Helvetica-Bold')
//        .fontSize(14)
//        .text('Appointment Details', 50, currentY);
    
//     currentY += 25;

//     addField('Date', formatDate(loanData.appointmentDate));
//     addField('Branch', loanData.branch || 'Main Branch', 2);

//     currentY += 30;

//     // Documents
//     doc.fillColor(colors.primary)
//        .font('Helvetica-Bold')
//        .fontSize(14)
//        .text('Required Documents', 50, currentY);
    
//     currentY += 20;

//     const documents = [
//       '• Original CNIC (Applicant + Guarantor)',
//       '• 2 Passport Size Photos',
//       '• Proof of Income (Salary slips or bank statements)',
//       '• Utility Bill (Proof of Address)',
//       '• Any other documents related to your loan type'
//     ];
    
//     documents.forEach(item => {
//       doc.fillColor(colors.darkGray)
//          .font('Helvetica')
//          .fontSize(10)
//          .text(item, 50, currentY);
//       currentY += 15;
//     });

//     currentY += 20;

//     // Images
//     try {
//       // User Photo
//       if (loanData.userPhoto) {
//         const photoBuffer = await getImageBuffer(loanData.userPhoto);
//         if (photoBuffer) {
//           doc.image(photoBuffer, 50, currentY, {
//             width: 80,
//             height: 80,
//             fit: [80, 80]
//           });
          
//           doc.fillColor(colors.darkGray)
//              .fontSize(8)
//              .text('Applicant Photo', 50, currentY + 85, { width: 80, align: 'center' });
//         }
//       }

//       // QR Code
//       if (loanData.tokenNumber) {
//         const qrBuffer = await QRCode.toBuffer(loanData.tokenNumber, {
//           width: 100,
//           margin: 1,
//           color: { dark: colors.primary, light: '#ffffff00' }
//         });
        
//         doc.image(qrBuffer, 450, currentY, { width: 80 });
//         doc.fillColor(colors.darkGray)
//            .fontSize(8)
//            .text('Verification Code', 450, currentY + 85, { width: 80, align: 'center' });
//       }
//     } catch (error) {
//       console.error('Error adding images:', error);
//     }

//     currentY += 100;

//     // Footer
//     doc.fillColor(colors.lightGray)
//        .rect(0, doc.page.height - 40, doc.page.width, 40)
//        .fill();
    
//     doc.fontSize(8)
//        .fillColor(colors.darkGray)
//        .text('Computer generated document - No signature required', 50, doc.page.height - 30)
//        .text(`Generated on: ${new Date().toLocaleDateString()}`, 50, doc.page.height - 15)
//        .text('Customer Support: 0800-12345', doc.page.width - 200, doc.page.height - 15, { align: 'right' });

//     doc.end();
//   });
// };

// export { generatePDF };

import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

// Utility functions
const formatCNIC = (cnic) => cnic ? cnic.replace(/(\d{5})(\d{7})(\d{1})/, '$1-$2-$3') : '';
const formatPhone = (phone) => phone ? phone.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3') : '';

const formatDate = (dateString) => {
  if (!dateString) return 'Not specified';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const formatCurrency = (amount) => amount ? `PKR ${amount.toLocaleString()}` : 'PKR 0';

const generatePDF = async (loanData) => {
  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
      bufferPages: true
    });

    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Colors
    const colors = {
      primary: '#1e40af',
      darkGray: '#374151',
      lightGray: '#f3f4f6',
      lightBlue: '#dbeafe'
    };

    // Header
    doc.fillColor(colors.primary)
       .font('Helvetica-Bold')
       .fontSize(20)
       .text('Loan Application Receipt', 50, 50);
    
    doc.fontSize(10)
       .fillColor(colors.darkGray)
       .text(`Application ID: ${loanData.tokenNumber || 'N/A'}`, 50, 80)
       .text(`Submission Date: ${formatDate(loanData.createdAt)}`, 50, 95);

    // Status
    doc.fillColor(colors.primary)
       .font('Helvetica-Bold')
       .fontSize(12)
       .text(`Status: ${loanData.status || 'Pending'}`, 450, 80);

    let currentY = 130;

    // Loan Information
    doc.fillColor(colors.lightBlue)
       .roundedRect(40, currentY - 10, 515, 120, 5)
       .fill();
    
    doc.fillColor(colors.primary)
       .font('Helvetica-Bold')
       .fontSize(14)
       .text('Loan Details', 50, currentY);
    
    currentY += 25;

    const addField = (label, value, col = 1) => {
      const x = col === 1 ? 50 : 300;
      const width = 220;
      
      doc.fillColor(colors.darkGray)
         .font('Helvetica-Bold')
         .fontSize(10)
         .text(`${label}:`, x, currentY, { width, continued: true })
         .fillColor('#4b5563')
         .font('Helvetica')
         .text(` ${value || ''}`, { width });
      
      if (col === 2) currentY += 15;
    };

    addField('Loan Type', loanData.loanType);
    addField('Subcategory', loanData.subcategory, 2);
    addField('Amount', formatCurrency(loanData.amount));
    addField('Max Amount', loanData.maxAmount ? formatCurrency(loanData.maxAmount) : '', 2);
    addField('Tenure', `${loanData.tenure || 0} months`);
    addField('Interest Rate', `${loanData.interestRate || 0}%`, 2);
    addField('Monthly EMI', loanData.emi ? formatCurrency(loanData.emi) : '', 2);

    currentY += 30;

    // Applicant Information
    doc.fillColor(colors.lightGray)
       .roundedRect(40, currentY - 10, 515, 120, 5)
       .fill();
    
    doc.fillColor(colors.primary)
       .font('Helvetica-Bold')
       .fontSize(14)
       .text('Applicant Information', 50, currentY);
    
    currentY += 25;

    addField('Full Name', loanData.applicantName);
    addField('Email', loanData.applicantEmail, 2);
    addField('CNIC', formatCNIC(loanData.applicantCNIC));
    addField('Phone', formatPhone(loanData.phoneNumber), 2);
    addField('Address', `${loanData.address || ''}, ${loanData.city || ''}, ${loanData.country || ''}`);

    currentY += 30;

    // Guarantor Information
    doc.fillColor(colors.lightGray)
       .roundedRect(40, currentY - 10, 515, 90, 5)
       .fill();
    
    doc.fillColor(colors.primary)
       .font('Helvetica-Bold')
       .fontSize(14)
       .text('Guarantor Details', 50, currentY);
    
    currentY += 25;

    addField('Name', loanData.guarantorName);
    addField('CNIC', formatCNIC(loanData.guarantorCNIC), 2);
    addField('Email', loanData.guarantorEmail);
    addField('Location', loanData.guarantorLocation, 2);

    currentY += 30;

    // Appointment
    doc.fillColor(colors.lightBlue)
       .roundedRect(40, currentY - 10, 515, 60, 5)
       .fill();
    
    doc.fillColor(colors.primary)
       .font('Helvetica-Bold')
       .fontSize(14)
       .text('Appointment Details', 50, currentY);
    
    currentY += 25;

    addField('Date', formatDate(loanData.appointmentDate));
    addField('Branch', loanData.branch || 'Main Branch', 2);

    currentY += 30;

    // Documents
    doc.fillColor(colors.primary)
       .font('Helvetica-Bold')
       .fontSize(14)
       .text('Required Documents', 50, currentY);
    
    currentY += 20;

    const documents = [
      '• Original CNIC (Applicant + Guarantor)',
      '• 2 Passport Size Photos',
      '• Proof of Income (Salary slips or bank statements)',
      '• Utility Bill (Proof of Address)',
      '• Any other documents related to your loan type'
    ];
    
    documents.forEach(item => {
      doc.fillColor(colors.darkGray)
         .font('Helvetica')
         .fontSize(10)
         .text(item, 50, currentY);
      currentY += 15;
    });

    currentY += 20;

    // Images Section
    try {
      // QR Code (always generate)
      const qrData = loanData.tokenNumber || loanData._id.toString();
      const qrCode = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 1,
        color: {
          dark: colors.primary,
          light: '#ffffff'
        }
      });

      doc.image(qrCode, 450, currentY, {
        width: 80,
        align: 'right'
      });
      
      doc.fillColor(colors.darkGray)
         .fontSize(8)
         .text('Verification Code', 450, currentY + 85, {
           width: 80,
           align: 'center'
         });

      // User Photo Placeholder
      doc.rect(50, currentY, 80, 80)
         .fill('#f0f0f0')
         .stroke('#cccccc');
      
      doc.fillColor('#666666')
         .fontSize(8)
         .text('Applicant Photo', 50, currentY + 85, {
           width: 80,
           align: 'center'
         });

    } catch (error) {
      console.error('Error generating QR code:', error);
    }

    currentY += 100;

    // Footer
    doc.fillColor(colors.lightGray)
       .rect(0, doc.page.height - 40, doc.page.width, 40)
       .fill();
    
    doc.fontSize(8)
       .fillColor(colors.darkGray)
       .text('Computer generated document - No signature required', 50, doc.page.height - 30)
       .text(`Generated on: ${new Date().toLocaleDateString()}`, 50, doc.page.height - 15)
       .text('Customer Support: 0800-12345', doc.page.width - 200, doc.page.height - 15, { align: 'right' });

    doc.end();
  });
};

export { generatePDF };