// material-ui
import { useTheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';

// third-party
import { CSVLink } from 'react-csv';
import { Headers } from 'react-csv/lib/core';

// assets
import DownloadOutlined from '@ant-design/icons/DownloadOutlined';

// ==============================|| CSV EXPORT ||============================== //

interface CSVExportProps<T extends object> {
  data: T[];
  filename: string;
  headers?: Headers;
}

export default function CSVExport<T extends object>({ data, filename, headers }: CSVExportProps<T>) {
  const theme = useTheme();

  return (
    <CSVLink data={data} filename={filename} headers={headers}>
      <Tooltip title="CSV Export">
        <DownloadOutlined
          style={{
            fontSize: '24px',
            color: theme.palette.text.secondary,
            marginTop: 4,
            marginRight: 4,
            marginLeft: 4
          }}
        />
      </Tooltip>
    </CSVLink>
  );
}
