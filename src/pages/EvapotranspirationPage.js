import React, { useEffect, useState } from 'react'
import { MapContainer, GeoJSON, TileLayer, ImageOverlay, WMSTileLayer } from 'react-leaflet'
import * as L from "leaflet";
import "leaflet/dist/leaflet.css"
import 'leaflet-fullscreen/dist/Leaflet.fullscreen.js';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import BaseMap from '../components/BaseMap';
import { MonthsArray, SelectedFeaturesAverageStatsFunction, SelectedFeaturesWeightedAverageStatsFunction, YearsArray, calculateAverageOfArray, calculateSumOfArray, fillDensityColor, getSumAnnualDataFromMonthly, renderTimeOptions } from '../helpers/functions';
import { BaseMapsLayers, mapCenter, maxBounds, pngRasterBounds, setDragging, setInitialMapZoom } from '../helpers/mapFunction';
import DynamicLegend from '../components/legend/DynamicLegend.js';
import { ColorLegendsData } from "../assets/data/ColorLegendsData";
import { useSelectedFeatureContext } from '../contexts/SelectedFeatureContext';
import TotalConsumptionChart from '../components/charts/TotalConsumptionChart';
import UnitConsumptionChart from '../components/charts/UnitConsumptionChart';
import GeoserverLegend from '../components/legend/GeoserverLegend.js';
import PixelValue from "../contexts/PixelValue.js";
import FiltereredDistrictsFeatures from '../components/FiltereredDistrictsFeatures.js';
import SelectedFeatureHeading from '../components/SelectedFeatureHeading.js';
import { useLoaderContext } from '../contexts/LoaderContext.js';
import axios from 'axios';
import Preloader from '../components/Preloader.js';
import ReactApexChart from 'react-apexcharts';
import TableView from '../components/TableView.js';
import CardHeading from '../components/charts/CardHeading.js';
import { BsInfoCircleFill } from "react-icons/bs";
import { useModalHandles } from '../components/ModalHandles.js';


const MapDataLayers = [
  {
    name: "Annual ET (Avg. 2018-2023)",
    value: "avg_aeti_raster",
    legend: "",
    attribution: "Data Source: <a href='https://www.fao.org/in-action/remote-sensing-for-water-productivity/wapor-data/en' target='_blank'>WaPOR L1 V3</a>"
  },
  {
    name: "Annual  Ref. ET (Avg. 2018-2023)",
    value: "avg_ret_raster",
    legend: "",
    attribution: "Data Source: <a href='https://data.apps.fao.org/catalog/dataset/global-weather-for-agriculture-agera5' target='_blank'>AgERA5 </a>"

  },
  // {
  //   name: "Annual  Potential ET (Avg. 2018-2023)",
  //   value: "avg_pet_raster",
  //   legend: "",
  //   attribution: "Data Source: <a href='https://developers.google.com/earth-engine/datasets/catalog/NASA_GLDAS_V021_NOAH_G025_T3H' target='_blank'>GLDAS </a>"
  // },
  {
    name: "Annual  PCP-ET (Avg. 2018-2023)",
    value: "avg_pcp_et",
    legend: "",
    attribution: ""
  },
  {
    name: "Evapotranspiration (ET)",
    value: "AETI",
    legend: "",
    attribution: "Data Source: <a href='https://www.fao.org/in-action/remote-sensing-for-water-productivity/wapor-data/en' target='_blank'>WaPOR L1 V3</a>"
  },
  {
    name: "Ref. ET",
    value: "RET",
    legend: "",
    attribution: "Data Source: <a href='https://data.apps.fao.org/catalog/dataset/global-weather-for-agriculture-agera5' target='_blank'>AgERA5 </a>"
  },
  // {
  //   name: "Potential ET",
  //   value: "PET",
  //   legend: "",
  //   attribution: "Data Source: <a href='https://developers.google.com/earth-engine/datasets/catalog/NASA_GLDAS_V021_NOAH_G025_T3H' target='_blank'>GLDAS </a>"
  // },
  {
    name: "PCP-ET",
    value: "PCP_ET",
    legend: "",
    attribution: ""
  },
]


