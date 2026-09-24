import menImg from "/men.jpg";
import womenImg from "/women.jfif";
import { getProfileUrl } from "@/utils/image";

/** 獲取演員圖像 */
export function getPersonImage(person: { profile_path: string | null; gender: 1 | 2 }) {
  const url = getProfileUrl(person.profile_path);
  if (url) return url;

  return person.gender === 1 ? womenImg : menImg;
}
