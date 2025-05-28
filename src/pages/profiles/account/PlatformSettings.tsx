import React, { useEffect, useState } from 'react';
import { Button, Grid, Stack, TextField, Typography } from '@mui/material';

// project import
import MainCard from 'components/MainCard';
import { ApolloClient, HttpLink, InMemoryCache, useQuery } from '@apollo/client';
import { LIST_PLATFORM_SETTINGS } from 'graphql/queries';

// Apollo Client setup
const client = new ApolloClient({
  link: new HttpLink({
    uri: import.meta.env.VITE_APP_PLATFORM_GRAPHQL_URL,  // Replace with your GraphQL API URL
    headers: {
      'x-api-key': import.meta.env.VITE_APP_PLATFORM_GRAPHQL_API_KEY,  // API Key for authorization
    },
  }),
  cache: new InMemoryCache(),
});

// Type for each setting
interface PlatformSetting {
  pId: string;
  keyName: string;
  value: string;
}

interface PlatformSettingsData {
  listPlatformSettings: {
    items: PlatformSetting[];
  };
}

// Main Component
export default function PlatformSettings() {
  // Fetching data using useQuery hook
  const { loading, error, data } = useQuery<PlatformSettingsData>(LIST_PLATFORM_SETTINGS, {
    client,
  });

  // State to store platform settings
  const [platformSettings, setPlatformSettings] = useState<PlatformSetting[]>([]);

  // Update platform settings data when it's loaded
  useEffect(() => {
    if (data) {
      setPlatformSettings(data.listPlatformSettings.items);
    }
  }, [data]);

  // Handle changes in text fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const updatedSettings = platformSettings.map((item) =>
      item.keyName === key ? { ...item, value: e.target.value } : item
    );
    setPlatformSettings(updatedSettings);
  };

  // Save button handler
  const handleSave = () => {
    // Logic to save the updated platform settings (e.g., sending a mutation)
    console.log('Saving settings:', platformSettings);
  };

  // Loading and error handling
  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error: {error.message}</Typography>;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <MainCard>
          <Stack spacing={2.5}>
            {/* Dynamically map through the fetched platform settings */}
            {platformSettings.map((setting) => (
              <div key={setting.pId}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle1">{setting.keyName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={setting.value}
                      onChange={(e: any) => handleChange(e, setting.keyName)}  // Update value on change
                    />
                  </Grid>
                </Grid>
              </div>
            ))}
          </Stack>
        </MainCard>
      </Grid>

      <Grid item xs={12}>
        <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
          {/* Optional Cancel button */}
          {/* <Button variant="outlined" color="secondary">
            Cancel
          </Button> */}
          {/* Save button */}
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
}
