import express from 'express';
import multer from 'multer';
import LoanRequest from '../models/loanRequest.js';
import QRCode from 'qrcode';
import authMiddleware from '../Middlewares/authMiddleware.js';
import cloudinaryUpload from '../config/cloudinary.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

router.post('/submit', authMiddleware, upload.single('userPhoto'), async (req, res) => {
  try {
    const { body, file, user } = req;
    
    if (!file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }

    // Upload image to Cloudinary
    const userPhotoUrl = await cloudinaryUpload(file.buffer);

    // Generate token and QR code
    const tokenNumber = 'LN-' + Date.now().toString().slice(-8);
    const qrCode = await QRCode.toDataURL(tokenNumber);

    // Create loan request
    const loanRequest = new LoanRequest({
      userId: user._id,
      applicantName: body.applicantName,
      applicantEmail: body.applicantEmail,
      applicantCNIC: body.applicantCNIC,
      phoneNumber: body.phoneNumber,
      address: body.address,
      city: body.city,
      country: body.country || 'Pakistan',
      guarantorName: body.guarantorName,
      guarantorEmail: body.guarantorEmail,
      guarantorCNIC: body.guarantorCNIC,
      guarantorLocation: body.guarantorLocation,
      appointmentDate: new Date(body.appointmentDate),
      userPhoto: userPhotoUrl,
      tokenNumber,
      qrCode,
      status: 'pending',
      amount: Number(body.amount) || 50000,
      tenure: Number(body.tenure) || 12,
      interestRate: Number(body.interestRate) || 10
    });

    await loanRequest.save();

    res.status(201).json({
      success: true,
      message: 'Loan submitted successfully',
      loanId: loanRequest._id,
      redirectUrl: `/slip-generation/${loanRequest._id}`
    });

  } catch (error) {
    console.error('Loan submission error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error during submission'
    });
  }
});

router.get('/details/:id', authMiddleware, async (req, res) => {
  try {
    const loan = await LoanRequest.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).lean();

    if (!loan) {
      return res.status(404).json({ 
        success: false,
        message: 'Loan request not found' 
      });
    }

    res.json({
      success: true,
      data: {
        ...loan,
        formattedAppointmentDate: new Date(loan.appointmentDate).toLocaleDateString('en-GB'),
        amount: loan.amount?.toLocaleString() || '50,000'
      }
    });

  } catch (error) {
    console.error('Error fetching loan details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loan details',
      error: error.message
    });
  }
});

export default router;