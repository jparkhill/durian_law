import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton
} from '@mui/material';
import {
  Event,
  Gavel,
  Schedule,
  Person,
  NavigateBefore,
  NavigateNext,
  Today
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { calendarService } from '../services/calendarService';

const Calendar = () => {
  const navigate = useNavigate();
  const [todayItems, setTodayItems] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [weekData, setWeekData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodayItems();
    loadWeekData();
  }, []);

  const loadTodayItems = async () => {
    try {
      const data = await calendarService.getTodayItems();
      setTodayItems(data.actionItems || []);
    } catch (error) {
      console.error('Failed to load today items:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWeekData = async () => {
    try {
      const startOfWeek = getStartOfWeek(new Date());
      const data = await calendarService.getWeekItems(startOfWeek.toISOString().split('T')[0]);
      setWeekData(data);
    } catch (error) {
      console.error('Failed to load week data:', error);
    }
  };

  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'court_date':
        return <Gavel color="error" />;
      case 'deadline':
        return <Schedule color="warning" />;
      case 'meeting':
        return <Person color="info" />;
      default:
        return <Event color="primary" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'court_date':
        return 'error';
      case 'deadline':
        return 'warning';
      case 'meeting':
        return 'info';
      default:
        return 'primary';
    }
  };

  const getCaseTypeColor = (caseType) => {
    const colors = {
      personal_injury: 'primary',
      criminal_defense: 'error',
      family_law: 'secondary',
      business_law: 'info',
      estate_planning: 'success',
      immigration: 'warning'
    };
    return colors[caseType] || 'default';
  };

  const formatCaseType = (caseType) => {
    return caseType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return <Typography>Loading calendar...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Calendar & Action Items</Typography>
        <Button
          variant="outlined"
          startIcon={<Today />}
          onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
        >
          Today
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Today's Action Items */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Action Items ({todayItems.length})
              </Typography>
              {todayItems.length > 0 ? (
                <List>
                  {todayItems.map((item) => (
                    <ListItem
                      key={item.id}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'grey.50' },
                        border: '1px solid',
                        borderColor: 'grey.200',
                        borderRadius: 1,
                        mb: 1
                      }}
                      onClick={() => navigate(`/cases/${item.caseId}`)}
                    >
                      <ListItemIcon>
                        {getTypeIcon(item.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" component="span">
                              {item.title}
                            </Typography>
                            <Chip
                              label={item.type.replace('_', ' ')}
                              color={getTypeColor(item.type)}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.primary">
                              {item.caseNumber} - {item.clientName}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                {item.time}
                              </Typography>
                              <Chip
                                label={formatCaseType(item.caseType)}
                                color={getCaseTypeColor(item.caseType)}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                            {item.description && (
                              <Typography variant="body2" color="text.secondary">
                                {item.description}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" sx={{ py: 2 }}>
                  No action items scheduled for today
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Weekly Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  Weekly Overview
                </Typography>
                <Box>
                  <IconButton onClick={() => {/* Previous week logic */}}>
                    <NavigateBefore />
                  </IconButton>
                  <IconButton onClick={() => {/* Next week logic */}}>
                    <NavigateNext />
                  </IconButton>
                </Box>
              </Box>
              
              {weekData && (
                <Box>
                  {weekData.days.map((day) => (
                    <Paper 
                      key={day.date} 
                      sx={{ 
                        p: 2, 
                        mb: 1,
                        backgroundColor: day.date === new Date().toISOString().split('T')[0] ? 'primary.light' : 'background.paper',
                        color: day.date === new Date().toISOString().split('T')[0] ? 'primary.contrastText' : 'text.primary'
                      }}
                    >
                      <Typography variant="subtitle2" gutterBottom>
                        {day.dayOfWeek} - {new Date(day.date).toLocaleDateString()}
                      </Typography>
                      {day.actionItems.length > 0 ? (
                        <Box>
                          {day.actionItems.slice(0, 3).map((item) => (
                            <Typography 
                              key={item.id} 
                              variant="body2" 
                              sx={{ 
                                cursor: 'pointer',
                                '&:hover': { textDecoration: 'underline' }
                              }}
                              onClick={() => navigate(`/cases/${item.caseId}`)}
                            >
                              • {item.time} - {item.title} ({item.caseNumber})
                            </Typography>
                          ))}
                          {day.actionItems.length > 3 && (
                            <Typography variant="body2" color="text.secondary">
                              + {day.actionItems.length - 3} more items
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No items scheduled
                        </Typography>
                      )}
                    </Paper>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Stats */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Action Item Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Gavel color="error" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">
                  {todayItems.filter(item => item.type === 'court_date').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Court Dates Today
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Schedule color="warning" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">
                  {todayItems.filter(item => item.type === 'deadline').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Deadlines Today
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Person color="info" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">
                  {todayItems.filter(item => item.type === 'meeting').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Meetings Today
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Event color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">
                  {todayItems.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Items Today
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Calendar;