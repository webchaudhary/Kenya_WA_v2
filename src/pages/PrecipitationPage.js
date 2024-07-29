import React, { useEffect, useState } from 'react'
import { MapContainer, GeoJSON, TileLayer, ImageOverlay, WMSTileLayer } from 'react-leaflet'
import * as L from "leaflet";
import "leaflet/dist/leaflet.css"
import 'leaflet-fullscreen/dist/Leaflet.fullscreen.js';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import BaseMap from '../components/BaseMap';
import { MonthsArray, SelectedFeaturesAverageStatsFunction, SelectedFeaturesWeightedAverageStatsFunction, YearsArray, fillDensityColor, getSumAnnualDataFromMonthly, renderTimeOptions } from '../helpers/functions';
import { BaseMapsLayers, mapCenter, maxBounds, setDragging, setInitialMapZoom } from '../helpers/mapFunction';
import { ColorLegendsData } from "../assets/data/ColorLegendsData";
import DynamicLegend from '../components/legend/DynamicLegend.js';
import { useSelectedFeatureContext } from '../contexts/SelectedFeatureContext';
import PCPTrendChart from '../components/charts/PCPTrendChart';
import PixelValue from '../contexts/PixelValue.js';
import FiltereredDistrictsFeatures from '../components/FiltereredDistrictsFeatures.js';
import GeoserverLegend from '../components/legend/GeoserverLegend.js';
import SelectedFeatureHeading from '../components/SelectedFeatureHeading.js';
import axios from 'axios';
import { useLoaderContext } from '../contexts/LoaderContext.js';
import Preloader from '../components/Preloader.js';
import ReactApexChart from 'react-apexcharts';
import AridityIndexChart from '../components/charts/AridityIndexChart.js';
import TableView from '../components/TableView.js';
import { BsInfoCircleFill } from 'react-icons/bs';
import { useModalHandles } from '../components/ModalHandles.js';


const MapDataLayers = [
  {
    name: "Annual Precipitation (Avg. 2018-2023)",
    value: "avg_pcp_raster",
    legend: "",
    attribution: "Data Source:<a href='https://www.chc.ucsb.edu/data/chirps' target='_blank'> Chirps </a>"
  },
  // {
  //   name: "Long Term Precipitation (1981-2023 mean)",
  //   value: "avg_longterm_pcp_raster",
  //   legend: "",
  //   attribution: "Data Source:<a href='https://www.chc.ucsb.edu/data/chirps' target='_blank'> Chirps </a>"
  // },
  {
    name: "Annual Ref. ET (Avg. 2018-2023)",
    value: "avg_ret_raster",
    legend: "",
    attribution: "Data Source: <a href='https://data.apps.fao.org/catalog/dataset/global-weather-for-agriculture-agera5' target='_blank'>AgERA5 </a>"
  },
  // {
  //   name: "Annual avg  Potential ET",
  //   value: "avg_pet_raster",
  //   legend: "",
  //   attribution: "Data Source: <a href='https://developers.google.com/earth-engine/datasets/catalog/NASA_GLDAS_V021_NOAH_G025_T3H' target='_blank'>GLDAS </a>"
  // },
  {
    name: "Annual Aridity Index (Avg. 2018-2023)",
    value: "avg_aridityIndex_raster",
    legend: "",
    attribution: ""
  },
  {
    name: "Precipitation",
    value: "PCP",
    legend: "",
    attribution: "Data Source:<a href='https://www.chc.ucsb.edu/data/chirps' target='_blank'> Chirps </a>"
  },
  {
    name: "Ref. Evapotranspiration",
    value: "RET",
    legend: "",
    attribution: "Data Source: <a href='https://data.apps.fao.org/catalog/dataset/global-weather-for-agriculture-agera5' target='_blank'>AgERA5 </a>"
  },
  {
    name: "Aridity Index",
    value: "AridityIndex",
    legend: "",
    attribution: ""
  },
]


