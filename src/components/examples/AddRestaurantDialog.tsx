import { useState } from "react";
import AddRestaurantDialog from "../AddRestaurantDialog";
import { Button } from "@/components/ui/button";

export default function AddRestaurantDialogExample() {
  const [open, setOpen] = useState(true);

  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>맛집 등록</Button>
      <AddRestaurantDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
