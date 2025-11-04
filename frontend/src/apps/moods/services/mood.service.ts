/* eslint-disable @typescript-eslint/no-explicit-any */
import { axiosAPI } from "@/services/axiosAPI";
import type { APIResponse, SafeResponse } from "@/services/common.interface";
import type { Mood } from "./mood.interface";

const MOOD_ENDPOINT = "/users/{USERID}/moods";

export interface MoodDTO {
  moodId: string;
}

export interface CreateMood {
  day: string;
  month: string;
  moods: MoodDTO[];
  userId: string;
  year: string;
}

export const createMoods = async ({
  day,
  month,
  moods,
  userId,
  year,
}: CreateMood): Promise<SafeResponse<Mood>> => {
  try {
    // "/users/{USERID}/moods/month/2025-12/days/05";
    const PATH = MOOD_ENDPOINT.replace("{USERID}", userId);

    const res = await axiosAPI.put<APIResponse<Mood>>(
      `${PATH}/month/${year}-${month}/days/${day}`,
      { moods },
    );

    return {
      success: true,
      data: res.data.data,
      message: res.data.message,
    };
  } catch (e: any) {
    console.error(e);

    return {
      success: false,
      error:
        e?.response?.data?.error ||
        "Ocurrió un error inesperado con la creación.",
    };
  }
};
