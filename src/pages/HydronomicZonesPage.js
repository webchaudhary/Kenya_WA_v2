import React, { useEffect, useState } from 'react'
import { MapContainer, GeoJSON, TileLayer, ImageOverlay, WMSTileLayer } from 'react-leaflet'
import * as L from "leaflet";
import "leaflet/dist/leaflet.css"
import 'leaflet-fullscreen/dist/Leaflet.fullscreen.js';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import BaseMap from '../components/BaseMap';
import { MonthsArray, SelectedFeaturesWeightedHydronomicFunc } from '../helpers/functions';
import { BaseMapsLayers, mapCenter, maxBounds, pngRasterBounds, setDragging, setInitialMapZoom } from '../helpers/mapFunction';
import DynamicLegend from '../components/legend/DynamicLegend.js';
import { ColorLegendsData } from "../assets/data/ColorLegendsData";
import { useSelectedFeatureContext } from '../contexts/SelectedFeatureContext';


import FiltereredDistrictsFeatures from '../components/FiltereredDistrictsFeatures.js';
import SelectedFeatureHeading from '../components/SelectedFeatureHeading.js';
import axios from 'axios';
import { useLoaderContext } from '../contexts/LoaderContext.js';
import { BsInfoCircleFill } from "react-icons/bs";
import { useModalHandles } from '../components/ModalHandles.js';
import TableView from '../components/TableView.js';

import GeoserverLegend from '../components/legend/GeoserverLegend.js';
import Preloader from '../components/Preloader.js';
const MapDataLayers = [
  {
    name: "Hydronomic zoning",
    value: "hydronomic_zones",
    legend: "",
    attribution: ""
  },

]


