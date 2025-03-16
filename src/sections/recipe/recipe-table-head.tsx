import { TableHead, TableRow, TableCell } from '@mui/material';

export function RecipeTableHead() {
  return (
    <TableHead>
      <TableRow>
        <TableCell>Name</TableCell>
        <TableCell>SKU</TableCell>
        <TableCell>COGS</TableCell>
        <TableCell>Actions</TableCell>
      </TableRow>
    </TableHead>
  );
}
