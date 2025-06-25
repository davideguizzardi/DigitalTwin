import React, { createContext, useState, useEffect } from "react";
import { apiFetch, removeType } from "../Commons/Constants";

export const DeviceContext = createContext();

export const DeviceProvider = ({ children }) => {
  const [deviceList, setDeviceList] = useState([]);
  
  
  const fetchDevices = async () => {
    try {
      const response = await apiFetch(`/device`);
      if (!response) throw new Error("Failed to fetch devices");
      const filtered_devices=response.filter(device=>!removeType.includes(device.device_class) && device.name.toLowerCase()!="backup").map(device=>device)
      setDeviceList(filtered_devices);
    } catch (err) {
      //alert(err.message);
    } 
  };

  
  useEffect(() => {
    fetchDevices();

    // Set interval for periodic updates
    //const interval = setInterval(() => {
    //  fetchDevices();
    //}, 5000); // Change 5000 to your desired interval in milliseconds

    // Cleanup function to clear interval when component unmounts
    //return () => clearInterval(interval);
  }, []);

  return (
    <DeviceContext.Provider value={{ deviceList, setDeviceList }}>
      {children}
    </DeviceContext.Provider>
  );
};
