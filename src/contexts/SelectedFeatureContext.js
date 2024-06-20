import React, { createContext, useContext, useState } from 'react';

const SelectedFeatureContext = createContext();

export const useSelectedFeatureContext = () => useContext(SelectedFeatureContext);


export const SelectedFeatureProvider = ({ children }) => {
  const [selectedView, setSelectedView] = useState('COUNTRY');
  const [dataView, setDataView] = useState('COUNTY');
  const [selectedFeatureName, setSelectedFeatureName] = useState('Kenya');



  return (
    <SelectedFeatureContext.Provider value={{ selectedView, setSelectedView ,selectedFeatureName, setSelectedFeatureName, dataView, setDataView}}>
      {children}
    </SelectedFeatureContext.Provider>
  );
};
