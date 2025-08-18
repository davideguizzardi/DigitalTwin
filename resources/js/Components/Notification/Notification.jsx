/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";
import { useReducer } from "react";
import { Chevron8 } from "../../icons/Chevron8";
import { Chevron9 } from "../../icons/Chevron9";

export const Notification = ({ stateProp }) => {
  const [state, dispatch] = useReducer(reducer, {
    state: stateProp || "ringtone",
  });

  return (
    <div
      className={`border border-solid border-gray w-[156px] flex items-center gap-2.5 px-[25px] py-2 rounded bg-white relative ${state.state === "open" ? "h-[110px]" : "h-[55px]"}`}
      onClick={() => {
        dispatch("click");
      }}
    >
      {state.state === "open" && (
        <div className="flex flex-col w-[54px] items-start gap-5 relative">
          <div className="inline-flex items-start gap-3.5 relative flex-[0_0_auto] mr-[-71.00px]">
            <img
              className="w-3.5 relative h-4"
              alt="Vector"
              src="https://c.animaapp.com/MCBeHGpe/img/vector-18.svg"
            />

            <div className="relative w-[97px] mt-[-1.00px] [font-family:'Roboto',Helvetica] font-normal text-[#1e1e1e] text-[15px] tracking-[0] leading-[normal]">
              Ringtone
            </div>
          </div>

          <div className="inline-flex items-start gap-3.5 relative flex-[0_0_auto] mr-[-28.00px]">
            <img
              className="w-4 relative h-4"
              alt="Vector"
              src="https://c.animaapp.com/MCBeHGpe/img/vector-15.svg"
            />

            <div className="relative w-[52px] mt-[-1.00px] [font-family:'Roboto',Helvetica] font-normal text-[#1e1e1e] text-[15px] tracking-[0] leading-[normal]">
              Music
            </div>
          </div>
        </div>
      )}

      <div
        className={`flex items-center relative ${state.state === "ringtone" ? "w-[90px]" : "w-[26px]"} ${state.state === "ringtone" ? "gap-3.5" : "gap-5"}`}
      >
        {state.state === "open" && (
          <div className="relative w-[55.02px] h-[18px] mr-[-29.02px]" />
        )}

        {state.state === "ringtone" && (
          <>
            <img
              className="relative w-3.5 h-4"
              alt="Vector"
              src="https://c.animaapp.com/MCBeHGpe/img/vector-23.svg"
            />

            <div className="flex w-[55.02px] items-center gap-[34px] relative">
              <div className="relative w-[68px] mt-[-1.00px] mr-[-12.98px] [font-family:'Roboto',Helvetica] font-normal text-[#1e1e1e] text-[15px] tracking-[0] leading-[normal]">
                Ringtone
              </div>
            </div>
          </>
        )}
      </div>

      {state.state === "open" && (
        <Chevron8 className="!relative !w-2.5 !h-2.5 !mr-[-4.00px]" />
      )}

      {state.state === "ringtone" && (
        <Chevron9 className="!relative !w-2.5 !h-2.5 !mr-[-4.00px]" />
      )}
    </div>
  );
};

function reducer(state, action) {
  switch (action) {
    case "click":
      return {
        ...state,
        state: "open",
      };
  }

  return state;
}
