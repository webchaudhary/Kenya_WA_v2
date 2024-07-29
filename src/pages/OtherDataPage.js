import React, { useState } from "react";
import {
    MapContainer,
    GeoJSON,
    ImageOverlay,
    WMSTileLayer,
    TileLayer,
} from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-fullscreen/dist/Leaflet.fullscreen.js";
import "leaflet-fullscreen/dist/leaflet.fullscreen.css";
import { BaseMapsLayers, mapCenter, maxBounds, pngRasterBounds, setDragging, setInitialMapZoom } from '../helpers/mapFunction';


import irrigated_rainfed from "../assets/legends/irrigated_rainfed.jpg";
import surface_water_legend from "../assets/legends/surface_water_legend.jpg"
import reservoirs_dams_legend from "../assets/legends/reservoirs_dams_legend.jpg"

import Kenya_boundary from '../assets/data/shapefiles/Kenya_boundary.json';
import Kenya_counties from '../assets/data/shapefiles/Kenya_counties.json';
import Kenya_water_basin from '../assets/data/shapefiles/Kenya_water_basin.json';

import BaseMap from "../components/BaseMap";
import GeoserverLegend from "../components/legend/GeoserverLegend.js";
import PixelValue from "../contexts/PixelValue.js";
import ImageLegend from "../components/legend/ImageLegend.js";





const RasterLayersOptions = [
    {
        name: 'Rainfed and Irrigated Cropland Areas',
        value: 'Irrigated_Rainfed',
        legend: "",
        attribution: 'Data Source: <a href="https://doi.org/10.5066/P9N4R7SF" target="_blank">Rainfed and Irrigated Cropland Areas for Africa</a>'
    },


    {
        name: 'Cropping Intensity',
        value: 'crop_intensity',
        legend: "",
        attribution: "Data Source: <a href='https://essd.copernicus.org/articles/13/4799/2021/' target='_blank'>GCI30: Global Cropping Intensity</a>"

    },
    {
        name: 'Elevation',
        value: 'elevation',
        legend: "",
        attribution: "Data Source: <a href='https://agupubs.onlinelibrary.wiley.com/doi/10.1029/2005RG000183' target='_blank'>NASA SRTM Digital Elevation</a>"
    },
    {
        name: 'Population Density',
        value: 'population_density',
        legend: "",
        attribution: "Data Source: <a href='https://sedac.ciesin.columbia.edu/data/set/gpw-v4-population-density-rev11' target='_blank'>SEDAC</a>"
    },
    {
        name: 'Reservoirs and Dams Locations',
        value: 'global_dams_reservoirs',
        legend: "",
        attribution: "Data Source: <a href='https://sedac.ciesin.columbia.edu/maps/services' target='_blank'>SEDAC</a>"
    },

    {
        name: 'Surface Water',
        value: 'surface_water',
        legend: "",
        attribution: "Data Source: <a href='https://global-surface-water.appspot.com/download' target='_blank'>2016 EC JRC/Google </a>"
    },

];

const VectorDataOptions = [
    { name: 'Country Boundry', value: 'Country_Boundry', data: Kenya_boundary },
    // { name: 'District Boundry', value: 'District_Boundry', data: AFG_districts },
    { name: 'Basins Boundry', value: 'Basin_Boundry', data: Kenya_water_basin },
    // { name: 'Watershed Boundry', value: 'Watershed_Boundry', data: Kenya_water_basin },
    { name: 'Counties Boundry', value: 'County_Boundry', data: Kenya_counties },

];


