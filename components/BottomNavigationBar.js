import React, { useState, useEffect } from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard'; // For Dashboard
import AccessTimeIcon from '@mui/icons-material/AccessTime'; // For Attendance
import PeopleIcon from '@mui/icons-material/People'; // For Members
import PaymentIcon from '@mui/icons-material/Payment'; // For Payment
import { useRouter } from 'next/router';  // Import useRouter from next/router

const BottomNavigationBar = ({ onSearchClick }) => {
  const [value, setValue] = useState(0);
  const router = useRouter();  // Initialize useRouter hook

  // Update the selected value based on the current route
  useEffect(() => {
    if (router.pathname === '/') {
      setValue(0);  // Dashboard page
    } else if (router.pathname === '/attendance') {
      setValue(1);  // Attendance page
    } else if (router.pathname === '/members') {
      setValue(2);  // Members page
    } else if (router.pathname === '/payment') {
      setValue(3);  // Payment page
    }
  }, [router.pathname]);  // Re-run when pathname changes

  const handleDashboardClick = () => {
    router.push('/');  // Navigate to the Dashboard
  };

  const handleAttendanceClick = () => {
    router.push('/attendance');  // Navigate to the Attendance page
  };

  const handleMembersClick = () => {
    router.push('/members');  // Navigate to the Members page
  };

  const handlePaymentClick = () => {
    router.push('/payment');  // Navigate to the Payment page
  };

  return (
    <BottomNavigation
      value={value}  // Set value to reflect the current route
      onChange={(event, newValue) => setValue(newValue)}  // Handle value change
      showLabels
      sx={{
        width: '100%',
        position: 'fixed',
        bottom: 0,
        left: 0,
        zIndex: 100,
        bgcolor: 'background.paper',
        boxShadow: 1,
        border: '1px solid rgba(0, 0, 0, 0.05)',
        py: 4.3,
      }}
    >
      <BottomNavigationAction
        label="Dashboard"
        icon={<DashboardIcon />}
        onClick={handleDashboardClick}  // Navigate to the dashboard
        sx={{
          '&.Mui-selected': {
            color: '#0d9488',  // Highlight color
          },
        }}
      />
      <BottomNavigationAction
        label="Attendance"
        icon={<AccessTimeIcon />}
        onClick={handleAttendanceClick}  // Navigate to the attendance page
        sx={{
          '&.Mui-selected': {
            color: '#0d9488',  // Highlight color
          },
        }}
      />
      <BottomNavigationAction
        label="Members"
        icon={<PeopleIcon />}
        onClick={handleMembersClick}  // Navigate to the members page
        sx={{
          '&.Mui-selected': {
            color: '#0d9488',  // Highlight color
          },
        }}
      />
      <BottomNavigationAction
        label="Payment"
        icon={<PaymentIcon />}
        onClick={handlePaymentClick}  // Navigate to the payment page
        sx={{
          '&.Mui-selected': {
            color: '#0d9488',  // Highlight color
          },
        }}
      />
    </BottomNavigation>
  );
};

export default BottomNavigationBar;
