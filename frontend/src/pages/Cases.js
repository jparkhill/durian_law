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
  Pagination
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { caseService } from '../services/caseService';

const Cases = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    caseType: '',
    description: '',
    clientAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });

  const caseTypes = [
    { value: 'personal_injury', label: 'Personal Injury' },
    { value: 'criminal_defense', label: 'Criminal Defense' },
    { value: 'family_law', label: 'Family Law' },
    { value: 'business_law', label: 'Business Law' },
    { value: 'estate_planning', label: 'Estate Planning' },
    { value: 'immigration', label: 'Immigration' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    loadCases();
  }, [page]);

  const loadCases = async () => {
    try {
      const data = await caseService.getCases({ page, limit: 10 });
      setCases(data.cases);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to load cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await caseService.createCase(formData);
      setOpen(false);
      setFormData({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        caseType: '',
        description: '',
        clientAddress: {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        }
      });
      loadCases();
    } catch (error) {
      console.error('Failed to create case:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      closed: 'default',
      on_hold: 'warning',
      pending: 'info'
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return <Typography>Loading cases...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Case Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
        >
          Add New Case
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Case Number</TableCell>
              <TableCell>Client Name</TableCell>
              <TableCell>Case Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Attorney</TableCell>
              <TableCell>Total Billed</TableCell>
              <TableCell>Total Paid</TableCell>
              <TableCell>Created Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cases.map((caseData) => (
              <TableRow
                key={caseData._id}
                onClick={() => navigate(`/cases/${caseData._id}`)}
                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'grey.50' } }}
              >
                <TableCell>{caseData.caseNumber}</TableCell>
                <TableCell>{caseData.clientName}</TableCell>
                <TableCell>
                  {caseTypes.find(type => type.value === caseData.caseType)?.label || caseData.caseType}
                </TableCell>
                <TableCell>
                  <Chip
                    label={caseData.status}
                    color={getStatusColor(caseData.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {caseData.attorney ? `${caseData.attorney.firstName} ${caseData.attorney.lastName}` : 'Unassigned'}
                </TableCell>
                <TableCell>${caseData.totalBilled || 0}</TableCell>
                <TableCell>${caseData.totalPaid || 0}</TableCell>
                <TableCell>
                  {new Date(caseData.createdAt).toLocaleDateString()}
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

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Add New Case</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
              <TextField
                label="Client Name"
                fullWidth
                variant="outlined"
                required
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              />
              <TextField
                label="Client Email"
                type="email"
                fullWidth
                variant="outlined"
                required
                value={formData.clientEmail}
                onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
              />
              <TextField
                label="Client Phone"
                fullWidth
                variant="outlined"
                required
                value={formData.clientPhone}
                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Case Type</InputLabel>
                <Select
                  value={formData.caseType}
                  label="Case Type"
                  onChange={(e) => setFormData({ ...formData, caseType: e.target.value })}
                  required
                >
                  {caseTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Client Address</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Street Address"
                fullWidth
                variant="outlined"
                value={formData.clientAddress.street}
                onChange={(e) => setFormData({
                  ...formData,
                  clientAddress: { ...formData.clientAddress, street: e.target.value }
                })}
                sx={{ gridColumn: '1 / -1' }}
              />
              <TextField
                label="City"
                fullWidth
                variant="outlined"
                value={formData.clientAddress.city}
                onChange={(e) => setFormData({
                  ...formData,
                  clientAddress: { ...formData.clientAddress, city: e.target.value }
                })}
              />
              <TextField
                label="State"
                fullWidth
                variant="outlined"
                value={formData.clientAddress.state}
                onChange={(e) => setFormData({
                  ...formData,
                  clientAddress: { ...formData.clientAddress, state: e.target.value }
                })}
              />
              <TextField
                label="ZIP Code"
                fullWidth
                variant="outlined"
                value={formData.clientAddress.zipCode}
                onChange={(e) => setFormData({
                  ...formData,
                  clientAddress: { ...formData.clientAddress, zipCode: e.target.value }
                })}
              />
            </Box>
            
            <TextField
              label="Case Description"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create Case</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Cases;