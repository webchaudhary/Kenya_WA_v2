import React, { useEffect, useState } from 'react'
import SearchBar from '../components/SearchBar'
import { MapContainer, GeoJSON, TileLayer, WMSTileLayer, ImageOverlay } from 'react-leaflet'
import * as L from "leaflet";
import "leaflet/dist/leaflet.css"
import 'leaflet-fullscreen/dist/Leaflet.fullscreen.js';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import { SelectedFeaturesCroplandStatFunction, calculateAverageOfArray, getSumAnnualDataFromMonthly } from '../helpers/functions';
import { BaseMapsLayers, mapCenter, maxBounds, setDragging, setInitialMapZoom } from '../helpers/mapFunction';
import worldcover_Legend from "../assets/legends/worldcover_Legend.png"
import { useSelectedFeatureContext } from '../contexts/SelectedFeatureContext';
import LandCoverPiChart from '../components/charts/LandCoverPiChart';
import BaseMap from '../components/BaseMap';
import irrigated_rainfed_cropland_area_legend from "../assets/legends/irrigated_rainfed_cropland_area_legend.jpg";
import FiltereredDistrictsFeatures from '../components/FiltereredDistrictsFeatures.js';
import SelectedFeatureHeading from '../components/SelectedFeatureHeading.js';
import axios from 'axios';
import { useLoaderContext } from '../contexts/LoaderContext.js';
import Preloader from '../components/Preloader.js';
import TableView from '../components/TableView.js';
import { BsInfoCircleFill } from 'react-icons/bs';
import RasterLayerLegend from '../components/RasterLayerLegend.js';

const MapDataLayers = [

  {
    name: "ESA LCC",
    value: "ESA_lcc",
    legend: "",
    attribution: 'Data Source: <a href="https://esa-worldcover.org/en/data-access" target="_blank">ESA WorldCover</a>'
  },
  {
    name: "WaPOR LCC",
    value: "wapor_lcc",
    legend: "",
    attribution: 'Data Source: <a href="https://www.sciencedirect.com/science/article/pii/S2352340924002853?via%3Dihub" target="_blank">Afghanistan Land cover</a>'
  },

]


