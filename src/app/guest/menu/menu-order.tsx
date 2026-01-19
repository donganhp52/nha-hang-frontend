"use client";

import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetDishList } from "@/src/queries/useDish";
import { cn, formatCurrency, handleErrorApi } from "@/src/lib/utils";
import Quantity from "./quantity";
import { useMemo, useState } from "react";
import { GuestCreateOrdersBodyType } from "@/src/schemaValidations/guest.schema";
import { useCreateOrderMutation } from "@/src/queries/useGuest";
import { useRouter } from "next/navigation";
import { DishStatus } from "@/src/constants/type";

export default function MenuOrder() {
  const { data } = useGetDishList();
  const dishes = useMemo(() => data?.payload.data ?? [], [data]);
  const [orders, setOrders] = useState<GuestCreateOrdersBodyType>([]);
  const { mutateAsync } = useCreateOrderMutation();
  const router = useRouter();

  const totalPrice = useMemo(() => {
    return dishes.reduce((result, dish) => {
      const order = orders.find((order) => order.dishId === dish.id);
      if (!order) return result;
      return result + order.quantity * dish.price;
    }, 0);
  }, [dishes, orders]);

  const handleOrder = async () => {
    try {
      await mutateAsync(orders);
      router.push("/guest/orders");
    } catch (error) {
      handleErrorApi({
        error,
      });
    }
  };

  // Hàm xử lý khi thay đổi số lượng món ăn trong giỏ hàng
  const handleQuantityChange = (dishId: number, quantity: number) => {
    setOrders((prevOrders) => {
      // Trường hợp 1: Nếu số lượng = 0, xóa món ăn khỏi giỏ hàng
      // VD: prevOrders = [{dishId: 1, quantity: 2}, {dishId: 2, quantity: 3}]
      // Nếu dishId = 1 và quantity = 0 => Kết quả: [{dishId: 2, quantity: 3}]
      if (quantity === 0) {
        return prevOrders.filter((order) => order.dishId !== dishId);
      }

      // Tìm vị trí của món ăn trong giỏ hàng (nếu có)
      const index = prevOrders.findIndex((order) => order.dishId === dishId);

      // Trường hợp 2: Món ăn chưa có trong giỏ hàng (index = -1), thêm mới vào
      // VD: prevOrders = [{dishId: 1, quantity: 2}]
      // Thêm dishId = 3, quantity = 1 => Kết quả: [{dishId: 1, quantity: 2}, {dishId: 3, quantity: 1}]
      if (index === -1) {
        return [...prevOrders, { dishId, quantity }];
      }

      // Trường hợp 3: Món ăn đã có trong giỏ hàng, cập nhật số lượng mới
      // VD: prevOrders = [{dishId: 1, quantity: 2}, {dishId: 2, quantity: 3}]
      // Cập nhật dishId = 2, quantity = 5 => Kết quả: [{dishId: 1, quantity: 2}, {dishId: 2, quantity: 5}]
      const newOrders = [...prevOrders];
      newOrders[index] = { ...newOrders[index], quantity };
      return newOrders;
    });
  };

  console.log(orders);

  return (
    <>
      {dishes
        .filter((dish) => dish.status !== DishStatus.Hidden)
        .map((dish) => (
          <div
            key={dish.id}
            className={cn("flex gap-4", {
              "pointer-events-none": dish.status === DishStatus.Unavailable,
            })}
          >
            <div className="flex-shrink-0 relative">
              {" "}
              {dish.status === DishStatus.Unavailable && (
                <span className="absolute inset-0 flex items-center justify-center text-sm">
                  Hết hàng
                </span>
              )}
              <Image
                src={dish.image}
                alt={dish.name}
                height={100}
                width={100}
                quality={100}
                className="object-cover w-[80px] h-[80px] rounded-md"
              />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm">{dish.name}</h3>
              <p className="text-xs">{dish.description}</p>
              <p className="text-xs font-semibold">
                {formatCurrency(dish.price)}
              </p>
            </div>
            <div className="flex-shrink-0 ml-auto flex justify-center items-center">
              <div className="flex gap-1 ">
                <Quantity
                  onChange={(value) => handleQuantityChange(dish.id, value)}
                  value={
                    orders.find((order) => order.dishId === dish.id)
                      ?.quantity ?? 0
                  }
                />
              </div>
            </div>
          </div>
        ))}
      <div className="sticky bottom-0">
        <Button
          className="w-full justify-between"
          onClick={handleOrder}
          disabled={orders.length === 0}
        >
          <span>Giỏ hàng · {orders.length} món</span>
          <span>{formatCurrency(totalPrice)} đ</span>
        </Button>
      </div>
    </>
  );
}
