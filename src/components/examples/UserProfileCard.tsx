import UserProfileCard from "../UserProfileCard";

export default function UserProfileCardExample() {
  return (
    <div className="p-4 max-w-md">
      <UserProfileCard
        userId="user1"
        name="김쩝쩝"
        bio="서울 강남 맛집 전문가 🍽️ 진짜 맛집만 소개합니다"
        hasLicense
        stats={{
          restaurants: 47,
          reviews: 132,
          followers: 1240,
          following: 89,
        }}
        onFollowChange={() => {}}
      />
    </div>
  );
}
