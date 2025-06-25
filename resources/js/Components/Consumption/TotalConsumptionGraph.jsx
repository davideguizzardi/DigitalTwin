import React, { useEffect, useState,useContext } from "react";
import { Spinner, Button, Select, Label } from "flowbite-react";
import { BarChart } from '@mui/x-charts/BarChart';
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { StyledButton } from "../Commons/StyledBasedComponents";
import { apiFetch, apiLog, logsEvents } from "../Commons/Constants";
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

  const user = useContext(UserContext);


  const heightGraph = window.innerHeight*0.7
  const isDark = localStorage.getItem("darkMode") == "true"
  const sxDatePicker = {
    '.MuiInputBase-root': {
      color: isDark ? "white" : "black",
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
    const devs = [{ device_id: t("Entire House"), name: t("Entire House") }].concat(device_list)
    setDeviceList(devs)
  }, [device_list, t])


  function handleItemClick(params) {
    switch (group) {
      case "daily":
        //need to go from daily to hourly of the clicked day
        var clickedItem = dataset[params["dataIndex"]]
        setFrom(dayjs(clickedItem.date, "DD-MM-YYYY"))
        setTo(dayjs(clickedItem.date, "DD-MM-YYYY"))
        setGroup("hourly")
        break;

      case "monthly":
        //need to go from monthly to daily of the clicked month
        var clickedItem = dataset[params["dataIndex"]]
        setFrom(dayjs(clickedItem.date, "MM-YYYY").date(1))
        setTo(dayjs(clickedItem.date, "MM-YYYY").endOf("month"))
        setGroup("daily")
        break;
    }
  }

  function handleNameChange(event) {
    const index = event.target.selectedIndex;
    const optionElement = event.target.childNodes[index];
    const optionElementId = optionElement.getAttribute('id');

    setDeviceName(event.target.value)
    setDeviceId(optionElementId)
  }

  const fetchConsumption = async () => {
    var url;
    const log_payload=JSON.stringify({
      start_timestamp:from.format("DD-MM-YYYY"),
      end_timestamp:to.format("DD-MM-YYYY"),
      group:group,
      device:deviceName
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
      data.map(item => item.date = item.date.split(" ").length > 1 ? item.date.split(" ")[1] : item.date)
      if (group != "hourly")
        data.map(item => item.energy_consumption = item.energy_consumption / 1000)
      setDataset(data)
      if(user)
        apiLog(user.username,logsEvents.CONSUMPTION_TOTAL,deviceName,log_payload)
    }
    setLoading(false)
  }

  useEffect(() => {
    setLoading(true)
    fetchConsumption()
  }, [from, to, group, deviceId, deviceName])


  const valueFormatter = (value) => `${value.toFixed(2)} ${group == "hourly" ? "Wh" : "kWh"}`;

  return (
    <div className="w-full flex flex-col">
      <div className="flex  mx-3 my-1 items-center justify-center gap-4">
        <div className="flex flex-row gap-2 ">
          <div className="flex flex-col w-fit">

            <Label htmlFor="device" value={t("Energy consumption of")} />
            <Select id="device" onChange={(event) => handleNameChange(event)} required>
              {
                innerDeviceList
                  .filter(d => !["Sun", "Forecast"].includes(d.name))
                  .map(dev => (
                    <option id={dev.device_id} key={dev.device_id}>{dev.name}</option>
                  ))
              }
            </Select>
          </div>
        </div>
        <div className="flex flex-row gap-6 h-full items-end justify-end">
          <div className="flex flex-row gap-2 items-center">
            {group == "hourly" &&
              <DatePicker value={from} size='medium' className="w-40 focus:ring-0" label={t('Day')} views={['year', 'month', 'day']} format="DD-MM-YYYY" onChange={(val) => { setFrom(val); setTo(val) }}
                sx={sxDatePicker}
              />
            }
            {group == "daily" &&
              <>
                <DatePicker value={from} size="small" className="w-40" label={t('From')} views={['year', 'month', 'day']} format="DD-MM-YYYY" onChange={(val) => setFrom(val)}
                  sx={sxDatePicker} />
                <span className="font-bold text-2xl">-</span>
                <DatePicker value={to} className="w-40" label={t('To')} views={['year', 'month', 'day']} format="DD-MM-YYYY" onChange={(val) => setTo(val)}
                  sx={sxDatePicker} />
              </>
            }
            {group == "monthly" &&
              <>
                <DatePicker value={from} className="w-40" label={t('From')} views={['year', 'month']} format="MM-YYYY" onChange={(val) => { setFrom(val.date(1)) }}
                  sx={sxDatePicker} />
                <span className="font-bold text-2xl">-</span>
                <DatePicker value={to} className="w-40" label={t('To')} views={['year', 'month']} format="MM-YYYY" onChange={(val) => { setTo(val.endOf("month")) }}
                  sx={sxDatePicker} />
              </>
            }
          </div>

          <div className="flex flex-col">
            <Label>{t("Consumption")}</Label>
            <div className="flex flex-row gap-2 items-center">
              {loading &&
                <Spinner className="fill-lime-400" aria-label="Loading" size="lg" />
              }
              <Button.Group>
                <StyledButton color="secondary" className={(group == "hourly" ? "bg-lime-400" : "bg-neutral-50 dark:bg-neutral-700 dark:text-white")}
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
                    setFrom(dayjs().subtract(7, "day"));
                    setTo(dayjs())
                  }}>
                  {t("Daily")}
                </StyledButton>
                <StyledButton color="secondary" className={(group == "monthly" ? "bg-lime-400" : "bg-neutral-50 dark:bg-neutral-700 dark:text-white")}
                  onClick={() => {
                    setGroup("monthly");
                    setFrom(dayjs().subtract(1, "month"));
                    setTo(dayjs())
                  }}>
                  {t("Monthly")}
                </StyledButton>
              </Button.Group>
            </div>
          </div>

        </div>
      </div>
      <div className="pl-3 flex h-full items-center justify-center dark:text-white">
        {
          dataset.length > 0 ?
            <BarChart
              className=""
              dataset={dataset}
              xAxis={[{ scaleType: 'band', dataKey: 'date' }]}
              yAxis={[{ valueFormatter: valueFormatter }]}
              series={[{ dataKey: "energy_consumption", color: '#a3e635', valueFormatter }]}
              borderRadius={4}
              margin={{ left: 70 }}
              height={heightGraph}
            //onItemClick={(event, params) => handleItemClick(params)}
              sx={sxGraph}
            />
            :
            <h1>{t("No data present")}</h1>
        }
      </div>
    </div>
  )
}
