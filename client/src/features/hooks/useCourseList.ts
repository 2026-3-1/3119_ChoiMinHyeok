import { useQuery } from "@tanstack/react-query";
import {
  getCourseByCategory,
  getCourses,
  getCategories,
  type GetCoursesParams,
} from "./api";
 
export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 10,
  });
 
export const useCourses = (params: GetCoursesParams, enabled = true) =>
  useQuery({
    queryKey: ["courses", params],
    queryFn: () => getCourses(params),
    enabled,
    placeholderData: (prev) => prev,
  });

export const useCoursesByCategory = (categoryId: number | null) =>
  useQuery({
    queryKey: ["courses", "category", categoryId],
    queryFn: () => getCourseByCategory(categoryId as number),
    enabled: categoryId !== null,
  });
 
