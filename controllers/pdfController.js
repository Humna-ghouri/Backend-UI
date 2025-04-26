// import mongoose from 'mongoose';
// import { generatePDF } from '../utils/pdfGenerator.js';
// import LoanRequest from '../models/LoanRequest.js';

// export const generateLoanPDF = async (req, res) => {
//   try {
//     const { loanRequestId } = req.params;

//     // Validate loan ID
//     if (!mongoose.Types.ObjectId.isValid(loanRequestId)) {
//       return res.status(400).json({ 
//         success: false,
//         message: 'Invalid loan ID format' 
//       });
//     }

//     // Fetch loan details with all fields
//     const loan = await LoanRequest.findById(loanRequestId)
//       .populate('userId') // Changed from 'applicant' to 'userId'
//       .lean();

//     if (!loan) {
//       return res.status(404).json({ 
//         success: false,
//         message: 'Loan request not found' 
//       });
//     }

//     // Format dates and combine all data
//     const formattedAppointmentDate = loan.appointmentDate 
//       ? new Date(loan.appointmentDate).toLocaleDateString('en-US', {
//           weekday: 'long',
//           year: 'numeric',
//           month: 'long',
//           day: 'numeric'
//         })
//       : 'Not specified';

//     const loanWithFormattedData = {
//       ...loan,
//       ...(loan.userId || {}), // Changed from loan.applicant to loan.userId
//       formattedAppointmentDate,
//       formattedAppointmentTime: '10:00 AM - 3:00 PM',
//       loanType: loan.loanType || 'N/A'
//     };

//     // Generate PDF with all loan details
//     const pdfBuffer = await generatePDF(loanWithFormattedData);

//     // Set proper PDF headers
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader(
//       'Content-Disposition', 
//       `attachment; filename=loan-application-${loan.tokenNumber || loan._id}.pdf`
//     );

//     // Send the PDF
//     res.send(pdfBuffer);

//   } catch (error) {
//     console.error('PDF Generation Error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to generate PDF'
//     });
//   }
// };




// controllers/pdfController.js
import { generatePDF } from '../utils/pdfGenerator.js';
import LoanRequest from '../models/LoanRequest.js';

export const generateLoanPDF = async (req, res) => {
  try {
    const { loanRequestId } = req.params;

    // Fetch loan details with all fields including virtuals
    const loan = await LoanRequest.findById(loanRequestId)
      .populate('userId')
      .lean({ virtuals: true });

    if (!loan) {
      return res.status(404).json({ 
        success: false,
        message: 'Loan request not found' 
      });
    }

    // Prepare complete data for PDF
    const pdfData = {
      // Loan details
      loanType: loan.loanType || 'Personal Loan',
      subcategory: loan.subcategory || '',
      amount: loan.amount || 0,
      maxAmount: loan.maxAmount || '',
      tenure: loan.tenure || 12,
      interestRate: loan.interestRate || 10,
      emi: loan.emi || loan.loan_emi || '',
      // Applicant details
      applicantName: loan.applicantName || loan.userId?.name || '',
      applicantEmail: loan.applicantEmail || loan.userId?.email || '',
      applicantCNIC: loan.applicantCNIC || loan.userId?.cnic || '',
      phoneNumber: loan.phoneNumber || loan.userId?.phone || '',
      address: loan.address || loan.userId?.address || '',
      city: loan.city || loan.userId?.city || '',
      country: loan.country || loan.userId?.country || 'Pakistan',
      userPhoto: loan.userPhoto || loan.userId?.profilePhoto || '',
      // Guarantor details
      guarantorName: loan.guarantorName || '',
      guarantorEmail: loan.guarantorEmail || '',
      guarantorCNIC: loan.guarantorCNIC || '',
      guarantorLocation: loan.guarantorLocation || '',
      // System fields
      tokenNumber: loan.tokenNumber || `L-${loan._id.toString().slice(-6).toUpperCase()}`,
      status: loan.status || 'Pending',
      appointmentDate: loan.appointmentDate || '',
      branch: loan.branch || 'Main Branch',
      qrCode: loan.qrCode || '',
      createdAt: loan.createdAt || new Date()
    };

    // Generate PDF
    const pdfBuffer = await generatePDF(pdfData);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition', 
      `attachment; filename=loan-application-${pdfData.tokenNumber}.pdf`
    );

    // Send PDF
    res.send(pdfBuffer);

  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF'
    });
  }
};