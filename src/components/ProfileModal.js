import React from 'react';
import { X, Star, MapPin, Clock } from 'lucide-react';

const ProfileModal = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      {/* Modal content */}
    </div>
  );
};

export default ProfileModal;
