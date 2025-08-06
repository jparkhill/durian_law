const express = require('express');
const { body, validationResult } = require('express-validator');
const { Client, Environment } = require('square');
const Payment = require('../models/Payment');
const Case = require('../models/Case');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Initialize Square client
const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT === 'production' ? Environment.Production : Environment.Sandbox
});

// Get all payments
router.get('/', auth, async (req, res) => {
  try {
    const { caseId, status, page = 1, limit = 10 } = req.query;
    const query = {};
    
    if (caseId) query.caseId = caseId;
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .populate('caseId', 'caseNumber clientName')
      .populate('processedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Process Square payment
router.post('/square', [
  auth,
  body('caseId').isMongoId(),
  body('amount').isNumeric().custom(value => value > 0),
  body('sourceId').notEmpty(),
  body('description').trim().notEmpty(),
  body('paidBy').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { caseId, amount, sourceId, description, paidBy } = req.body;

    // Verify case exists
    const caseData = await Case.findById(caseId);
    if (!caseData) {
      return res.status(404).json({ message: 'Case not found' });
    }

    // Process payment with Square
    const paymentsApi = squareClient.paymentsApi;
    
    const requestBody = {
      sourceId: sourceId,
      amountMoney: {
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'USD'
      },
      idempotencyKey: `${caseId}-${Date.now()}`
    };

    const squareResponse = await paymentsApi.createPayment(requestBody);
    
    if (squareResponse.result.payment) {
      // Create payment record
      const payment = new Payment({
        caseId,
        amount,
        paymentMethod: 'square',
        squarePaymentId: squareResponse.result.payment.id,
        description,
        paidBy,
        processedBy: req.user._id,
        status: 'completed'
      });

      await payment.save();
      
      // Update case totals
      caseData.totalPaid += amount;
      await caseData.save();

      await payment.populate('caseId', 'caseNumber clientName');
      await payment.populate('processedBy', 'firstName lastName');

      res.status(201).json(payment);
    } else {
      res.status(400).json({ message: 'Payment failed' });
    }
  } catch (error) {
    console.error(error);
    if (error.errors) {
      res.status(400).json({ message: error.errors[0].detail });
    } else {
      res.status(500).json({ message: 'Payment processing failed' });
    }
  }
});

// Record cash/check payment
router.post('/manual', [
  auth,
  body('caseId').isMongoId(),
  body('amount').isNumeric().custom(value => value > 0),
  body('paymentMethod').isIn(['cash', 'check', 'bank_transfer']),
  body('description').trim().notEmpty(),
  body('paidBy').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { caseId, amount, paymentMethod, description, paidBy, notes } = req.body;

    // Verify case exists
    const caseData = await Case.findById(caseId);
    if (!caseData) {
      return res.status(404).json({ message: 'Case not found' });
    }

    // Create payment record
    const payment = new Payment({
      caseId,
      amount,
      paymentMethod,
      description,
      paidBy,
      processedBy: req.user._id,
      notes,
      status: 'completed'
    });

    await payment.save();
    
    // Update case totals
    caseData.totalPaid += amount;
    await caseData.save();

    await payment.populate('caseId', 'caseNumber clientName');
    await payment.populate('processedBy', 'firstName lastName');

    res.status(201).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('caseId', 'caseNumber clientName')
      .populate('processedBy', 'firstName lastName');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;