import React, { useEffect, useState } from "react";
import { Spinner} from "flowbite-react";
import { apiFetch, getIcon } from "../Commons/Constants";
import { LineChart } from "@mui/x-charts";
import { useLaravelReactI18n } from "laravel-react-i18n";

export function ConsumptionPredictionGraphPower({ url_in, future_steps, graphHeight = 0 ,setErrorFun,setOkFun}) {
  const [dataset, setDataset] = useState([])
  const [loading, setLoading] = useState(false)
  const colorPast='#a3e635'
  const colorFuture = '#65A30D'
  const threshold=2000
  const heightGraph = graphHeight > 0 ? graphHeight : window.innerHeight > 1000 ? 800 : 550
  const { t } = useLaravelReactI18n()

  const getColor = (index) => {
    return index < future_steps ? colorPast : colorFuture; // First 12 elements: #a3e635, others: #65A30D
  };


  const fetchConsumption = async () => {
    let url = url_in
    const response = await apiFetch(url);
    if (response) {
      if(response.some(item=>item.power>=threshold)){
        setErrorFun(true)
      }else{
        setOkFun(true)
      }
      setDataset(response)
    }
    setLoading(false)
  }


  //Loading new consumption data when data of the query change
  useEffect(() => {
    setLoading(true)
    fetchConsumption()
  }, [url_in])

  const valueFormatter = (value) => `${value} W`;

  return (
    <div className="size-full flex flex-col mt-2">
      {loading ?
      <div className="flex flex-row items-center gap-3 justify-center p-2">
        <Spinner className="fill-lime-400" aria-label="Loading" size="xl" />
        Evaluating the effects of your action, please wait...
        </div>
        :
        <>
          <h1 className="text-lg pl-2">{t("Predicted energy consumption")}</h1>
          <div className="pl-3 flex flex-col items-center relative">
            <div className="relative size-full">
              <LineChart
                className="relative"
                dataset={dataset}
                xAxis={[
                  {
                    scaleType: "band",
                    dataKey: "date",
                  },
                ]}
                yAxis={[
                  {
                    valueFormatter: valueFormatter,
                    colorMap: {
                      type: "piecewise",
                      thresholds: [threshold],
                      colors: ["#a3e635", "red"],
                    },
                  },
                ]}
                series={[
                  {
                    dataKey: "power",
                    showMark: false,
                    valueFormatter,
                  },
                ]}
                borderRadius={4}
                margin={{ left: 70 }}
                height={heightGraph}
              />

              {/* Arrow pointing to the 61st element */}
              {dataset.length > 62 && (
                <div
                  className="absolute text-lg font-bold text-gray-800 flex flex-col items-center "
                  style={{
                    left: `${(62 / dataset.length) * 100}%`, // Position relative to the dataset size
                    bottom: "60%", // Adjust the height to move it above the graph
                    transform: "translateX(-50%)", // Center the arrow
                  }}
                >
                  <div>
                  Your action
                  </div>
                  <div>
                  ↓ 
                    </div>
                </div>
              )}
            </div>


          </div>
        </>
      }
    </div>
  )
}

