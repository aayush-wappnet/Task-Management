import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  CardActions,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { fetchTasks } from '../features/tasks/tasksApi';
import { setTasks } from '../features/tasks/tasksSlice';
import { Task, TaskStatus, TaskPriority } from '../features/tasks/types';
import { User } from '../features/auth/types';
import { fetchAllUsers, deleteUser, fetchUserTasks } from '../features/admin/adminApi';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { tasks } = useSelector((state: RootState) => state.tasks);
  
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserTasks, setSelectedUserTasks] = useState<Task[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const usersData = await fetchAllUsers();
        setUsers(usersData);
      } catch (err) {
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    const loadTasks = async () => {
      try {
        const tasksData = await fetchTasks();
        dispatch(setTasks(tasksData));
      } catch (err) {
        setError('Failed to fetch tasks');
      }
    };
    
    loadUsers();
    loadTasks();
  }, [dispatch]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await deleteUser(id);
      setUsers(users.filter(user => user.id !== id));
      if (selectedUser?.id === id) {
        setSelectedUser(null);
        setSelectedUserTasks([]);
      }
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const handleViewUserTasks = async (user: User) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedUser(user);
      const tasksData = await fetchUserTasks(user.id);
      setSelectedUserTasks(tasksData);
      setTabValue(1); // Switch to the User Tasks tab
    } catch (err) {
      setError('Failed to fetch user tasks');
    } finally {
      setLoading(false);
    }
  };

  const renderUserTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Chip
                  label={user.role}
                  color={user.role === 'admin' ? 'primary' : 'default'}
                />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleViewUserTasks(user)} color="primary">
                  <AssignmentIcon />
                </IconButton>
                <IconButton onClick={() => handleDeleteUser(user.id)} color="error">
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderUserCards = () => (
    <Grid container spacing={2}>
      {users.map((user) => (
        <Grid item xs={12} sm={6} md={4} key={user.id}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PersonIcon fontSize="large" sx={{ mr: 1 }} />
                <Typography variant="h6">{user.name}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" mb={1}>
                <strong>Email:</strong> {user.email}
              </Typography>
              <Typography variant="body2" mb={1}>
                <strong>Role:</strong>{' '}
                <Chip
                  label={user.role}
                  color={user.role === 'admin' ? 'primary' : 'default'}
                  size="small"
                />
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                variant="outlined" 
                startIcon={<AssignmentIcon />}
                onClick={() => handleViewUserTasks(user)}
              >
                View Tasks
              </Button>
              <Button 
                size="small" 
                variant="outlined" 
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => handleDeleteUser(user.id)}
              >
                Delete
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderSelectedUserTasks = () => {
    if (!selectedUser) {
      return (
        <Alert severity="info">Select a user to view their tasks</Alert>
      );
    }

    if (selectedUserTasks.length === 0) {
      return (
        <Box mt={2}>
          <Alert severity="info">No tasks found for {selectedUser.name}</Alert>
        </Box>
      );
    }

    return (
      <Box mt={2}>
        <Typography variant="h6" gutterBottom>
          Tasks for {selectedUser.name}
        </Typography>
        {isMobile ? (
          <Grid container spacing={2}>
            {selectedUserTasks.map((task) => (
              <Grid item xs={12} key={task.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{task.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {task.description}
                    </Typography>
                    <Box mt={1} display="flex" justifyContent="space-between">
                      <Chip 
                        label={task.status} 
                        size="small"
                        color={
                          task.status === TaskStatus.COMPLETED 
                            ? 'success' 
                            : task.status === TaskStatus.IN_PROGRESS 
                              ? 'warning' 
                              : 'info'
                        }
                      />
                      <Chip 
                        label={task.priority} 
                        size="small"
                        color={
                          task.priority === TaskPriority.HIGH 
                            ? 'error' 
                            : task.priority === TaskPriority.MEDIUM 
                              ? 'warning' 
                              : 'success'
                        }
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Due Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedUserTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{task.description}</TableCell>
                    <TableCell>
                      <Chip 
                        label={task.status} 
                        color={
                          task.status === TaskStatus.COMPLETED 
                            ? 'success' 
                            : task.status === TaskStatus.IN_PROGRESS 
                              ? 'warning' 
                              : 'info'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={task.priority}
                        color={
                          task.priority === TaskPriority.HIGH 
                            ? 'error' 
                            : task.priority === TaskPriority.MEDIUM 
                              ? 'warning' 
                              : 'success'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(task.dueDate).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin dashboard tabs">
          <Tab label="Users Management" />
          <Tab label="User Tasks" />
        </Tabs>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TabPanel value={tabValue} index={0}>
        <Box mb={3}>
          <Typography variant="h5" gutterBottom>
            All Users
          </Typography>
          {isMobile ? renderUserCards() : renderUserTable()}
        </Box>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        {renderSelectedUserTasks()}
      </TabPanel>
    </Container>
  );
};

export default AdminDashboard; 