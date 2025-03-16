import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Snackbar,
  Alert,
} from '@mui/material';
import { IngredientData, RecipeDetailResponse, Ingredient } from 'src/models/recipe';
import { deleteIngredentItem } from 'src/services/recipeService';
import { Iconify } from 'src/components/iconify';
import { IngredientFormModal } from './view/ingredient-form-modal';

interface RecipeDetailModalProps {
  open: boolean;
  onClose: () => void;
  item: RecipeDetailResponse | null;
  onDeleteSuccess: () => void;
}

export function RecipeDetailModal({
  open,
  onClose,
  item,
  onDeleteSuccess,
}: RecipeDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [formOpen, setFormOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientData | null>(null);

  const handleOpenForm = () => {
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
  };

  const handleSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleDeleteClick = (id: number) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  const handleEdit = (data: Ingredient) => {
    console.log(data);
  };

  const handleDeleteConfirm = async () => {
    if (selectedId !== null) {
      setLoading(true);
      try {
        await deleteIngredentItem(selectedId);
        onDeleteSuccess(); // 🔥 Refresh data setelah delete
        handleSnackbar('Bahan berhasil dihapus!', 'success'); // 🔥 Tampilkan Snackbar sukses
      } catch (error) {
        console.error('Gagal menghapus bahan:', error);
        handleSnackbar('Gagal menghapus bahan.', 'error'); // 🔥 Tampilkan Snackbar error
      } finally {
        setLoading(false);
        setConfirmOpen(false); // 🔥 Tutup dialog konfirmasi
        setSelectedId(null);
      }
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Detail Recipe</DialogTitle>
        <DialogContent>
          {item ? (
            <>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <strong>Name</strong>
                    </TableCell>
                    <TableCell>{item.recipe.name}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <strong>SKU</strong>
                    </TableCell>
                    <TableCell>{item.recipe.sku}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <strong>COGS</strong>
                    </TableCell>
                    <TableCell>{item.recipe.cogs}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '20px',
                }}
              >
                <h3>Ingredients</h3>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  onClick={handleOpenForm}
                >
                  Add
                </Button>
              </div>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {item.ingredients.length > 0 ? (
                    item.ingredients.map((ingredient) => (
                      <TableRow key={ingredient.id}>
                        <TableCell>{ingredient.item}</TableCell>
                        <TableCell>{ingredient.quantity}</TableCell>
                        <TableCell>
                          <Button
                            color="error"
                            onClick={() => handleDeleteClick(ingredient.id)}
                            disabled={loading}
                          >
                            Delete
                          </Button>
                          <Button
                            color="warning"
                            disabled={loading}
                            onClick={() => handleEdit(ingredient)}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        Ingredients not found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
        <DialogContent>Apakah Anda yakin ingin menghapus bahan ini?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Batal</Button>
          <Button onClick={handleDeleteConfirm} color="error" disabled={loading}>
            {loading ? 'Menghapus...' : 'Hapus'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity as any}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <IngredientFormModal
        open={formOpen}
        onClose={handleCloseForm}
        recipeId={item?.recipe.id ?? 0}
        onSaveSuccess={() => {
          handleCloseForm();
          onDeleteSuccess();
        }}
      />
    </>
  );
}
