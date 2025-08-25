function ltrim(str: string | null | undefined): string | null | undefined {
  if (!str) return str;
  return str.replace(/^\s+/g, '');
}

function rtrim(str: string | null | undefined): string | null | undefined {
  if (!str) return str;
  return str.replace(/\s+$/g, '');
}

function trimFc(formik: { setFieldValue: (field: string, value: string) => void }) {
  return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    const trimmed = ltrim(rtrim(value));
    formik.setFieldValue(e.target.name, trimmed ?? '');
  };
}

export default trimFc;
