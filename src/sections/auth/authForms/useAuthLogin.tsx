import { useSearchParams } from 'react-router-dom';
import * as Yup from 'yup';
import useAuth from 'hooks/useAuth';

export const useAuthLogin = () => {
    const { login, awsResetPassword, isNewPasswordRequired, cognitoUser, userAttributes } = useAuth();
    const [searchParams] = useSearchParams();
    const auth = searchParams.get('auth');

    const initialValues = {
        email: '',
        password: '',
        newPassword: '',
        submit: null
    };

    const validationSchema = Yup.object({
        email: Yup.string().email('Invalid email').required('Email required'),
        password: Yup.string().when([], {
            is: () => !isNewPasswordRequired,
            then: (s) => s.required('Password required')
        }),
        newPassword: Yup.string().when([], {
            is: () => isNewPasswordRequired,
            then: (s) => s.min(8).required('New password required')
        })
    });

    const onSubmit = async (values: any, { setErrors, setSubmitting }: any) => {
        try {
            if (!isNewPasswordRequired) {
                await login(values.email.trim(), values.password);
            } else {
                if (!cognitoUser) {
                    setErrors({ submit: 'User not ready. Please try again.' });
                    return;
                }
                await awsResetPassword(values.newPassword, cognitoUser, userAttributes);
                alert('Password reset successfully! Please login again.');
            }
        } catch (err: any) {
            setErrors({ submit: err.message || 'Something went wrong' });
        } finally {
            setSubmitting(false);
        }
    };

    return {
        auth,
        isNewPasswordRequired,
        cognitoUser,
        initialValues,
        validationSchema,
        onSubmit
    };
};
