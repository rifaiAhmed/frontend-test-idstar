import { useEffect, useState } from 'react';
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
import { Ingredient, RecipeDetailResponse } from 'src/models/recipe';
import { deleteIngredentItem, fetchRecipeDetail } from 'src/services/recipeService';
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
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [recipeDetail, setRecipeDetail] = useState<RecipeDetailResponse | null>(item);

  useEffect(() => {
    if (open && item) {
      fetchRecipeDetail(item.recipe.id)
        .then((data) => setRecipeDetail(data))
        .catch((error) => console.error('Failed to fetch updated recipe:', error));
    }
  }, [open, item]);

  const handleSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleEdit = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setFormOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleDeleteClick = (id: number) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedId !== null) {
      setLoading(true);
      try {
        await deleteIngredentItem(selectedId);
        const updatedData = await fetchRecipeDetail(recipeDetail?.recipe.id ?? 0);
        setRecipeDetail(updatedData);
        handleSnackbar('Bahan berhasil dihapus!', 'success');
        onDeleteSuccess();
      } catch (error) {
        console.error('Gagal menghapus bahan:', error);
        handleSnackbar('Gagal menghapus bahan.', 'error');
      } finally {
        setLoading(false);
        setConfirmOpen(false);
        setSelectedId(null);
      }
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Detail Recipe</DialogTitle>
        <DialogContent>
          {recipeDetail ? (
            <>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <strong>Name</strong>
                    </TableCell>
                    <TableCell>{recipeDetail.recipe.name}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <strong>SKU</strong>
                    </TableCell>
                    <TableCell>{recipeDetail.recipe.sku}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <strong>COGS</strong>
                    </TableCell>
                    <TableCell>{recipeDetail.recipe.cogs}</TableCell>
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
                  onClick={() => {
                    setSelectedIngredient(null);
                    setFormOpen(true);
                  }}
                >
                  Add
                </Button>
              </div>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>UOM</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recipeDetail?.ingredients?.length > 0 ? (
                    recipeDetail.ingredients.map((ingredient) => (
                      <TableRow key={ingredient.id}>
                        <TableCell>{ingredient.item || '-'}</TableCell>
                        <TableCell>{ingredient.quantity || '0'}</TableCell>
                        <TableCell>{ingredient.uom || '-'}</TableCell>
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
                      <TableCell colSpan={4} align="center" style={{ color: 'red' }}>
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

      {/* Modal untuk tambah/edit bahan */}
      <IngredientFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        recipeId={recipeDetail?.recipe.id ?? 0}
        ingredient={selectedIngredient}
        onSaveSuccess={async () => {
          setFormOpen(false);
          const updatedData = await fetchRecipeDetail(recipeDetail?.recipe.id ?? 0);
          setRecipeDetail(updatedData);
        }}
      />

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
    </>
  );
}
