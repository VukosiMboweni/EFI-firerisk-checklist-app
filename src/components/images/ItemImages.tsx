import React from 'react';
import { Dialog, DialogContent, DialogActions, Button } from '@mui/material';

interface ItemImagesProps {
  images: string[];
  onClose: () => void;
  selectedImage: string;
}

export const ItemImages: React.FC<ItemImagesProps> = ({ images, onClose, selectedImage }) => {
  return (
    <Dialog open={!!selectedImage} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
        <img src={selectedImage} alt="Assessment item" style={{ width: '100%', height: 'auto' }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
