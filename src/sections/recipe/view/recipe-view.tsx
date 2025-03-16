import { useEffect, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { MessageSnackbar } from 'src/layouts/components/MessageSnackBar';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { fetchRecipe, deleteRecipeItem, fetchRecipeDetail } from 'src/services/recipeService';
import { RecipeItem, RecipeDetailResponse } from 'src/models/recipe';
import { TableNoData } from 'src/sections/user/table-no-data';
import { RecipeTableRow } from '../recipe-table-row';
import { RecipeModal } from '../recipe-modal';
import { RecipeDetailModal } from '../recipe-detail-modal';

export function RecipeView() {
  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [meta, setMeta] = useState({ totalData: 0, totalPages: 0, current_page: 1 });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSearch, setTempSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RecipeItem | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<RecipeDetailResponse | null>(null);

  // Handle Snackbar Notifications
  const handleSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Fetch Recipes
  const loadRecipes = useCallback(async () => {
    try {
      const response = await fetchRecipe(page + 1, rowsPerPage, searchQuery, sortOrder, 'name');
      setRecipes(response.data || []); // Pastikan tidak null
      setMeta(response.meta || { totalData: 0, totalPages: 0, current_page: 1 });
    } catch (error) {
      console.error('Failed to load recipes:', error);
    }
  }, [page, rowsPerPage, searchQuery, sortOrder]);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  // Handle Search
  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setSearchQuery(tempSearch);
      setPage(0);
    }
  };

  // Handle Add Recipe
  const handleAdd = () => {
    console.log('Tambah Resep diklik!'); // Debugging
    setSelectedItem(null);
    setModalOpen(true);
  };

  // Handle Edit Recipe
  const handleEdit = (item: RecipeItem) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  // Handle Delete Recipe
  const handleDeleteConfirm = (id: number) => {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteId(null);
    setDeleteConfirmOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId !== null) {
      try {
        await deleteRecipeItem(deleteId);
        setRecipes((prevRecipes) => prevRecipes.filter((item) => item.id !== deleteId));
        handleSnackbar('Resep berhasil dihapus!', 'success');
        loadRecipes();
      } catch (error) {
        console.error('Failed to delete recipe:', error);
        handleSnackbar('Gagal menghapus resep.', 'error');
      } finally {
        setDeleteConfirmOpen(false);
        setDeleteId(null);
      }
    }
  };

  const handleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleView = async (item: RecipeItem) => {
    try {
      const response = await fetchRecipeDetail(item.id);
      setSelectedDetailItem(response);
      setDetailModalOpen(true);
    } catch (error) {
      handleSnackbar('Gagal mengambil detail resep.', 'error');
    }
  };

  return (
    <DashboardContent>
      <MessageSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity as any}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />

      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Resep
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleAdd}
        >
          Tambah Resep
        </Button>
      </Box>

      <Card>
        <OutlinedInput
          fullWidth
          value={tempSearch}
          onChange={(event) => setTempSearch(event.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Cari resep..."
          startAdornment={
            <InputAdornment position="start">
              <Iconify width={20} icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          }
          sx={{ maxWidth: 320, my: 3, ml: 5 }}
        />
        <Scrollbar>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel active direction={sortOrder} onClick={handleSort}>
                      NAME RECIPE
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>COGS</TableCell>
                  <TableCell>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recipes.length > 0 ? (
                  recipes.map((row) => (
                    <RecipeTableRow
                      key={row.id}
                      row={row}
                      onEdit={handleEdit}
                      onDelete={() => handleDeleteConfirm(row.id)}
                      onView={handleView}
                    />
                  ))
                ) : (
                  <TableNoData searchQuery={searchQuery} />
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
      </Card>

      <RecipeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        item={selectedItem}
        onSuccess={loadRecipes}
      />
      <RecipeDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        item={selectedDetailItem}
        onDeleteSuccess={loadRecipes}
      />

      <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Hapus Resep</DialogTitle>
        <DialogContent>Apakah Anda yakin ingin menghapus resep ini?</DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Batal</Button>
          <Button onClick={handleDelete} color="error">
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
