import Image from "next/image";
import OrdersCart from "./orders-cart";

export default async function OrdersPage() {
  return (
    <div className="max-w-[400px] mx-auto space-y-4">
      <h1 className="text-center text-xl font-bold">Đơn hàng</h1>
      <OrdersCart></OrdersCart>
    </div>
  );
}
