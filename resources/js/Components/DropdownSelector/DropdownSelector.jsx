/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";
import { useReducer } from "react";
import { Chevron9 } from "../../icons/Chevron9";
import { Chevron10 } from "../../icons/Chevron10";

export const DropdownSelector = ({ stateProp }) => {
  const [state, dispatch] = useReducer(reducer, {
    state: stateProp || "device",
  });

  return (
    <div
      className={`border border-solid border-gray w-[156px] flex items-center gap-2.5 px-[25px] py-2 rounded bg-white relative ${state.state === "open" ? "h-[122px]" : "h-[55px]"}`}
      onClick={() => {
        dispatch("click");
      }}
    >
      {state.state === "device" && (
        <>
          <div className="flex w-[90px] items-center gap-5 relative">
            <img
              className="relative w-[9.02px] h-4"
              alt="Vector"
              src="https://c.animaapp.com/MCBeHGpe/img/vector-28.svg"
            />

            <div className="relative flex-1 mt-[-1.00px] [font-family:'Roboto',Helvetica] font-normal text-[#1e1e1e] text-[15px] tracking-[0] leading-[normal]">
              Device
            </div>
          </div>

          <Chevron9 className="!relative !w-2.5 !h-2.5 !mr-[-4.00px]" />
        </>
      )}

      {state.state === "open" && (
        <>
          <div className="inline-flex flex-col items-start justify-center gap-[30px] relative flex-[0_0_auto]">
            <div
              className="flex w-[90px] items-center gap-5 relative flex-[0_0_auto]"
              onClick={() => {
                dispatch("click_284");
              }}
            >
              <img
                className="w-[9.02px] relative h-4"
                alt="Vector"
                src="https://c.animaapp.com/MCBeHGpe/img/vector-17.svg"
              />

              <div className="relative flex-1 mt-[-1.00px] [font-family:'Roboto',Helvetica] font-normal text-[#1e1e1e] text-[15px] tracking-[0] leading-[normal]">
                Device
              </div>
            </div>

            <div className="flex w-[90px] items-center gap-[15px] relative flex-[0_0_auto]">
              <img
                className="w-3.5 relative h-4"
                alt="Vector"
                src="https://c.animaapp.com/MCBeHGpe/img/vector-18.svg"
              />

              <div className="relative w-fit mt-[-1.00px] [font-family:'Roboto',Helvetica] font-normal text-[#1e1e1e] text-[15px] tracking-[0] leading-[normal] whitespace-nowrap">
                Notify
              </div>
            </div>
          </div>

          <Chevron10 className="!relative !w-2.5 !h-2.5 !mr-[-4.00px]" />
        </>
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

    case "click_284":
      return {
        ...state,
        state: "device",
      };
  }

  return state;
}
