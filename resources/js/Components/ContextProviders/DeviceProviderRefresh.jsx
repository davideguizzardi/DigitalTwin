import React, { createContext, useState, useEffect } from "react";
import { apiFetch, backend } from "../Commons/Constants";

export const DeviceContextRefresh = createContext();




export const DeviceProviderRefresh = ({ children }) => {
  const [deviceList, setDeviceList] = useState([]);
  const [connectionOk,setConnectionOk]=useState(true)
  const [isDemo,setIsDemo]=useState(false)
  const refreshFrequency=10*1000 //in milliseconds
  
  const fetchDevices = async () => {
    try {
      const response = await apiFetch(`/device`);
      if (!response) throw new Error("Failed to fetch devices");
      setDeviceList(response);
      setConnectionOk(true)

      const demo_response=await apiFetch(`/configuration/enable_demo`);
      if (!demo_response) throw new Error("Failed to fetch demo info");
      setIsDemo(demo_response.value=="1")
    } catch (err) {
      setConnectionOk(false)
    } 
  };

  
  useEffect(() => {
    fetchDevices();
   
    const interval = setInterval(() => {
      fetchDevices();
    }, refreshFrequency); 

    return () => clearInterval(interval);
  }, []);

  return (
    <DeviceContextRefresh.Provider value={{ deviceList,connectionOk,isDemo,fetchDevices}}>
      {children}
    </DeviceContextRefresh.Provider>
  );
};
