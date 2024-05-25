import { ReactNode } from "react";

interface BaseButtonProps {
  children: ReactNode;
}

function BaseButton(props: BaseButtonProps) {
  return (
    <div
      {...props}
      className="flex justify-center items-center bg-primary py-3 px-7 rounded-md"
    >
      {props.children}
    </div>
  );
}

export default BaseButton;
