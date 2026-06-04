import FollowButton from "../FollowButton";

export default function FollowButtonExample() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <FollowButton userId="user1" />
      <FollowButton userId="user2" initialFollowing size="sm" />
    </div>
  );
}
