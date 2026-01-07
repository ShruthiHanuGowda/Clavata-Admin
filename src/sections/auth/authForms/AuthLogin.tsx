// import React, { useState } from 'react';
// import { Formik } from 'formik';
// import * as Yup from 'yup';
// import { Link as RouterLink, useSearchParams } from 'react-router-dom';
// import { CognitoUser } from 'amazon-cognito-identity-js';

// import Button from '@mui/material/Button';
// import Grid from '@mui/material/Grid';
// import Stack from '@mui/material/Stack';
// import InputLabel from '@mui/material/InputLabel';
// import OutlinedInput from '@mui/material/OutlinedInput';
// import InputAdornment from '@mui/material/InputAdornment';
// import FormHelperText from '@mui/material/FormHelperText';
// import Checkbox from '@mui/material/Checkbox';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import Link from '@mui/material/Link';
// import Typography from '@mui/material/Typography';

// import AnimateButton from 'components/@extended/AnimateButton';
// import IconButton from 'components/@extended/IconButton';
// import EyeOutlined from '@ant-design/icons/EyeOutlined';
// import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';

// import useAuth from 'hooks/useAuth';

// export default function AuthLogin({ isDemo = false }: { isDemo?: boolean }) {
//   const { login, awsResetPassword, isNewPasswordRequired, cognitoUser, userAttributes } = useAuth();
//   const [showPassword, setShowPassword] = useState(false);
//   const [checked, setChecked] = useState(false);
//   const [searchParams] = useSearchParams();
//   const auth = searchParams.get('auth');

//   const handleClickShowPassword = () => setShowPassword((prev) => !prev);
//   const handleMouseDownPassword = (event: React.SyntheticEvent) => event.preventDefault();

//   const handleSubmitLogin = async (email: string, password: string) => {
//     await login(email.trim(), password);
//   };

//   const handleSetNewPassword = async (newPassword: string) => {
//     console.log('handleSetNewPassword called', { cognitoUser, newPassword });

//     if (!cognitoUser) {
//       console.warn('No cognitoUser available');
//       return;
//     }
//     try {
//       await awsResetPassword(newPassword, cognitoUser, userAttributes);
//       alert('Password reset successfully! Please login again.');
//     } catch (err: any) {
//       console.error('Password reset error', err);
//       alert(err.message || 'Error resetting password');
//     }
//   };



//   return (
//     <Formik
//       initialValues={{ email: '', password: '', newPassword: '', submit: null }}
//       validationSchema={Yup.object({
//         email: Yup.string().email('Invalid email').required('Email required'),
//         password: Yup.string().when([], {
//           is: () => !isNewPasswordRequired,
//           then: (schema) => schema.required('Password required')
//         }),
//         newPassword: Yup.string().when([], {
//           is: () => isNewPasswordRequired,
//           then: (schema) => schema.min(8, 'At least 8 characters').required('New password required')
//         })
//       })}
//       onSubmit={async (values, { setErrors, setSubmitting }) => {
//         console.log('Formik submit fired', values, isNewPasswordRequired);
//         try {
//           if (!isNewPasswordRequired) {
//             // normal login
//             await handleSubmitLogin(values.email, values.password);
//           } else {
//             if (!cognitoUser) {
//               // if cognitoUser is not ready yet, show an error
//               setErrors({ submit: 'User not ready. Please try again.' });
//               return;
//             }
//             await handleSetNewPassword(values.newPassword);
//           }
//         } catch (err: any) {
//           setErrors({ submit: err.message || 'Something went wrong' });
//         } finally {
//           setSubmitting(false);
//         }
//       }}

//     >
//       {({ values, errors, touched, handleBlur, handleChange, handleSubmit, isSubmitting }) => (
//         <form noValidate onSubmit={handleSubmit}>
//           <Grid container spacing={3}>
//             {/* LOGIN FORM */}
//             {!isNewPasswordRequired && (
//               <>
//                 <Grid item xs={12}>
//                   <Stack spacing={1}>
//                     <InputLabel>Email Address</InputLabel>
//                     <OutlinedInput
//                       fullWidth
//                       type="email"
//                       name="email"
//                       value={values.email}
//                       onBlur={handleBlur}
//                       onChange={handleChange}
//                       error={Boolean(touched.email && errors.email)}
//                       placeholder="Enter email"
//                     />
//                   </Stack>
//                   {touched.email && errors.email && <FormHelperText error>{errors.email}</FormHelperText>}
//                 </Grid>

//                 <Grid item xs={12}>
//                   <Stack spacing={1}>
//                     <InputLabel>Password</InputLabel>
//                     <OutlinedInput
//                       fullWidth
//                       type={showPassword ? 'text' : 'password'}
//                       name="password"
//                       value={values.password}
//                       onBlur={handleBlur}
//                       onChange={handleChange}
//                       error={Boolean(touched.password && errors.password)}
//                       endAdornment={
//                         <InputAdornment position="end">
//                           <IconButton onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword}>
//                             {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
//                           </IconButton>
//                         </InputAdornment>
//                       }
//                       placeholder="Enter password"
//                     />
//                   </Stack>
//                   {touched.password && errors.password && <FormHelperText error>{errors.password}</FormHelperText>}
//                 </Grid>

//                 <Grid item xs={12}>
//                   <Stack direction="row" justifyContent="space-between" alignItems="center">
//                     <FormControlLabel
//                       control={<Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />}
//                       label={<Typography>Keep me signed in</Typography>}
//                     />
//                     <Link
//                       component={RouterLink}
//                       to={
//                         isDemo
//                           ? '/auth/forgot-password'
//                           : auth
//                             ? `/${auth}/forgot-password?auth=jwt`
//                             : '/forgot-password'
//                       }
//                     >
//                       Forgot Password?
//                     </Link>
//                   </Stack>
//                 </Grid>
//               </>
//             )}

//             {/* NEW PASSWORD FORM */}
//             {isNewPasswordRequired && (
//               <>
//                 {cognitoUser ? (
//                   <Grid item xs={12}>
//                     <Stack spacing={1}>
//                       <InputLabel>New Password</InputLabel>
//                       <OutlinedInput
//                         fullWidth
//                         type={showPassword ? 'text' : 'password'}
//                         name="newPassword"
//                         value={values.newPassword}
//                         onBlur={handleBlur}
//                         onChange={handleChange}
//                         error={Boolean(touched.newPassword && errors.newPassword)}
//                         placeholder="Enter new password"
//                       />
//                       {touched.newPassword && errors.newPassword && (
//                         <FormHelperText error>{errors.newPassword}</FormHelperText>
//                       )}
//                     </Stack>
//                   </Grid>
//                 ) : (
//                   <Typography variant="body2" color="textSecondary">
//                     Preparing account... please wait
//                   </Typography>
//                 )}
//               </>
//             )}


//             {errors.submit && (
//               <Grid item xs={12}>
//                 <FormHelperText error>{errors.submit}</FormHelperText>
//               </Grid>
//             )}

//             <Grid item xs={12}>
//               <AnimateButton>
//                 <Button fullWidth size="large" type="submit" variant="contained" disabled={isSubmitting}>
//                   {isNewPasswordRequired ? 'Set New Password' : 'Login'}
//                 </Button>
//               </AnimateButton>
//             </Grid>
//           </Grid>
//         </form>
//       )}
//     </Formik>
//   );
// }

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
