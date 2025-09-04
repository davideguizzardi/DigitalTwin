import React, { useEffect, useState, useContext } from "react";
import { Spinner, Button, Select, Label } from "flowbite-react";
import { BarChart } from "@mui/x-charts/BarChart";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useLaravelReactI18n } from "laravel-react-i18n";
import { StyledButton } from "../Commons/StyledBasedComponents";
import { apiFetch, apiLog, logsEvents, useIsMobile } from "../Commons/Constants";
import { UserContext } from "@/Layouts/UserLayout";

export function ConsumptionComparisonGraph({ device_list }) {
  const [date1, setDate1] = useState(dayjs());
  const [date2, setDate2] = useState(dayjs());
  const [dataset, setDataset] = useState([]);
  const [group, setGroup] = useState("daily");
  const [loading, setLoading] = useState(false);
  const { t } = useLaravelReactI18n();
  const [deviceName, setDeviceName] = useState(t("Entire House"));
  const [deviceId, setDeviceId] = useState("");
  const [innerDeviceList, setDeviceList] = useState([]);

  const isMobile = useIsMobile();
  const heightGraph = isMobile ? 400 : window.innerHeight * 0.7;
  const isDark = localStorage.getItem("darkMode") == "true";
  const user = useContext(UserContext);

  const sxDatePicker = {
    ".MuiInputBase-root": {
      color: isDark ? "white" : "black",
      fontSize: { xs: "0.75rem", md: "0.875rem" },
      height: { xs: 36, md: 40 },
      width: { xs: 112, md: 160 },
      "&:hover > .MuiOutlinedInput-notchedOutline": {
        border: "1px " + (isDark ? " white " : " black ") + " solid",
      },
    },
    ".MuiIconButton-root": {
      color: isDark ? "white" : "black",
    },
    ".MuiInputLabel-root": {
      color: isDark ? "white" : "black",
    },
    ".MuiOutlinedInput-notchedOutline ": {
      border: "1px " + (isDark ? " white " : " black ") + " solid",
    },
  };

  const sxGraph = {
    "& .MuiChartsAxis-tickLabel": {
      fontSize: { xs: "0.25rem", md: "0.15rem" },
    },
    "& .MuiChartsAxis-label": {
      fontSize: { xs: "0.45rem", md: "0.9rem" },
    },
    "& .MuiChartsAxis-left .MuiChartsAxis-tickLabel": {
      strokeWidth: "0.4",
      fill: isDark ? "white" : "black",
    },
    "& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel": {
      strokeWidth: "0.5",
      fill: isDark ? "white" : "black",
    },
    "& .MuiChartsAxis-bottom .MuiChartsAxis-line": {
      stroke: isDark ? "white" : "black",
      strokeWidth: 1,
    },
    "& .MuiChartsAxis-left .MuiChartsAxis-line": {
      stroke: isDark ? "white" : "black",
      strokeWidth: 1,
    },
    "& .MuiChartsAxis-bottom .MuiChartsAxis-tick": {
      stroke: isDark ? "white" : "black",
      strokeWidth: 1,
    },
    "& .MuiChartsAxis-left .MuiChartsAxis-tick": {
      stroke: isDark ? "white" : "black",
      strokeWidth: 1,
    },
  };

  useEffect(() => {
    const devs = [{ device_id: t("Entire House"), name: t("Entire House") }].concat(device_list);
    setDeviceList(devs);
  }, [device_list, t]);

  function handleNameChange(event) {
    const index = event.target.selectedIndex;
    const optionElement = event.target.childNodes[index];
    const optionElementId = optionElement.getAttribute("id");

    setDeviceName(event.target.value);
    setDeviceId(optionElementId);
  }

  const fetchConsumption = async () => {
    let url1, url2;
    let endDate1 = date1;
    let endDate2 = date2;

    if (group === "monthly") {
      endDate1 = date1.endOf("month");
      endDate2 = date2.endOf("month");
    }

    if (deviceName == t("Entire House")) {
      url1 = `/consumption/total?start_timestamp=${encodeURIComponent(date1.format("YYYY-MM-DD"))}&end_timestamp=${encodeURIComponent(endDate1.format("YYYY-MM-DD"))}&group=${group}`;
      url2 = `/consumption/total?start_timestamp=${encodeURIComponent(date2.format("YYYY-MM-DD"))}&end_timestamp=${encodeURIComponent(endDate2.format("YYYY-MM-DD"))}&group=${group}`;
    } else {
      url1 = `/consumption/device?device_id=${deviceId}&start_timestamp=${encodeURIComponent(date1.format("YYYY-MM-DD"))}&end_timestamp=${encodeURIComponent(endDate1.format("YYYY-MM-DD"))}&group=${group}`;
      url2 = `/consumption/device?device_id=${deviceId}&start_timestamp=${encodeURIComponent(date2.format("YYYY-MM-DD"))}&end_timestamp=${encodeURIComponent(endDate2.format("YYYY-MM-DD"))}&group=${group}`;
    }

    const response1 = await apiFetch(url1);
    const response2 = await apiFetch(url2);

    if (response1 && response2) {
      const concatDataset = response1.concat(response2);
      if (group !== "hourly") concatDataset.map((item) => (item.energy_consumption = item.energy_consumption / 1000));
      setDataset(concatDataset);

      const log_payload = JSON.stringify({
        date1: date1.format("DD-MM-YYYY"),
        date2: date2.format("DD-MM-YYYY"),
        group,
        device: deviceName,
      });
      if (user) apiLog(user.username, logsEvents.CONSUMPTION_COMPARISON, deviceName, log_payload);
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchConsumption();
  }, [date1, date2, group, deviceId, deviceName]);

  const valueFormatter = (value) => `${value.toFixed(1)} kWh`;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex flex-col md:flex-row items-center justify-center md:items-end md:justify-center gap-4 w-fit">
        <div className="flex flex-col min-w-48">
          <Label htmlFor="device" value={t("Energy consumption of")} />
          <Select id="device" defaultValue={t("Entire House")} onChange={handleNameChange} required>
            {innerDeviceList
              .filter((d) => !["Sun", "Forecast"].includes(d.name))
              .map((dev) => (
                <option id={dev.device_id} key={dev.device_id}>
                  {dev.name}
                </option>
              ))}
          </Select>
        </div>

        <div className="flex flex-row gap-2 items-center justify-center w-full">
          {group == "daily" && (
            <>
              <DatePicker value={date1} size="small" label={t("Day") + " 1"} views={["year", "month", "day"]} format="DD-MM-YYYY" onChange={(val) => setDate1(val)} sx={sxDatePicker} />
              <span className="font-bold text-2xl">vs</span>
              <DatePicker value={date2} size="small" label={t("Day") + " 2"} views={["year", "month", "day"]} format="DD-MM-YYYY" onChange={(val) => setDate2(val)} sx={sxDatePicker} />
            </>
          )}
          {group == "monthly" && (
            <>
              <DatePicker value={date1} label={t("Month") + " 1"} views={["year", "month"]} format="MM-YYYY" onChange={(val) => setDate1(val.date(1))} sx={sxDatePicker} />
              <span className="font-bold text-2xl">vs</span>
              <DatePicker value={date2} label={t("Month") + " 2"} views={["year", "month"]} format="MM-YYYY" onChange={(val) => setDate2(val.date(1))} sx={sxDatePicker} />
            </>
          )}
        </div>

        <div className="flex flex-col">
          <Label>{t("Consumption")}</Label>
          <div className="flex flex-row gap-2 items-center">
            {loading && <Spinner className="fill-lime-400" aria-label="Loading" size="lg" />}
            <Button.Group>
              <StyledButton
                color="secondary"
                className={group == "daily" ? "bg-lime-400" : "bg-neutral-50 dark:bg-neutral-700 dark:text-white"}
                onClick={() => {
                  setGroup("daily");
                  setDate1(dayjs().subtract(1, "day"));
                  setDate2(dayjs());
                }}
              >
                {t("Daily")}
              </StyledButton>
              <StyledButton
                color="secondary"
                className={group == "monthly" ? "bg-lime-400 dark:text-black" : "bg-neutral-50 dark:bg-neutral-700 dark:text-white"}
                onClick={() => {
                  setGroup("monthly");
                  setDate1(dayjs().subtract(1, "month").date(1));
                  setDate2(dayjs().date(1));
                }}
              >
                {t("Monthly")}
              </StyledButton>
            </Button.Group>
          </div>
        </div>
      </div>

      <div className="md:pl-3 -p-2 flex items-center justify-center w-full">
        {dataset.length > 0 ? (
          <BarChart
            dataset={dataset}
            xAxis={[
              {
                scaleType: "band",
                dataKey: "date",
                colorMap: { type: "ordinal", colors: ["#a3e635", "#65A30D"] },
              },
            ]}
            yAxis={[{ valueFormatter: valueFormatter, tickLabelStyle: { fontSize: isMobile ? 10 : 13 } }]}
            series={[{ dataKey: "energy_consumption", valueFormatter }]}
            borderRadius={4}
            margin={{ right: 20, left:70}}
            height={heightGraph}
            sx={sxGraph}
          />
        ) : (
          <h1>{t("No data present")}</h1>
        )}
      </div>
    </div>
  );
}
