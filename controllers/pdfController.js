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



import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { generatePDF } from '../utils/pdfGenerator.js';
import LoanRequest from '../models/loanRequest.js'; // Regular import

// Get current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const generateLoanPDF = async (req, res) => {
    try {
        const { loanRequestId } = req.params;

        // Fetch loan details
        const loan = await LoanRequest.findById(loanRequestId)
            .populate('userId')
            .lean({ virtuals: true });

        if (!loan) {
            return res.status(404).json({ 
                success: false,
                message: 'Loan request not found' 
            });
        }

        // Prepare PDF data
        const pdfData = {
            loanType: loan.loanType || 'Personal Loan',
            amount: loan.amount || 0,
            tenure: loan.tenure || 12,
            interestRate: loan.interestRate || 10,
            emi: loan.emi || loan.loan_emi || '',
            applicantName: loan.applicantName || loan.userId?.name || '',
            applicantEmail: loan.applicantEmail || loan.userId?.email || '',
            applicantCNIC: loan.applicantCNIC || loan.userId?.cnic || '',
            phoneNumber: loan.phoneNumber || loan.userId?.phone || '',
            address: loan.address || loan.userId?.address || '',
            city: loan.city || loan.userId?.city || '',
            country: loan.country || loan.userId?.country || 'Pakistan',
            userPhoto: loan.userPhoto || loan.userId?.profilePhoto || '',
            guarantorName: loan.guarantorName || '',
            guarantorEmail: loan.guarantorEmail || '',
            guarantorCNIC: loan.guarantorCNIC || '',
            guarantorLocation: loan.guarantorLocation || '',
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