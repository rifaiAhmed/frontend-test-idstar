import { useEffect, useState, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { updateRecipeItem, createRecipeItem } from 'src/services/recipeService';
import { RecipeItem } from 'src/models/recipe';

interface RecipeModalProps {
  open: boolean;
  onClose: () => void;
  item?: RecipeItem | null;
  onSuccess: (message: string) => void;
}

export function RecipeModal({ open, onClose, onSuccess, item }: RecipeModalProps) {
  const [form, setForm] = useState({ name: '' });
  const [errors, setErrors] = useState({ name: '' });

  useEffect(() => {
    setForm({ name: item ? item.name : '' });
    setErrors({ name: '' });
  }, [item, open]);

  const validateForm = useCallback(() => {
    let valid = true;
    const newErrors = { name: '' };

    if (!form.name.trim()) {
      newErrors.name = 'Item name is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  }, [form]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ name: e.target.value });
  };

  const handleSave = useCallback(async () => {
    if (!validateForm()) return;

    try {
      if (item) {
        await updateRecipeItem(item.id, { name: form.name });
        onSuccess('Item berhasil diperbarui!');
      } else {
        await createRecipeItem({ name: form.name });
        onSuccess('Item berhasil ditambahkan!');
      }
      onClose();
    } catch (error) {
      console.error('Failed to save item:', error);
    }
  }, [form, item, onClose, onSuccess, validateForm]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{item ? 'Edit Recipe Item' : 'Add Recipe Item'}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Item Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          error={!!errors.name}
          helperText={errors.name}
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
