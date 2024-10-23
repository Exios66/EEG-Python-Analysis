import React, { useContext } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Container,
  useScrollTrigger,
  Slide,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Brightness4,
  Brightness7,
  Help
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';
import PropTypes from 'prop-types';

// Hide header on scroll
function HideOnScroll({ children }) {
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

HideOnScroll.propTypes = {
  children: PropTypes.element.isRequired
};

const Header = () => {
  const { isDarkTheme, toggleTheme } = useContext(ThemeContext);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenu = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchor(null);
  };

  return (
    <HideOnScroll>
      <AppBar position="sticky" elevation={0}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo/Brand */}
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
                flexGrow: { xs: 1, md: 0 }
              }}
            >
              EEG Analysis
            </Typography>

            {/* Mobile Menu Button */}
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                color="inherit"
                aria-label="menu"
                onClick={handleMobileMenu}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={mobileMenuAnchor}
                open={Boolean(mobileMenuAnchor)}
                onClose={handleClose}
              >
                <MenuItem component={RouterLink} to="/dashboard" onClick={handleClose}>
                  Dashboard
                </MenuItem>
                <MenuItem component={RouterLink} to="/analysis" onClick={handleClose}>
                  Analysis
                </MenuItem>
                <MenuItem component={RouterLink} to="/results" onClick={handleClose}>
                  Results
                </MenuItem>
              </Menu>
            </Box>

            {/* Desktop Navigation */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 4 }}>
              <Button
                component={RouterLink}
                to="/dashboard"
                color="inherit"
                sx={{ mx: 1 }}
              >
                Dashboard
              </Button>
              <Button
                component={RouterLink}
                to="/analysis"
                color="inherit"
                sx={{ mx: 1 }}
              >
                Analysis
              </Button>
              <Button
                component={RouterLink}
                to="/results"
                color="inherit"
                sx={{ mx: 1 }}
              >
                Results
              </Button>
            </Box>

            {/* Right-side Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Toggle theme">
                <IconButton color="inherit" onClick={toggleTheme} size="large">
                  {isDarkTheme ? <Brightness7 /> : <Brightness4 />}
                </IconButton>
              </Tooltip>

              <Tooltip title="Help">
                <IconButton
                  component={RouterLink}
                  to="/help"
                  color="inherit"
                  size="large"
                >
                  <Help />
                </IconButton>
              </Tooltip>

              <Tooltip title="Account">
                <IconButton
                  color="inherit"
                  onClick={handleMenu}
                  size="large"
                >
                  <AccountCircle />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem component={RouterLink} to="/profile" onClick={handleClose}>
                  Profile
                </MenuItem>
                <MenuItem component={RouterLink} to="/settings" onClick={handleClose}>
                  Settings
                </MenuItem>
                <MenuItem onClick={handleClose}>Logout</MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </HideOnScroll>
  );
};

export default Header;
