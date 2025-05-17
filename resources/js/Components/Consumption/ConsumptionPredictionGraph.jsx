import React, { useEffect, useState } from "react";
import { Spinner, Button, Select, Label } from "flowbite-react";
import { BarChart } from '@mui/x-charts/BarChart';
import { useLaravelReactI18n } from "laravel-react-i18n";
import { apiFetch, apiLog, logsEvents } from "../Commons/Constants";
import { useContext } from "react";
import { UserContext } from "@/Layouts/UserLayout";

export function ConsumptionPredictionGraph({ url_in, future_steps, graphHeight = 0 }) {
  const [dataset, setDataset] = useState([])
  const [loading, setLoading] = useState(false)
  const [colorPast, setColorPast] = useState('#a3e635')
  const [colorFuture, setColorFuture] = useState('#65A30D')
  const heightGraph = graphHeight > 0 ? graphHeight : window.innerHeight *0.7
  const { t } = useLaravelReactI18n()

  const user = useContext(UserContext)
  const getColor = (index) => {
    return index < future_steps ? colorPast : colorFuture; // First 12 elements: #a3e635, others: #65A30D
  };


  const fetchConsumption = async () => {
    let url_cache = `${url_in}/cache`
    const cache = await apiFetch(url_cache)
    if (cache) {
      setDataset(cache.data)
      if (user)
        apiLog(user.username, logsEvents.CONSUMPTION_PREDICTION, "Entire House", "{}")
    }
    setLoading(true)
    const response = await apiFetch(url_in)
    if (response) {
      setDataset(response.data)
    }
    setLoading(false)
  }


  //Loading new consumption data when data of the query change
  useEffect(() => {

    fetchConsumption()
  }, [url_in])

  const valueFormatter = (value) => `${value} Wh`;

  return (
    <div className="size-full flex flex-col mt-2">
      {dataset &&
        <>
          <div className="pl-3 flex flex-col items-center relative">
            <div className="absolute pr-5 items-start -top-1 right-3">
              <div className="flex flex-col gap-2 items-start pl-5">
                <div className="flex flex-row gap-1 items-center" onMouseEnter={() => setColorFuture("#d0e3b6")} onMouseLeave={() => setColorFuture('#65A30D')}>
                  <div className="size-5 bg-lime-300 shadow-md rounded-sm" />
                  <h1 className="font-[Inter] text-gray-800 text-base">{t("Past real consumption")}</h1>
                </div>

                <div className="flex flex-row gap-1 items-center" onMouseEnter={() => setColorPast("#E3F7C2")} onMouseLeave={() => setColorPast('#a3e635')}>
                  <div className="size-5 bg-lime-600 shadow-md rounded-sm" />
                  <h1 className="font-[Inter] text-gray-800 text-base">{t("Future predicted consumption")}</h1>
                </div>
              </div>
            </div>


            <BarChart
              className=""
              dataset={dataset}
              xAxis={[
                {
                  scaleType: 'band',
                  dataKey: 'date',
                  colorMap: {
                    type: 'ordinal',
                    // Instead of a static color array, we'll define colors for each bar dynamically
                    colors: dataset.map((_, index) => getColor(index)), // Assign color based on index
                  },
                },
              ]}
              yAxis={[{ valueFormatter: valueFormatter }]}
              series={[
                { dataKey: "energy_consumption", valueFormatter }
              ]}
              borderRadius={4}
              margin={{ left: 70 }}
              height={heightGraph}
            />
          </div>
        </>
      }
      {loading &&
      <div className="flex flex-row items-center gap-2 justify-center">
        <Spinner className="fill-lime-400" aria-label="Loading" size="xl" />
        <div className="text-xl">
        {t("Updating data...")}
          </div>
        </div>
      }
    </div>
  )
}

