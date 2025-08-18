/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";
import { Cog1 } from "../../icons/Cog1";
import { Home1 } from "../../icons/Home1";
import { LightningBolt } from "../../icons/LightningBolt";
import { Moon2 } from "../../icons/Moon2";
import { Puzzle } from "../../icons/Puzzle";

export const PropertyDefaultWrapper = ({
  property1,
  className,
  frameClassName,
  frameClassNameOverride,
  graphicClassName,
}) => {
  return (
    <div className={`w-[1920px] h-[90px] bg-[#f3f4f6] ${className}`}>
      <div className="relative h-[90px]">
        <div className="flex w-[1920px] h-[90px] items-start justify-center gap-2.5 p-2.5 absolute top-0 left-0 bg-[#f3f4f6]">
          <div
            className={`flex flex-col w-[314px] items-center justify-center gap-2.5 px-[54px] py-4 relative self-stretch bg-lime-400 rounded-lg overflow-hidden ${frameClassName}`}
          >
            <div className="gap-[11px] w-full flex-[0_0_auto] mt-[-4.50px] mb-[-4.50px] flex items-center justify-center relative self-stretch">
              <Home1 className="!relative !w-10 !h-10" />
              <div className="relative w-[60px] h-[47px] mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-[#1f2937] text-xl tracking-[0] leading-[30px]">
                Home
              </div>
            </div>
          </div>

          <div className="flex-col w-[314px] gap-2.5 px-[54px] py-4 bg-[#f3f4f6] rounded-lg overflow-hidden flex items-center justify-center relative self-stretch">
            <div className="gap-[11px] w-full flex-[0_0_auto] mt-[-4.50px] mb-[-4.50px] flex items-center justify-center relative self-stretch">
              <LightningBolt className="!relative !w-10 !h-10" />
              <div className="relative w-[130px] h-[47px] mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-[#1f2937] text-xl tracking-[0] leading-[30px]">
                Consumption
              </div>
            </div>
          </div>

          <div
            className={`flex flex-col w-[314px] items-center justify-center gap-2.5 px-[54px] py-4 relative self-stretch bg-[#f3f4f6] rounded-lg overflow-hidden ${frameClassNameOverride}`}
          >
            <div className="gap-[11px] w-full flex-[0_0_auto] mt-[-4.50px] mb-[-4.50px] flex items-center justify-center relative self-stretch">
              <Puzzle className="!relative !w-10 !h-10" />
              <div className="relative w-[127px] h-[47px] mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-[#1f2937] text-xl tracking-[0] leading-[30px]">
                Automations
              </div>
            </div>
          </div>

          <div className="flex flex-col w-[314px] items-center justify-center gap-2.5 px-[54px] py-4 relative self-stretch bg-[#f3f4f6] rounded-lg overflow-hidden">
            <div className="gap-[11px] w-full flex-[0_0_auto] mt-[-4.50px] mb-[-4.50px] flex items-center justify-center relative self-stretch">
              <Cog1 className="!relative !w-10 !h-10" />
              <div className="relative w-36 h-[47px] mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-[#1f2937] text-xl tracking-[0] leading-[30px]">
                Configuration
              </div>
            </div>
          </div>
        </div>

        <div className="inline-flex h-[70px] items-center gap-[11px] pl-[27px] pr-[30px] py-2 absolute top-2.5 left-[1758px] bg-[#f3f4f6] border-l [border-left-style:solid] border-black">
          <Moon2 className="!relative !w-10 !h-10" />
          <div
            className={`relative w-[54px] h-[54px] rounded-[48px] bg-[url(https://c.animaapp.com/MCBeHGpe/img/graphic.svg)] bg-cover bg-[50%_50%] ${graphicClassName}`}
          />
        </div>
      </div>
    </div>
  );
};
