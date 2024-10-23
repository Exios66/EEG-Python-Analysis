import React from 'react';
import { Box, Container, Typography, Link, IconButton, Tooltip } from '@mui/material';
import { GitHub, LinkedIn, Email } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const Footer = () => {
  const theme = useTheme();
  
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: theme.palette.mode === 'light' 
          ? theme.palette.grey[100]
          : theme.palette.grey[900]
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} EEG Analysis Tool. All rights reserved.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="View source on GitHub">
              <IconButton
                aria-label="github"
                component={Link}
                href="https://github.com/yourusername/your-repo"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
              >
                <GitHub />
              </IconButton>
            </Tooltip>

            <Tooltip title="Connect on LinkedIn">
              <IconButton
                aria-label="linkedin"
                component={Link}
                href="https://linkedin.com/in/your-profile"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
              >
                <LinkedIn />
              </IconButton>
            </Tooltip>

            <Tooltip title="Contact us">
              <IconButton
                aria-label="email"
                component={Link}
                href="mailto:contact@example.com"
                color="inherit"
              >
                <Email />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            <Link
              href="/privacy"
              color="inherit"
              underline="hover"
              sx={{ typography: 'body2' }}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              color="inherit"
              underline="hover"
              sx={{ typography: 'body2' }}
            >
              Terms of Service
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;