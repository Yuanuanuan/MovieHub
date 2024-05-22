import instance from "./instance";

/** 獲取演員資訊 */
export async function getPersonDetails(id: number) {
  const res = await instance.get(
    `/person/${id}?append_to_response=movie_credits,external_ids&language=zh-TW`
  );
  return res.data.results;
}
