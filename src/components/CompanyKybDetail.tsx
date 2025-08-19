import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { Box, Typography, Button, Grid, Paper, Divider } from '@mui/material';
import { LIST_COMPANY_WALLETS } from 'graphql/queries';

export default function CompanyKybDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(LIST_COMPANY_WALLETS);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error loading data.</Typography>;

  const company = data?.listUserWallets?.items.find((item: any) => item.applicantId === id);

  if (!company) return <Typography>No company found with ID: {id}</Typography>;

  let companyDetails = null;
  try {
    companyDetails = typeof company.company_detail === 'string' ? JSON.parse(company.company_detail) : company.company_detail;
  } catch (e) {
    console.error('Failed to parse company_detail:', e);
  }

  console.log('company details', company);

  const info = companyDetails?.fullResponse?.fixedInfo?.companyInfo;

  return (
    <Box sx={{ p: 4 }}>
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 4 }}>
        ← Back
      </Button>

      <Grid container spacing={4}>
        {/* Company Details Card */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2 }}>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Company Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography>
              <strong>Email:</strong> {company.userAddress}
            </Typography>
            <Typography>
              <strong>Wallet:</strong> {company.userWallet}
            </Typography>
            <Typography>
              <strong>KYB Applicant Id:</strong> {company.applicantId}
            </Typography>
            <Typography>
              <strong>KYB Verified?:</strong> {company?.is_verified_kyb ? 'Yes' : 'No'}
            </Typography>
            <Typography>
              <strong>Created Date:</strong> {new Date(company.date).toLocaleDateString()}
            </Typography>
          </Paper>
        </Grid>

        {/* KYB Details Card */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2 }}>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              KYB Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography>
              <strong>Company Name:</strong> {info?.companyName || 'N/A'}
            </Typography>
            <Typography>
              <strong>Registration Number:</strong> {info?.registrationNumber || 'N/A'}
            </Typography>
            <Typography>
              <strong>Country:</strong> {info?.country || 'N/A'}
            </Typography>
            <Typography>
              <strong>Address:</strong> {info?.legalAddress || 'N/A'}
            </Typography>
            <Typography>
              <strong>Website:</strong> {info?.website || 'N/A'}
            </Typography>
            <Typography>
              <strong>Incorporated On:</strong> {info?.incorporatedOn || 'N/A'}
            </Typography>
            <Typography>
              <strong>Type:</strong> {info?.type || 'N/A'}
            </Typography>
            <Typography>
              <strong>Registration Location:</strong> {info?.registrationLocation || 'N/A'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
