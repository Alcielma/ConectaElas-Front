import "./Post.css";
import Perfil from "../../public/Perfil.svg";

interface PostProps {
  title: string;
  imageUrl: string | null;
  description: string;
}

const Post = ({ title, imageUrl, description }: PostProps) => {
  const finalImageUrl = imageUrl || "https://via.placeholder.com/300";
  const placeholderName = "Rafael Alves";
  const placeholderEmail = "Rafael.alves@exemplo.com";
  
  return (
    <div className="post-container">
      <div className="profile-container">
        <img className="profile-image" src={Perfil} alt="Profile" />
        <div className="profile-info">
          <div className="profile-name">{placeholderName}</div>
          <div className="profile-email">{placeholderEmail}</div>
        </div>
      </div>
      <img className="post-image" src={finalImageUrl} alt={title} />
      <div className="post-content">
        <div className="post-title">{title}</div>
        <p className="post-description">{description}</p>
      </div>
    </div>
  );
};

export default Post;
