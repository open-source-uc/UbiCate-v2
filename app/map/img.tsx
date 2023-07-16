import Image from "next/image";

export default function Img() {
  return (
    <div className="relative w-5 h-5">
      <Image className="" src="/static/assets/logo.svg" alt="Logo" width={20} height={20} />
    </div>
  );
}
