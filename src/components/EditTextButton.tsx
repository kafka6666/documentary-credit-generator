'use client';

import React, { useState } from 'react';

interface EditTextButtonProps {
  content: string;
  onSave: (editedContent: string) => void;
}

export default function EditTextButton({ 
  content, 
  onSave 
}: EditTextButtonProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleSave = () => {
    onSave(editedContent);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditedContent(content);
    setIsEditing(false);
  };
  
  if (isEditing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
          <h2 className="text-2xl font-bold mb-4 text-blue-800 border-b pb-2">Edit Documentary Credit Draft</h2>
          
          <textarea
            className="w-full h-96 p-6 border border-gray-300 rounded-md font-mono text-base mb-4 flex-grow bg-gray-50 text-gray-900 leading-relaxed focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            spellCheck="false"
          />
          
          <div className="flex justify-end gap-4 mt-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <button
      onClick={handleEdit}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
    >
      Edit File
    </button>
  );
}
