import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tab,
  Tabs,
  Card,
  CardContent
} from '@mui/material';
import {
  Upload,
  Event,
  Note,
  AttachFile
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { caseService } from '../services/caseService';

const CaseDetail = () => {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [openUpload, setOpenUpload] = useState(false);
  const [openDate, setOpenDate] = useState(false);
  const [openNote, setOpenNote] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentCategory, setDocumentCategory] = useState('other');
  const [dateForm, setDateForm] = useState({
    title: '',
    date: dayjs(),
    description: '',
    type: 'other'
  });
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    loadCase();
  }, [id]);

  const loadCase = async () => {
    try {
      const data = await caseService.getCase(id);
      setCaseData(data);
    } catch (error) {
      console.error('Failed to load case:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('category', documentCategory);

    try {
      await caseService.uploadDocument(id, formData);
      setOpenUpload(false);
      setSelectedFile(null);
      setDocumentCategory('other');
      loadCase();
    } catch (error) {
      console.error('Failed to upload document:', error);
    }
  };

  const handleAddDate = async (e) => {
    e.preventDefault();
    try {
      await caseService.addImportantDate(id, {
        ...dateForm,
        date: dateForm.date.toISOString()
      });
      setOpenDate(false);
      setDateForm({
        title: '',
        date: dayjs(),
        description: '',
        type: 'other'
      });
      loadCase();
    } catch (error) {
      console.error('Failed to add important date:', error);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    try {
      await caseService.addNote(id, noteContent);
      setOpenNote(false);
      setNoteContent('');
      loadCase();
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  if (loading) {
    return <Typography>Loading case details...</Typography>;
  }

  if (!caseData) {
    return <Typography>Case not found</Typography>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Case #{caseData.caseNumber}</Typography>
          <Chip
            label={caseData.status}
            color={caseData.status === 'active' ? 'success' : 'default'}
          />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label="Overview" />
                <Tab label="Documents" />
                <Tab label="Calendar" />
                <Tab label="Notes" />
              </Tabs>

              {tabValue === 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>Client Information</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography><strong>Name:</strong> {caseData.clientName}</Typography>
                      <Typography><strong>Email:</strong> {caseData.clientEmail}</Typography>
                      <Typography><strong>Phone:</strong> {caseData.clientPhone}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography><strong>Case Type:</strong> {caseData.caseType}</Typography>
                      <Typography><strong>Attorney:</strong> {caseData.attorney ? `${caseData.attorney.firstName} ${caseData.attorney.lastName}` : 'Unassigned'}</Typography>
                      <Typography><strong>Case Manager:</strong> {caseData.caseManager ? `${caseData.caseManager.firstName} ${caseData.caseManager.lastName}` : 'Unassigned'}</Typography>
                    </Grid>
                  </Grid>
                  
                  <Typography variant="h6" sx={{ mt: 3 }} gutterBottom>Description</Typography>
                  <Typography>{caseData.description}</Typography>
                </Box>
              )}

              {tabValue === 1 && (
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Documents</Typography>
                    <Button
                      variant="contained"
                      startIcon={<Upload />}
                      onClick={() => setOpenUpload(true)}
                    >
                      Upload Document
                    </Button>
                  </Box>
                  <List>
                    {caseData.documents?.map((doc) => (
                      <ListItem key={doc._id} divider>
                        <AttachFile sx={{ mr: 2 }} />
                        <ListItemText
                          primary={doc.originalName}
                          secondary={`${doc.category} - Uploaded by ${doc.uploadedBy?.firstName} ${doc.uploadedBy?.lastName} on ${new Date(doc.uploadedAt).toLocaleDateString()}`}
                        />
                      </ListItem>
                    ))}
                    {!caseData.documents?.length && (
                      <ListItem>
                        <ListItemText primary="No documents uploaded yet" />
                      </ListItem>
                    )}
                  </List>
                </Box>
              )}

              {tabValue === 2 && (
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Important Dates</Typography>
                    <Button
                      variant="contained"
                      startIcon={<Event />}
                      onClick={() => setOpenDate(true)}
                    >
                      Add Date
                    </Button>
                  </Box>
                  <List>
                    {caseData.importantDates?.map((date, index) => (
                      <ListItem key={index} divider>
                        <ListItemText
                          primary={date.title}
                          secondary={`${new Date(date.date).toLocaleDateString()} - ${date.description}`}
                        />
                        <Chip label={date.type} size="small" />
                      </ListItem>
                    ))}
                    {!caseData.importantDates?.length && (
                      <ListItem>
                        <ListItemText primary="No important dates added yet" />
                      </ListItem>
                    )}
                  </List>
                </Box>
              )}

              {tabValue === 3 && (
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Notes</Typography>
                    <Button
                      variant="contained"
                      startIcon={<Note />}
                      onClick={() => setOpenNote(true)}
                    >
                      Add Note
                    </Button>
                  </Box>
                  <List>
                    {caseData.notes?.map((note) => (
                      <ListItem key={note._id} divider>
                        <ListItemText
                          primary={note.content}
                          secondary={`By ${note.createdBy?.firstName} ${note.createdBy?.lastName} on ${new Date(note.createdAt).toLocaleDateString()}`}
                        />
                      </ListItem>
                    ))}
                    {!caseData.notes?.length && (
                      <ListItem>
                        <ListItemText primary="No notes added yet" />
                      </ListItem>
                    )}
                  </List>
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Billing Summary</Typography>
                <Typography>Total Billed: ${caseData.totalBilled || 0}</Typography>
                <Typography>Total Paid: ${caseData.totalPaid || 0}</Typography>
                <Typography>Balance: ${(caseData.totalBilled || 0) - (caseData.totalPaid || 0)}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Upload Document Dialog */}
        <Dialog open={openUpload} onClose={() => setOpenUpload(false)}>
          <form onSubmit={handleFileUpload}>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogContent>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                style={{ margin: '16px 0' }}
              />
              <TextField
                select
                label="Category"
                fullWidth
                value={documentCategory}
                onChange={(e) => setDocumentCategory(e.target.value)}
                margin="normal"
              >
                <option value="contract">Contract</option>
                <option value="evidence">Evidence</option>
                <option value="correspondence">Correspondence</option>
                <option value="court_filing">Court Filing</option>
                <option value="other">Other</option>
              </TextField>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenUpload(false)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={!selectedFile}>
                Upload
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Add Important Date Dialog */}
        <Dialog open={openDate} onClose={() => setOpenDate(false)}>
          <form onSubmit={handleAddDate}>
            <DialogTitle>Add Important Date</DialogTitle>
            <DialogContent>
              <TextField
                label="Title"
                fullWidth
                margin="normal"
                required
                value={dateForm.title}
                onChange={(e) => setDateForm({ ...dateForm, title: e.target.value })}
              />
              <DateTimePicker
                label="Date and Time"
                value={dateForm.date}
                onChange={(newValue) => setDateForm({ ...dateForm, date: newValue })}
                sx={{ width: '100%', mt: 2 }}
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                margin="normal"
                value={dateForm.description}
                onChange={(e) => setDateForm({ ...dateForm, description: e.target.value })}
              />
              <TextField
                select
                label="Type"
                fullWidth
                margin="normal"
                value={dateForm.type}
                onChange={(e) => setDateForm({ ...dateForm, type: e.target.value })}
              >
                <option value="court_date">Court Date</option>
                <option value="deadline">Deadline</option>
                <option value="meeting">Meeting</option>
                <option value="other">Other</option>
              </TextField>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDate(false)}>Cancel</Button>
              <Button type="submit" variant="contained">Add Date</Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Add Note Dialog */}
        <Dialog open={openNote} onClose={() => setOpenNote(false)}>
          <form onSubmit={handleAddNote}>
            <DialogTitle>Add Note</DialogTitle>
            <DialogContent>
              <TextField
                label="Note"
                fullWidth
                multiline
                rows={4}
                margin="normal"
                required
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenNote(false)}>Cancel</Button>
              <Button type="submit" variant="contained">Add Note</Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default CaseDetail;