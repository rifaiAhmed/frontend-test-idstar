import { InventoryItem } from 'src/models/inventory';

interface ApiResponse {
  meta: { current_page: number; totalPages: number; totalData: number };
  data: InventoryItem[];
}

const apiUrl = import.meta.env.VITE_API_URL;

/**
 * Helper function untuk menangani error Unauthorized (401)
 */
const handleUnauthorized = () => {
  localStorage.removeItem('token'); // Hapus token
  window.location.href = '/sign-in'; // Redirect ke halaman login
};

/**
 * Fetch inventory items with pagination, search, and sorting.
 */
export const fetchInventory = async (
  page: number = 1,
  rowsPerPage: number = 5,
  search: string = '',
  sortType: string = '',
  sortBy: string = ''
): Promise<ApiResponse> => {
  try {
    const token = localStorage.getItem('token') || '';

    const queryParams = new URLSearchParams({
      sort_by: sortBy,
      sort_type: sortType,
      limit: rowsPerPage.toString(),
      skip: ((page - 1) * rowsPerPage).toString(),
    });

    if (search) {
      queryParams.append('search', search);
    }

    const response = await fetch(`${apiUrl}inventory?${queryParams}`, {
      method: 'GET',
      headers: { Authorization: token ? `${token}` : '', 'Content-Type': 'application/json' },
      mode: 'cors',
      credentials: 'include',
    });

    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching inventory:', error);
    throw error;
  }
};

/**
 * Delete inventory item by ID.
 */
export async function deleteInventoryItem(id: number) {
  try {
    const token = localStorage.getItem('token') || '';

    const response = await fetch(`${apiUrl}inventory/${id}`, {
      method: 'DELETE',
      headers: { Authorization: token ? `${token}` : '', 'Content-Type': 'application/json' },
    });

    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('Unauthorized');
    }

    if (!response.ok) throw new Error('Failed to delete inventory item');
  } catch (error) {
    console.error('Error deleting inventory:', error);
    throw error;
  }
}

/**
 * Create a new inventory item.
 */
export async function createInventoryItem(
  itemData: Omit<InventoryItem, 'id'>
): Promise<InventoryItem> {
  try {
    const token = localStorage.getItem('token') || '';

    const response = await fetch(`${apiUrl}inventory`, {
      method: 'POST',
      headers: { Authorization: token ? `${token}` : '', 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    });

    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create inventory item: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating inventory:', error);
    throw error;
  }
}

/**
 * Update an existing inventory item.
 */
export async function updateInventoryItem(
  id: number,
  updatedData: Partial<InventoryItem>
): Promise<InventoryItem> {
  try {
    const token = localStorage.getItem('token') || '';

    const response = await fetch(`${apiUrl}inventory/${id}`, {
      method: 'PUT',
      headers: { Authorization: token ? `${token}` : '', 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });

    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update inventory item: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating inventory:', error);
    throw error;
  }
}
