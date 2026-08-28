import { Formik } from 'formik';
import {
  Grid,
  Stack,
  Button,
  Checkbox,
  Typography,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  OutlinedInput,
  Link
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import AnimateButton from 'components/@extended/AnimateButton';
import PasswordInput from './PasswordInput';
import { useAuthLogin } from './useAuthLogin';

//auth login form
export default function AuthLogin({ isDemo = false }: { isDemo?: boolean }) {
  const {
    auth,
    isNewPasswordRequired,
    cognitoUser,
    initialValues,
    validationSchema,
    onSubmit
  } = useAuthLogin();

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
      {({ values, errors, touched, handleBlur, handleChange, handleSubmit, isSubmitting }) => (
        <form noValidate onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {!isNewPasswordRequired && (
              <>
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <InputLabel>Email Address</InputLabel>
                    <OutlinedInput
                      fullWidth
                      name="email"
                      value={values.email}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      error={Boolean(touched.email && errors.email)}
                      placeholder="Enter email"
                    />
                    {touched.email && errors.email && (
                      <FormHelperText error>{errors.email}</FormHelperText>
                    )}
                  </Stack>
                </Grid>

                <Grid item xs={12}>
                  <PasswordInput
                    label="Password"
                    name="password"
                    value={values.password}
                    touched={touched.password}
                    error={errors.password}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter password"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Stack direction="row" justifyContent="space-between">
                    <FormControlLabel control={<Checkbox />} label="Keep me signed in" />
                    <Link
                      component={RouterLink}
                      to={
                        isDemo
                          ? '/auth/forgot-password'
                          : auth
                            ? `/${auth}/forgot-password?auth=jwt`
                            : '/forgot-password'
                      }
                    >
                      Forgot Password?
                    </Link>
                  </Stack>
                </Grid>
              </>
            )}

            {isNewPasswordRequired && (
              <Grid item xs={12}>
                {cognitoUser ? (
                  <PasswordInput
                    label="New Password"
                    name="newPassword"
                    value={values.newPassword}
                    touched={touched.newPassword}
                    error={errors.newPassword}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter new password"
                  />
                ) : (
                  <Typography>Preparing account…</Typography>
                )}
              </Grid>
            )}

            {errors.submit && (
              <Grid item xs={12}>
                <FormHelperText error>{errors.submit}</FormHelperText>
              </Grid>
            )}

            <Grid item xs={12}>
              <AnimateButton>
                <Button fullWidth type="submit" variant="contained" disabled={isSubmitting}>
                  {isNewPasswordRequired ? 'Set New Password' : 'Login'}
                </Button>
              </AnimateButton>
            </Grid>
          </Grid>
        </form>
      )}
    </Formik>
  );
}