const LandClassificationPage = () => {
  const { selectedView, selectedFeatureName, dataView } = useSelectedFeatureContext();
  const { setIsLoading } = useLoaderContext();

  const [selectedBasemapLayer, setSelectedBasemapLayer] = useState(BaseMapsLayers[0]);
  const [selectedDataType, setSelectedDataType] = useState(MapDataLayers[0]);
  const [landCoverStats, setLandCoverStats] = useState(null);
  const [croplandStats, setCroplandStats] = useState(null);
  const [waterProductivityStats, setWaterProductivityStats] = useState(null);


  const [selectedYear, setSelectedYear] = useState('2023');

  const handleYearSelection = (e) => {
    setSelectedYear(e.target.value)
  }



  const fetchWaterProductivityStats = (view, featureName) => {
    axios
      .get(`${process.env.REACT_APP_BACKEND}/featureData/WaterProductivityStats/`, {
        params: {
          view: view,
          featureName: featureName
        }
      })
      .then(response => {
        setWaterProductivityStats(response.data);
      })
      .catch(error => console.error('Error fetching data:', error));
  }






  const handleBasemapSelection = (e) => {
    const selectedItem = BaseMapsLayers.find((item) => item.name === e.target.value);
    setSelectedBasemapLayer(selectedItem);

  };

  const handleDataLayerSelection = (e) => {
    const value = e.target.value;
    const selectedItem = MapDataLayers.find((item) => item.value === value);
    setSelectedDataType(selectedItem);
  };





  const fetchLandCoverStats = (view, featureName) => {
    axios
      .get(`${process.env.REACT_APP_BACKEND}/featureData/LandcoverStats/`, {
        params: {
          view: view,
          featureName: featureName
        }
      })
      .then(response => {
        setLandCoverStats(response.data);
      })
      .catch(error => console.error('Error fetching data:', error));
  }

  const fetchCroplandStats = (view, featureName) => {
    axios
      .get(`${process.env.REACT_APP_BACKEND}/featureData/Cropland/`, {
        params: {
          view: view,
          featureName: featureName
        }
      })
      .then(response => {
        setCroplandStats(response.data);
      })
      .catch(error => console.error('Error fetching data:', error));
  }

  useEffect(() => {
    if (selectedView && selectedFeatureName) {
      setIsLoading(true);
      Promise.all([
        fetchLandCoverStats(selectedView, selectedFeatureName),
        fetchCroplandStats(selectedView, selectedFeatureName),
        fetchWaterProductivityStats(selectedView, selectedFeatureName),
      ]).then(() => {
        setIsLoading(false);
      }).catch(() => {
        setIsLoading(false);
      });
    }
  }, [selectedView, selectedFeatureName]);

  const SelectedFeaturesStatsData = landCoverStats && SelectedFeaturesCroplandStatFunction(landCoverStats);




  // function DistrictOnEachfeature(feature, layer) {
  //   layer.on('mouseover', function (e) {
  //     const DataItem = HydroclimaticStats.find(item => item.DISTRICT === feature.properties.DISTRICT);

  //     const initialData = [
  //       { label: 'Tree cover', value: Math.round(DataItem.Trees), color: '#006400' },
  //       { label: 'Shrubland', value: Math.round(DataItem.Shrubland), color: '#FFBB23' },
  //       { label: 'Grassland', value: Math.round(DataItem.Grassland), color: '#FFFF4C' },
  //       { label: 'Cropland', value: Math.round(DataItem.Cropland), color: '#F096FF' },
  //       { label: 'Built-up', value: Math.round(DataItem.Builtup), color: '#FA0100' },
  //       { label: 'Bare/sparse vegetation', value: Math.round(DataItem.Bare_Sparse_vegetation), color: '#B4B4B4' },
  //       { label: 'Snow and ice', value: Math.round(DataItem.Snow_and_ice), color: '#F0F0F0' },
  //       { label: 'Permanent water bodies', value: Math.round(DataItem.Permanent_water_bodies), color: '#0064C8' },
  //       { label: 'Herbaceous wetland', value: Math.round(DataItem.Herbaceous_wetland), color: '#0096A0' },
  //       { label: 'Mangroves', value: 0, color: '#04CF75' },  // Assuming 'Mangroves' data is not available
  //       { label: 'Mangroves', value: Math.round(DataItem.Moss_and_lichen), color: '#FAE69F' }
  //     ];

  //     // Calculate total area
  //     const totalArea = initialData.reduce((sum, item) => sum + item.value, 0);

  //     // Convert values to percentages
  //     initialData.forEach(item => {
  //       item.value = ((item.value / totalArea) * 100).toFixed(2);  // Keep two decimal places
  //     });

  //     // Sort and slice to get top 5
  //     const sortedData = initialData.sort((a, b) => b.value - a.value).slice(0, 5);

  //     // Calculate the sum of the remaining percentages
  //     const otherPercentage = initialData.filter(item => !sortedData.includes(item)).reduce((sum, current) => sum + parseFloat(current.value), 0).toFixed(2);

  //     // Add 'Other Land' if there are remaining percentages
  //     if (otherPercentage > 0) {
  //       sortedData.push({ label: 'Other Land', value: otherPercentage, color: '#000000' });  // Black color for 'Other Land'
  //     }

  //     // SVG dimensions
  //     const width = 400;
  //     const barHeight = 15;
  //     const gap = 5;
  //     const chartHeight = sortedData.length * (barHeight + gap);

  //     let svgContent = '<svg width="' + width + '" height="' + chartHeight + '" xmlns="http://www.w3.org/2000/svg">';

  //     const maxValue = Math.max(...sortedData.map(item => parseFloat(item.value)));
  //     sortedData.forEach((item, index) => {
  //       const barWidth = (parseFloat(item.value) / maxValue) * (width - 100); // Scale the bar width
  //       const y = index * (barHeight + gap);
  //       svgContent += `<rect x="100" y="${y}" width="${barWidth}" height="${barHeight}" fill="${item.color}" />`;
  //       svgContent += `<text x="95" y="${y + 15}" alignment-baseline="middle" text-anchor="end" fill="black" font-size="12">${item.label}</text>`;
  //       svgContent += `<text x="${100 + barWidth + 5}" y="${y + 15}" alignment-baseline="middle" fill="black" font-size="12">${item.value}%</text>`;
  //     });

  //     svgContent += '</svg>';

  //     const popupContent = `<div>
  //       District: ${feature.properties.DISTRICT}<br/>
  //       ${svgContent}
  //     </div>`;

  //     layer.bindTooltip(popupContent, { sticky: true });
  //     layer.openTooltip();
  //   });

  //   layer.on('mouseout', function () {
  //     layer.closeTooltip();
  //   });
  // }



  function DistrictOnEachfeature(feature, layer) {

    const DataItem = landCoverStats && landCoverStats.find(item => item[dataView] === feature.properties.NAME);
    // console.log(DataItem)

    if (DataItem) {
      layer.on('mouseover', function (e) {

        let initialData;

        if (selectedDataType.value === "ESA_lcc") {
          initialData = [
            { label: 'Tree cover', value: Math.round(DataItem.ESA_Landcover[0]), color: '#006400' },
            { label: 'Shrubland', value: Math.round(DataItem.ESA_Landcover[1]), color: '#FFBB23' },
            { label: 'Grassland', value: Math.round(DataItem.ESA_Landcover[2]), color: '#FFFF4C' },
            { label: 'Cropland', value: Math.round(DataItem.ESA_Landcover[3]), color: '#F096FF' },
            { label: 'Built-up', value: Math.round(DataItem.ESA_Landcover[4]), color: '#FA0100' },
            { label: 'Bare/sparse vegetation', value: Math.round(DataItem.ESA_Landcover[5]), color: '#B4B4B4' },
            { label: 'Snow and ice', value: Math.round(DataItem.ESA_Landcover[6]), color: '#F0F0F0' },
            { label: 'Permanent water bodies', value: Math.round(DataItem.ESA_Landcover[7]), color: '#0064C8' },
            { label: 'Herbaceous wetland', value: Math.round(DataItem.ESA_Landcover[8]), color: '#0096A0' },
            { label: 'Mangroves', value: Math.round(DataItem.ESA_Landcover[9]), color: '#FAE69F' }
          ];

        } if (selectedDataType.value === "wapor_lcc") {
          initialData = [
            { label: 'Shrubland', value: Math.round(DataItem.WaPOR_LCC[0]), color: '#ffbb23' },
            { label: 'Grassland', value: Math.round(DataItem.WaPOR_LCC[1]), color: '#ffff4c' },
            { label: 'Cropland, rainfed', value: Math.round(DataItem.WaPOR_LCC[2]), color: '#f096ff' },
            { label: 'Cropland, irrigated or under water management', value: Math.round(DataItem.WaPOR_LCC[3]), color: '#9e15cb' },
            { label: 'Built-up', value: Math.round(DataItem.WaPOR_LCC[4]), color: '#fa0100' },
            { label: 'Bare / sparse vegetation', value: Math.round(DataItem.WaPOR_LCC[5]), color: '#eaead1' },
            { label: 'Water bodies', value: Math.round(DataItem.WaPOR_LCC[6]), color: '#0032c8' },
            { label: 'Shrub or herbaceous cover, flooded', value: Math.round(DataItem.WaPOR_LCC[7]), color: '#c2e9ca' },
            { label: 'Tree cover: open, deciduous broadleaved', value: Math.round(DataItem.WaPOR_LCC[8]), color: '#a1dc01' },
            { label: 'Tree cover: open, unknown type', value: Math.round(DataItem.WaPOR_LCC[9]), color: '#658c00' },
            { label: 'Tree cover: closed, deciduous broadleaved', value: Math.round(DataItem.WaPOR_LCC[10]), color: '#009900' },
            { label: 'Tree cover: closed, unknown type', value: Math.round(DataItem.WaPOR_LCC[11]), color: '#006e14' },
            { label: 'Tree cover: closed, evergreen broadleaved', value: Math.round(DataItem.WaPOR_LCC[12]), color: '#009900' },
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




  // function DistrictOnEachfeature(feature, layer) {

  //   layer.on('mouseover', function (e) {
  //     const DataItem = HydroclimaticStats.find(item => item.DISTRICT === feature.properties.DISTRICT);

  //     const popupContent = `
  //           <div>
  //             District: ${feature.properties.DISTRICT}<br/>
  //             Trees: ${DataItem.Trees} ha<br/>
  //             Shrubland: ${DataItem.Shrubland} ha<br/>
  //             Grassland: ${DataItem.Grassland} ha<br/>
  //             Cropland: ${DataItem.Cropland} ha<br/>
  //             Builtup: ${DataItem.Builtup} ha<br/>
  //             Bare, Sparse vegetation: ${DataItem.Bare_Sparse_vegetation} ha<br/>
  //             Snow and Ice: ${DataItem.Snow_and_ice} ha<br/>
  //             Permanent water bodies: ${DataItem.Permanent_water_bodies} ha<br/>
  //             Herbaceous wetland: ${DataItem.Herbaceous_wetland} ha<br/>
  //             Mangroves: ${DataItem.Moss_and_lichen} ha<br/>
  //           </div>
  //         `;
  //     layer.bindTooltip(popupContent, { sticky: true });
  //     layer.openTooltip();
  //   });

  //   layer.on('mouseout', function () {
  //     layer.closeTooltip();
  //   });
  // }

  return (
    <>
      {SelectedFeaturesStatsData && croplandStats ? (
        <div className='dasboard_page_container'>
          <div className='main_dashboard'>
            <div className='left_panel_equal'>
              <SelectedFeatureHeading />



              <div className="card_container"  >
                <div className='card_heading_container'>
                  <div className='card_heading'>
                    <h4>Land Cover class</h4>
                  </div>

                  <div className='info_container'>
                    <div className='heading_info_button'>
                      <BsInfoCircleFill />
                    </div>
                    <div className='info_card_container'>
                      <p>
                        WorldCover provides the first global land cover products for 2020 and 2021 at 10 m resolution, developed and validated in near-real time based on Sentinel-1 and Sentinel-2 data.

                      </p>


                    </div>
                  </div>
                </div>






                {selectedDataType.value === "ESA_lcc" ? (
                  <LandCoverPiChart
                    ClassesName={['Tree cover', 'Shrubland', 'Grassland', 'Cropland', 'Built-up', 'Bare/sparse vegetation', 'Snow and ice', 'Permanent water bodies', 'Herbaceous wetland', 'Mangroves']}
                    landCoverValues={SelectedFeaturesStatsData.ESA_Landcover}
                    colorPallete={['#006400', '#FFBB23', '#FFFF4C', '#F096FF', '#FA0100', '#B4B4B4', '#F0F0F0', '#0064C8', '#0096A0', '#FAE69F',]}
                  />

                ) : selectedDataType.value === "wapor_lcc" ? (
                  <LandCoverPiChart
                    ClassesName={["Shrubland", "Grassland", "Cropland, rainfed", "Cropland, irrigated or under water management", "Built-up", "Bare / sparse vegetation", "Water bodies", "Shrub or herbaceous cover, flooded", "Tree cover: open, deciduous broadleaved", "Tree cover: open, unknown type", "Tree cover: closed, deciduous broadleaved", "Tree cover: closed, unknown type", "Tree cover: closed, evergreen broadleaved"]}
                    landCoverValues={SelectedFeaturesStatsData.WaPOR_LCC}
                    colorPallete={['#ffbb23', '#ffff4c', '#f096ff', '#9e15cb', '#fa0100', '#eaead1', '#0032c8', '#c2e9ca', '#a1dc01', '#658c00', '#009900', '#006e14', '#009900',]}
                  />

                ) : null}






              </div>


              {/* <div className='card_container'>
                <div className='defination_container'>
                  <h4>Land Cover class area by {dataView.toLowerCase()}</h4>
                </div>

                <TableView
                  tableHeaders={[
                    dataView.charAt(0).toUpperCase() + dataView.slice(1).toLowerCase(),
                    "Irrigated cropland (ha)",
                    "Rainfed cropland (ha)",
                    "Ocean and water bodies (ha)",
                    "Non-cropland (other land covers) (ha)"
                  ]}
                  tableBody={landCoverStats.map((item) => [
                    item[dataView],
                    item.Cropland[2].toFixed(0),
                    item.Cropland[3].toFixed(0),
                    item.Cropland[0].toFixed(0),
                    item.Cropland[1].toFixed(0)
                  ])}
                />

              </div> */}



              <div className='card_container'>
                <div className='card_heading_container'>
                  <div className='card_heading'>
                    <h4>Landcover classes area by {dataView.toLowerCase()}</h4>
                  </div>

                  <div className='info_container'>
                    <div className='heading_info_button'>
                      <BsInfoCircleFill />
                    </div>
                    <div className='info_card_container'>
                      <p>
                        Landcover classes area by {dataView.toLowerCase()}
                      </p>

                    </div>
                  </div>
                </div>
                {/* ["Snow",	"Builtup area",	"Water body",	"Forest",	"Irrigated agriculture"	"Rainfed agriculture",	"Fruit trees",	
                "Vineyards",	"Marshland",	"Bare land",	"Rangeland",	"Sand cover",	"Streams"] */}


                {selectedDataType.value === 'ESA_lcc' ? (
                  <>

                    <TableView
                      tableHeaders={[
                        dataView.charAt(0).toUpperCase() + dataView.slice(1).toLowerCase(),

                        "Trees (ha)",
                        "Shrubland (ha)",
                        "Grassland (ha)",
                        "Cropland (ha)",
                        "Builtup (ha)",
                        "Bare, Sparse vegetation (ha)",
                        "Snow and ice (ha)",
                        "Permanent water bodies (ha)",
                        "Herbaceous wetland (ha)",
                        "Mangroves (ha)",
                      ]}
                      tableBody={landCoverStats && landCoverStats.map(item => [
                        item[dataView],
                        item.ESA_Landcover[0].toFixed(0),
                        item.ESA_Landcover[1].toFixed(0),
                        item.ESA_Landcover[2].toFixed(0),
                        item.ESA_Landcover[3].toFixed(0),
                        item.ESA_Landcover[4].toFixed(0),
                        item.ESA_Landcover[5].toFixed(0),
                        item.ESA_Landcover[6].toFixed(0),
                        item.ESA_Landcover[7].toFixed(0),
                        item.ESA_Landcover[8].toFixed(0),
                        item.ESA_Landcover[9].toFixed(0),

                      ])}
                    />

                  </>


                ) : selectedDataType.value === 'wapor_lcc' ? (
                  <TableView
                    tableHeaders={[
                      dataView.charAt(0).toUpperCase() + dataView.slice(1).toLowerCase(),
                      "Shrubland", "Grassland", "Cropland, rainfed", "Cropland, irrigated or under water management", "Built-up", "Bare / sparse vegetation", "Water bodies", "Shrub or herbaceous cover, flooded", "Tree cover: open, deciduous broadleaved", "Tree cover: open, unknown type", "Tree cover: closed, deciduous broadleaved", "Tree cover: closed, unknown type", "Tree cover: closed, evergreen broadleaved"



                    ]}
                    tableBody={landCoverStats && landCoverStats.map(item => [
                      item[dataView],
                      item.WaPOR_LCC[0].toFixed(0),
                      item.WaPOR_LCC[1].toFixed(0),
                      item.WaPOR_LCC[2].toFixed(0),
                      item.WaPOR_LCC[3].toFixed(0),
                      item.WaPOR_LCC[4].toFixed(0),
                      item.WaPOR_LCC[5].toFixed(0),
                      item.WaPOR_LCC[6].toFixed(0),
                      item.WaPOR_LCC[7].toFixed(0),
                      item.WaPOR_LCC[8].toFixed(0),
                      item.WaPOR_LCC[9].toFixed(0),
                      item.WaPOR_LCC[10].toFixed(0),
                      item.WaPOR_LCC[11].toFixed(0),
                      item.WaPOR_LCC[12].toFixed(0),

                    ])}
                  />

                ) : null}



              </div>


              {/* <div className='card_container'>
                <div className='card_heading_container'>
                  <div className='card_heading'>
                    <h4>Cropland classes area by {dataView.toLowerCase()}</h4>
                  </div>

                  <div className='info_container'>
                    <div className='heading_info_button'>
                      <BsInfoCircleFill />
                    </div>
                    <div className='info_card_container'>
                      <p>
                        Cropland classes area by {dataView.toLowerCase()}
                      </p>

                    </div>
                  </div>
                </div>




                <div className='chart_year_container' >
                  <label>Select Year: &nbsp; </label>
                  <select value={selectedYear} onChange={handleYearSelection} style={{ marginRight: "10px" }}>
                    <option value="2018">2018</option>
                    <option value="2019">2019</option>
                    <option value="2020">2020</option>
                    <option value="2021">2021</option>
                    <option value="2022">2022</option>
                    <option value="2023">2023</option>
                  </select>

                </div>


                <TableView
                  tableHeaders={[
                    dataView.charAt(0).toUpperCase() + dataView.slice(1).toLowerCase(),
                    "Wheat (ha)",
                    "Fodder (ha)",
                    "Trees, Orchards & Vineyards (ha)",
                    "Rice (ha)",
                    "Wheat-Other (ha)",
                    // "Leguminous (ha)",
                    "Other (ha)",
                    "Wheat-Rice (ha)",
                    "Cotton (ha)",
                    "Maize (ha)",
                    "Poppy (ha)"
                  ]}
                  tableBody={croplandStats && croplandStats.map(item => [
                    item[dataView],
                    (item[selectedYear][0] * 0.0001).toFixed(0),
                    (item[selectedYear][1] * 0.0001).toFixed(0),
                    (item[selectedYear][2] * 0.0001).toFixed(0),
                    (item[selectedYear][3] * 0.0001).toFixed(0),
                    (item[selectedYear][4] * 0.0001).toFixed(0),
                    // (item[selectedYear][5] * 0.0001).toFixed(0),
                    (item[selectedYear][6] * 0.0001).toFixed(0),
                    (item[selectedYear][7] * 0.0001).toFixed(0),
                    (item[selectedYear][8] * 0.0001).toFixed(0),
                    (item[selectedYear][9] * 0.0001).toFixed(0),
                    (item[selectedYear][10] * 0.0001).toFixed(0)
                  ])}
                />

              </div> */}



              {waterProductivityStats && (
                <div className='card_container'>

                  {/* <div className='card_heading_container'>
                    <div className='card_heading'>
                      <h4>Irrigated/Rainfed area by {dataView.toLowerCase()}</h4>
                    </div>

                    <div className='info_container'>
                      <div className='heading_info_button'>
                        <BsInfoCircleFill />
                      </div>
                      <div className='info_card_container'>
                        <p>
                          The Landsat-Derived Global Rainfed and Irrigated-Cropland Product (LGRIP) maps the world’s agricultural lands by dividing them into irrigated and rainfed croplands. The data is produced using Landsat 8 time-series satellite sensor data for the 2014-2017 time period to create a nominal 2015 product.
                        </p>


                      </div>
                    </div>
                  </div> */}



                  {/* <div className='item_table_container'>
                    <table className='item_table'>
                      <thead>


                        <tr>
                          <td rowspan="1"></td>
                          <th colspan="4" scope="colgroup">Irrigated land</th>
                          <th colspan="4" scope="colgroup">Rainfed land</th>
                        </tr>


                        <tr>
                          <th>{dataView.charAt(0).toUpperCase() + dataView.slice(1).toLowerCase()}</th>
                          <th>Area (ha)</th>
                          <th>PCP (mm/year)</th>
                          <th>AETI (mm/year)</th>
                          <th>P-ET (mm/year)</th>

                          <th>Area (ha)</th>
                          <th>PCP (mm/year)</th>
                          <th>AETI (mm/year)</th>
                          <th>P-ET (mm/year)</th>


                        </tr>
                      </thead>
                      <tbody>
                        {waterProductivityStats.map((item, index) => (
                          <tr key={index}>
                            <td>{item[dataView]}</td>
                            <td>{(item.Area_irrigated / 10000).toFixed(0)}</td>
                            <td>{calculateAverageOfArray(getSumAnnualDataFromMonthly(item.PCP_irrigated)).toFixed(0)}</td>
                            <td>{calculateAverageOfArray(getSumAnnualDataFromMonthly(item.AETI_irrigated)).toFixed(0)}</td>
                            <td>{(calculateAverageOfArray(getSumAnnualDataFromMonthly(item.PCP_irrigated)) - calculateAverageOfArray(getSumAnnualDataFromMonthly(item.AETI_irrigated))).toFixed(0)}</td>

                            <td>{(item.Area_rainfed / 10000).toFixed(0)}</td>
                            <td>{calculateAverageOfArray(getSumAnnualDataFromMonthly(item.PCP_rainfed)).toFixed(0)}</td>
                            <td>{calculateAverageOfArray(getSumAnnualDataFromMonthly(item.AETI_rainfed)).toFixed(0)}</td>
                            <td>{(calculateAverageOfArray(getSumAnnualDataFromMonthly(item.PCP_rainfed)) - calculateAverageOfArray(getSumAnnualDataFromMonthly(item.AETI_rainfed))).toFixed(0)}</td>

                          </tr>
                        ))}
                      </tbody>
                    </table>

                  </div> */}




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
                          <button className="accordion-button map_layer_collapse collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseTwo" aria-expanded="false" aria-controls="panelsStayOpen-collapseTwo">
                            Raster Layers
                          </button>
                        </h2>
                        <div id="panelsStayOpen-collapseTwo" className="accordion-collapse collapse" aria-labelledby="panelsStayOpen-headingTwo">
                          <div className="accordion-body map_layer_collapse_body">

                            {MapDataLayers.map((item, index) => (
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

                    </div>
                  </div>

                  <TileLayer
                    key={selectedBasemapLayer.url}
                    attribution={selectedBasemapLayer.attribution}
                    url={selectedBasemapLayer.url}
                    subdomains={selectedBasemapLayer.subdomains}
                  />


                  <BaseMap />




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
                    DistrictOnEachfeature={DistrictOnEachfeature}
                  />





                  {selectedDataType.value === 'wapor_lcc' ? (
                    <>
                      <WMSTileLayer
                        attribution={selectedDataType.attribution}
                        url={`${process.env.REACT_APP_GEOSERVER_URL}/geoserver/Kenya/wms`}
                        params={{ LAYERS: 'Kenya:Kenya_WaPOR_LCC' }}
                        version="1.1.0"
                        transparent={true}
                        format="image/png"
                        key="wapor_lcc"
                      />


                      <RasterLayerLegend
                        layerName="Kenya_WaPOR_LCC"
                        Unit=""
                      />
                      {/* <PixelValue layername="Avg_PCP_2018_2023" unit="mm/year" /> */}

                    </>

                  ) : selectedDataType.value === 'ESA_lcc' ? (
                    <>
                      <WMSTileLayer
                        attribution={selectedDataType.attribution}
                        url={`${process.env.REACT_APP_GEOSERVER_URL}/geoserver/Kenya/wms`}
                        params={{ LAYERS: 'Kenya:ESA_WorldCover' }}
                        version="1.1.0"
                        transparent={true}
                        format="image/png"
                        key="ESA_lcc"
                      />
                      <RasterLayerLegend
                        layerName="ESA_WorldCover"
                        Unit=""
                      />




                    </>

                  ) : null}


                  {/* <FiltererdJsonFeature /> */}



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

export default LandClassificationPage