import React, { useEffect, useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  useMediaQuery,
  Menu,
  MenuItem,
  IconButton,
  useTheme
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { clearAuth } from '../../features/auth/authSlice';
import { AuthState } from '../../features/auth/types';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, accessToken } = useSelector((state: RootState) => state.auth as AuthState);
  const isAuthenticated = !!accessToken && !!user;
  
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isMobileMenuOpen = Boolean(mobileMenuAnchorEl);
  
  useEffect(() => {
    // Check if token exists in localStorage but not in Redux
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken && !accessToken) {
      console.log('Token exists in localStorage but not in Redux state, page might have been refreshed');
    }
  }, [accessToken]);

  const handleLogout = () => {
    console.log('Logging out user');
    dispatch(clearAuth());
    navigate('/login');
    handleMobileMenuClose();
  };
  
  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchorEl(null);
  };
  
  const navigateTo = (path: string) => {
    navigate(path);
    handleMobileMenuClose();
  };

  const mobileMenu = (
    <Menu
      anchorEl={mobileMenuAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      {isAuthenticated ? (
        <>
          {user && (
            <MenuItem disabled>
              <Typography variant="body2">Welcome, {user.name}</Typography>
            </MenuItem>
          )}
          {user?.role === 'admin' ? (
            <MenuItem onClick={() => navigateTo('/admin')}>Admin Dashboard</MenuItem>
          ) : (
            <MenuItem onClick={() => navigateTo('/dashboard')}>Dashboard</MenuItem>
          )}
          <MenuItem onClick={() => navigateTo('/task-form')}>Add Task</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </>
      ) : (
        <>
          <MenuItem onClick={() => navigateTo('/login')}>Login</MenuItem>
          <MenuItem onClick={() => navigateTo('/register')}>Register</MenuItem>
        </>
      )}
    </Menu>
  );

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div"
          onClick={() => navigate('/')} 
          sx={{ 
            flexGrow: 1, 
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          Task Manager
        </Typography>
        
        {isMobile ? (
          <>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls="mobile-menu"
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreVertIcon />
            </IconButton>
            {mobileMenu}
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isAuthenticated ? (
              <>
                {user && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    <AccountCircleIcon sx={{ mr: 0.5 }} />
                    <Typography variant="body2">
                      Welcome, {user.name}
                    </Typography>
                  </Box>
                )}
                {user?.role === 'admin' ? (
                  <Button 
                    color="inherit" 
                    onClick={() => navigate('/admin')}
                    variant="outlined"
                    sx={{ mr: 1 }}
                  >
                    Admin Dashboard
                  </Button>
                ) : (
                  <Button color="inherit" onClick={() => navigate('/dashboard')}>
                    Dashboard
                  </Button>
                )}
                <Button color="inherit" onClick={() => navigate('/task-form')}>
                  Add Task
                </Button>
                <Button color="inherit" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button color="inherit" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button color="inherit" onClick={() => navigate('/register')}>
                  Register
                </Button>
              </>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;