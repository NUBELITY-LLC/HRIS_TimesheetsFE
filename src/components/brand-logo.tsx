import Image from "next/image";

export function BrandLogo() {
  return (
    <span className="flex items-center gap-2.5">
      <Image
        src="/nubelity-mark.png"
        alt="Nubelity"
        width={400}
        height={203}
        priority
        className="h-7 w-auto"
      />
      <span className="text-[15px] font-semibold tracking-tight text-white">
        Nubelity TS
      </span>
    </span>
  );
}
