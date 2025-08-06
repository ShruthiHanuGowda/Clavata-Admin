import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { LIST_USER_WALLETS } from 'graphql/queries';
import { Typography, Box, Button } from '@mui/material';

export default function UserKYCDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data, loading, error } = useQuery(LIST_USER_WALLETS);

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography>Error loading data.</Typography>;

    const user = data?.listUserWalletAddresses?.items.find((item: any) => item.applicantId === id);

    if (!user) return <Typography>No user found with ID: {id}</Typography>;

    const kyc = typeof user.kycDetails === 'string'
        ? JSON.parse(user.kycDetails)
        : user.kycDetails;

    return (
        <Box sx={{ p: 4 }}>
            <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 2 }}>
                ← Back
            </Button>
            <Typography variant="h4" gutterBottom>KYC Detail</Typography>
            <Typography><strong>Email:</strong> {user.emailAddress}</Typography>
            <Typography><strong>Wallet:</strong> {user.userWallet}</Typography>
            <Typography><strong>First Name:</strong> {kyc?.fullResponse?.info?.firstName || 'N/A'}</Typography>
            <Typography><strong>Last Name:</strong> {kyc?.fullResponse?.info?.lastName || 'N/A'}</Typography>
            <Typography><strong>DOB:</strong> {kyc?.fullResponse?.info?.dob || 'N/A'}</Typography>
            <Typography><strong>Country:</strong> {kyc?.fullResponse?.info?.country || 'N/A'}</Typography>
        </Box>
    );
}
