import React from "react";
import PostPartial from "./PostPartial";

const HomeMain = ({ posts = [], currentUser, onEdit, onDelete, onLike, onReply, onShare }) => (
  <main className="z-10 flex-grow border-x border-gray-800 min-h-screen md:max-w-[600px]">
    <div id="timeline-content">
      {posts.length > 0 ? (
        posts.map((post, idx) => (
          <div className="post p-4 border-b border-gray-800" key={post._id || idx}>
            <PostPartial
              post={post}
              currentUser={currentUser}
              onEdit={() => onEdit && onEdit(post)}
              onDelete={() => onDelete && onDelete(post)}
              onLike={() => onLike && onLike(post)}
              onReply={() => onReply && onReply(post)}
              onShare={() => onShare && onShare(post)}
            />
          </div>
        ))
      ) : (
        <div className="text-gray-500 text-center py-8">
          <p>No posts yet. Start posting!</p>
        </div>
      )}
    </div>
  </main>
);

export default HomeMain;
