import React from "react";
import DropdownMenuWithNavigate from "./DropdownMenuWithNavigate";

const PostPartial = ({ post, currentUser, onEdit, onDelete, onLike, onReply, onShare, handleViewProfile }) => (

  

  <article className="border-b border-gray-800 p-4 post-hover cursor-pointer">
    <div className="flex">
      <div className="flex-shrink-0 mr-3">
        
          <img
  src={
    user?.profileImg?.startsWith("http")
      ? user.profileImg
      : "/images/default_profile.png"
  }
  alt="profile"
/>

          alt={post.author?.name || 'User'}
          className="w-10 h-10 rounded-full object-cover bg-gray-800 border-2 border-gray-700 block align-middle"
          style={{ boxSizing: 'border-box', margin: 0, padding: 0 }}
        />
      </div>
      <div className="flex-grow">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <span className="font-bold hover:underline mr-1 flex items-center">
              <span className="flex items-center"  onClick={() => handleViewProfile(post.author?.username)}>
                {post.author?.username}
                {post.author?.IsVerified && (
                  <span title="Verified" className="ml-1 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      x="0px"
                      y="0px"
                      width="20"
                      height="20"
                      viewBox="0 0 50 50"
                      className="inline-block align-middle ml-1 "
                      style={{ verticalAlign: "middle" }}
                    >
                      <path
                        fill="#1DA1F2"
                        d="M45.103,24.995l3.195-6.245l-5.892-3.807l-0.354-7.006l-7.006-0.35l-3.81-5.89l-6.242,3.2l-6.245-3.196l-3.806,5.893 L7.938,7.948l-0.352,7.007l-5.89,3.81l3.2,6.242L1.702,31.25l5.892,3.807l0.354,7.006l7.006,0.35l3.81,5.891l6.242-3.2l6.245,3.195 l3.806-5.893l7.005-0.354l0.352-7.006l5.89-3.81L45.103,24.995z M22.24,32.562l-6.82-6.819l2.121-2.121l4.732,4.731l10.202-9.888 l2.088,2.154L22.24,32.562z"
                      ></path>
                    </svg>
                  </span>
                )}
              </span>
            </span>
            <span className="text-gray-500">{new Date(post.createdAt).toLocaleString()}</span>
          </div>
          {currentUser && currentUser._id && post.author?._id && String(currentUser._id) === String(post.author._id) && (
            <DropdownMenuWithNavigate postId={post._id} />
          )}
        </div>
        <div className="mt-1 text-[15px] leading-normal whitespace-pre-line">{post.content}</div>
        {post.image?.url && (
          <div className="mt-2">
            <img src={post.image.url} alt="Post Image" className="rounded-lg max-h-80 w-auto object-cover" />
          </div>
        )}
        <div className="flex justify-between mt-3 text-gray-500 max-w-md">
          <button className={`flex items-center space-x-1 ${post.isLiked ? 'text-red-500 fill-red-500' : 'text-gray-500'} hover:text-red-500`} onClick={onLike}>
            <span className="material-symbols-outlined">favorite</span>
            <span>{post.likes?.length || 0}</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500" onClick={onReply}>
            <span className="material-symbols-outlined">comment</span>
            <span>{post.replies?.length || 0}</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500" onClick={onShare}>
            <span className="material-symbols-outlined">share</span>
            <span>{post.shares?.length || 0}</span>
          </button>
        </div>
      </div>
    </div>
  </article>
);

export default PostPartial;
