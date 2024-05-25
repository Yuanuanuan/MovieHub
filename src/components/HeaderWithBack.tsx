import { useNavigate } from "react-router-dom";

import backIcon from "/back.svg";

export default function HeaderWithBack() {
  const navigate = useNavigate();

  function handleBack() {
    navigate(-1);
  }

  return (
    <header className="w-full h-20 flex items-center">
      <img
        width={48}
        height={48}
        src={backIcon}
        className="ml-4 cursor-pointer"
        alt="back icon"
        onClick={handleBack}
      />
    </header>
  );
}
