import React from "react";
import { Carousel } from "flowbite-react";
import { FaCar, FaCoffee, FaPizzaSlice, FaTree, FaVideo, FaMobileAlt } from "react-icons/fa";
import { SiNetflix } from "react-icons/si";
import { useTranslation } from "react-i18next";
import { kgCO2e_kWh } from "./Constants";

const kWhComparisons = (kWh,t) => {
  const kgCO2e = kWh * kgCO2e_kWh; // Italy grid emissions: 0.270 kg CO2e per kWh
  const iconStyle="2xl:text-5xl md:text-4xl size-9"
  return [
    { 
      icon: <FaCar className={`${iconStyle} text-slate-600`} />, 
      text: t("Driving for :value km", {
        value: (kgCO2e / 0.192).toFixed(1)})
    },
    { 
      icon: <FaCoffee className={`${iconStyle} text-amber-800`} />,
      text: t("Making :value cups of coffee", {
        value: (kgCO2e / 0.29).toFixed(1)}) 
    },
    { 
      icon: <FaPizzaSlice className={`${iconStyle} text-yellow-400`} />,
      text: t("Eating :value pizzas", {
        value: (kgCO2e / 0.86).toFixed(1)}) 
    },
    { 
      icon: <FaTree className={`${iconStyle} text-green-600`} />,
      text: t("Absorbed by :value trees in a year", {
        value: (kgCO2e / 21).toFixed(2)}) 
    },
    { 
      icon: <SiNetflix className={`${iconStyle} text-red-500`} />,
      text: t( "Watching :value hours of Netfilx", {
        value: (kWh * 12.5).toFixed(0)})  
    },
    { 
      icon: <FaMobileAlt className={`${iconStyle} text-gray-600`} />,
      text: t("Charging a phone :value times", {
        value: (kWh * 55).toFixed(0)}) 
    }
  ];
};

const groupComparisons = (comparisons) => {
  const groups = [];
  for (let i = 0; i < comparisons.length; i += 3) {
    groups.push(comparisons.slice(i, i + 3));
  }
  return groups;
};

export const EcologicalFootprintCarousel = ({ kWh }) => {
  const {t} = useTranslation()
  const comparisons = kWhComparisons(kWh,t);
  const comparisonGroups = groupComparisons(comparisons);

  return (
    <div className="w-full h-40 md:h-32 2xl:hidden">
      <Carousel slide={true} className="" indicators={false} leftControl="<" rightControl=">" slideInterval={4000}>
        {comparisonGroups.map((group, index) => (
          <div key={index} className="grid grid-cols-3 gap-2 p-2 rounded-lg">
            {group.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-4">
                {item.icon}
                <p className="mt-2 text-sm font-semibold text-gray-800">{item.text}</p>
              </div>
            ))}
          </div>
        ))}
      </Carousel>
    </div>
  );
};


export const EcologicalFootprintGrid = ({ kWh }) => {
  const {t} = useTranslation()

  return (
    <div className="w-full hidden 2xl:block">
      <div className="grid grid-cols-3 gap-4 ">
        {kWhComparisons(kWh,t).map((item, index) => (
          <div key={index} className="flex flex-col items-center text-center p-4">
            {item.icon}
            <p className="mt-2 text-sm font-semibold text-gray-800">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
