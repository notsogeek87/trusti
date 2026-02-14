import React from 'react';
import { X } from 'lucide-react';
import AdminSimpleTableModal from './AdminSimpleTableModal';

/**
 * Modal d'administration principale pour gérer toutes les applications
 */
const AdminAppsModal = ({ onClose }) => {
  return <AdminSimpleTableModal onClose={onClose} />;
};

export default AdminAppsModal;
