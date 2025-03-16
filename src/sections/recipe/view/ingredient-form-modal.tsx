import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { addIngredientItem, updateIngredientItem } from 'src/services/recipeService';
import { fetchInventory } from 'src/services/inventoryService';
import { Ingredient } from 'src/models/recipe';

interface IngredientFormModalProps {
  open: boolean;
  onClose: () => void;
  recipeId: number;
  ingredient?: { id: number; name: string; quantity: string; inventoryId: number } | null;
  onSaveSuccess: () => void;
}

export function IngredientFormModal({
  open,
  onClose,
  recipeId,
  ingredient,
  onSaveSuccess,
}: IngredientFormModalProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [inventoryId, setInventoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [inventoryList, setInventoryList] = useState<Ingredient[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);

  useEffect(() => {
    if (open) {
      setLoadingInventory(true);
      fetchInventory(1, 100, '', 'asc', 'id')
        .then((res) => {
          const data: Ingredient[] = res.data.map((item: any) => ({
            id: item.id,
            name: item.item, // Ubah dari `item` ke `name`
            item: item.item, // Tambahkan properti `item`
            inventory_id: item.id, // Gunakan ID inventory
            quantity: item.qty.toString(), // Ubah `qty` ke `quantity` dan ubah ke string
          }));
          setInventoryList(data);
        })
        .catch((err) => console.error('Error fetching inventory:', err))
        .finally(() => setLoadingInventory(false));
    }
  }, [open]);

  useEffect(() => {
    if (ingredient) {
      setName(ingredient.name);
      setQuantity(ingredient.quantity);
      setInventoryId(ingredient.inventoryId);
    } else {
      setName('');
      setQuantity('');
      setInventoryId(null);
    }
  }, [ingredient]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!name.trim() || !quantity.trim() || inventoryId === null) {
        alert('Semua field harus diisi!');
        setLoading(false);
        return;
      }

      const data = {
        recipe_id: recipeId,
        inventory_id: inventoryId,
        quantity: parseFloat(quantity),
      };

      if (ingredient && ingredient.id) {
        await updateIngredientItem(ingredient.id, data);
      } else {
        await addIngredientItem(data);
      }

      onSaveSuccess();
      onClose();
    } catch (error) {
      console.error('Gagal menyimpan bahan:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{ingredient ? 'Edit Ingredient' : 'Add Ingredient'}</DialogTitle>
      <DialogContent>
        <Autocomplete
          options={inventoryList}
          getOptionLabel={(option) => option.item} // Gunakan `name`
          value={inventoryList.find((item) => item.id === inventoryId) || null}
          onChange={(_, newValue) => {
            if (newValue) {
              setInventoryId(newValue.id);
              setName(newValue.item);
            }
          }}
          loading={loadingInventory}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Ingredient"
              margin="dense"
              fullWidth
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingInventory ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />

        <TextField
          fullWidth
          label="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          margin="dense"
          type="number"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
