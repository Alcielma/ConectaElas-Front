import React from "react";
import ReactDOM from "react-dom";
import { IonIcon } from "@ionic/react";
import { arrowBack } from "ionicons/icons";
import CommentItem from "./CommentItem";
import "./PostModal.css";

interface Comment {
    id: number;
    comentario: string;
    data: string | null;
    createdAt: string;
}

interface PostModalProps {
    title: string;
    imageUrl: string | null;
    description: string;
    comments: Comment[];
    newComment: string;
    setNewComment: (value: string) => void;
    handleAddComment: () => void;
    onClose: () => void;
}

const PostModal: React.FC<PostModalProps> = ({
    title,
    imageUrl,
    description,
    comments,
    newComment,
    setNewComment,
    handleAddComment,
    onClose,
}) => {
    return ReactDOM.createPortal(
        <div className="modal-overlay">
            <div className="modal-content" >

                {/* Seta branca para voltar */}
                <div className="modal-header">
                    <IonIcon
                        icon={arrowBack}
                        className="voltar-seta-modal"
                        onClick={onClose}
                    />
                    <h2>{title}</h2>
                    {imageUrl && <img src={imageUrl} alt={title} className="modal-image" />}
                   <p className="modal-description">{description || "Sem descrição disponível."}</p>
                    
                </div>

                <div className="modal-comments">
                    <h4>Comentários</h4>
                    <div className="add-comment">
                        <input
                            type="text"
                            placeholder="Deixe um comentário..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <button onClick={handleAddComment}>Enviar</button>
                    </div>
                    {comments.length > 0 ? (
                        comments.map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comentario={comment.comentario}
                                createdAt={comment.createdAt}
                            />
                        ))
                    ) : (
                        <p className="sem-comentarios">Sem comentários ainda.</p>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default PostModal;
