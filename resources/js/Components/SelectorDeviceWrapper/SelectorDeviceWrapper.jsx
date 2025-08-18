/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";
import { useReducer } from "react";
import { Chevron6 } from "../../icons/Chevron6";
import { Chevron9 } from "../../icons/Chevron9";

export const SelectorDeviceWrapper = ({ selector }) => {
  const [state, dispatch] = useReducer(reducer, {
    selector: selector || "device",
  });

  return (
    <div
      className={`border border-solid border-gray w-[156px] flex items-center gap-2.5 px-[25px] py-2 rounded bg-white relative ${state.selector === "open" ? "h-[165px]" : "h-[55px]"}`}
      onClick={() => {
        dispatch("click");
      }}
    >
      {["date", "device", "hour"].includes(state.selector) && (
        <>
          <div
            className={`w-[90px] flex items-center relative ${state.selector === "device" ? "gap-5" : "gap-[15px]"}`}
          >
            <img
              className={`h-4 relative ${state.selector === "device" ? "w-[9.02px]" : "w-4"}`}
              alt="Vector"
              src={
                state.selector === "hour"
                  ? "https://c.animaapp.com/MCBeHGpe/img/vector-27.svg"
                  : state.selector === "date"
                    ? "https://c.animaapp.com/MCBeHGpe/img/vector-25.svg"
                    : "https://c.animaapp.com/MCBeHGpe/img/vector-28.svg"
              }
            />

            <div
              className={`[font-family:'Roboto',Helvetica] mt-[-1.00px] tracking-[0] text-[15px] text-[#1e1e1e] relative font-normal leading-[normal] ${["date", "hour"].includes(state.selector) ? "w-[50px]" : ""} ${state.selector === "device" ? "flex-1" : ""}`}
            >
              {state.selector === "device" && <>Device</>}

              {state.selector === "hour" && <>Hour</>}

              {state.selector === "date" && <>Date</>}
            </div>
          </div>

          <Chevron9 className="!relative !w-2.5 !h-2.5 !mr-[-4.00px]" />
        </>
      )}

      {state.selector === "open" && (
        <>
          <div className="inline-flex flex-col items-start justify-center gap-[30px] relative flex-[0_0_auto]">
            <div
              className="flex w-[90px] items-center gap-[15px] relative flex-[0_0_auto]"
              onClick={() => {
                dispatch("click_244");
              }}
            >
              <img
                className="w-4 relative h-4"
                alt="Vector"
                src="https://c.animaapp.com/MCBeHGpe/img/vector-25.svg"
              />

              <div className="relative w-[50px] mt-[-1.00px] [font-family:'Roboto',Helvetica] font-normal text-[#1e1e1e] text-[15px] tracking-[0] leading-[normal]">
                Date
              </div>
            </div>

            <div
              className="flex w-[90px] items-center gap-5 relative flex-[0_0_auto]"
              onClick={() => {
                dispatch("click_247");
              }}
            >
              <img
                className="w-[9.02px] relative h-4"
                alt="Vector"
                src="https://c.animaapp.com/MCBeHGpe/img/vector-28.svg"
              />

              <div className="relative flex-1 mt-[-1.00px] [font-family:'Roboto',Helvetica] font-normal text-[#1e1e1e] text-[15px] tracking-[0] leading-[normal]">
                Device
              </div>
            </div>

            <div
              className="flex w-[90px] items-center gap-[15px] relative flex-[0_0_auto]"
              onClick={() => {
                dispatch("click_250");
              }}
            >
              <img
                className="w-4 relative h-4"
                alt="Vector"
                src="https://c.animaapp.com/MCBeHGpe/img/vector-27.svg"
              />

              <div className="relative w-[50px] mt-[-1.00px] [font-family:'Roboto',Helvetica] font-normal text-[#1e1e1e] text-[15px] tracking-[0] leading-[normal]">
                Hour
              </div>
            </div>
          </div>

          <Chevron6 className="!relative !w-2.5 !h-2.5 !mr-[-4.00px]" />
        </>
      )}
    </div>
  );
};

function reducer(state, action) {
  if (state.selector === "open") {
    switch (action) {
      case "click_244":
        return {
          selector: "date",
        };

      case "click_247":
        return {
          selector: "device",
        };

      case "click_250":
        return {
          selector: "hour",
        };
    }
  }

  switch (action) {
    case "click":
      return {
        ...state,
        selector: "open",
      };
  }

  return state;
}
