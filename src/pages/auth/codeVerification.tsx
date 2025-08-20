// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project import
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthCodeVerification from 'sections/auth/authForms/AuthCodeVerification';

// ================================|| CODE VERIFICATION ||================================ //

export default function CodeVerification() {
  const email = window.localStorage.getItem('email');
  const finalArr: string[] = [];

  if (email) {
    const emailSplit = email.split('');
    const len = emailSplit.indexOf('@');
    emailSplit.forEach((item, pos) => {
      pos >= 1 && pos <= len - 2 ? finalArr.push('*') : finalArr.push(emailSplit[pos]);
    });
  }

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Stack spacing={1}>
            <Typography variant="h3">Enter Verification Code</Typography>
            <Typography color="secondary">We send you on mail.</Typography>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Typography>We`ve send you code on jone. {email && finalArr.length > 0 ? finalArr.join('') : '****@company.com'}</Typography>
        </Grid>
        <Grid item xs={12}>
          <AuthCodeVerification />
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
