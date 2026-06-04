import PointTransactionItem from "../PointTransactionItem";

export default function PointTransactionItemExample() {
  return (
    <div className="flex flex-col divide-y">
      <PointTransactionItem
        id="txn1"
        type="earn"
        description="맛집 등록 (사진 포함)"
        amount={1500}
        timestamp="2시간 전"
        icon="restaurant"
      />
      <PointTransactionItem
        id="txn2"
        type="earn"
        description="후기 작성"
        amount={500}
        timestamp="5시간 전"
        icon="review"
      />
      <PointTransactionItem
        id="txn3"
        type="earn"
        description="영수증 인증"
        amount={5000}
        timestamp="1일 전"
        icon="receipt"
      />
    </div>
  );
}
