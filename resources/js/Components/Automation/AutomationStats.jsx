import React from "react";
import { getIcon } from "@/Components/Commons/Constants";
import { useLaravelReactI18n } from "laravel-react-i18n";
const AutomationStats = ({
  monthlyCost,
  minCost,
  maxCost,
  powerDrawn,
  energyConsumption,
}) => {
const {t} = useLaravelReactI18n()
  return (
    <div className="grid xl:grid-cols-3 xl:gap-5 grid-cols-1 gap-2">
      {monthlyCost !== -1 ? (
        <StatCard
          icon={getIcon("money")}
          title={t("Monthly cost")}
          value={`${monthlyCost.toFixed(2)} €/`}
          subtitle={t("Month")}
        />
      ) : (
        <StatCard
          icon={getIcon("money")}
          title={t("Execution cost")}
          value={`${minCost.toFixed(2)}~${maxCost.toFixed(2)} €/`}
          subtitle={t("Run")}
        />
      )}
      <StatCard
        icon={getIcon("power")}
        title={t("Power usage")}
        value={`${powerDrawn.toFixed(2)} W`}
      />
      <StatCard
        icon={getIcon("energy")}
        title={t("Consumption")}
        value={`${energyConsumption.toFixed(2)} Wh`}
      />
    </div>
  );
};

const StatCard = ({ icon, title, value, subtitle }) => {
  return (
    <div className="rounded-lg bg-gray-300 flex flex-col">
      <div className="flex flex-row gap-1 items-center">
        {icon}
        <span className="text-sm font-semibold font-[Inter]">{title}</span>
      </div>
      <div className="text-xl items-end justify-end flex font-[Inter]">
        {value}
        {subtitle && <span className="text-sm">{subtitle}</span>}
      </div>
    </div>
  );
};

export default AutomationStats;