const EvapotranspirationPage = () => {
  const [selectedDataType, setSelectedDataType] = useState(MapDataLayers[0]);
  const [intervalType, setIntervalType] = useState('Yearly');
  const [selectedTime, setSelectedTime] = useState(5);
  const { selectedView, selectedFeatureName, dataView } = useSelectedFeatureContext();
  const { setIsLoading } = useLoaderContext();

  const [selectedBasemapLayer, setSelectedBasemapLayer] = useState(BaseMapsLayers[0]);
  const [hydroclimaticStats, setHydroclimaticStats] = useState(null);

  const { handleET } = useModalHandles();


  const handleBasemapSelection = (e) => {
    const selectedItem = BaseMapsLayers.find((item) => item.name === e.target.value);
    setSelectedBasemapLayer(selectedItem);
  };


  const ColorLegendsDataItem = ColorLegendsData[`${intervalType}_${selectedDataType.value}`];




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


  useEffect(() => {
    if (selectedView && selectedFeatureName) {
      setIsLoading(true);
      Promise.all([
        fetchHydroclimaticStats(selectedView, selectedFeatureName),
      ]).then(() => {
        setIsLoading(false);
      }).catch(() => {
        setIsLoading(false);
      });
    }
  }, [selectedView, selectedFeatureName]);





  const SelectedFeaturesStatsData = hydroclimaticStats && SelectedFeaturesWeightedAverageStatsFunction(hydroclimaticStats);


  function DistrictOnEachfeature(feature, layer) {
    if (hydroclimaticStats) {

      layer.on("mouseover", function (e) {

        const DataItem = hydroclimaticStats.find(
          (item) => item[dataView] === feature.properties.NAME
        );
        let popupContent;

        if (!DataItem) {
          popupContent = `<div> Data not available for ${feature.properties.NAME}</div>`;
        } else if (selectedDataType.value === "PCP_ET") {
          const value = intervalType === 'Monthly' ?
            (DataItem["PCP"][selectedTime] - DataItem["AETI"][selectedTime]).toFixed(1) :
            (getSumAnnualDataFromMonthly(DataItem["PCP"])[selectedTime] - getSumAnnualDataFromMonthly(DataItem["AETI"])[selectedTime]).toFixed(1);
          popupContent = `
              <div>
                ${dataView}: ${feature.properties.NAME}<br/>
                ${selectedDataType.name} (${intervalType === 'Yearly' ? 'mm/year' : 'mm/month'}): ${value}
              </div>
            `;
        } else if (selectedDataType.value === "PET") {
          const value = DataItem["PET"][selectedTime]
          popupContent = `
              <div>
              ${dataView}: ${feature.properties.NAME}<br/>
                ${selectedDataType.name} (mm/year): ${value}
              </div>
            `;
        } else {
          const value = intervalType === 'Monthly' ?
            DataItem[selectedDataType.value][selectedTime] :
            getSumAnnualDataFromMonthly(DataItem[selectedDataType.value])[selectedTime];
          popupContent = `
              <div>
              ${dataView}: ${feature.properties.NAME}<br/>
                ${selectedDataType.name} ${selectedDataType.value === 'AridityIndex' ? '' : `(${intervalType === 'Yearly' ? 'mm/year' : 'mm/month'})`} : ${value}
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
    if (selectedTime && selectedDataType && hydroclimaticStats && selectedDataType.value) {
      const getDensityFromData = (name, view) => {

        const DataItem = hydroclimaticStats && hydroclimaticStats.find((item) => item[view] === name);

        if (selectedDataType.value === "PCP_ET") {
          if (intervalType === 'Monthly') {
            return DataItem && DataItem["PCP"][selectedTime] - DataItem["AETI"][selectedTime];
          } else {
            return DataItem && getSumAnnualDataFromMonthly(DataItem["PCP"])[selectedTime] - getSumAnnualDataFromMonthly(DataItem["AETI"])[selectedTime];
          }
        } if (selectedDataType.value === "PET") {
          if (intervalType === 'Yearly') {
            return DataItem && DataItem["PET"][selectedTime];
          }
        }
        else {
          if (intervalType === 'Monthly') {
            return DataItem && DataItem[selectedDataType.value] ? DataItem[selectedDataType.value][selectedTime] : null;
          } else {
            return DataItem && DataItem[selectedDataType.value] ? getSumAnnualDataFromMonthly(DataItem[selectedDataType.value])[selectedTime] : null;
          }
        }
      };

      const density = getDensityFromData(feature.properties.NAME, dataView)


      return {
        fillColor: ColorLegendsDataItem ? fillDensityColor(ColorLegendsDataItem, density) : "none",
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
  let maxAETI;
  let maxRET;
  let maxRange;


  if (SelectedFeaturesStatsData) {
    TableAnnualData = {
      Year: YearsArray,
      Yearly_AETI: getSumAnnualDataFromMonthly(SelectedFeaturesStatsData.AETI),
      Yearly_PCP: getSumAnnualDataFromMonthly(SelectedFeaturesStatsData.PCP),
      Yearly_RET: getSumAnnualDataFromMonthly(SelectedFeaturesStatsData.RET),
      Yearly_ETB: SelectedFeaturesStatsData.ETB,
      Yearly_ETG: SelectedFeaturesStatsData.ETG,
    }
    maxAETI = Math.max(...SelectedFeaturesStatsData.AETI);
    maxRET = Math.max(...SelectedFeaturesStatsData.RET);
    maxRange = Math.max(maxAETI, maxRET);

  }

  console.log(TableAnnualData)


  return (
    <>
      {SelectedFeaturesStatsData ? (

        <div className='dasboard_page_container'>
          <div className='main_dashboard'>


            <>
              <div className='left_panel_equal'>

                <SelectedFeatureHeading />


                <div className='card_container'>

                  <div className='card_heading_container'>
                    <div className='card_heading'>
                      <h4>Evapotranspiration and Ref. ET</h4>
                    </div>

                    <div className='heading_info_button'
                      onClick={handleET}
                    >
                      <BsInfoCircleFill />
                    </div>


                  </div>



                  <ReactApexChart
                    options={{
                      chart: {
                        height: "100%",
                        type: 'line',
                      },

                      // markers: {
                      //   size: 0.5,
                      // },
                      stroke: {
                        curve: 'smooth',
                        width: 2
                      },
                      // grid: {
                      //   show: false, 
                      // },

                      // xaxis: {
                      //   categories: MonthsArray,
                      // },

                      xaxis: {
                        type: 'datetime',
                        categories: MonthsArray,
                        labels: {
                          // rotate: 0,
                          rotateAlways: false,
                          // formatter: (value) => {
                          //   // Ensure value is a string and ends with "-1" before processing
                          //   return value && value.endsWith("-1") ? value.split("-")[0] : "";
                          // }
                        },
                        tickPlacement: 'on',
                      },


                      yaxis: [
                        {
                          title: {
                            text: 'Evapotranspiration (mm/month)',
                          },
                          labels: {
                            formatter: (val) => `${parseInt(val)}`, // Ensure labels are integers
                          },
                          min: 0,
                          max: maxRange + 10


                        },
                        {
                          opposite: true,
                          title: {
                            text: 'Ref. ET (mm/month)',

                          },
                          labels: {
                            formatter: (val) => `${parseInt(val)}`, // Ensure labels are integers
                          },
                          min: 0,
                          max: maxRange + 10
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
                            return `${val.toFixed(1)}`;
                          }
                        }, {
                          formatter: function (val) {
                            return `${val.toFixed(1)}`;
                          }
                        }]
                      },
                      // legend: {
                      //   horizontalAlign: 'left',
                      //   offsetX: 40
                      // }
                    }}
                    series={[
                      {
                        name: 'Evapotranspiration (mm/month)',
                        type: 'area',
                        data: SelectedFeaturesStatsData.AETI,
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




                </div>

                <div className='card_container'>

                  <TableView
                    tableHeaders={[
                      "Year",
                      "Total Evapotranspiration (BCM/year)",
                      "ET Blue (BCM/year)",
                      "ET Green (BCM/year)",
                      "Precipitation (PCP) (BCM/year)",
                      "PCP - ET (BCM/year)",
                      "Portion of PCP consumed within the country (%)"
                    ]}
                    tableBody={TableAnnualData.Year.map((year, index) => [
                      year,
                      (TableAnnualData.Yearly_AETI[index] * 0.001 * SelectedFeaturesStatsData.AREA / 1000000000).toFixed(1),
                      (TableAnnualData.Yearly_ETB[index] * 0.001 * SelectedFeaturesStatsData.AREA / 1000000000).toFixed(1),
                      (TableAnnualData.Yearly_ETG[index] * 0.001 * SelectedFeaturesStatsData.AREA / 1000000000).toFixed(1),
                      (TableAnnualData.Yearly_PCP[index] * 0.001 * SelectedFeaturesStatsData.AREA / 1000000000).toFixed(1),
                      ((TableAnnualData.Yearly_PCP[index] - TableAnnualData.Yearly_AETI[index]) * 0.001 * SelectedFeaturesStatsData.AREA / 1000000000).toFixed(2),
                      (TableAnnualData.Yearly_AETI[index] * 100 / TableAnnualData.Yearly_PCP[index]).toFixed(1)
                    ])}
                  />

                </div>

                {hydroclimaticStats && (

                  <div className="card_container" style={{ maxHeight: "600px", overflow: "scroll" }}>

                    <div className='card_heading_container'>
                      <div className='card_heading'>
                        <h4>Average annual consumption per {dataView.toLowerCase()}</h4>
                      </div>

                      {/* <div className='info_container'>
                        <div className='heading_info_button'>
                          <BsInfoCircleFill />
                        </div>
                        
                      </div> */}
                    </div>


                    <TotalConsumptionChart hydroclimaticStats={hydroclimaticStats} />
                  </div>

                )}


                {hydroclimaticStats && (
                  <div className="card_container" style={{ maxHeight: "600px", overflow: "scroll" }}>


                    <div className='card_heading_container'>
                      <div className='card_heading'>
                        <h4>Average annual unit consumption per {dataView.toLowerCase()}</h4>
                      </div>

                      {/* <div className='info_container'>
                        <div className='heading_info_button'>
                          <BsInfoCircleFill />
                        </div>
                        
                      </div> */}
                    </div>



                    <UnitConsumptionChart hydroclimaticStats={hydroclimaticStats} />
                  </div>
                )}

              </div>

              <div className='right_panel_equal' >
                <div className='card_container' style={{ height: "100%" }}>


                  <MapContainer
                    fullscreenControl={true}
                    center={mapCenter}
                    style={{ width: '100%', height: "100%", backgroundColor: 'white', border: 'none', margin: 'auto' }}
                    zoom={setInitialMapZoom()}
                    maxBounds={maxBounds}
                    zoomSnap={0.5}
                    minZoom={setInitialMapZoom() - 1}
                    keyboard={false}
                    dragging={setDragging()}
                    doubleClickZoom={false}
                  >

                    <div className='map_heading'>
                      <p> {selectedDataType.name} </p>
                    </div>


                    <div className='map_layer_manager'>
                      <div className="accordion" id="accordionPanelsStayOpenExample">
                        <div className="accordion-item">
                          <h2 className="accordion-header" id="panelsStayOpen-headingOne">
                            <button className="accordion-button map_layer_collapse collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseOne" aria-expanded="false" aria-controls="panelsStayOpen-collapseOne">
                              Base map
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
                            <button className="accordion-button map_layer_collapse" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseTwo" aria-expanded="true" aria-controls="panelsStayOpen-collapseTwo">
                              Raster layers
                            </button>
                          </h2>
                          <div id="panelsStayOpen-collapseTwo" className="accordion-collapse collapse show" aria-labelledby="panelsStayOpen-headingTwo">
                            <div className="accordion-body map_layer_collapse_body">
                              {MapDataLayers.slice(0, 3).map((item, index) => (
                                <div key={item.value} className="form-check">
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
                              Vector data layers
                            </button>
                          </h2>
                          <div id="panelsStayOpen-collapseThree" className="accordion-collapse collapse" aria-labelledby="panelsStayOpen-headingThree">
                            <div className="accordion-body map_layer_collapse_body">
                              {MapDataLayers.slice(3, 6).map((item, index) => (
                                <div key={item.value} className="form-check">
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

                    {selectedBasemapLayer && selectedBasemapLayer.url && (
                      <TileLayer
                        key={selectedBasemapLayer.url}
                        attribution={selectedBasemapLayer.attribution}
                        url={selectedBasemapLayer.url}
                        subdomains={selectedBasemapLayer.subdomains}
                      />
                    )}



                    {selectedDataType.value === 'avg_aeti_raster' ? (
                      <>
                        <WMSTileLayer
                          attribution={selectedDataType.attribution}
                          url={`${process.env.REACT_APP_GEOSERVER_URL}/geoserver/Kenya/wms`}
                          params={{ LAYERS: '	Kenya:AETI_2018-2023_avg' }}
                          version="1.1.0"
                          transparent={true}
                          format="image/png"
                          key="avg_aeti_raster"
                          zIndex={3}
                        />
                        <PixelValue layername="AETI_2018-2023_avg" unit="mm/year" />

                        <GeoserverLegend
                          layerName="AETI_2018-2023_avg"
                          Unit="AETI (mm/year)"
                        />

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
                          url={`${process.env.REACT_APP_GEOSERVER_URL}/geoserver/AFG_Dashboard/wms`}
                          params={{ LAYERS: '	AFG_Dashboard:PET_2018-2023_avg' }}
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

                    ) : selectedDataType.value === 'avg_pcp_et' ? (
                      <>
                        <WMSTileLayer
                          attribution={selectedDataType.attribution}
                          url={`${process.env.REACT_APP_GEOSERVER_URL}/geoserver/Kenya/wms`}
                          params={{ LAYERS: '	Kenya:PCP-AETI_2018-2023_avg' }}
                          version="1.1.0"
                          transparent={true}
                          format="image/png"
                          key="avg_pcp_et"
                          zIndex={3}
                        />

                        <PixelValue layername="PCP-AETI_2018-2023_avg" unit="mm/year" />

                        <GeoserverLegend
                          layerName="PCP-AETI_2018-2023_avg"
                          Unit="P-ET (mm/year)"
                        />






                      </>

                    ) : (
                      null

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
            </>


          </div>
        </div >

      ) : (
        <Preloader />
      )}
    </>

  )
}

export default EvapotranspirationPage