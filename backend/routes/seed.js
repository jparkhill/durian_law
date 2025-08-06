const express = require('express');
const Case = require('../models/Case');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Sample data for generating random cases
const caseTypes = ['personal_injury', 'criminal_defense', 'family_law', 'business_law', 'estate_planning', 'immigration'];
const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Jennifer', 'William', 'Amanda', 'Christopher', 'Emily', 'Daniel', 'Jessica', 'Matthew', 'Ashley', 'Anthony', 'Melissa', 'Mark', 'Michelle', 'Steven', 'Kimberly', 'Paul', 'Amy', 'Andrew', 'Angela', 'Joshua', 'Helen', 'Kenneth', 'Deborah'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];
const streets = ['Main St', 'Oak Ave', 'Pine Rd', 'Maple Dr', 'Cedar Ln', 'Elm St', 'Park Ave', 'First St', 'Second St', 'Third St', 'Washington St', 'Lincoln Ave', 'Madison Dr', 'Jefferson Rd', 'Adams St'];
const cities = ['Springfield', 'Franklin', 'Georgetown', 'Bristol', 'Clinton', 'Fairview', 'Kingston', 'Salem', 'Troy', 'Madison', 'Chester', 'Greenville', 'Dover', 'Oxford', 'Newton'];
const states = ['CA', 'TX', 'FL', 'NY', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI', 'NJ', 'VA', 'WA', 'AZ', 'MA'];

const caseDescriptions = {
  personal_injury: [
    'Motor vehicle accident resulting in back and neck injuries',
    'Slip and fall incident at retail establishment',
    'Workplace injury involving machinery malfunction',
    'Dog bite incident requiring medical treatment',
    'Construction site accident with multiple injuries'
  ],
  criminal_defense: [
    'DUI charges requiring legal representation',
    'Assault charges following altercation',
    'Drug possession charges needing defense',
    'Theft charges requiring court representation',
    'Domestic violence charges needing legal counsel'
  ],
  family_law: [
    'Divorce proceedings with child custody issues',
    'Child support modification request',
    'Adoption proceedings for minor child',
    'Restraining order application',
    'Prenuptial agreement preparation'
  ],
  business_law: [
    'Contract dispute between business partners',
    'Employment discrimination lawsuit',
    'Business formation and incorporation',
    'Intellectual property protection matter',
    'Commercial lease negotiation'
  ],
  estate_planning: [
    'Will preparation and estate planning',
    'Trust establishment for family assets',
    'Probate administration following death',
    'Power of attorney document preparation',
    'Estate tax planning consultation'
  ],
  immigration: [
    'Citizenship application processing',
    'Green card renewal and status adjustment',
    'Deportation defense proceedings',
    'Family reunification visa application',
    'Work visa application and processing'
  ]
};

const importantDateTypes = {
  personal_injury: [
    { type: 'court_date', titles: ['Mediation Hearing', 'Deposition', 'Settlement Conference', 'Trial Date'] },
    { type: 'deadline', titles: ['Discovery Deadline', 'Expert Witness Disclosure', 'Summary Judgment Motion Due', 'Medical Records Review'] },
    { type: 'meeting', titles: ['Client Consultation', 'Insurance Adjuster Meeting', 'Medical Examination', 'Witness Interview'] }
  ],
  criminal_defense: [
    { type: 'court_date', titles: ['Arraignment', 'Preliminary Hearing', 'Plea Hearing', 'Trial Date', 'Sentencing'] },
    { type: 'deadline', titles: ['Discovery Response Due', 'Motion Filing Deadline', 'Plea Negotiation Deadline'] },
    { type: 'meeting', titles: ['Client Meeting', 'Prosecutor Conference', 'Witness Prep Session'] }
  ],
  family_law: [
    { type: 'court_date', titles: ['Custody Hearing', 'Divorce Hearing', 'Support Modification Hearing'] },
    { type: 'deadline', titles: ['Financial Disclosure Due', 'Child Support Calculation', 'Asset Division Proposal'] },
    { type: 'meeting', titles: ['Mediation Session', 'Parenting Plan Discussion', 'Asset Valuation Meeting'] }
  ],
  business_law: [
    { type: 'court_date', titles: ['Contract Dispute Hearing', 'Employment Tribunal', 'Arbitration Hearing'] },
    { type: 'deadline', titles: ['Contract Review Deadline', 'Filing Deadline', 'Compliance Report Due'] },
    { type: 'meeting', titles: ['Board Meeting', 'Contract Negotiation', 'Compliance Review'] }
  ],
  estate_planning: [
    { type: 'deadline', titles: ['Will Review Due', 'Trust Document Filing', 'Probate Filing Deadline'] },
    { type: 'meeting', titles: ['Estate Planning Consultation', 'Family Asset Review', 'Trust Meeting'] }
  ],
  immigration: [
    { type: 'court_date', titles: ['Immigration Hearing', 'Asylum Hearing', 'Citizenship Interview'] },
    { type: 'deadline', titles: ['Application Filing Deadline', 'Document Submission Due', 'Response Deadline'] },
    { type: 'meeting', titles: ['USCIS Interview', 'Document Review', 'Status Update Meeting'] }
  ]
};

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateRandomCase(attorneys, caseManagers) {
  const caseType = getRandomElement(caseTypes);
  const firstName = getRandomElement(firstNames);
  const lastName = getRandomElement(lastNames);
  const street = `${Math.floor(Math.random() * 9999) + 1} ${getRandomElement(streets)}`;
  const city = getRandomElement(cities);
  const state = getRandomElement(states);
  
  return {
    clientName: `${firstName} ${lastName}`,
    clientEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
    clientPhone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    clientAddress: {
      street: street,
      city: city,
      state: state,
      zipCode: `${Math.floor(Math.random() * 90000) + 10000}`
    },
    caseType: caseType,
    description: getRandomElement(caseDescriptions[caseType]),
    attorney: getRandomElement(attorneys)._id,
    caseManager: Math.random() > 0.5 ? getRandomElement(caseManagers)._id : null,
    billingRate: (Math.floor(Math.random() * 200) + 150) * 5, // $150-$350 per hour in $5 increments
    totalBilled: Math.floor(Math.random() * 10000) + 1000,
    totalPaid: Math.floor(Math.random() * 8000) + 500
  };
}

function generateImportantDates(caseType) {
  const today = new Date();
  const threeMonthsFromNow = new Date(today.getTime() + (90 * 24 * 60 * 60 * 1000));
  const dates = [];
  const numDates = Math.floor(Math.random() * 4) + 1; // 1-4 dates per case
  
  const dateOptions = importantDateTypes[caseType] || importantDateTypes.business_law;
  
  for (let i = 0; i < numDates; i++) {
    const option = getRandomElement(dateOptions);
    const title = getRandomElement(option.titles);
    const date = getRandomDate(today, threeMonthsFromNow);
    
    dates.push({
      title: title,
      date: date,
      description: `${title} scheduled for case`,
      type: option.type
    });
  }
  
  return dates;
}

// Seed database with sample cases
router.post('/cases', adminAuth, async (req, res) => {
  try {
    const { count = 300 } = req.body;
    
    // Get all attorneys and case managers
    const attorneys = await User.find({ role: 'attorney', isActive: true });
    const caseManagers = await User.find({ role: 'case_manager', isActive: true });
    
    if (attorneys.length === 0) {
      return res.status(400).json({ message: 'No attorneys found. Please create attorneys first.' });
    }
    
    if (caseManagers.length === 0) {
      return res.status(400).json({ message: 'No case managers found. Please create case managers first.' });
    }
    
    // Clear existing cases
    await Case.deleteMany({});
    
    const cases = [];
    const batchSize = 50; // Process in smaller batches
    
    for (let batch = 0; batch < Math.ceil(count / batchSize); batch++) {
      const batchStart = batch * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, count);
      
      for (let i = batchStart; i < batchEnd; i++) {
        try {
          const caseData = generateRandomCase(attorneys, caseManagers);
          
          // Manually set case number to avoid validation issues
          caseData.caseNumber = `CASE-${String(i + 1).padStart(6, '0')}`;
          
          // Generate important dates
          const importantDates = generateImportantDates(caseData.caseType);
          caseData.importantDates = importantDates;
          
          const newCase = new Case(caseData);
          await newCase.save();
          cases.push(newCase);
        } catch (error) {
          console.error(`Error creating case ${i + 1}:`, error.message);
        }
      }
      
      // Small delay between batches to avoid overwhelming the database
      if (batch < Math.ceil(count / batchSize) - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    res.json({ 
      message: `Successfully created ${count} sample cases`,
      casesCreated: cases.length,
      attorneys: attorneys.length,
      caseManagers: caseManagers.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to seed cases' });
  }
});

module.exports = router;