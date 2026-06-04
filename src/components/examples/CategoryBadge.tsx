import CategoryBadge from "../CategoryBadge";

export default function CategoryBadgeExample() {
  return (
    <div className="flex flex-wrap gap-2 p-4">
      <CategoryBadge label="한식" />
      <CategoryBadge label="일식" />
      <CategoryBadge label="중식" variant="outline" />
      <CategoryBadge label="양식" variant="default" />
    </div>
  );
}
