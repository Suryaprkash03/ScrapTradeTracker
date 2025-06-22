export const PERMISSIONS = {
  // Admin permissions (full access)
  ADMIN: {
    pages: [
      '/admin-dashboard',
      '/users',
      '/inventory',
      '/deals',
      '/shipments',
      '/documents',
      '/finance',
      '/reports',
      '/imports',
      '/settings',
      '/partners'
    ],
    actions: [
      'create_user',
      'edit_user',
      'delete_user',
      'assign_roles',
      'manage_deals',
      'manage_inventory',
      'manage_shipments',
      'manage_documents',
      'approve_deals',
      'reject_deals',
      'access_all_reports',
      'manage_settings'
    ]
  },

  // Export Manager permissions
  EXPORT_MANAGER: {
    pages: [
      '/deals',
      '/documents',
      '/shipments',
      '/finance',
      '/reports',
      '/partners'
    ],
    actions: [
      'create_export_deals',
      'manage_export_deals',
      'upload_documents',
      'manage_suppliers_buyers',
      'track_shipments',
      'update_shipments',
      'record_weighbridge',
      'record_quality_tests',
      'view_payment_records',
      'manage_payment_records',
      'view_export_analytics'
    ],
    restrictions: [
      'cannot_manage_users',
      'cannot_assign_roles',
      'cannot_delete_inventory',
      'cannot_view_import_data'
    ]
  },

  // Yard Staff permissions
  YARD_STAFF: {
    pages: [
      '/inventory',
      '/scrap-lifecycle',
      '/quality-check',
      '/shipments/view-only'
    ],
    actions: [
      'manage_inventory',
      'update_inventory',
      'input_lifecycle_stages',
      'upload_inspection_reports',
      'upload_quality_reports',
      'assign_barcodes',
      'assign_qr_codes',
      'mark_recycled',
      'mark_disposed',
      'view_shipments_readonly'
    ],
    restrictions: [
      'cannot_create_deals',
      'cannot_view_deals',
      'cannot_manage_payments',
      'cannot_manage_documents',
      'no_access_suppliers_buyers',
      'no_access_reports'
    ]
  }
};

export const hasPermission = (userRole: string, action: string): boolean => {
  const roleKey = userRole.toUpperCase() as keyof typeof PERMISSIONS;
  const permissions = PERMISSIONS[roleKey];
  
  if (!permissions) return false;
  
  return permissions.actions.includes(action);
};

export const hasPageAccess = (userRole: string, page: string): boolean => {
  const roleKey = userRole.toUpperCase() as keyof typeof PERMISSIONS;
  const permissions = PERMISSIONS[roleKey];
  
  if (!permissions) return false;
  
  return permissions.pages.includes(page);
};

export const canAccessResource = (userRole: string, resource: string, action: string): boolean => {
  const roleKey = userRole.toUpperCase() as keyof typeof PERMISSIONS;
  
  // Admin has access to everything
  if (roleKey === 'ADMIN') return true;
  
  const permissions = PERMISSIONS[roleKey];
  if (!permissions) return false;
  
  // Check if the action is explicitly restricted
  const restrictionKey = `cannot_${action}` as const;
  if (permissions.restrictions?.includes(restrictionKey)) return false;
  
  // Check if the user has the required action permission
  return permissions.actions.includes(`${action}_${resource}`) || 
         permissions.actions.includes(action) ||
         permissions.actions.includes(`manage_${resource}`);
};

export const getAccessiblePages = (userRole: string): string[] => {
  const roleKey = userRole.toUpperCase() as keyof typeof PERMISSIONS;
  const permissions = PERMISSIONS[roleKey];
  
  if (!permissions) return [];
  
  return permissions.pages;
};

export const LIFECYCLE_STAGES = [
  { value: 'collection', label: 'Collection' },
  { value: 'sorting', label: 'Sorting' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'melting', label: 'Melting' },
  { value: 'distribution', label: 'Distribution' }
];

export const INVENTORY_STATUS = [
  { value: 'available', label: 'Available' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'sold', label: 'Sold' },
  { value: 'recycled', label: 'Recycled' },
  { value: 'disposed', label: 'Disposed' }
];

export const DOCUMENT_TYPES = [
  { value: 'invoice', label: 'Commercial Invoice' },
  { value: 'packing_list', label: 'Packing List' },
  { value: 'bol', label: 'Bill of Lading' },
  { value: 'coo', label: 'Certificate of Origin' },
  { value: 'lc', label: 'Letter of Credit' },
  { value: 'inspection_certificate', label: 'Inspection Certificate' }
];

export const PAYMENT_TYPES = [
  { value: 'advance', label: 'Advance Payment' },
  { value: 'tt', label: 'Telegraphic Transfer (TT)' },
  { value: 'lc', label: 'Letter of Credit (LC)' },
  { value: 'balance', label: 'Balance Payment' }
];