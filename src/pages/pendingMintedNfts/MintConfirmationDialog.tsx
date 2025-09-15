import React from 'react';
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Paper, Stack, TextField, Typography } from '@mui/material';

interface Props {
  open: boolean;
  isMinting: boolean;
  selectedItem: NftPendingItem | null;
  inputVolume: string;
  onClose: () => void;
  onConfirm: () => void;
}

export interface NftPendingItem {
  id: string;
  assetId: string;
  contractAddress: string;
  recipientWalletAddress: string;
  tokenId?: string;
  volume: number;
  type: 'mint' | 'addVolume';
  status?: string;
  createdAt: string;
}

const MintConfirmationDialog: React.FC<Props> = ({ open, isMinting, selectedItem, inputVolume, onClose, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirm NFT {selectedItem?.type === 'mint' ? 'Minting' : 'Volume Addition'}</DialogTitle>
      <DialogContent>
        {selectedItem && (
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Asset ID
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {selectedItem.assetId}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Type
                  </Typography>
                  <Chip label={selectedItem.type} size="small" color={selectedItem.type === 'mint' ? 'primary' : 'secondary'} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Volume
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {selectedItem.volume?.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Recipient Address
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {selectedItem.recipientWalletAddress}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <TextField
              label="Volume to Process"
              type="number"
              fullWidth
              disabled
              value={inputVolume}
              helperText={`This will ${selectedItem.type === 'mint' ? 'mint' : 'add'} ${inputVolume} volume to the NFT`}
            />
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button variant="contained" onClick={onConfirm} disabled={isMinting}>
          {isMinting ? 'Processing...' : `Confirm ${selectedItem?.type === 'mint' ? 'Mint' : 'Add Volume'}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MintConfirmationDialog;
