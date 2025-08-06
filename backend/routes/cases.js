const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const Case = require('../models/Case');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Get all cases
router.get('/', auth, async (req, res) => {
  try {
    const { status, caseType, page = 1, limit = 10 } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (caseType) query.caseType = caseType;

    const cases = await Case.find(query)
      .populate('attorney', 'firstName lastName')
      .populate('caseManager', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Case.countDocuments(query);

    res.json({
      cases,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new case
router.post('/', [
  auth,
  body('clientName').trim().notEmpty(),
  body('clientEmail').isEmail().normalizeEmail(),
  body('clientPhone').trim().notEmpty(),
  body('caseType').isIn(['personal_injury', 'criminal_defense', 'family_law', 'business_law', 'estate_planning', 'immigration', 'other']),
  body('description').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const caseData = new Case({
      ...req.body,
      attorney: req.user._id
    });

    await caseData.save();
    await caseData.populate('attorney', 'firstName lastName');
    
    res.status(201).json(caseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single case
router.get('/:id', auth, async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id)
      .populate('attorney', 'firstName lastName')
      .populate('caseManager', 'firstName lastName')
      .populate('documents.uploadedBy', 'firstName lastName')
      .populate('notes.createdBy', 'firstName lastName');
    
    if (!caseData) {
      return res.status(404).json({ message: 'Case not found' });
    }

    res.json(caseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update case
router.put('/:id', auth, async (req, res) => {
  try {
    const caseData = await Case.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('attorney', 'firstName lastName')
     .populate('caseManager', 'firstName lastName');
    
    if (!caseData) {
      return res.status(404).json({ message: 'Case not found' });
    }

    res.json(caseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload document
router.post('/:id/documents', auth, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const caseData = await Case.findById(req.params.id);
    if (!caseData) {
      return res.status(404).json({ message: 'Case not found' });
    }

    const document = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user._id,
      category: req.body.category || 'other'
    };

    caseData.documents.push(document);
    await caseData.save();
    await caseData.populate('documents.uploadedBy', 'firstName lastName');
    
    res.json(caseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add important date
router.post('/:id/dates', [
  auth,
  body('title').trim().notEmpty(),
  body('date').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const caseData = await Case.findById(req.params.id);
    if (!caseData) {
      return res.status(404).json({ message: 'Case not found' });
    }

    caseData.importantDates.push(req.body);
    await caseData.save();
    
    res.json(caseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add note to case
router.post('/:id/notes', [
  auth,
  body('content').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const caseData = await Case.findById(req.params.id);
    if (!caseData) {
      return res.status(404).json({ message: 'Case not found' });
    }

    caseData.notes.push({
      content: req.body.content,
      createdBy: req.user._id
    });

    await caseData.save();
    await caseData.populate('notes.createdBy', 'firstName lastName');
    
    res.json(caseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;