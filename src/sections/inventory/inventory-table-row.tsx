import { TableRow, TableCell, Button } from '@mui/material';
import { InventoryItem } from 'src/models/inventory';

interface InventoryTableRowProps {
  row: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: number) => void;
}

export function InventoryTableRow({ row, onEdit, onDelete }: InventoryTableRowProps) {
  return (
    <TableRow>
      <TableCell>{row.item}</TableCell>
      <TableCell>{row.qty}</TableCell>
      <TableCell>{row.uom}</TableCell>
      <TableCell>{row.price_per_qty}</TableCell>
      <TableCell>
        <Button variant="outlined" color="primary" onClick={() => onEdit(row)}>
          Edit
        </Button>
        <Button variant="outlined" color="error" onClick={() => onDelete(row.id)} sx={{ ml: 1 }}>
          Delete
        </Button>
      </TableCell>
    </TableRow>
  );
}
