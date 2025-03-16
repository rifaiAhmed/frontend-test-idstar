import { useEffect, useState, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { createInventoryItem, updateInventoryItem } from 'src/services/inventoryService';
import { InventoryItem } from 'src/models/inventory';

interface InventoryModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  item?: InventoryItem | null;
}

export function InventoryModal({ open, onClose, onSuccess, item }: InventoryModalProps) {
  const [form, setForm] = useState({ item: '', qty: '', uom: '', price_per_qty: '' });
  const [errors, setErrors] = useState({ item: '', qty: '', uom: '', price_per_qty: '' });

  useEffect(() => {
    if (item) {
      setForm({
        item: item.item,
        qty: item.qty.toString(),
        uom: item.uom,
        price_per_qty: item.price_per_qty.toString(),
      });
    } else {
      setForm({ item: '', qty: '', uom: '', price_per_qty: '' });
    }
    setErrors({ item: '', qty: '', uom: '', price_per_qty: '' });
  }, [item, open]);

  const validateForm = useCallback(() => {
    let valid = true;
    const newErrors = { item: '', qty: '', uom: '', price_per_qty: '' };

    if (!form.item.trim()) {
      newErrors.item = 'Item name is required';
      valid = false;
    }
    if (!form.qty.trim() || Number.isNaN(Number(form.qty))) {
      newErrors.qty = 'Valid quantity is required';
      valid = false;
    }
    if (!form.uom.trim()) {
      newErrors.uom = 'Unit of measure is required';
      valid = false;
    }
    if (!form.price_per_qty.trim() || Number.isNaN(Number(form.price_per_qty))) {
      newErrors.price_per_qty = 'Valid price per quantity is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  }, [form]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = useCallback(async () => {
    if (!validateForm()) return;

    try {
      const payload = { ...form, qty: Number(form.qty), price_per_qty: Number(form.price_per_qty) };

      if (item) {
        await updateInventoryItem(item.id, payload);
        onSuccess('Item berhasil diperbarui!');
      } else {
        await createInventoryItem(payload);
        onSuccess('Item berhasil ditambahkan!');
      }
      onClose();
    } catch (error) {
      console.error('Failed to save item:', error);
    }
  }, [form, item, onClose, onSuccess, validateForm]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{item ? 'Edit Inventory Item' : 'Add Inventory Item'}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Item Name"
          name="item"
          value={form.item}
          onChange={handleChange}
          error={!!errors.item}
          helperText={errors.item}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Quantity"
          name="qty"
          value={form.qty}
          onChange={handleChange}
          error={!!errors.qty}
          helperText={errors.qty}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Unit of Measure"
          name="uom"
          value={form.uom}
          onChange={handleChange}
          error={!!errors.uom}
          helperText={errors.uom}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Price per Quantity"
          name="price_per_qty"
          value={form.price_per_qty}
          onChange={handleChange}
          error={!!errors.price_per_qty}
          helperText={errors.price_per_qty}
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
