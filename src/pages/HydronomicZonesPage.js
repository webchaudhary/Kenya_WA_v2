import React, { useEffect, useState } from 'react'
import { MapContainer, GeoJSON, TileLayer, ImageOverlay, WMSTileLayer } from 'react-leaflet'
import * as L from "leaflet";
import "leaflet/dist/leaflet.css"
import 'leaflet-fullscreen/dist/Leaflet.fullscreen.js';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import BaseMap from '../components/BaseMap';
import { MonthsArray, SelectedFeaturesAverageStatsFunction, YearsArray, calculateAverageOfArray, calculateSumOfArray, fillDensityColor, getAnnualDataFromMonthly, renderTimeOptions } from '../helpers/functions';
import { BaseMapsLayers, mapCenter, maxBounds, pngRasterBounds, setDragging, setInitialMapZoom } from '../helpers/mapFunction';
import MapLegend from '../components/MapLegend';
import { ColorLegendsData } from "../assets/data/ColorLegendsData";
import { useSelectedFeatureContext } from '../contexts/SelectedFeatureContext';


import FiltereredDistrictsFeatures from '../components/FiltereredDistrictsFeatures.js';

import hydronomic_zones from "../assets/legends/hydronomic_zones.jpg"
import SelectedFeatureHeading from '../components/SelectedFeatureHeading.js';
import axios from 'axios';
import { useLoaderContext } from '../contexts/LoaderContext.js';

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
  const { selectedView, selectedFeatureName } = useSelectedFeatureContext();
  const [hydronomicZonesStats, setHydronomicZonesStats] = useState(null);
  const { setIsLoading } = useLoaderContext();

  const [selectedBasemapLayer, setSelectedBasemapLayer] = useState(BaseMapsLayers[0]);


  const handleBasemapSelection = (e) => {
    const selectedItem = BaseMapsLayers.find((item) => item.name === e.target.value);
    setSelectedBasemapLayer(selectedItem);
  };




  //   const fetchHydronomicZonesStats = (view, featureName) => {
  //     axios
  //         .get(`${process.env.REACT_APP_BACKEND}/featureData/HydronomicZonesStats/`, {
  //             params: {
  //                 view: view,
  //                 featureName: featureName
  //             }
  //         })
  //         .then(response => {
  //           console.log(response)
  //           setHydronomicZonesStats(response.data);
  //         })
  //         .catch(error => console.error('Error fetching data:', error));
  // }

  const fetchHydronomicZonesStats = (view, featureName) => {
    axios
      .get(`${process.env.REACT_APP_BACKEND}/data/HydronomicZonesStats/`)
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



  const handleDataLayerSelection = (e) => {
    const value = e.target.value;
    const selectedItem = MapDataLayers.find((item) => item.value === value);
    setSelectedDataType(selectedItem);
  };


  const handleIntervalTypeChange = (e) => {
    setIntervalType(e.target.value);
    setSelectedTime('')
  };







  return (
    <div className='dasboard_page_container'>
      <div className='main_dashboard'>


        <>

          <div className='left_panel_equal'>

            <SelectedFeatureHeading />


            <div className='card_container'>

              {hydronomicZonesStats && (
                <table className='item_table'>
                  <thead>
                    <tr>
                      <th>Zone</th>
                      <th>Zone Name</th>
                      <th>PCP (mm/year)</th>
                      <th>AETI (mm/year)</th>
                      <th>PCP - ET (mm/year)</th>
                      <th>Area (ha)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hydronomicZonesStats.map((item, index) => (
                      <tr key={index}>
                        <td>{item.Zone}</td>
                        <td>{item.Zone_name}</td>
                        <td>{item.PCP}</td>
                        <td>{item.AETI}</td>
                        <td>{item.PCP_ET}</td>
                        <td>{item.Area_Hectare}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>


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
                        <button className="accordion-button map_layer_collapse collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseTwo" aria-expanded="false" aria-controls="panelsStayOpen-collapseTwo">
                          Raster layers
                        </button>
                      </h2>
                      <div id="panelsStayOpen-collapseTwo" className="accordion-collapse collapse" aria-labelledby="panelsStayOpen-headingTwo">
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
                      params={{ LAYERS: '	Kenya:kenya_zoning_nw_v3_nw1' }}
                      version="1.1.0"
                      transparent={true}
                      format="image/png"
                      key="avg_aeti_raster"
                    />


                    <div className="legend-panel" style={{ width: "200px" }}>
                      <img
                        src={hydronomic_zones}
                        alt="Legend_Img"
                      />
                    </div>

                  </>



                ) : (
                  <>

                  </>

                )}


                <FiltereredDistrictsFeatures
                  // DistrictStyle={DistrictStyle}
                  attribution={selectedDataType.attribution}
                  layerKey={selectedDataType.value}
                  DistrictStyle={{
                    fillColor: 'black',
                    weight: 2,
                    color: 'black',
                    fillOpacity: "0.001",
                  }}
                // DistrictOnEachfeature={DistrictOnEachfeature}
                />









                <BaseMap />

              </MapContainer>
            </div>
          </div>
        </>


      </div>
    </div >
  )
}

export default HydronomicZonesPage