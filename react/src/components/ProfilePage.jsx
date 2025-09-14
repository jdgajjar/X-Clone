import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Profile from "./Profile";
import Loading from "./Loading";
import { useSelector, useDispatch } from "react-redux";
import { clientServer } from "../config/clientServer";
import { fetchProfileDataThunk } from "../config/redux/action/profileAction";

const ProfilePage = ({ currentUser, randomusers }) => {
  const { username } = useParams();
  const dispatch = useDispatch();
  const profileState = useSelector((state) => state.profile) || {};
  const { profile: profileUser, posts, followers, following, loading, error } = profileState;
  const [localFollowers, setFollowers] = useState(followers || []);
  const [isFollowing, setIsFollowing] = useState(() => {
    if (!currentUser || !profileUser) return false;
    return localFollowers.some(f => f._id === currentUser._id);
  });
  // Keep localFollowers in sync with Redux followers
  useEffect(() => {
    setFollowers(followers || []);
  }, [followers]);

  // Debug log for troubleshooting
  console.log('profileUser:', profileUser);
  console.log('posts:', posts);
  console.log('followers:', followers);
  console.log('following:', following);
  console.log('loading:', loading);
  console.log('error:', error);

  useEffect(() => {
    dispatch(fetchProfileDataThunk({ username }));
    // eslint-disable-next-line
  }, [username, dispatch]);

  // Keep localFollowers in sync with Redux followers
  useEffect(() => {
    setFollowers(followers || []);
  }, [followers]);

  // Keep isFollowing in sync with localFollowers and currentUser
  useEffect(() => {
    if (!currentUser) {
      setIsFollowing(false);
      return;
    }
    setIsFollowing(localFollowers.some(f => f._id === currentUser._id));
  }, [localFollowers, currentUser]);

  // Follow/unfollow handler
  const onFollowToggle = async () => {
    if (!profileUser || !profileUser._id) return;
    try {
          // Optimistic UI update
    if (isFollowing) {
      setFollowers((prev) => prev.filter((f) => f._id !== currentUser._id));
    } else {
      setFollowers((prev) => [...prev, { _id: currentUser._id }]);
    }



      // Send follow/unfollow request
      const res = await clientServer.post(
        `api/profile/${profileUser.username}/toggle-follow`,
        {},
        { withCredentials: true }
      );

      if (res.status === 200) {
        // Refetch updated profile data
        dispatch(fetchProfileDataThunk({ username: profileUser.username }));
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
    }
  };

  if (loading) return <Loading />;
  if (!profileUser)
    return (
      <div className="text-center text-gray-400 py-10">Profile not found.</div>
    );

  return (
    <Profile
      user={profileUser}
      posts={posts}
      followers={localFollowers}
      following={following}
      currentUser={currentUser}
      randomusers={randomusers}
      onEditProfile={() => {
        // Navigate to edit profile page for current user
        if (profileUser && profileUser._id) {
          window.location.href = `/profile/${profileUser._id}/edit`;
        }
      }}
      onFollowToggle={onFollowToggle}
      isFollowing={isFollowing}
    />
  );
};

export default ProfilePage;
