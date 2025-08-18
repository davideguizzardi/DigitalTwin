/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";

export const InputSelector = ({ type }) => {
  return (
    <div className="border border-solid border-gray w-[280px] flex items-center gap-2.5 px-[25px] py-2 h-[55px] rounded bg-white relative">
      <div className="[font-family:'Roboto',Helvetica] tracking-[0] text-xs flex-1 text-[#1e1e1e] font-normal leading-[normal] relative">
        {type === "date" && <>Mon,&nbsp;&nbsp;23 Jun 2025</>}

        {type === "hour" && <>08 : 30 AM</>}
      </div>

      <img
        className="w-4 h-4 relative"
        alt="Vector"
        src={
          type === "hour"
            ? "https://c.animaapp.com/MCBeHGpe/img/vector-27.svg"
            : "https://c.animaapp.com/MCBeHGpe/img/vector-25.svg"
        }
      />
    </div>
  );
};
