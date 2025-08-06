import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { Add, Payment } from '@mui/icons-material';
import { billingService } from '../services/billingService';
import { caseService } from '../services/caseService';

const Billing = () => {
  const [payments, setPayments] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    caseId: '',
    amount: '',
    paymentMethod: 'cash',
    description: '',
    paidBy: '',
    notes: ''
  });

  const paymentMethods = [
    { value: 'square', label: 'Square (Credit Card)' },
    { value: 'cash', label: 'Cash' },
    { value: 'check', label: 'Check' },
    { value: 'bank_transfer', label: 'Bank Transfer' }
  ];

  useEffect(() => {
    loadPayments();
    loadCases();
  }, [page]);

  const loadPayments = async () => {
    try {
      const data = await billingService.getPayments({ page, limit: 10 });
      setPayments(data.payments);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCases = async () => {
    try {
      const data = await caseService.getCases({ limit: 100 });
      setCases(data.cases);
    } catch (error) {
      console.error('Failed to load cases:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const paymentData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      if (formData.paymentMethod === 'square') {
        // In a real implementation, you would integrate with Square's Web Payments SDK
        // For now, we'll just show that it would process a Square payment
        alert('Square payment integration would be implemented here with Square Web Payments SDK');
        return;
      } else {
        await billingService.recordManualPayment(paymentData);
      }

      setOpen(false);
      setFormData({
        caseId: '',
        amount: '',
        paymentMethod: 'cash',
        description: '',
        paidBy: '',
        notes: ''
      });
      loadPayments();
    } catch (error) {
      console.error('Failed to process payment:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'success',
      pending: 'warning',
      failed: 'error',
      refunded: 'default'
    };
    return colors[status] || 'default';
  };

  const getMethodColor = (method) => {
    const colors = {
      square: 'primary',
      cash: 'success',
      check: 'info',
      bank_transfer: 'secondary'
    };
    return colors[method] || 'default';
  };

  if (loading) {
    return <Typography>Loading payments...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Billing & Payments</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
        >
          Record Payment
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Payments
              </Typography>
              <Typography variant="h5">
                {payments.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h5">
                ${payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Receipt #</TableCell>
              <TableCell>Case</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Paid By</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment._id}>
                <TableCell>{payment.receiptNumber}</TableCell>
                <TableCell>{payment.caseId?.caseNumber || 'N/A'}</TableCell>
                <TableCell>{payment.caseId?.clientName || 'N/A'}</TableCell>
                <TableCell>${payment.amount}</TableCell>
                <TableCell>
                  <Chip
                    label={payment.paymentMethod}
                    color={getMethodColor(payment.paymentMethod)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{payment.paidBy}</TableCell>
                <TableCell>
                  <Chip
                    label={payment.status}
                    color={getStatusColor(payment.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(payment.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
          />
        </Box>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
              <InputLabel>Case</InputLabel>
              <Select
                value={formData.caseId}
                label="Case"
                onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
                required
              >
                {cases.map((caseData) => (
                  <MenuItem key={caseData._id} value={caseData._id}>
                    {caseData.caseNumber} - {caseData.clientName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Amount"
              type="number"
              fullWidth
              variant="outlined"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              sx={{ mb: 2 }}
              inputProps={{ min: "0", step: "0.01" }}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={formData.paymentMethod}
                label="Payment Method"
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              >
                {paymentMethods.map((method) => (
                  <MenuItem key={method.value} value={method.value}>
                    {method.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Paid By"
              fullWidth
              variant="outlined"
              required
              value={formData.paidBy}
              onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
              sx={{ mb: 2 }}
            />
            
            <TextField
              label="Description"
              fullWidth
              variant="outlined"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            
            <TextField
              label="Notes"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" startIcon={<Payment />}>
              Record Payment
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Billing;