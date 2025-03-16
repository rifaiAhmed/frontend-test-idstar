import { TableRow, TableCell, Button } from '@mui/material';
import { RecipeItem } from 'src/models/recipe';

interface RecipeTableRowProps {
  row: RecipeItem;
  onEdit: (item: RecipeItem) => void;
  onDelete: (id: number) => void;
  onView: (item: RecipeItem) => void;
}

export function RecipeTableRow({ row, onEdit, onDelete, onView }: RecipeTableRowProps) {
  return (
    <TableRow>
      <TableCell>{row.name}</TableCell>
      <TableCell>{row.sku}</TableCell>
      <TableCell>{row.cogs}</TableCell>
      <TableCell>
        <Button variant="contained" color="info" onClick={() => onView(row)} sx={{ mr: 1 }}>
          View Detail
        </Button>
        <Button variant="outlined" color="primary" onClick={() => onEdit(row)} sx={{ mr: 1 }}>
          Edit
        </Button>
        <Button variant="outlined" color="error" onClick={() => onDelete(row.id)}>
          Delete
        </Button>
      </TableCell>
    </TableRow>
  );
}
