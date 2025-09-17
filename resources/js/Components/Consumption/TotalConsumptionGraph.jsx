import React, { useEffect, useState, useContext } from "react";
import { Spinner, Button, Select, Label } from "flowbite-react";
import { BarChart } from '@mui/x-charts/BarChart';
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { StyledButton } from "../Commons/StyledBasedComponents";
import { apiFetch, apiLog, logsEvents, useIsMobile } from "../Commons/Constants";
import { UserContext } from "@/Layouts/UserLayout";
export function TotalConsumptionGraph({ device_list }) {
  const [from, setFrom] = useState(dayjs())
  const [to, setTo] = useState(dayjs())
  const [dataset, setDataset] = useState([])
  const [group, setGroup] = useState("hourly")
  const [loading, setLoading] = useState(false)
  const { t } = useLaravelReactI18n()
  const [deviceName, setDeviceName] = useState(t("Entire House"))
  const [deviceId, setDeviceId] = useState("")
  const [innerDeviceList, setDeviceList] = useState([t("Entire House")])

  const isMobile = useIsMobile()
  const user = useContext(UserContext);

  const heightGraph = isMobile ? 400 : window.innerHeight * 0.7;
  const isDark = localStorage.getItem("darkMode") == "true"
  const sxDatePicker = {
    '.MuiInputBase-root': {
      color: isDark ? "white" : "black",
      fontSize: { xs: "0.75rem", md: "0.875rem" },
      height: { xs: 36, md: 40 },
      width: { xs: 112, md: 160 },
      "&:hover > .MuiOutlinedInput-notchedOutline": {
        border: "1px " + (isDark ? " white " : " black ") + " solid"
      }
    },
    '.MuiIconButton-root': {
      color: isDark ? "white" : "black",
    },
    '.MuiInputLabel-root': {
      color: isDark ? "white" : "black",
    },
    '.MuiOutlinedInput-notchedOutline ': {
      border: "1px " + (isDark ? " white " : " black ") + " solid"
    },
  }

  const sxGraph = {
    "& .MuiChartsAxis-tickLabel": {
      fontSize: { xs: "0.25rem", md: "0.15rem" }, // smaller on mobile
    },
    "& .MuiChartsAxis-label": {
      fontSize: { xs: "0.45rem", md: "0.9rem" },   // axis title if you use it
    },
    //change left yAxis label styles
    "& .MuiChartsAxis-left .MuiChartsAxis-tickLabel": {
      strokeWidth: "0.4",
      fill: isDark ? "white" : "black"
    },
    // change bottom label styles
    "& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel": {
      strokeWidth: "0.5",
      fill: isDark ? "white" : "black"
    },
    // bottomAxis Line Styles
    "& .MuiChartsAxis-bottom .MuiChartsAxis-line": {
      stroke: isDark ? "white" : "black",
      strokeWidth: 1
    },
    // leftAxis Line Styles
    "& .MuiChartsAxis-left .MuiChartsAxis-line": {
      stroke: isDark ? "white" : "black",
      strokeWidth: 1
    },
    "& .MuiChartsAxis-bottom .MuiChartsAxis-tick": {
      stroke: isDark ? "white" : "black",
      strokeWidth: 1
    },
    "& .MuiChartsAxis-left .MuiChartsAxis-tick": {
      stroke: isDark ? "white" : "black",
      strokeWidth: 1
    },
    "& .css-1j25yxu-MuiResponsiveChart-container": {
      color: isDark ? "white" : "black"
    }
  }

  useEffect(() => {
    const devs = [{ device_id: t("Entire House"), name: t("Entire House"), show: true, device_class: "total" }].concat(device_list)
    setDeviceList(devs)
  }, [device_list, t])

  function handleNameChange(event) {
    const index = event.target.selectedIndex;
    const optionElement = event.target.childNodes[index];
    const optionElementId = optionElement.getAttribute('id');

    setDeviceName(event.target.value)
    setDeviceId(optionElementId)
  }

  const parseDate = (dateStr) => {
    const normalizedDate = group === 'monthly' ? `01-${dateStr}` : dateStr;
    return dayjs(normalizedDate, 'DD-MM-YYYY').toDate();
  };

  const fetchConsumption = async () => {
    var url;
    const log_payload = JSON.stringify({
      start_timestamp: from.format("DD-MM-YYYY"),
      end_timestamp: to.format("DD-MM-YYYY"),
      group: group,
      device: deviceName
    })
    if (deviceName == t("Entire House")) {
      url = `/consumption/total?` +
        `start_timestamp=${encodeURIComponent(from.format("YYYY-MM-DD"))}` +
        `&end_timestamp=${encodeURIComponent(to.format("YYYY-MM-DD"))}` +
        `&group=${group}`

    }
    else {
      url = `/consumption/device?device_id=${deviceId}` +
        `&start_timestamp=${encodeURIComponent(from.format("YYYY-MM-DD"))}` +
        `&end_timestamp=${encodeURIComponent(to.format("YYYY-MM-DD"))}` +
        `&group=${group}`
    }

    const response = await apiFetch(url);
    if (response) {
      const data = response
      data.sort((a, b) => dayjs(a.date, 'DD-MM-YYYY').toDate() - dayjs(b.date, 'DD-MM-YYYY').toDate());
      data.map(item => item.date = item.date.split(" ").length > 1 ? item.date.split(" ")[1] : item.date)
      if (group != "hourly") {
        data.sort((a, b) => parseDate(a.date) - parseDate(b.date));
        data.map(item => item.energy_consumption = item.energy_consumption / 1000)
      }
      setDataset(data)
      if (user)
        apiLog(user.username, logsEvents.CONSUMPTION_TOTAL, deviceName, log_payload)
    }
    setLoading(false)
  }

  useEffect(() => {
    setLoading(true)
    fetchConsumption()
  }, [from, to, group, deviceId, deviceName])


  const valueFormatter = (value) => `${value ? value.toFixed(1) : 0} ${group == "hourly" ? "Wh" : "kWh"}`;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex flex-col md:flex-row items-center justify-center md:items-end md:justify-center gap-4 w-fit">
        <div className="flex flex-col min-w-48">
          <Label htmlFor="device" value={t("Energy consumption of")} />
          <Select id="device" onChange={(event) => handleNameChange(event)} required>
            {
              innerDeviceList
                .filter(d => !["Sun", "Forecast"].includes(d.name))
                .filter(d => d.show)
                .filter(d => !["sensor", "event"].includes(d.device_class))
                .map(dev => (
                  <option id={dev.device_id} key={dev.device_id}>{dev.name}</option>
                ))
            }
          </Select>
        </div>
        <div className="flex flex-row gap-2 items-center justify-center w-full">
          {group == "hourly" &&
            <DatePicker value={from} size='small' className="" label={t('Day')} views={['year', 'month', 'day']} format="DD-MM-YYYY" onChange={(val) => { setFrom(val); setTo(val) }}
              sx={sxDatePicker}
            />
          }
          {group == "daily" &&
            <>
              <DatePicker value={from} size="small" className="" label={t('From')} views={['year', 'month', 'day']} format="DD-MM-YYYY" onChange={(val) => setFrom(val)}
                sx={sxDatePicker} />
              <span className="font-bold text-2xl">-</span>
              <DatePicker value={to} className="" label={t('To')} views={['year', 'month', 'day']} format="DD-MM-YYYY" onChange={(val) => setTo(val)}
                sx={sxDatePicker} />
            </>
          }
          {group == "monthly" &&
            <>
              <DatePicker value={from} className="" label={t('From')} views={['year', 'month']} format="MM-YYYY" onChange={(val) => { setFrom(val.date(1)) }}
                sx={sxDatePicker} />
              <span className="font-bold text-2xl">-</span>
              <DatePicker value={to} className="" label={t('To')} views={['year', 'month']} format="MM-YYYY" onChange={(val) => { setTo(val.endOf("month")) }}
                sx={sxDatePicker} />
            </>
          }
        </div>

        <div className="flex flex-col">
          <Label>{t("Consumption")}</Label>
          <Button.Group>
            <StyledButton color="secondary" className={`text-base ${group == "hourly" ? "bg-lime-400" : "bg-neutral-50"}`}
              onClick={() => {
                setGroup("hourly");
                setFrom(dayjs().hour(0));
                setTo(dayjs())
              }}>
              {t("Hourly")}
            </StyledButton>
            <StyledButton color="secondary" className={(group == "daily" ? "bg-lime-400" : "bg-neutral-50 dark:bg-neutral-700 dark:text-white")}
              onClick={() => {
                setGroup("daily");
                setFrom(dayjs().subtract(7, "day").startOf("day"));
                setTo(dayjs())
              }}>
              {t("Daily")}
            </StyledButton>
            <StyledButton color="secondary" className={(group == "monthly" ? "bg-lime-400" : "bg-neutral-50 dark:bg-neutral-700 dark:text-white")}
              onClick={() => {
                setGroup("monthly");
                setFrom(dayjs().subtract(1, "month").startOf("month"));
                setTo(dayjs())
              }}>
              {t("Monthly")}
            </StyledButton>
          </Button.Group>
        </div>

        {loading &&
          <Spinner className="fill-lime-400" aria-label="Loading" size="lg" />
        }

      </div>
      <div className="md:pl-3 -p-2 flex items-center justify-center w-full ">
        {
          dataset.length > 0 ?
            <BarChart
              dataset={dataset}
              xAxis={[{ scaleType: 'band', dataKey: 'date' }]}
              yAxis={[{ valueFormatter: valueFormatter, tickLabelStyle: { fontSize: isMobile ? 10 : 13 } }]}
              series={[{ dataKey: "energy_consumption", color: '#a3e635', valueFormatter }]}
              borderRadius={4}
              margin={{ right: 20,left: isMobile?60:90}}
              height={heightGraph}
              sx={sxGraph}
            />
            :
            <h1>{t("No data present")}</h1>
        }
      </div>
    </div>
  )
}
