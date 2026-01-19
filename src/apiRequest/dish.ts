import http from "../lib/http";
import {
  CreateDishBodyType,
  DishListResType,
  DishResType,
  UpdateDishBodyType,
} from "../schemaValidations/dish.schema";
const prefix = "/dishes";

const dishApiRequest = {
  // Note: Next.js 15 thì mặc định fetch sẽ là { cache: 'no-store' } (dynamic rendering page)
  // Hiện tại next.js 14 mặc định fetch sẽ là { cache: 'force-cache' } nghĩa là cache (static rendering page)
  list: () => http.get<DishListResType>("dishes"),
  // // list dish with pagination
  // listWithPagnation: () =>
  //   http.get<DishListWithPaginationResType>(`${prefix}/pagination`),
  // get dish detail by id
  getDish: (id: number) => http.get<DishResType>(`${prefix}/${id}`),
  // Add new dish
  addDish: (body: CreateDishBodyType) =>
    http.post<DishResType>(`${prefix}`, body),
  // update Dish
  updateDish: (id: number, body: UpdateDishBodyType) =>
    http.put<DishResType>(`${prefix}/${id}`, body),
  // delete Delete
  deleteDish: (id: number) => http.delete<DishResType>(`${prefix}/${id}`),
};

export default dishApiRequest;
