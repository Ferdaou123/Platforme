import React, { useState } from 'react';
import { FaUser, FaReply, FaEdit, FaTrash, FaCrown, FaCog } from 'react-icons/fa';
import moment from 'moment';
import 'moment/locale/fr';
import CommentForm from './CommentForm';

moment.locale('fr');

const CommentItem = ({ commentaire, onReply, onUpdate, onDelete, currentUser, isReply = false }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  // ✅ Vérification de sécurité pour éviter les erreurs
  if (!commentaire) {
    console.warn('CommentItem: commentaire is null or undefined');
    return null;
  }

  // ✅ Vérification de sécurité pour l'utilisateur du commentaire
  const commentaireUser = commentaire.utilisateur || {};
  const commentaireUserName = commentaireUser.nom || 'Utilisateur supprimé';
  const commentaireUserRole = commentaireUser.rôle || 'citoyen';
  const commentaireUserId = commentaireUser._id || null;

  // ✅ Vérifications de permissions avec utilisateur courant
  const canEdit = currentUser && commentaireUserId && (
    currentUser._id === commentaireUserId || 
    currentUser.rôle === 'admin'
  );

  const canDelete = currentUser && commentaireUserId && (
    currentUser._id === commentaireUserId || 
    currentUser.rôle === 'admin'
  );

  const getUserIcon = (role) => {
    switch (role) {
      case 'admin':
        return <FaCrown className="text-yellow-500" title="Administrateur" />;
      case 'technicien':
        return <FaCog className="text-blue-500" title="Technicien" />;
      default:
        return <FaUser className="text-gray-500" title="Citoyen" />;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'technicien':
        return 'Technicien';
      default:
        return 'Citoyen';
    }
  };

  const handleReply = (contenu) => {
    if (onReply && typeof onReply === 'function') {
      onReply(contenu, commentaire._id);
    }
    setShowReplyForm(false);
  };

  const handleUpdate = (contenu) => {
    if (onUpdate && typeof onUpdate === 'function') {
      onUpdate(commentaire._id, contenu);
    }
    setShowEditForm(false);
  };

  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      if (onDelete && typeof onDelete === 'function') {
        onDelete(commentaire._id);
      }
    }
  };

  // ✅ Vérification de sécurité pour le contenu du commentaire
  const commentaireContenu = commentaire.contenu || '';
  const commentaireDateCreation = commentaire.dateCréation;

  return (
    <div className={`${isReply ? 'ml-8 pl-4 border-l-2 border-gray-200' : ''}`}>
      <div className="flex space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            {getUserIcon(commentaireUserRole)}
          </div>
        </div>
        
        <div className="flex-grow">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-gray-900">
                    {commentaireUserName}
                  </h4>
                  <span className="text-xs text-gray-500">
                    {getRoleLabel(commentaireUserRole)}
                  </span>
                  {!commentaireUserId && (
                    <span className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded">
                      Supprimé
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {commentaireDateCreation 
                    ? moment(commentaireDateCreation).fromNow()
                    : 'Date inconnue'
                  }
                </p>
              </div>
              
              {(canEdit || canDelete) && (
                <div className="flex space-x-2">
                  {canEdit && (
                    <button
                      onClick={() => setShowEditForm(true)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      title="Modifier"
                    >
                      <FaEdit />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={handleDelete}
                      className="text-red-600 hover:text-red-800 text-sm"
                      title="Supprimer"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {showEditForm ? (
              <CommentForm
                initialValue={commentaireContenu}
                onSubmit={handleUpdate}
                onCancel={() => setShowEditForm(false)}
                placeholder="Modifiez votre commentaire..."
                submitText="Modifier"
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">
                {commentaireContenu || 'Contenu supprimé'}
              </p>
            )}
          </div>
          
          {!isReply && currentUser && !showEditForm && (
            <div className="mt-2 flex items-center space-x-4">
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
              >
                <FaReply className="mr-1" />
                Répondre
              </button>
              
              {commentaire.réponses && Array.isArray(commentaire.réponses) && commentaire.réponses.length > 0 && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  {showReplies ? 'Masquer' : 'Afficher'} les réponses ({commentaire.réponses.length})
                </button>
              )}
            </div>
          )}
          
          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                onSubmit={handleReply}
                onCancel={() => setShowReplyForm(false)}
                placeholder="Écrivez votre réponse..."
                submitText="Répondre"
              />
            </div>
          )}
          
          {/* Affichage des réponses */}
          {showReplies && 
           commentaire.réponses && 
           Array.isArray(commentaire.réponses) && 
           commentaire.réponses.length > 0 && (
            <div className="mt-4 space-y-4">
              {commentaire.réponses
                .filter(reponse => reponse && reponse._id) // ✅ Filtrer les réponses invalides
                .map(reponse => (
                  <CommentItem
                    key={reponse._id}
                    commentaire={reponse}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    currentUser={currentUser}
                    isReply={true}
                  />
                ))
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;