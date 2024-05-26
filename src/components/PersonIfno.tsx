import SocialMedia from "@/components/SocialMedia";
import menImg from "/men.jpg";
import womenImg from "/women.jfif";
import maleIcon from "/male.svg";
import femaleIcon from "/female.svg";
import { type IPersonInfo } from "@/utils/module";

function PersonInfo({ personInfo }: { personInfo: IPersonInfo }) {
  return (
    <div className="w-full h-fit flex gap-32">
      <img
        width={"40%"}
        height={"100%"}
        src={getPersonImage(personInfo)}
        className="max-w-[400px] object-cover rounded-2xl border-primary"
        style={{
          boxShadow: "-2px -2px 15px #252525, 2px 2px 15px #474747",
        }}
        alt="person image"
      />
      <div className="w-[60%] h-full font-notoSans">
        <h1 className="text-5xl">{personInfo.name}</h1>
        <hr className="hr my-8" />
        <h2 className="text-xl my-8 font-bold">
          生日:
          <span className=" ml-3 font-normal">{personInfo.birthday}</span>
        </h2>
        <h3 className="text-xl my-8 font-bold">
          出生地:
          <span className=" ml-3 font-normal">{personInfo.place_of_birth}</span>
        </h3>
        <h4 className="text-xl my-8 font-bold flex items-center">
          性別:
          <span className=" ml-3 font-normal">
            <img
              width={36}
              height={36}
              src={transGender(personInfo.gender)}
              alt=" gender"
            />
          </span>
        </h4>
        <SocialMedia externalIds={personInfo.external_ids} />
      </div>
    </div>
  );
}

export default PersonInfo;

/** 獲取演員圖像 */
function getPersonImage(person: IPersonInfo) {
  if (person.profile_path)
    return import.meta.env.VITE_IMAGE_URL + person.profile_path;

  if (person.gender === 1) {
    return womenImg;
  } else {
    return menImg;
  }
}

/** 獲取演員性別 */
function transGender(gender: 1 | 2) {
  if (gender === 2) {
    return maleIcon;
  }
  return femaleIcon;
}
