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
import { fetchInventory, deleteInventoryItem } from 'src/services/inventoryService';
import { InventoryItem } from 'src/models/inventory';
import { TableNoData } from 'src/sections/user/table-no-data';
import { InventoryTableRow } from '../inventory-table-row';
import { InventoryModal } from '../inventory-modal';

export function InventoryView() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [meta, setMeta] = useState({ totalData: 0, totalPages: 0, current_page: 1 });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSearch, setTempSearch] = useState('');
  const [sortField, setSortField] = useState<'item' | 'qty' | 'uom' | 'price_per_qty'>('item');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const handleSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const loadInventory = useCallback(async () => {
    try {
      const response = await fetchInventory(
        page + 1,
        rowsPerPage,
        searchQuery,
        sortOrder,
        sortField
      );
      setInventory(response.data);
      setMeta(response.meta);
    } catch (error) {
      console.error('Failed to load inventory:', error);
    }
  }, [page, rowsPerPage, searchQuery, sortOrder, sortField]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setSearchQuery(tempSearch);
      setPage(0);
    }
  };

  const handleSort = (field: 'item' | 'qty' | 'uom' | 'price_per_qty') => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setModalOpen(true);
  };

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
        await deleteInventoryItem(deleteId);
        setInventory(inventory.filter((item) => item.id !== deleteId));
        loadInventory();
        handleSnackbar('Item berhasil dihapus!', 'success');
      } catch (error) {
        console.error('Failed to delete item:', error);
        handleSnackbar('Gagal menghapus item.', 'error');
      } finally {
        setDeleteConfirmOpen(false);
        setDeleteId(null);
      }
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
          Inventory
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleAdd}
        >
          Add Item
        </Button>
      </Box>

      <Card>
        <OutlinedInput
          fullWidth
          value={tempSearch}
          onChange={(event) => setTempSearch(event.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search inventory..."
          startAdornment={
            <InputAdornment position="start">
              <Iconify width={20} icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          }
          sx={{ maxWidth: 320, my: 3, ml: 5 }}
        />
        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  {['item', 'qty', 'uom', 'price_per_qty'].map((field) => (
                    <TableCell key={field}>
                      <TableSortLabel
                        active={sortField === field}
                        direction={sortField === field ? sortOrder : 'asc'}
                        onClick={() => handleSort(field as any)}
                      >
                        {field.toUpperCase()}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventory.map((row) => (
                  <InventoryTableRow
                    key={row.id}
                    row={row}
                    onEdit={handleEdit}
                    onDelete={() => handleDeleteConfirm(row.id)}
                  />
                ))}
                {inventory.length === 0 && <TableNoData searchQuery={searchQuery} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={page}
          count={meta.totalData}
          rowsPerPage={rowsPerPage}
          onPageChange={(event, newPage) => setPage(newPage)}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={(event) => setRowsPerPage(parseInt(event.target.value, 10))}
        />
      </Card>

      <InventoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        item={selectedItem}
        onSuccess={(message) => {
          loadInventory();
          handleSnackbar(message, 'success');
        }}
      />

      <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this item?</DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
