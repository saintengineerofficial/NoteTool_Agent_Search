import React from "react";
import Link from "next/link";
import Image from "next/image";

const Logo = () => {
  return (
    <Link href='/' className="w-fit flex items-center gap-[2px]">
      <div className="flex aspect-square size-8 items-center justify-center rounded-md overflow-hidden bg-primary text-primary-foreground">
        <Image src="/logo.png" width={36} height={36} alt="Waveai" />
      </div>

      <div className="flex-1 text-left text-base leading-tight">
        <span className="font-medium">toto</span>
      </div>
    </Link>
  );
};

export default Logo;
