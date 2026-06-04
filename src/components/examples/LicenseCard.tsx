import LicenseCard from "../LicenseCard";

export default function LicenseCardExample() {
  return (
    <div className="grid gap-4 p-4 max-w-2xl">
      <LicenseCard
        title="맛집 평론가"
        description="정확하고 신뢰할 수 있는 리뷰를 작성하는 전문가"
        icon="crown"
        requirements={[
          { label: "맛집 등록", current: 5, target: 10, completed: false },
          { label: "후기 작성", current: 15, target: 20, completed: false },
          { label: "팔로워", current: 50, target: 100, completed: false },
        ]}
        unlocked={true}
      />
      <LicenseCard
        title="맛집러"
        description="새로운 맛집을 발굴하고 공유하는 탐험가"
        icon="star"
        requirements={[
          { label: "맛집 등록", current: 3, target: 5, completed: false },
          { label: "사진 업로드", current: 10, target: 10, completed: true },
        ]}
        unlocked={true}
        selected
      />
    </div>
  );
}
