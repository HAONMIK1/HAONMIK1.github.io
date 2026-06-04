import RankingCard from "../RankingCard";

export default function RankingCardExample() {
  return (
    <div className="flex flex-col gap-2 p-4 max-w-md">
      <RankingCard
        rank={1}
        user={{ id: "1", name: "김맛집", hasLicense: true }}
        score={45000}
      />
      <RankingCard
        rank={2}
        user={{ id: "2", name: "이쩝쩝" }}
        score={38000}
      />
      <RankingCard
        rank={3}
        user={{ id: "3", name: "박푸드" }}
        score={32000}
        isCurrentUser
      />
    </div>
  );
}
