import menImg from "/men.jpg";
import womenImg from "/women.jfif";
import { type IPersonInfo } from "@/utils/module";

/** 獲取演員圖像 */
export function getPersonImage(person: IPersonInfo) {
  if (person.profile_path)
    return import.meta.env.VITE_IMAGE_URL + person.profile_path;

  if (person.gender === 1) {
    return womenImg;
  } else {
    return menImg;
  }
}
