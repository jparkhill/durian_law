import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Download, Assessment, TableChart, PieChart } from '@mui/icons-material';
import { reportService } from '../services/reportService';

const Reports = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    caseType: '',
    paymentMethod: ''
  });

  const caseTypes = [
    { value: '', label: 'All Types' },
    { value: 'personal_injury', label: 'Personal Injury' },
    { value: 'criminal_defense', label: 'Criminal Defense' },
    { value: 'family_law', label: 'Family Law' },
    { value: 'business_law', label: 'Business Law' },
    { value: 'estate_planning', label: 'Estate Planning' },
    { value: 'immigration', label: 'Immigration' },
    { value: 'other', label: 'Other' }
  ];

  const caseStatuses = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'closed', label: 'Closed' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'pending', label: 'Pending' }
  ];

  const paymentMethods = [
    { value: '', label: 'All Methods' },
    { value: 'square', label: 'Square' },
    { value: 'cash', label: 'Cash' },
    { value: 'check', label: 'Check' },
    { value: 'bank_transfer', label: 'Bank Transfer' }
  ];

  const handleExport = async (type) => {
    try {
      let blob;
      let filename;

      switch (type) {
        case 'cases':
          blob = await reportService.exportCases(filters);
          filename = 'cases-export.xlsx';
          break;
        case 'payments':
          blob = await reportService.exportPayments(filters);
          filename = 'payments-export.xlsx';
          break;
        case 'leads':
          blob = await reportService.exportLeads(filters);
          filename = 'leads-export.xlsx';
          break;
        default:
          return;
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const ReportCard = ({ title, description, icon, onExport, exportType }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          startIcon={<Download />}
          onClick={() => onExport(exportType)}
        >
          Export to Excel
        </Button>
      </CardActions>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reports & Analytics
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Export Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="End Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Case Type</InputLabel>
              <Select
                value={filters.caseType}
                label="Case Type"
                onChange={(e) => setFilters({ ...filters, caseType: e.target.value })}
              >
                {caseTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                {caseStatuses.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <ReportCard
            title="Cases Report"
            description="Export all case data including client information, status, billing details, and case timeline."
            icon={<Assessment color="primary" />}
            onExport={handleExport}
            exportType="cases"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <ReportCard
            title="Payments Report"
            description="Export payment history with transaction details, methods, and case associations."
            icon={<TableChart color="secondary" />}
            onExport={handleExport}
            exportType="payments"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <ReportCard
            title="Leads Report"
            description="Export lead information including contact details, sources, and conversion status."
            icon={<PieChart color="success" />}
            onExport={handleExport}
            exportType="leads"
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Available Report Features
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" paragraph>
            • <strong>Excel Export:</strong> All reports are exported in Excel format (.xlsx) for easy analysis
          </Typography>
          <Typography variant="body1" paragraph>
            • <strong>Date Filtering:</strong> Filter reports by date range to analyze specific time periods
          </Typography>
          <Typography variant="body1" paragraph>
            • <strong>Status Filtering:</strong> Filter by case status, payment status, or lead status
          </Typography>
          <Typography variant="body1" paragraph>
            • <strong>Case Type Analysis:</strong> Break down data by different practice areas
          </Typography>
          <Typography variant="body1" paragraph>
            • <strong>Financial Reports:</strong> Track payments, outstanding balances, and revenue
          </Typography>
          <Typography variant="body1" paragraph>
            • <strong>Lead Conversion:</strong> Monitor lead sources and conversion rates
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Reports;