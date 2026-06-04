import PointsDisplay from "../PointsDisplay";

export default function PointsDisplayExample() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <PointsDisplay points={15000} />
      <PointsDisplay points={5000} size="sm" showLabel />
      <PointsDisplay points={25000} size="lg" />
    </div>
  );
}
