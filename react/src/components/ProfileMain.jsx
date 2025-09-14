import React from "react";
import PostPartial from "./PostPartial";


const ProfileMain = ({ posts = [], currentUser, onEdit, onDelete, onLike, onReply, onShare }) => {
  // Show all posts passed in props (do not filter by currentUser)
  return (
    <main className="flex-grow border-x border-gray-800 min-h-screen md:max-w-[600px]">
      <div className="divide-y divide-gray-800">
        {posts.length > 0 ? (
          posts.map((post, idx) => (
            <PostPartial
              key={post._id || idx}
              post={post}
              currentUser={currentUser}
              onEdit={() => onEdit && onEdit(post)}
              onDelete={() => onDelete && onDelete(post)}
              onLike={() => onLike && onLike(post)}
              onReply={() => onReply && onReply(post)}
              onShare={() => onShare && onShare(post)}
            />
          ))
        ) : (
          <div className="text-gray-500 text-center py-8">
            <p>You haven't posted anything yet.</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default ProfileMain;
