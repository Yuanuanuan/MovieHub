import SocialMedia from "@/components/SocialMedia";
import { type IPersonInfo } from "@/utils/module";
import { getPersonImage } from "@/utils/person";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";

function PersonInfo({ personInfo }: { personInfo: IPersonInfo }) {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 px-4 md:px-16">
      <div className="flex-none w-28 md:w-[200px] -mt-16 md:-mt-20 relative z-10">
        <ImageWithSkeleton
          src={getPersonImage(personInfo)}
          alt="演員照片"
          loading="eager"
          className="w-full aspect-[2/3] rounded-lg shadow-2xl border-4 border-black"
          imgClassName="w-full h-full object-cover rounded-lg"
        />
      </div>

      <div className="flex-1 flex flex-col gap-3 pt-4 w-full">
        <h1 className="text-[32px] md:text-[44px] font-black leading-tight">
          {personInfo.name}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
          {personInfo.known_for_department && (
            <span className="text-xs px-3 py-1 rounded-full border border-white/20">
              {personInfo.known_for_department}
            </span>
          )}
          {personInfo.birthday && <span>{personInfo.birthday}</span>}
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm text-slate-300 max-w-sm">
          <dt className="font-bold text-slate-400">出生地</dt>
          <dd>{personInfo.place_of_birth || "資料不詳"}</dd>
          <dt className="font-bold text-slate-400">性別</dt>
          <dd>{transGender(personInfo.gender)}</dd>
        </dl>
        <SocialMedia externalIds={personInfo.external_ids} />
      </div>
    </div>
  );
}

export default PersonInfo;

/** 獲取演員性別 */
function transGender(gender: 1 | 2) {
  return gender === 2 ? "男" : "女";
}
