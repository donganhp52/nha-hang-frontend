import { useQuery } from "@tanstack/react-query";
import { DashboardIndicatorQueryParamsType } from "../schemaValidations/indicator.schema";
import indicatorApiRequest from "../apiRequest/indicator";

export const useGetDashboardIndicators = (
  queryParams: DashboardIndicatorQueryParamsType
) => {
  return useQuery({
    queryKey: ["dashboardIndicators", queryParams],
    queryFn: () => indicatorApiRequest.getDashboardIndicators(queryParams),
  });
};