const OtherDataPage = () => {
    const [selectedRasterLayer, setSelectedRasterLayer] = useState(RasterLayersOptions[0]);
    const [rasterLayerOpacity, setRasterLayerOpacity] = useState(1);
    const [selectedVectorData, setSelectedVectorData] = useState(VectorDataOptions[0]);
    const [selectedBasemapLayer, setSelectedBasemapLayer] = useState(BaseMapsLayers[0]);



    const handleBasemapSelection = (e) => {
        const selectedItem = BaseMapsLayers.find((item) => item.name === e.target.value);
        setSelectedBasemapLayer(selectedItem);


    };

    const handleRasterLayerSelection = (e) => {
        const value = e.target.value;
        const selectedItem = RasterLayersOptions.find((item) => item.value === value);
        setSelectedRasterLayer(selectedItem);

    };

    const handleOpacityChange = (e) => {
        setRasterLayerOpacity(parseFloat(e.target.value));
    };


    const handleVectorLayerSelection = (e) => {
        const selectedItem = VectorDataOptions.find((item) => item.value === e.target.value);
        setSelectedVectorData(selectedItem);
    };







    return (
        <div className="dasboard_page_container">
            <div className="main_dashboard">
                <div className="otherdata_left_panel">
                    <div className="card_container" style={{ height: "100%", overflowY: "scroll" }}>

                        <div className="accordion" >
                            <div className="accordion-item">
                                <h2 className="accordion-header" id="panelsStayOpen-headingThree">
                                    <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseThree" aria-expanded="true" aria-controls="panelsStayOpen-collapseThree">
                                        Base Map
                                    </button>
                                </h2>
                                <div id="panelsStayOpen-collapseThree" className="accordion-collapse collapse show" aria-labelledby="panelsStayOpen-headingThree">
                                    <div className="accordion-body">
                                        {BaseMapsLayers.map((option, index) => (
                                            <div key={index} className="form-check">
                                                <input
                                                    type="radio"
                                                    id={option.nameclassName = "form-check-input"}
                                                    className="form-check-input"
                                                    value={option.name}
                                                    checked={selectedBasemapLayer.name === option.name}
                                                    onChange={handleBasemapSelection}
                                                />
                                                <label htmlFor={option.name}>{option.name}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="accordion-item">
                                <h2 className="accordion-header" id="panelsStayOpen-headingOne">
                                    <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseOne" aria-expanded="true" aria-controls="panelsStayOpen-collapseOne">
                                        Choose Layers
                                    </button>
                                </h2>
                                <div id="panelsStayOpen-collapseOne" className="accordion-collapse collapse show" aria-labelledby="panelsStayOpen-headingOne">
                                    <div className="accordion-body">
                                        {RasterLayersOptions.map((item, index) => (
                                            <div key={index} className="form-check">
                                                <input
                                                    type="radio"
                                                    className="form-check-input"
                                                    id={item.value}
                                                    value={item.value}
                                                    checked={selectedRasterLayer.value === item.value}
                                                    onChange={handleRasterLayerSelection}
                                                />
                                                <label htmlFor={item.value}>{item.name}</label>
                                            </div>
                                        ))}
                                        <div className="input_range_container">
                                            <div className="input_range_label">
                                                <p>0%</p>
                                                <p>Layer Opacity</p>
                                                <p>100%</p>
                                            </div>
                                            <input

                                                type="range"
                                                name="vol"
                                                min="0"
                                                max="1"
                                                step="0.1"
                                                value={rasterLayerOpacity}
                                                onChange={handleOpacityChange}
                                            />
                                        </div>



                                    </div>
                                </div>
                            </div>
                            <div className="accordion-item">
                                <h2 className="accordion-header" id="panelsStayOpen-headingTwo">
                                    <button className="accordion-button " type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseTwo" aria-expanded="true" aria-controls="panelsStayOpen-collapseTwo">
                                        Choose Boundaries
                                    </button>
                                </h2>
                                <div id="panelsStayOpen-collapseTwo" className="accordion-collapse collapse show" aria-labelledby="panelsStayOpen-headingTwo">
                                    <div className="accordion-body">
                                        {VectorDataOptions.map(option => (
                                            <div key={option.value} className="form-check">
                                                <input
                                                    type="checkbox"
                                                    id={option.value}
                                                    name="data_type"
                                                    className="form-check-input"
                                                    value={option.value}
                                                    checked={selectedVectorData?.value === option.value}
                                                    onChange={handleVectorLayerSelection}
                                                />
                                                <label htmlFor={option.value}>{option.name}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>


                    </div>
                </div>

                <div className="otherdata_right_panel">
                    <div className="card_container" style={{ height: "100%" }}>
                        <MapContainer
                            fullscreenControl={true}
                            center={mapCenter}
                            style={{
                                width: "100%",
                                height: "100%",
                                backgroundColor: "white",
                                border: "none",
                                margin: "auto",
                            }}
                            zoom={setInitialMapZoom()}
                            maxBounds={maxBounds}
                            minZoom={setInitialMapZoom() - 1}
                            keyboard={false}
                            dragging={setDragging()}
                            // attributionControl={false}
                            // scrollWheelZoom={false}
                            doubleClickZoom={false}
                        >
                            <BaseMap />

                            <TileLayer
                                key={selectedBasemapLayer.url}
                                attribution={selectedBasemapLayer.attribution}
                                url={selectedBasemapLayer.url}
                                subdomains={selectedBasemapLayer.subdomains}
                            />



                            {selectedRasterLayer.value === "Irrigated_Rainfed" ? (
                                <>
                                    <div className='map_heading'>
                                        <p>Irrigated/Rainfed</p>
                                    </div>

                                    <ImageLegend
                                    legend_image={irrigated_rainfed}
                                    Unit=""/>



                                    {/* <div className='legend-panel'>
                                        <img src={irrigated_rainfed} alt='worldcover_Legend' />
                                    </div> */}


                                    <WMSTileLayer
                                        opacity={rasterLayerOpacity}
                                        attribution={selectedRasterLayer.attribution}
                                        url={`${process.env.REACT_APP_GEOSERVER_URL}/geoserver/Kenya/wms`}
                                        params={{ LAYERS: '	Kenya:Kenya_irrigated_rainfed' }}
                                        version="1.1.0"
                                        transparent={true}
                                        format="image/png"
                                        key="Irrigated_Rainfed"
                                        zIndex={3}
                                    />
                   

                                </>
                            ) : selectedRasterLayer.value === "crop_intensity" ? (
                                <>
                                    <div className='map_heading'>
                                        <p>Crop Intensity</p>
                                    </div>
                                    <WMSTileLayer
                                        opacity={rasterLayerOpacity}
                                        key="crop_intensity"
                                        attribution={selectedRasterLayer.attribution}
                                        url={`${process.env.REACT_APP_GEOSERVER_URL}/geoserver/Kenya/wms`}
                                        params={{ LAYERS: 'Kenya:Kenya_Cropping_Intensity_2016-2018_Avg' }}
                                        version="1.1.0"
                                        transparent={true}
                                        format="image/png"
                                        zIndex={3}
                                    />
                                    <GeoserverLegend
                                        layerName="Kenya_Cropping_Intensity_2016-2018_Avg"
                                        Unit=""
                                    />



                                </>
                            )  : selectedRasterLayer.value === "population_density" ? (
                                <>
                                    <div className='map_heading'>
                                        <p>Population Density</p>
                                    </div>

                                    <WMSTileLayer
                                        opacity={rasterLayerOpacity}
                                        attribution={selectedRasterLayer.attribution}
                                        url={`${process.env.REACT_APP_GEOSERVER_URL}/geoserver/Kenya/wms`}
                                        params={{ LAYERS: 'Kenya:Population_Density' }}
                                        version="1.1.0"
                                        transparent={true}
                                        format="image/png"
                                        key="elevation"
                                        zIndex={3}
                                    />
                                    <PixelValue layername="Population_Density" unit="persons/sq km" />

                                    <GeoserverLegend
                                        layerName="Population_Density"
                                        Unit="(persons/sq km)"
                                    />





                                    {/* <WMSTileLayer
                                        opacity={rasterLayerOpacity}
                                        zIndex={10}
                                        key="population_density"
                                        attribution="Data Source: <a href='https://sedac.ciesin.columbia.edu/maps/services' target='_blank'>SEDAC</a>"
                                        url="https://sedac.ciesin.columbia.edu/geoserver/wms"
                                        params={{ LAYERS: "gpw-v3:gpw-v3-population-density_2000" }}
                                        // maxZoom={6}
                                        version="1.1.1"
                                        // transparent={true}
                                        format="image/png"
                                        zIndex={3}
                                    /> */}
                                    {/* <div className="legend-panel" style={{ width: "150px" }}>
                                        <img
                                            src={global_population_legend}
                                            alt="Legend_Img"
                                        />
                                    </div> */}
                                </>
                            ) : selectedRasterLayer.value === "global_dams_reservoirs" ? (
                                <>
                                    <div className='map_heading'>
                                        <p>Reservoirs and Dams Locations</p>
                                    </div>
                                    <WMSTileLayer
                                        opacity={rasterLayerOpacity}

                                        key="global_dams_reservoirs"
                                        attribution={selectedRasterLayer.attribution}
                                        url="https://sedac.ciesin.columbia.edu/geoserver/wms"
                                        params={{ LAYERS: "grand-v1:grand-v1-dams-rev01,grand-v1:grand-v1-reservoirs-rev01" }}
                                        // maxZoom={6}
                                        version="1.1.1"
                                        // transparent={true}
                                        format="image/png"
                                        zIndex={3}
                                    />

<ImageLegend
                                    legend_image={reservoirs_dams_legend}
                                    Unit=""/>


                

                                </>
                            )
                                : selectedRasterLayer.value === "elevation" ? (
                                    <>
                                        <div className='map_heading'>
                                            <p>Elevation</p>
                                        </div>

                                        <WMSTileLayer
                                            opacity={rasterLayerOpacity}
                                            attribution={selectedRasterLayer.attribution}
                                            url={`${process.env.REACT_APP_GEOSERVER_URL}/geoserver/Kenya/wms`}
                                            params={{ LAYERS: 'Kenya:Kenya_DEM' }}
                                            version="1.1.0"
                                            transparent={true}
                                            format="image/png"
                                            key="elevation"
                                            zIndex={3}
                                        />
                                        <PixelValue layername="Kenya_DEM" unit="m" />


                                        {/* <WMSTileLayer
                                            opacity={rasterLayerOpacity}
                                            key="elevation"
                                            attribution="Data Source: <a href='https://www.terrestris.de/en/hoehenmodell-srtm30-wms/' target='_blank'>Terrestris</a>"
                                            layers={"SRTM30-Colored"}
                                            url="https://ows.terrestris.de/osm/service?"
                                            zIndex={3}
                                        /> */}

                                        <GeoserverLegend
                                            layerName="Kenya_DEM"
                                            Unit=""
                                        />







                                    </>
                                ) : selectedRasterLayer.value === "surface_water" ? (
                                    <>
                                        <div className='map_heading'>
                                            <p>Surface Water</p>
                                        </div>
                                        <TileLayer
                                            opacity={rasterLayerOpacity}
                                            attribution={selectedRasterLayer.attribution}
                                            key="surface_water"
                                            url="https://storage.googleapis.com/global-surface-water/tiles2021/transitions/{z}/{x}/{y}.png"

                                        />

<ImageLegend
                                    legend_image={surface_water_legend}
                                    Unit=""/>


                    
                                    </>
                                ) : (
                                    null
                                )}



                            <GeoJSON
                                key={selectedVectorData.value}
                                style={{
                                    fillColor: "black",
                                    weight: 2,
                                    color: "black",
                                    fillOpacity: "0.001",
                                    interactive: false,
                                }}
                                data={selectedVectorData.data.features}
                            />






                        </MapContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OtherDataPage;
