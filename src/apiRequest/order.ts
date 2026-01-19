import http from "../lib/http";
import {
  CreateOrdersBodyType,
  CreateOrdersResType,
  GetOrderDetailResType,
  GetOrdersQueryParamsType,
  GetOrdersResType,
  PayGuestOrdersBodyType,
  PayGuestOrdersResType,
  UpdateOrderBodyType,
  UpdateOrderResType,
} from "../schemaValidations/order.schema";
import queryString from "query-string";

const prefix = "/orders";

const orderApiRequest = {
  getOrderList: (queryParams: GetOrdersQueryParamsType) =>
    http.get<GetOrdersResType>(
      `${prefix}?` +
        queryString.stringify({
          fromDate: queryParams.fromDate?.toISOString(),
          toDate: queryParams.toDate?.toISOString(),
        })
    ),
  updateOrder: (id: number, body: UpdateOrderBodyType) =>
    http.put<UpdateOrderResType>(`${prefix}/${id}`, body),
  getOrderDetail: (orderId: number) =>
    http.get<GetOrderDetailResType>(`${prefix}/${orderId}`),
  pay: (body: PayGuestOrdersBodyType) =>
    http.post<PayGuestOrdersResType>(`${prefix}/pay`, body),
  createOrders: (body: CreateOrdersBodyType) =>
    http.post<CreateOrdersResType>(`${prefix}`, body),
};

export default orderApiRequest;
