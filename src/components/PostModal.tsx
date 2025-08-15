import React from "react";
import ReactDOM from "react-dom";
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
    console.log("Descrição no PostModal:", description); // Log para depuração
    return ReactDOM.createPortal(
        <div className="modal-overlay">
            <div className="modal-content">
                <button
                    onClick={onClose}
                    aria-label="Fechar"
                    className="close-btnX">
                    &times;
                </button>

                <h2>{title}</h2>
                {imageUrl && <img src={imageUrl} alt={title} className="modal-image" />}
                <p>{description || "Sem descrição disponível."}</p>
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