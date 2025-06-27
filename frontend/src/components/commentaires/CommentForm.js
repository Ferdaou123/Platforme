import React, { useState } from 'react';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';

const CommentForm = ({ 
  onSubmit, 
  onCancel, 
  placeholder = "Écrivez votre commentaire...", 
  submitText = "Publier",
  initialValue = ""
}) => {
  const [contenu, setContenu] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!contenu.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(contenu.trim());
      setContenu('');
    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContenu(initialValue);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <textarea
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          placeholder={placeholder}
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 resize-none"
          rows="3"
          maxLength="500"
          disabled={isSubmitting}
        />
        <div className="text-right text-xs text-gray-500 mt-1">
          {contenu.length}/500 caractères
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={handleCancel}
            className="btn bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center"
            disabled={isSubmitting}
          >
            <FaTimes className="mr-2" />
            Annuler
          </button>
        )}
        
        <button
          type="submit"
          className="btn btn-primary flex items-center"
          disabled={isSubmitting || !contenu.trim()}
        >
          <FaPaperPlane className="mr-2" />
          {isSubmitting ? 'Publication...' : submitText}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;