const express = require('express');
const Case = require('../models/Case');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get today's action items for a user
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Query for cases where the user is either attorney or case manager
    const query = {
      $or: [
        { attorney: req.user._id },
        { caseManager: req.user._id }
      ],
      'importantDates.date': {
        $gte: startOfDay,
        $lt: endOfDay
      }
    };

    const cases = await Case.find(query)
      .populate('attorney', 'firstName lastName')
      .populate('caseManager', 'firstName lastName')
      .sort({ 'importantDates.date': 1 });

    // Extract today's action items from all cases
    const actionItems = [];
    cases.forEach(caseData => {
      caseData.importantDates.forEach(date => {
        const dateObj = new Date(date.date);
        if (dateObj >= startOfDay && dateObj < endOfDay) {
          actionItems.push({
            id: `${caseData._id}-${date._id}`,
            caseId: caseData._id,
            caseNumber: caseData.caseNumber,
            clientName: caseData.clientName,
            caseType: caseData.caseType,
            title: date.title,
            description: date.description,
            type: date.type,
            date: date.date,
            time: dateObj.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            })
          });
        }
      });
    });

    // Sort by time
    actionItems.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      date: today.toISOString().split('T')[0],
      dayOfWeek: today.toLocaleDateString('en-US', { weekday: 'long' }),
      actionItems,
      total: actionItems.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get action items for a specific date
router.get('/date/:date', auth, async (req, res) => {
  try {
    const targetDate = new Date(req.params.date);
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);

    // Query for cases where the user is either attorney or case manager
    const query = {
      $or: [
        { attorney: req.user._id },
        { caseManager: req.user._id }
      ],
      'importantDates.date': {
        $gte: startOfDay,
        $lt: endOfDay
      }
    };

    const cases = await Case.find(query)
      .populate('attorney', 'firstName lastName')
      .populate('caseManager', 'firstName lastName')
      .sort({ 'importantDates.date': 1 });

    // Extract action items for the specified date
    const actionItems = [];
    cases.forEach(caseData => {
      caseData.importantDates.forEach(date => {
        const dateObj = new Date(date.date);
        if (dateObj >= startOfDay && dateObj < endOfDay) {
          actionItems.push({
            id: `${caseData._id}-${date._id}`,
            caseId: caseData._id,
            caseNumber: caseData.caseNumber,
            clientName: caseData.clientName,
            caseType: caseData.caseType,
            title: date.title,
            description: date.description,
            type: date.type,
            date: date.date,
            time: dateObj.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            })
          });
        }
      });
    });

    // Sort by time
    actionItems.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      date: req.params.date,
      dayOfWeek: targetDate.toLocaleDateString('en-US', { weekday: 'long' }),
      actionItems,
      total: actionItems.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get weekly calendar view
router.get('/week/:date', auth, async (req, res) => {
  try {
    const startDate = new Date(req.params.date);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7);

    // Query for cases where the user is either attorney or case manager
    const query = {
      $or: [
        { attorney: req.user._id },
        { caseManager: req.user._id }
      ],
      'importantDates.date': {
        $gte: startDate,
        $lt: endDate
      }
    };

    const cases = await Case.find(query)
      .populate('attorney', 'firstName lastName')
      .populate('caseManager', 'firstName lastName')
      .sort({ 'importantDates.date': 1 });

    // Group action items by date
    const weekData = {};
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateKey = currentDate.toISOString().split('T')[0];
      weekData[dateKey] = {
        date: dateKey,
        dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
        actionItems: []
      };
    }

    // Populate action items
    cases.forEach(caseData => {
      caseData.importantDates.forEach(date => {
        const dateObj = new Date(date.date);
        const dateKey = dateObj.toISOString().split('T')[0];
        
        if (weekData[dateKey]) {
          weekData[dateKey].actionItems.push({
            id: `${caseData._id}-${date._id}`,
            caseId: caseData._id,
            caseNumber: caseData.caseNumber,
            clientName: caseData.clientName,
            caseType: caseData.caseType,
            title: date.title,
            description: date.description,
            type: date.type,
            date: date.date,
            time: dateObj.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            })
          });
        }
      });
    });

    // Sort action items within each day
    Object.keys(weekData).forEach(dateKey => {
      weekData[dateKey].actionItems.sort((a, b) => new Date(a.date) - new Date(b.date));
    });

    res.json({
      weekStart: startDate.toISOString().split('T')[0],
      weekEnd: endDate.toISOString().split('T')[0],
      days: Object.values(weekData)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;