const HydronomicZonesPage = () => {
  const [selectedDataType, setSelectedDataType] = useState(MapDataLayers[0]);
  const [intervalType, setIntervalType] = useState('Yearly');
  const [selectedTime, setSelectedTime] = useState(5);
  const { selectedView, selectedFeatureName, dataView } = useSelectedFeatureContext();
  const [hydronomicZonesStats, setHydronomicZonesStats] = useState(null);
  const { setIsLoading } = useLoaderContext();

  const [selectedBasemapLayer, setSelectedBasemapLayer] = useState(BaseMapsLayers[0]);
  const { handleHydronomicZones } = useModalHandles();



  const [tableItem, setTableItem] = useState('AETI');

  const handleTableItemSelection = (e) => {
    setTableItem(e.target.value)
  }

  const handleBasemapSelection = (e) => {
    const selectedItem = BaseMapsLayers.find((item) => item.name === e.target.value);
    setSelectedBasemapLayer(selectedItem);
  };




  const fetchHydronomicZonesStats = (view, featureName) => {
    axios
      .get(`${process.env.REACT_APP_BACKEND}/featureData/HydronomicZonesStats/`, {
        params: {
          view: view,
          featureName: featureName
        }
      })
      .then(response => {
        setHydronomicZonesStats(response.data);
      })
      .catch(error => console.error('Error fetching data:', error));
  }




  useEffect(() => {
    if (selectedView && selectedFeatureName) {
      setIsLoading(true);
      Promise.all([
        fetchHydronomicZonesStats(selectedView, selectedFeatureName),
      ]).then(() => {
        setIsLoading(false);
      }).catch(() => {
        setIsLoading(false);
      });
    }
  }, [selectedView, selectedFeatureName]);




  const SelectedFeaturesStatsData = hydronomicZonesStats && SelectedFeaturesWeightedHydronomicFunc(hydronomicZonesStats);



  const handleDataLayerSelection = (e) => {
    const value = e.target.value;
    const selectedItem = MapDataLayers.find((item) => item.value === value);
    setSelectedDataType(selectedItem);
  };


  const handleIntervalTypeChange = (e) => {
    setIntervalType(e.target.value);
    setSelectedTime('')
  };




  function DistrictOnEachfeature(feature, layer) {
    const DataItem = hydronomicZonesStats && hydronomicZonesStats.find(item => item[dataView] === feature.properties.NAME);

    if (DataItem) {

      layer.on('mouseover', function (e) {


        let initialData;

        if (selectedDataType.value === "hydronomic_zones") {
          initialData = [
            { label: '1a. Perennial sources/headwaters', value: Math.round(DataItem.ZonesArea[0]), color: '#067074' },
            { label: '1b. Intermittent/seasonal flow zones', value: Math.round(DataItem.ZonesArea[1]), color: '#0b3435' },
            { label: '2. Conveyance and recapture zones', value: Math.round(DataItem.ZonesArea[2]), color: '#01cdf8' },
            { label: '3a. Rainwater dependent zone - Good arable', value: Math.round(DataItem.ZonesArea[3]), color: '#3baa80' },
            { label: '3b. Rainwater dependent zone - risky arable', value: Math.round(DataItem.ZonesArea[4]), color: '#bfa903' },
            { label: '3c. Suitable for drier land uses (livestock)', value: Math.round(DataItem.ZonesArea[5]), color: '#e6cdde' },
            { label: '3d. Driest/shortest biomass', value: Math.round(DataItem.ZonesArea[6]), color: '#b1aeb7' },
            { label: '4a. Terminal use zone (Ocean)', value: Math.round(DataItem.ZonesArea[7]), color: '#fba779' },
            { label: '4b. Terminal use zone (Inland)', value: Math.round(DataItem.ZonesArea[8]), color: '#e1535a' },
            { label: 'Waterbodies', value: Math.round(DataItem.ZonesArea[9]), color: '#4d94f6' },

          ];

        }


        // Define colors, labels, and their corresponding data values


        // Calculate total area
        const totalArea = initialData.reduce((sum, item) => sum + item.value, 0);

        // Convert values to percentages
        initialData.forEach(item => {
          item.value = ((item.value / totalArea) * 100).toFixed(2);  // Keep two decimal places
        });


        // Sort and slice to get top 5
        const sortedData = initialData.sort((a, b) => b.value - a.value).slice(0, 5);

        // Calculate the sum of the remaining percentages
        const otherPercentage = initialData.filter(item => !sortedData.includes(item)).reduce((sum, current) => sum + parseFloat(current.value), 0).toFixed(2);

        // Add 'Other Land' if there are remaining percentages
        if (otherPercentage > 0) {
          sortedData.push({ label: 'Other Land Cover', value: otherPercentage, color: '#000000' });  // Black color for 'Other Land'
        }

        // SVG dimensions
        const radius = 70;
        let svgContent = '<svg width="200" height="200" viewBox="-100 -100 200 200" xmlns="http://www.w3.org/2000/svg">';
        let legendContent = '<ul style="list-style: none; padding: 0;">';

        // Start at the top of the circle
        let startAngle = 0;

        sortedData.forEach((item, index) => {
          // Calculate the angle for this slice
          const angle = (item.value / 100) * 2 * Math.PI;
          const endAngle = startAngle + angle;
          const largeArc = (angle > Math.PI) ? 1 : 0;

          // Calculate x, y coordinates for the arc
          const x1 = radius * Math.sin(startAngle);
          const y1 = -radius * Math.cos(startAngle);
          const x2 = radius * Math.sin(endAngle);
          const y2 = -radius * Math.cos(endAngle);

          // Draw the path for the slice
          svgContent += `<path d="M0,0 L${x1},${y1} A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2} z" fill="${item.color}" />`;


          // Add to legend
          legendContent += `<li><span style="color:${item.color};">&#9632;</span> ${item.label} (${item.value}%)</li>`;

          // Move to the next slice
          startAngle = endAngle;
        });

        svgContent += '</svg>';
        legendContent += '</ul>';

        const popupContent = `<div>
      ${dataView}: ${feature.properties.NAME}<br/>
        ${svgContent}
        ${legendContent}
      </div>`;

        layer.bindTooltip(popupContent, { sticky: true });
        layer.openTooltip();
      });

      layer.on('mouseout', function () {
        layer.closeTooltip();
      });

    }


  }

  const ZonesName = [
    "1a. Perennial sources/headwaters",
    "1b. Intermittent/seasonal flow zones",
    "2. Conveyance and recapture zones",
    "3a. Rainwater dependent zone - Good arable",
    "3b. Rainwater dependent zone - risky arable",
    "3c. Suitable for drier land uses (livestock)",
    "3d. Driest/shortest biomass",
    "4a. Terminal use zone (Ocean)",
    "4b. Terminal use zone (Inland)",
    "Waterbodies"
  ]

  let TableAnnualData;

  if (SelectedFeaturesStatsData) {
    TableAnnualData = {
      Zones: ZonesName,
      ZonesArea: SelectedFeaturesStatsData.ZonesArea,
      AETI: SelectedFeaturesStatsData.AETI,
      PCP: SelectedFeaturesStatsData.PCP,
    }
  }




  return (
    <>
      {SelectedFeaturesStatsData && hydronomicZonesStats ? (

        <div className='dasboard_page_container'>
          <div className='main_dashboard'>



            <div className='left_panel_equal'>

              <SelectedFeatureHeading />


              <div className='card_container'>

                <div className='card_heading_container'>
                  <div className='card_heading'>
                    <h4>Hydronomic Zones Stats (Avg 2018 - 2023)</h4>
                  </div>

                  <div className='heading_info_button'
                    onClick={handleHydronomicZones}
                  >
                    <BsInfoCircleFill />
                  </div>


                </div>


                {TableAnnualData && TableAnnualData.ZonesArea && (
                  <>
                    <TableView
                      tableHeaders={[
                        "Zone Name",
                        "Precipitation (mm/year)",
                        "Evapotranspiration (mm/year)",
                        "PCP - ET (mm/year)",
                        "Area (Ha)",
                      ]}
                      tableBody={TableAnnualData.Zones.map((zone, index) => [
                        zone,
                        TableAnnualData.PCP[index].toFixed(0),
                        TableAnnualData.AETI[index].toFixed(0),
                        (TableAnnualData.PCP[index] - TableAnnualData.AETI[index]).toFixed(0),
                        parseFloat(TableAnnualData.ZonesArea[index].toFixed(0)).toLocaleString()



                      ])}
                    />
                  </>

                )}


              </div>



              <div className='card_container'>

                <div className='card_heading_container'>
                  <div className='card_heading'>
                    <h4>Hydronomic Zones Stats (Avg 2018 - 2023) per {dataView.toLowerCase()}</h4>
                  </div>

                  <div className='heading_info_button'>
                    <select value={tableItem} onChange={handleTableItemSelection} >
                      <option value="AETI">AETI (mm/year)</option>
                      <option value="PCP">PCP (mm/year)</option>
                      <option value="ZonesArea">Zones Area (Ha)</option>

                    </select>
                  </div>


                </div>




                {hydronomicZonesStats && hydronomicZonesStats.length > 0 && (
                  <>
                    <div className='item_table_container'>
                      <table className='item_table'>
                        <thead>
                          <tr>
                            <th>Zones \ {dataView.charAt(0).toUpperCase() + dataView.slice(1).toLowerCase()}</th>
                            {hydronomicZonesStats.map((item, index) => (
                              <th key={index}>{item[dataView]}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {hydronomicZonesStats[0][tableItem].map((_, zoneIndex) => (
                            <tr key={zoneIndex}>
                              <td>{ZonesName[zoneIndex]}</td>
                              {hydronomicZonesStats.map((item, index) => (
                                <td key={index}>{parseFloat(item[tableItem][zoneIndex].toFixed(0)).toLocaleString()}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>



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
                          <button className="accordion-button map_layer_collapse " type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseTwo" aria-expanded="true" aria-controls="panelsStayOpen-collapseTwo">
                            Raster Layers
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






                  {selectedDataType.value === 'hydronomic_zones' ? (
                    <>
                      <WMSTileLayer
                        attribution={selectedDataType.attribution}
                        url={`${process.env.REACT_APP_GEOSERVER_URL}/geoserver/Kenya/wms`}
                        params={{ LAYERS: 'Kenya:kenya_zoning_nw_v3_nw1' }}
                        version="1.1.0"
                        transparent={true}
                        format="image/png"
                        key="avg_aeti_raster"
                        zIndex={3}
                      />




                      <GeoserverLegend
                        layerName="kenya_zoning_nw_v3_nw1"
                        Unit=""
                      />



                    </>



                  ) : (
                    <>

                    </>

                  )}


                  <FiltereredDistrictsFeatures
                    attribution={selectedDataType.attribution}
                    layerKey={selectedDataType.value + (hydronomicZonesStats && hydronomicZonesStats.length)}
                    DistrictStyle={{
                      fillColor: 'black',
                      weight: 2,
                      color: 'black',
                      fillOpacity: "0.001",
                    }}
                    DistrictOnEachfeature={DistrictOnEachfeature}
                  />









                  <BaseMap />

                </MapContainer>
              </div>
            </div>



          </div>
        </div >

      ) : (
        <Preloader />

      )}
    </>

  )
}

export default HydronomicZonesPage