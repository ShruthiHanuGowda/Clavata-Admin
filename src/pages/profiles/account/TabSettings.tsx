import { useEffect, useMemo, useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

// project import
import MainCard from 'components/MainCard';
import DefaultThemeMode from 'layout/Dashboard/Header/HeaderContent/Customization/ThemeMode';

// ==============================|| ACCOUNT PROFILE - SETTINGS ||============================== //

export default function TabSettings() {
  const [settings, setSettings] = useState({
    email_notification: true,
    send_copy_to_personal_email: true,
    have_new_notifications: true,
    your_sent_a_direct_message: true,
    someone_adds_you_as_a_connection: true,
    upon_new_order: true,
    new_membership_approval: true,
    member_registration: true,
    news_about_pct_themes_products_and_feature_updates: true,
    tips_on_getting_more_out_of_pct_themes: true,
    things_you_missed_since_you_last_logged_into_pct_themes: true,
    news_about_products_and_other_services: true,
    tips_and_document_business_products: true
  });

  useEffect(() => {
    const requestOptions: RequestInit = {
      method: 'GET',
      redirect: 'follow'
    };

    fetch('https://11rysti5l2.execute-api.me-central-1.amazonaws.com/test/getUserSettings?userId=user123', requestOptions)
      .then((response) => response.json())
      .then((result) => result.data?.settings && setSettings(result.data?.settings))
      .catch((error) => console.error(error));
  }, []);

  const themeMode = useMemo(() => <DefaultThemeMode />, []);

  const myToggle = (e: any) => {
    let { checked, name } = e.target;

    setSettings((pre) => ({
      ...pre,
      [name]: checked
    }));
  };

  const handleUpdate = () => {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    const raw = JSON.stringify({
      userId: 'user123',
      settings: settings
    });

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    fetch('https://11rysti5l2.execute-api.me-central-1.amazonaws.com/test/userSettings', requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.error(error));
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MainCard title="Theme Mode">{themeMode}</MainCard>
          </Grid>
          <Grid item xs={12}>
            <MainCard title="Email Settings">
              <Stack spacing={2.5}>
                <Typography variant="subtitle1">Setup Email Notification</Typography>
                <List sx={{ p: 0, '& .MuiListItem-root': { p: 0, py: 0.25 } }}>
                  <ListItem>
                    <ListItemText id="switch-list-label-en" primary={<Typography color="secondary">Email Notification</Typography>} />
                    <Switch
                      edge="end"
                      onChange={myToggle}
                      checked={settings.email_notification}
                      name="email_notification"
                      inputProps={{
                        'aria-labelledby': 'switch-list-label-en'
                      }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      id="switch-list-label-sctp"
                      primary={<Typography color="secondary">Send Copy To Personal Email</Typography>}
                    />
                    <Switch
                      edge="end"
                      onChange={myToggle}
                      checked={settings.send_copy_to_personal_email}
                      name="send_copy_to_personal_email"
                      inputProps={{
                        'aria-labelledby': 'switch-list-label-sctp'
                      }}
                    />
                  </ListItem>
                </List>
              </Stack>
            </MainCard>
          </Grid>
          <Grid item xs={12}>
            <MainCard title="Updates from System Notification">
              <Stack spacing={2.5}>
                <Typography variant="subtitle1">Email you with?</Typography>
                <List sx={{ p: 0, '& .MuiListItem-root': { p: 0, py: 0.25 } }}>
                  <ListItem>
                    <ListItemText primary={<Typography color="secondary">News about PCT-themes products and feature updates</Typography>} />
                    <Checkbox
                      name="news_about_pct_themes_products_and_feature_updates"
                      checked={settings.news_about_pct_themes_products_and_feature_updates}
                      onChange={myToggle}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={<Typography color="secondary">Tips on getting more out of PCT-themes</Typography>} />
                    <Checkbox
                      name="tips_on_getting_more_out_of_pct_themes"
                      checked={settings.tips_on_getting_more_out_of_pct_themes}
                      onChange={myToggle}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary={<Typography color="secondary">Things you missed since you last logged into PCT-themes</Typography>}
                    />
                    <Checkbox
                      name="things_you_missed_since_you_last_logged_into_pct_themes"
                      checked={settings.things_you_missed_since_you_last_logged_into_pct_themes}
                      onChange={myToggle}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={<Typography color="secondary">News about products and other services</Typography>} />
                    <Checkbox
                      name="news_about_products_and_other_services"
                      checked={settings.news_about_products_and_other_services}
                      onChange={myToggle}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={<Typography color="secondary">Tips and Document business products</Typography>} />
                    <Checkbox
                      name="tips_and_document_business_products"
                      onChange={myToggle}
                      checked={settings.tips_and_document_business_products}
                    />
                  </ListItem>
                </List>
              </Stack>
            </MainCard>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} sm={6}>
        <MainCard title="Activity Related Emails">
          <Stack spacing={2.5}>
            <Typography variant="subtitle1">When to email?</Typography>
            <List sx={{ p: 0, '& .MuiListItem-root': { p: 0, py: 0.25 } }}>
              <ListItem>
                <ListItemText id="switch-list-label-email-1" primary={<Typography color="secondary">Have new notifications</Typography>} />
                <Switch
                  edge="end"
                  onChange={myToggle}
                  checked={settings.have_new_notifications}
                  name="have_new_notifications"
                  inputProps={{
                    'aria-labelledby': 'switch-list-label-email-1'
                  }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  id="switch-list-label-email-2"
                  primary={<Typography color="secondary">You&apos;re sent a direct message</Typography>}
                />
                <Switch
                  edge="end"
                  onChange={myToggle}
                  checked={settings.your_sent_a_direct_message}
                  name="youre_sent_a_direct_message"
                  inputProps={{
                    'aria-labelledby': 'switch-list-label-email-2'
                  }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  id="switch-list-label-email-3"
                  primary={<Typography color="secondary">Someone adds you as a connection</Typography>}
                />
                <Switch
                  edge="end"
                  onChange={myToggle}
                  checked={settings.someone_adds_you_as_a_connection}
                  name="someone_adds_you_as_a_connection"
                  inputProps={{
                    'aria-labelledby': 'switch-list-label-email-3'
                  }}
                />
              </ListItem>
            </List>
            <Divider />
            <Typography variant="subtitle1">When to escalate emails?</Typography>
            <List sx={{ p: 0, '& .MuiListItem-root': { p: 0, py: 0.25 } }}>
              <ListItem>
                <ListItemText id="switch-list-label-order-1" primary={<Typography color="secondary.light">Upon new order</Typography>} />
                <Switch
                  edge="end"
                  onChange={myToggle}
                  checked={settings.upon_new_order}
                  name="upon_new_order"
                  disabled
                  inputProps={{
                    'aria-labelledby': 'switch-list-label-order-1'
                  }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  id="switch-list-label-order-2"
                  primary={<Typography color="secondary.light">New membership approval</Typography>}
                />
                <Switch
                  edge="end"
                  disabled
                  onChange={myToggle}
                  checked={settings.new_membership_approval}
                  name="new_membership_approval"
                  inputProps={{
                    'aria-labelledby': 'switch-list-label-order-2'
                  }}
                />
              </ListItem>
              <ListItem>
                <ListItemText id="switch-list-label-order-3" primary={<Typography color="secondary">Member registration</Typography>} />
                <Switch
                  edge="end"
                  onChange={myToggle}
                  checked={settings.member_registration}
                  name="member_registration"
                  inputProps={{
                    'aria-labelledby': 'switch-list-label-order-3'
                  }}
                />
              </ListItem>
            </List>
          </Stack>
        </MainCard>
      </Grid>
      <Grid item xs={12}>
        <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
          <Button variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleUpdate}>
            Update Profile
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
}
