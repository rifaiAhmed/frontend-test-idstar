import { TableHead, TableRow, TableCell } from '@mui/material';

export function InventoryTableHead() {
  return (
    <TableHead>
      <TableRow>
        <TableCell>Item</TableCell>
        <TableCell>Quantity</TableCell>
        <TableCell>Unit</TableCell>
        <TableCell>Price per Qty</TableCell>
      </TableRow>
    </TableHead>
  );
}
