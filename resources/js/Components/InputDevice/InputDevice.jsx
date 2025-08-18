/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";
import { useReducer } from "react";
import { Menu1 } from "../../icons/Menu1";
import { Menu } from "../Menu";

export const InputDevice = ({ device }) => {
  const [state, dispatch] = useReducer(reducer, {
    device: device || "bulb",
  });

  return (
    <div
      className={`border border-solid border-gray w-[280px] flex items-center gap-2.5 rounded bg-white relative ${state.device === "open" ? "pl-[25px] pr-[31px] py-2" : "px-[25px] py-2"} ${state.device === "open" ? "h-[165px]" : "h-[55px]"}`}
      onClick={() => {
        dispatch("click");
      }}
    >
      {["bulb", "speaker"].includes(state.device) && (
        <>
          <div className="flex items-center grow gap-2.5 flex-1 relative">
            <img
              className="w-4 h-4 relative"
              alt="Vector"
              src={
                state.device === "speaker"
                  ? "https://c.animaapp.com/MCBeHGpe/img/vector-22.svg"
                  : "https://c.animaapp.com/MCBeHGpe/img/vector-29.svg"
              }
            />

            <div className="[font-family:'Roboto',Helvetica] tracking-[0] text-xs flex-1 text-[#1e1e1e] font-normal leading-[normal] relative">
              {state.device === "bulb" && <>Light Bulb</>}

              {state.device === "speaker" && <>Speaker</>}
            </div>
          </div>

          <Menu1 className="!relative !w-5 !h-5" />
        </>
      )}

      {state.device === "open" && (
        <>
          <div className="flex flex-col items-start justify-center gap-9 relative flex-1 grow">
            <div
              className="flex items-center gap-2.5 relative self-stretch w-full flex-[0_0_auto]"
              onClick={() => {
                dispatch("click_215");
              }}
            >
              <img
                className="relative w-4 h-4"
                alt="Vector"
                src="https://c.animaapp.com/MCBeHGpe/img/vector-2.svg"
              />

              <div className="relative flex-1 [font-family:'Roboto',Helvetica] font-normal text-[#1e1e1e] text-xs tracking-[0] leading-[normal]">
                Light Bulb
              </div>
            </div>

            <div className="flex items-center gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
              <img
                className="relative w-3.5 h-[18px]"
                alt="Vector"
                src="https://c.animaapp.com/MCBeHGpe/img/vector-3.svg"
              />

              <div className="relative flex-1 [font-family:'Roboto',Helvetica] font-normal text-[#1e1e1e] text-xs tracking-[0] leading-[normal]">
                Smart Plug
              </div>
            </div>

            <div
              className="flex items-center gap-2.5 relative self-stretch w-full flex-[0_0_auto]"
              onClick={() => {
                dispatch("click_221");
              }}
            >
              <img
                className="relative w-4 h-4"
                alt="Vector"
                src="https://c.animaapp.com/MCBeHGpe/img/vector-22.svg"
              />

              <div className="relative flex-1 [font-family:'Roboto',Helvetica] font-normal text-[#1e1e1e] text-xs tracking-[0] leading-[normal]">
                Speaker
              </div>
            </div>
          </div>

          <Menu />
          <img
            className="relative w-[12.71px] h-[7.06px] mr-[-0.35px]"
            alt="Vector"
            src="https://c.animaapp.com/MCBeHGpe/img/vector-2-1.svg"
          />
        </>
      )}
    </div>
  );
};

function reducer(state, action) {
  if (state.device === "open") {
    switch (action) {
      case "click_215":
        return {
          device: "bulb",
        };

      case "click_221":
        return {
          device: "speaker",
        };
    }
  }

  switch (action) {
    case "click":
      return {
        ...state,
        device: "open",
      };
  }

  return state;
}