const PrecipitationPage = () => {
  const { selectedView, selectedFeatureName, dataView } = useSelectedFeatureContext();
  const [selectedDataType, setSelectedDataType] = useState(MapDataLayers[0]);
  const [intervalType, setIntervalType] = useState('Yearly');
  const [selectedTableUnit, setSelectedTableUnit] = useState('mm_year');

  const [selectedTime, setSelectedTime] = useState(5);
  const [hydroclimaticStats, setHydroclimaticStats] = useState(null);
  const [climateChangeStats, setClimateChangeStats] = useState(null);
  const { setIsLoading } = useLoaderContext();
  const { handlePCP , handleAridityIndex} = useModalHandles();


  const fetchHydroclimaticStats = (view, featureName) => {
    axios
      .get(`${process.env.REACT_APP_BACKEND}/featureData/HydroclimaticStats/`, {
        params: {
          view: view,
          featureName: featureName
        }
      })
      .then(response => {
        setHydroclimaticStats(response.data);
      })
      .catch(error => console.error('Error fetching data:', error));
  }

  const fetchClimateChangeStats = (view, featureName) => {
    axios
      .get(`${process.env.REACT_APP_BACKEND}/featureData/ClimateChangeStats/`, {
        params: {
          view: view,
          featureName: featureName
        }
      })
      .then(response => {
        setClimateChangeStats(response.data);
      })
      .catch(error => console.error('Error fetching data:', error));
  }



  useEffect(() => {
    if (selectedView && selectedFeatureName) {
      setIsLoading(true);
      Promise.all([
        fetchHydroclimaticStats(selectedView, selectedFeatureName),
        fetchClimateChangeStats(selectedView, selectedFeatureName),
      ]).then(() => {
        setIsLoading(false);
      }).catch(() => {
        setIsLoading(false);
      });
    }
  }, [selectedView, selectedFeatureName]);

  const SelectedFeaturesStatsData = hydroclimaticStats && SelectedFeaturesWeightedAverageStatsFunction(hydroclimaticStats);




  const [selectedBasemapLayer, setSelectedBasemapLayer] = useState(BaseMapsLayers[0]);


  const handleBasemapSelection = (e) => {
    const selectedItem = BaseMapsLayers.find((item) => item.name === e.target.value);
    setSelectedBasemapLayer(selectedItem);


  };







  const ColorLegendsDataItem = ColorLegendsData[`${intervalType}_${selectedDataType.value}`];

  function DistrictOnEachfeature(feature, layer) {
    if (hydroclimaticStats) {

      layer.on("mouseover", function (e) {
        const DataItem = hydroclimaticStats.find(
          (item) => item[dataView] === feature.properties.NAME
        );
        let popupContent;

        if (!DataItem) {
          popupContent = `<div> Data not available for ${feature.properties.NAME}</div>`;
        } else if (selectedDataType.value === "AridityIndex") {
          popupContent = `
            <div>
              ${dataView}: ${feature.properties.NAME}<br/>
              ${selectedDataType.name}: ${DataItem["AridityIndex"][selectedTime]}  
              
            </div>
          `;
        } else {
          popupContent = `
            <div>
            ${dataView}: ${feature.properties.NAME}<br/>
              ${selectedDataType.name}  ${selectedDataType.value === 'AridityIndex' ? '' : `(${intervalType === 'Yearly' ? 'mm/year' : 'mm/month'})`}: ${intervalType === 'Monthly' ? DataItem[selectedDataType.value][selectedTime] : getSumAnnualDataFromMonthly(DataItem[selectedDataType.value])[selectedTime]}
            </div>
          `;
        }

        layer.bindTooltip(popupContent, { sticky: true });
        layer.openTooltip();
      });

      layer.on("mouseout", function () {
        layer.closeTooltip();
      });
    }
  }

  const DistrictStyle = (feature) => {
    if (selectedTime !== "" && hydroclimaticStats) {
      const getDensityFromData = (name, view) => {
        const DataItem = hydroclimaticStats && hydroclimaticStats.find((item) => item[view] === name);
        if (selectedDataType.value === "AridityIndex") {
          if (intervalType === 'Yearly') {
            return DataItem && DataItem["AridityIndex"][selectedTime];
          }
        } else {
          if (intervalType === 'Monthly') {
            return DataItem && DataItem[selectedDataType.value] ? DataItem[selectedDataType.value][selectedTime] : null;
          } else {
            return DataItem && DataItem[selectedDataType.value] ? getSumAnnualDataFromMonthly(DataItem[selectedDataType.value])[selectedTime] : null;
          }
        }
      };
      const density = getDensityFromData(feature.properties.NAME, dataView);

      return {
        fillColor: ColorLegendsDataItem ? fillDensityColor(ColorLegendsDataItem, density) : "none",
        // fillColor: selectedTime !== '' ? Annual_Density(density) : "none",
        weight: 1,
        opacity: 1,
        color: "black",
        dashArray: "2",
        fillOpacity: 1,
      };
    }
  };


  const handleDataLayerSelection = (e) => {
    const value = e.target.value;
    const selectedItem = MapDataLayers.find((item) => item.value === value);
    setSelectedDataType(selectedItem);
  };

  const handleIntervalTypeChange = (e) => {
    setIntervalType(e.target.value);
    setSelectedTime('')
  };


  let TableAnnualData;

  if (SelectedFeaturesStatsData) {
    TableAnnualData = {
      Year: YearsArray,
      AREA: SelectedFeaturesStatsData.AREA,
      Yearly_AETI: getSumAnnualDataFromMonthly(SelectedFeaturesStatsData.AETI),
      Yearly_PCP: getSumAnnualDataFromMonthly(SelectedFeaturesStatsData.PCP),
      Yearly_RET: getSumAnnualDataFromMonthly(SelectedFeaturesStatsData.RET),
      Yearly_AridityIndex: SelectedFeaturesStatsData.AridityIndex,
      Yearly_ETB: SelectedFeaturesStatsData.ETB,
      Yearly_ETG: SelectedFeaturesStatsData.ETG,
    }
  }


  return (
    <>

      {SelectedFeaturesStatsData ? (
        <div className='dasboard_page_container'>
          <div className='main_dashboard'>

            <div className='left_panel_equal'>

              <SelectedFeatureHeading />



              <div className='card_container'>

                <div className='card_heading_container'>
                  <div className='card_heading'>
                    <h4>Precipitation and Ref. Evapotranspiration</h4>
                  </div>

                  <div className='info_container'>
                    <div className='heading_info_button' onClick={handlePCP}>
                      <BsInfoCircleFill />
                    </div>

                  </div>
                </div>




                <ReactApexChart
                  options={{
                    chart: {
                      height: "100%",
                      type: 'line',
                    },

                    // markers: {
                    //   size: 2,
                    // },
                    stroke: {
                      curve: 'smooth',
                      width: 3
                    },
                    // grid: {
                    //   show: false, 
                    // },

                    xaxis: {
                      type: 'datetime',
                      categories: MonthsArray,
                      // labels: {
                      //   rotate: 0,
                      // },
                      tickPlacement: 'on',
                    },
                    yaxis: [
                      {
                        title: {
                          text: 'Precipitation (mm/month)',
                        },
                        labels: {
                          formatter: (val) => `${parseInt(val)}`, // Ensure labels are integers
                        },

                      },
                      {
                        opposite: true,
                        title: {
                          text: 'Ref. ET (mm/month)',
                        },
                        labels: {
                          formatter: (val) => `${parseInt(val)}`, // Ensure labels are integers
                        },
                      }
                    ],
                    tooltip: {
                      shared: true,
                      intersect: false,
                      x: {
                        format: 'MMM yyyy'
                      },
                      y: [{
                        formatter: function (val) {
                          return `${val}`;
                        }
                      }, {
                        // formatter: function (val) {
                        //   return `${val.toFixed(2)}`;
                        // }
                      }]
                    },
                    // legend: {
                    //   horizontalAlign: 'left',
                    //   offsetX: 40
                    // }
                  }}
                  series={[
                    {
                      name: 'Precipitation (mm/month)',
                      type: 'bar',
                      data: SelectedFeaturesStatsData.PCP,
                      color: '#265073',
                    },
                    {
                      name: 'Ref. ET (mm/month)',
                      type: 'line',
                      data: SelectedFeaturesStatsData.RET,
                      color: '#e80202',
                    }
                  ]}
                  type="line"
                  style={{ width: "100%", height: "100%" }}
                />




                {climateChangeStats && (
                  <PCPTrendChart
                    climateChangeStats={climateChangeStats} />

                )}




              </div>

              <div className='card_container'>

                <div className='card_heading_container'>
                  <div className='card_heading'>
                    <h4>Aridity Index</h4>
                  </div>

                  <div className='info_container'>
                    <div className='heading_info_button' onClick={handleAridityIndex}>
                      <BsInfoCircleFill />
                    </div>
                    
                  </div>
                </div>


                <AridityIndexChart
                  SelectedFeaturesStatsData={SelectedFeaturesStatsData}
                />

              </div>

              <div className='card_container'>
                {/* <div className='defination_container'>
              <h4>Land Cover class area by district (ha)</h4>
            </div> */}



                {/* <div className='chart_year_container' >
                  <label>Select unit: &nbsp; </label>
                  <select value={selectedTableUnit} style={{ marginRight: "10px" }}>
                    <option value="mm_year">mm/year</option>
                    <option value="mcm_year">MCM/year</option>
                  </select>

                </div> */}

                {TableAnnualData && TableAnnualData.Year && (
                  <>
                    <TableView
                      tableHeaders={[
                        "Year",
                        "Precipitation (mm/year)",
                        "Evapotranspiration (mm/year)",
                        "PCP - ET (mm/year)",
                        "Ref. ET (mm/year)",
                        "Aridity Index",
                        "ET Blue (mm/year)",
                        "ET Green (mm/year)"
                      ]}
                      tableBody={TableAnnualData.Year.map((year, index) => [
                        year,
                        parseFloat(TableAnnualData.Yearly_PCP[index].toFixed(0)).toLocaleString(),
                        parseFloat(TableAnnualData.Yearly_AETI[index].toFixed(0)).toLocaleString(),
                        parseFloat((TableAnnualData.Yearly_PCP[index] - TableAnnualData.Yearly_AETI[index]).toFixed(0)).toLocaleString(),
                        parseFloat((TableAnnualData.Yearly_RET[index]).toFixed(0)).toLocaleString(),
                        parseFloat(TableAnnualData.Yearly_AridityIndex[index].toFixed(2)).toLocaleString(),
                        parseFloat(TableAnnualData.Yearly_ETB[index].toFixed(0)).toLocaleString(),
                        parseFloat(TableAnnualData.Yearly_ETG[index].toFixed(0)).toLocaleString()
                      ])}
                    />

                    <TableView
                      tableHeaders={[
                        "Year",
                        "Precipitation (MCM/year)",
                        "Evapotranspiration (MCM/year)",
                        "PCP - ET (MCM/year)",
                        "Ref. ET (MCM/year)",
                        "Aridity Index",
                        "ET Blue (MCM/year)",
                        "ET Green (MCM/year)"
                      ]}
                      tableBody={TableAnnualData.Year.map((year, index) => [
                        year,
                        parseFloat((TableAnnualData.Yearly_PCP[index] * 0.001 * TableAnnualData.AREA / 1000000).toFixed(0)).toLocaleString(),
                        parseFloat((TableAnnualData.Yearly_AETI[index] * 0.001 * TableAnnualData.AREA / 1000000).toFixed(0)).toLocaleString(),
                        parseFloat(((TableAnnualData.Yearly_PCP[index] - TableAnnualData.Yearly_AETI[index]) * 0.001 * TableAnnualData.AREA / 1000000).toFixed(0)).toLocaleString(),
                        parseFloat((TableAnnualData.Yearly_RET[index] * 0.001 * TableAnnualData.AREA / 1000000).toFixed(0)).toLocaleString(),
                        parseFloat((TableAnnualData.Yearly_AridityIndex[index]).toFixed(2)).toLocaleString(),
                        parseFloat((TableAnnualData.Yearly_ETB[index] * 0.001 * TableAnnualData.AREA / 1000000).toFixed(0)).toLocaleString(),
                        parseFloat((TableAnnualData.Yearly_ETG[index] * 0.001 * TableAnnualData.AREA / 1000000).toFixed(0)).toLocaleString(),
                      ])}
                    />

                  </>

                )}





              </div>


            </div>

            <div className='right_panel_equal' >
              <div className='card_container' style={{ height: "100%" }}>
                <MapContainer
                  fullscreenControl={true}
                  center={mapCenter}
                  style={{ width: '100%', height: "100%", backgroundColor: 'white', border: 'none', margin: 'auto' }}
                  zoom={setInitialMapZoom()}
                  // maxZoom={8}
                  minZoom={setInitialMapZoom()}
                  keyboard={false}
                  dragging={setDragging()}
                  maxBounds={maxBounds}
                  // attributionControl={false}
                  // scrollWheelZoom={false}
                  doubleClickZoom={false}
                  zoomSnap={0.5}
                >

                  <div className='map_heading'>
                    <p> {selectedDataType.name} </p>
                  </div>

                  <div className='map_layer_manager'>
                    <div className="accordion" id="accordionPanelsStayOpenExample">
                      <div className="accordion-item">
                        <h2 className="accordion-header" id="panelsStayOpen-headingOne">
                          <button className="accordion-button map_layer_collapse collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseOne" aria-expanded="false" aria-controls="panelsStayOpen-collapseOne">
                            Base Map
                          </button>
                        </h2>
                        <div id="panelsStayOpen-collapseOne" className="accordion-collapse collapse" aria-labelledby="panelsStayOpen-headingOne">
                          <div className="accordion-body map_layer_collapse_body">
                            {BaseMapsLayers.map((option, index) => (
                              <div key={index} className="form-check">
                                <input
                                  type="radio"
                                  className="form-check-input"
                                  id={option.name}
                                  name="data_type"
                                  value={option.name}
                                  checked={selectedBasemapLayer?.name === option.name}
                                  onChange={handleBasemapSelection}
                                />
                                <label htmlFor={option.name}>{option.name}</label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="accordion-item">
                        <h2 className="accordion-header" id="panelsStayOpen-headingTwo">
                          <button className="accordion-button map_layer_collapse " type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseTwo" aria-expanded="true" aria-controls="panelsStayOpen-collapseTwo">
                            Raster Layers
                          </button>
                        </h2>
                        <div id="panelsStayOpen-collapseTwo" className="accordion-collapse collapse show" aria-labelledby="panelsStayOpen-headingTwo">
                          <div className="accordion-body map_layer_collapse_body">
                            {MapDataLayers.slice(0, 3).map((item, index) => (
                              <div key={index} className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={item.value}
                                  value={item.value}
                                  checked={selectedDataType.value === item.value}
                                  onChange={handleDataLayerSelection}
                                />
                                <label htmlFor={item.value}> {item.name}</label>
                              </div>


                            ))}


                          </div>
                        </div>
                      </div>
                      <div className="accordion-item">
                        <h2 className="accordion-header" id="panelsStayOpen-headingThree">
                          <button className="accordion-button map_layer_collapse collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseThree" aria-expanded="false" aria-controls="panelsStayOpen-collapseThree">
                            Vector Data Layers
                          </button>
                        </h2>
                        <div id="panelsStayOpen-collapseThree" className="accordion-collapse collapse" aria-labelledby="panelsStayOpen-headingThree">
                          <div className="accordion-body map_layer_collapse_body">


                            {MapDataLayers.slice(3, 8).map((item, index) => (
                              <div key={index} className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={item.value}
                                  value={item.value}
                                  checked={selectedDataType.value === item.value}
                                  onChange={handleDataLayerSelection}
                                />
                                <label htmlFor={item.value}> {item.name}</label>
                              </div>
                            ))}



                            {/* <select value={intervalType} onChange={handleIntervalTypeChange}>
                          <option value="Monthly">Monthly</option>
                          <option value="Yearly">Yearly</option>
                        </select> */}


                            <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
                              {renderTimeOptions(intervalType)}
                            </select>


                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <TileLayer
                    key={selectedBasemapLayer.url}
                    attribution={selectedBasemapLayer.attribution}
                    url={selectedBasemapLayer.url}
                    subdomains={selectedBasemapLayer.subdomains}
                  />



                  {selectedDataType.value === 'avg_pcp_raster' ? (
                    <>
                      <WMSTileLayer
                        attribution={selectedDataType.attribution}
                        url={`${process.env.REACT_APP_GEOSERVER_URL}/geoserver/Kenya/wms`}
                        params={{ LAYERS: '	Kenya:PCP_2018-2023_avg' }}
                        version="1.1.0"
                        transparent={true}
                        format="image/png"
                        key="avg_pcp_raster"
                        zIndex={3}
                      />
                      <GeoserverLegend
                        layerName="PCP_2018-2023_avg"
                        Unit="P (mm/year)"
                      />

                      <PixelValue layername="PCP_2018-2023_avg" unit="mm/year" />


                    </>

                  ) : selectedDataType.value === 'avg_longterm_pcp_raster' ? (
                    <>
                      <WMSTileLayer
                        attribution={selectedDataType.attribution}
                        url={`${process.env.REACT_APP_GEOSERVER_URL}/geoserver/Kenya/wms`}
                        params={{ LAYERS: '	Kenya:PCP_Long_Term_Mean_1981-2023' }}
                        version="1.1.0"
                        transparent={true}
                        format="image/png"
                        key="avg_longterm_pcp_raster"
                        zIndex={3}
                      />
                      <GeoserverLegend
                        layerName="PCP_Long_Term_Mean_1981-2023"
                        Unit="P (mm/year)"
                      />

                      <PixelValue layername="PCP_Long_Term_Mean_1981-2023" unit="mm/year" />


                    </>

                  ) : selectedDataType.value === 'avg_ret_raster' ? (
                    <>
                      <WMSTileLayer
                        attribution={selectedDataType.attribution}
                        url={`${process.env.REACT_APP_GEOSERVER_URL}/geoserver/Kenya/wms`}
                        params={{ LAYERS: '	Kenya:RET_2018-2023_avg' }}
                        version="1.1.0"
                        transparent={true}
                        format="image/png"
                        key="avg_ret_raster"
                        zIndex={3}
                      />
                      <PixelValue layername="RET_2018-2023_avg" unit="mm/year" />

                      <GeoserverLegend
                        layerName="RET_2018-2023_avg"
                        Unit="Ref. ET (mm/year)"
                      />

                    </>

                  ) : selectedDataType.value === 'avg_pet_raster' ? (
                    <>
                      <WMSTileLayer
                        attribution={selectedDataType.attribution}
                        url={`${process.env.REACT_APP_GEOSERVER_URL}/geoserver/Kenya/wms`}
                        params={{ LAYERS: 'Kenya:PET_2018-2023_avg' }}
                        version="1.1.0"
                        transparent={true}
                        format="image/png"
                        key="avg_pet_raster"
                        zIndex={3}
                      />
                      <PixelValue layername="PET_2018-2023_avg" unit="mm/year" />

                      <GeoserverLegend
                        layerName="PET_2018-2023_avg"
                        Unit="Potential ET (mm/year)"
                      />



                    </>

                  ) : selectedDataType.value === 'avg_aridityIndex_raster' ? (
                    <>

                      <WMSTileLayer
                        attribution={selectedDataType.attribution}
                        url={`${process.env.REACT_APP_GEOSERVER_URL}/geoserver/Kenya/wms`}
                        params={{ LAYERS: '	Kenya:AridityIndex_2018-2023_avg' }}
                        version="1.1.0"
                        transparent={true}
                        format="image/png"
                        key="avg_aridityIndex_raster"
                        zIndex={3}
                      />
                      <PixelValue layername="AridityIndex_2018-2023_avg" unit="" />

                      <GeoserverLegend
                        layerName="AridityIndex_2018-2023_avg"
                        Unit="Aridity Index"
                      />
                    </>

                  ) : (
                    <>

                    </>
                  )}


                  {selectedDataType && selectedDataType.value && selectedTime !== "" && intervalType !== "" && ColorLegendsDataItem ? (

                    <>
                      <FiltereredDistrictsFeatures
                        DistrictStyle={DistrictStyle}
                        DistrictOnEachfeature={DistrictOnEachfeature}
                        layerKey={selectedDataType.value + selectedTime + intervalType + (hydroclimaticStats && hydroclimaticStats.length)}
                        attribution={selectedDataType.attribution}
                      />

                      {ColorLegendsDataItem && (
                        <DynamicLegend ColorLegendsDataItem={ColorLegendsDataItem} />
                      )}

                    </>

                  ) : (
                    <>
                      <FiltereredDistrictsFeatures
                        DistrictStyle={
                          {
                            fillColor: "none",
                            weight: 2,
                            opacity: 1,
                            color: "black",
                            fillOpacity: 1,
                          }}
                        layerKey={selectedDataType.value + selectedTime + intervalType}
                      />
                    </>


                  )}





                  <BaseMap />

                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Preloader />
      )}
    </>

  )
}

export default PrecipitationPage