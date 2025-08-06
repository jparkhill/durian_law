const express = require('express');
const XLSX = require('xlsx');
const Payment = require('../models/Payment');
const Case = require('../models/Case');
const Lead = require('../models/Lead');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Export cases to Excel
router.get('/cases/export', auth, async (req, res) => {
  try {
    const { status, caseType, startDate, endDate } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (caseType) query.caseType = caseType;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const cases = await Case.find(query)
      .populate('attorney', 'firstName lastName')
      .populate('caseManager', 'firstName lastName')
      .sort({ createdAt: -1 });

    const exportData = cases.map(caseData => ({
      'Case Number': caseData.caseNumber,
      'Client Name': caseData.clientName,
      'Client Email': caseData.clientEmail,
      'Client Phone': caseData.clientPhone,
      'Case Type': caseData.caseType,
      'Status': caseData.status,
      'Attorney': caseData.attorney ? `${caseData.attorney.firstName} ${caseData.attorney.lastName}` : '',
      'Case Manager': caseData.caseManager ? `${caseData.caseManager.firstName} ${caseData.caseManager.lastName}` : '',
      'Total Billed': caseData.totalBilled,
      'Total Paid': caseData.totalPaid,
      'Balance': caseData.totalBilled - caseData.totalPaid,
      'Created Date': caseData.createdAt.toISOString().split('T')[0]
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cases');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=cases-export.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Export failed' });
  }
});

// Export payments to Excel
router.get('/payments/export', auth, async (req, res) => {
  try {
    const { status, paymentMethod, startDate, endDate } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const payments = await Payment.find(query)
      .populate('caseId', 'caseNumber clientName')
      .populate('processedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    const exportData = payments.map(payment => ({
      'Receipt Number': payment.receiptNumber,
      'Case Number': payment.caseId ? payment.caseId.caseNumber : '',
      'Client Name': payment.caseId ? payment.caseId.clientName : '',
      'Amount': payment.amount,
      'Payment Method': payment.paymentMethod,
      'Paid By': payment.paidBy,
      'Status': payment.status,
      'Description': payment.description,
      'Processed By': payment.processedBy ? `${payment.processedBy.firstName} ${payment.processedBy.lastName}` : '',
      'Payment Date': payment.createdAt.toISOString().split('T')[0]
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=payments-export.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Export failed' });
  }
});

// Export leads to Excel
router.get('/leads/export', auth, async (req, res) => {
  try {
    const { status, caseType, startDate, endDate } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (caseType) query.caseType = caseType;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const leads = await Lead.find(query)
      .populate('assignedTo', 'firstName lastName')
      .sort({ createdAt: -1 });

    const exportData = leads.map(lead => ({
      'Name': lead.name,
      'Email': lead.email,
      'Phone': lead.phone,
      'Case Type': lead.caseType,
      'Status': lead.status,
      'Source': lead.source,
      'Assigned To': lead.assignedTo ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}` : '',
      'Follow Up Date': lead.followUpDate ? lead.followUpDate.toISOString().split('T')[0] : '',
      'Created Date': lead.createdAt.toISOString().split('T')[0]
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=leads-export.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Export failed' });
  }
});

// Dashboard statistics
router.get('/dashboard', auth, async (req, res) => {
  try {
    const [
      totalCases,
      activeCases,
      totalLeads,
      totalPayments,
      recentPayments
    ] = await Promise.all([
      Case.countDocuments(),
      Case.countDocuments({ status: 'active' }),
      Lead.countDocuments(),
      Payment.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.find()
        .populate('caseId', 'caseNumber clientName')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    const totalRevenue = totalPayments.length > 0 ? totalPayments[0].total : 0;

    res.json({
      totalCases,
      activeCases,
      totalLeads,
      totalRevenue,
      recentPayments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;