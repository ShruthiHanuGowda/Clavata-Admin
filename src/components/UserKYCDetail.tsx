import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { Typography, Box, Button, Grid, Card, CardContent, Divider } from '@mui/material';
import { LIST_USER_WALLETS } from 'graphql/queries';

interface KYCInfo {
  firstName?: string;
  lastName?: string;
  dob?: string;
  country?: string;
}

interface KYCDetails {
  fullResponse?: {
    info?: KYCInfo;
  };
}

interface User {
  applicantId: string;
  emailAddress?: string;
  userWallet?: string;
  isKycVerified?: boolean;
  createdAt?: string;
  kycDetails?: string | KYCDetails;
}

export default function UserKYCDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(LIST_USER_WALLETS);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error loading data.</Typography>;

  const user = data?.listUserWalletAddresses?.items.find((item: User) => item.applicantId === id);

  if (!user) return <Typography>No user found with ID: {id}</Typography>;

  const kyc = typeof user.kycDetails === 'string' ? JSON.parse(user.kycDetails) : user.kycDetails;

  return (
    <Box sx={{ p: 4 }}>
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        ← Back
      </Button>

      {/* <Typography variant="h4" gutterBottom>
                User Details
            </Typography> */}

      <Grid container spacing={3}>
        {/* Left Side - User Info */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                User Information
              </Typography>
              <Divider sx={{ mt: 2, mb: 2 }} />
              <Box>
                <Typography>
                  <b>Email:</b> {user.emailAddress || 'N/A'}
                </Typography>
                <Typography>
                  <b>User Wallet Address:</b> {user.userWallet || 'N/A'}
                </Typography>
                <Typography>
                  <b>KYC Applicant ID:</b> {user.applicantId || 'N/A'}
                </Typography>
                <Typography>
                  <b>KYC Verified:</b> {user.isKycVerified ? 'Yes' : 'No'}
                </Typography>
                <Typography>
                  <b>Date Registered:</b> {user.createdAt || 'N/A'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side - KYC Data */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                KYC Details
              </Typography>
              <Divider sx={{ mt: 2, mb: 2 }} />
              <Box>
                <Typography>
                  <b>First Name:</b> {kyc?.fullResponse?.info?.firstName || 'N/A'}
                </Typography>
                <Typography>
                  <b>Last Name:</b> {kyc?.fullResponse?.info?.lastName || 'N/A'}
                </Typography>
                <Typography>
                  <b>DOB:</b> {kyc?.fullResponse?.info?.dob || 'N/A'}
                </Typography>
                <Typography>
                  <b>Country:</b> {kyc?.fullResponse?.info?.country || 'N/A'}
                </Typography>
              </Box>
              {/* Add any additional KYC fields here */}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
