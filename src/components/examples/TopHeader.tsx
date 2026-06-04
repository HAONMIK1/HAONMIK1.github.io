import TopHeader from "../TopHeader";

export default function TopHeaderExample() {
  return (
    <TopHeader
      location="강남구"
      notificationCount={3}
      onLocationClick={() => {}}
      onNotificationClick={() => {}}
      onSearch={() => {}}
    />
  );
}
