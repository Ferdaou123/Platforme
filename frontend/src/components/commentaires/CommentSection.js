import React, { useState, useEffect, useContext } from 'react';
import { FaComment, FaReply, FaEdit, FaTrash, FaUser } from 'react-icons/fa';
import moment from 'moment';
import 'moment/locale/fr';
import AuthContext from '../../context/AuthContext';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import Spinner from '../layout/Spinner';

moment.locale('fr');

const CommentSection = ({ signalementId }) => {
  const [commentaires, setCommentaires] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchCommentaires();
  }, [signalementId, currentPage]);

  const fetchCommentaires = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/signalements/${signalementId}/commentaires?page=${currentPage}&limit=10`);
      
      if (currentPage === 1) {
        setCommentaires(res.data.data);
      } else {
        setCommentaires(prev => [...prev, ...res.data.data]);
      }
      
      setPagination(res.data.pagination || {});
      setIsLoading(false);
    } catch (err) {
      console.error('Erreur lors du chargement des commentaires:', err);
      toast.error('Erreur lors du chargement des commentaires');
      setIsLoading(false);
    }
  };

  const handleAddComment = async (contenu, commentaireParent = null) => {
    try {
      const commentData = { contenu };
      if (commentaireParent) {
        commentData.commentaireParent = commentaireParent;
      }

      const res = await api.post(`/signalements/${signalementId}/commentaires`, commentData);
      
      if (commentaireParent) {
        // Si c'est une réponse, mettre à jour le commentaire parent
        setCommentaires(prev => 
          prev.map(comment => {
            if (comment._id === commentaireParent) {
              return {
                ...comment,
                réponses: [...(comment.réponses || []), res.data.data]
              };
            }
            return comment;
          })
        );
      } else {
        // Si c'est un commentaire principal, l'ajouter en tête
        setCommentaires(prev => [res.data.data, ...prev]);
        setShowForm(false);
      }
      
      toast.success('Commentaire ajouté avec succès');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'ajout du commentaire');
    }
  };

  const handleUpdateComment = async (commentId, contenu) => {
    try {
      const res = await api.put(`/commentaires/${commentId}`, { contenu });
      
      // Mettre à jour le commentaire dans la liste
      setCommentaires(prev =>
        prev.map(comment => {
          if (comment._id === commentId) {
            return res.data.data;
          }
          // Vérifier aussi dans les réponses
          if (comment.réponses) {
            return {
              ...comment,
              réponses: comment.réponses.map(reply =>
                reply._id === commentId ? res.data.data : reply
              )
            };
          }
          return comment;
        })
      );
      
      toast.success('Commentaire modifié avec succès');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la modification du commentaire');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      return;
    }

    try {
      await api.delete(`/commentaires/${commentId}`);
      
      // Supprimer le commentaire de la liste
      setCommentaires(prev =>
        prev.filter(comment => {
          if (comment._id === commentId) {
            return false;
          }
          // Supprimer aussi des réponses
          if (comment.réponses) {
            comment.réponses = comment.réponses.filter(reply => reply._id !== commentId);
          }
          return true;
        })
      );
      
      toast.success('Commentaire supprimé avec succès');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la suppression du commentaire');
    }
  };

  const loadMoreComments = () => {
    if (pagination.next) {
      setCurrentPage(pagination.next.page);
    }
  };

  if (isLoading && currentPage === 1) {
    return <Spinner />;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <FaComment className="mr-2 text-primary-600" />
          Commentaires ({commentaires.length})
        </h3>
        
        {user && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary flex items-center"
          >
            <FaComment className="mr-2" />
            {showForm ? 'Annuler' : 'Ajouter un commentaire'}
          </button>
        )}
      </div>

      {showForm && user && (
        <div className="mb-6">
          <CommentForm
            onSubmit={(contenu) => handleAddComment(contenu)}
            onCancel={() => setShowForm(false)}
            placeholder="Écrivez votre commentaire..."
          />
        </div>
      )}

      {!user && (
        <div className="bg-gray-50 p-4 rounded-md mb-6 text-center">
          <p className="text-gray-600">
            Vous devez être connecté pour commenter ce signalement.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {commentaires.length > 0 ? (
          commentaires.map(commentaire => (
            <CommentItem
              key={commentaire._id}
              commentaire={commentaire}
              onReply={handleAddComment}
              onUpdate={handleUpdateComment}
              onDelete={handleDeleteComment}
              currentUser={user}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <FaComment className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun commentaire
            </h3>
            <p className="text-gray-500">
              Soyez le premier à commenter ce signalement !
            </p>
          </div>
        )}
      </div>

      {pagination.next && (
        <div className="text-center mt-6">
          <button
            onClick={loadMoreComments}
            className="btn bg-gray-100 text-gray-800 hover:bg-gray-200"
            disabled={isLoading}
          >
            {isLoading ? 'Chargement...' : 'Charger plus de commentaires'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentSection;