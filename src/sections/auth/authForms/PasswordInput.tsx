import { useState } from 'react';
import {
    InputAdornment,
    OutlinedInput,
    Stack,
    InputLabel,
    FormHelperText
} from '@mui/material';
import IconButton from 'components/@extended/IconButton';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';

export default function PasswordInput({
    label,
    name,
    value,
    touched,
    error,
    onBlur,
    onChange,
    placeholder
}: any) {
    const [show, setShow] = useState(false);

    return (
        <Stack spacing={1}>
            <InputLabel>{label}</InputLabel>
            <OutlinedInput
                fullWidth
                type={show ? 'text' : 'password'}
                name={name}
                value={value}
                onBlur={onBlur}
                onChange={onChange}
                error={Boolean(touched && error)}
                placeholder={placeholder}
                endAdornment={
                    <InputAdornment position="end">
                        <IconButton onClick={() => setShow((s) => !s)}>
                            {show ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        </IconButton>
                    </InputAdornment>
                }
            />
            {touched && error && <FormHelperText error>{error}</FormHelperText>}
        </Stack>
    );
}
