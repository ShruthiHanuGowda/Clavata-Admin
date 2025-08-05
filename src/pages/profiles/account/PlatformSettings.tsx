import React, { useEffect, useMemo, useState } from 'react';
import { Button, Grid, Stack, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { ApolloClient, HttpLink, InMemoryCache, useQuery, useMutation } from '@apollo/client';

import MainCard from 'components/MainCard';
import { LIST_PLATFORM_SETTINGS, UPDATE_PLATFORM_SETTINGS } from 'graphql/queries';
import createApolloClient from '../../../utils/createApolloClient';

// Apollo Client setup
// const token = localStorage.getItem('serviceToken');
// const client = new ApolloClient({
//   link: new HttpLink({
//     uri: import.meta.env.VITE_APP_PLATFORM_GRAPHQL_URL,
//     headers: {
//       // 'x-api-key': import.meta.env.VITE_APP_PLATFORM_GRAPHQL_API_KEY,
//       Authorization: token ? `Bearer ${token}` : ''
//     }
//   }),
//   cache: new InMemoryCache()
// });

// Types
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

export default function PlatformSettings() {
  const client = useMemo(() => createApolloClient(import.meta.env.VITE_APP_PLATFORM_GRAPHQL_URL), []);

  const { loading, error, data } = useQuery<PlatformSettingsData>(LIST_PLATFORM_SETTINGS, { client });

  const [platformSettings, setPlatformSettings] = useState<PlatformSetting[]>([]);
  const [updateSetting] = useMutation(UPDATE_PLATFORM_SETTINGS, { client });

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  useEffect(() => {
    if (data) {
      setPlatformSettings(data.listPlatformSettings.items);
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const updatedSettings = platformSettings.map((item) => (item.keyName === key ? { ...item, value: e.target.value } : item));
    setPlatformSettings(updatedSettings);
  };

  const handleSave = async () => {
    try {
      await Promise.all(
        platformSettings.map((setting) =>
          updateSetting({
            variables: {
              input: {
                pId: setting.pId,
                keyName: setting.keyName,
                value: setting.value
              }
            }
          })
        )
      );
      setSuccessDialogOpen(true);
    } catch (err) {
      console.error('Failed to update settings:', err);
      alert('Error updating settings');
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error: {error.message}</Typography>;

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <MainCard>
            <Stack spacing={2.5}>
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
                        onChange={(e: any) => handleChange(e, setting.keyName)}
                      />
                    </Grid>
                  </Grid>
                </div>
              ))}
            </Stack>
          </MainCard>
        </Grid>

        <Grid item xs={12}>
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button variant="contained" onClick={handleSave}>
              Save
            </Button>
          </Stack>
        </Grid>
      </Grid>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onClose={() => setSuccessDialogOpen(false)}>
        {/* <DialogTitle>Success</DialogTitle> */}
        <DialogContent>
          <Typography>Settings updated successfully!</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuccessDialogOpen(false)} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
