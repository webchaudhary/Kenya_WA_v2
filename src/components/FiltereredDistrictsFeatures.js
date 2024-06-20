import React, { useEffect } from 'react';
import { GeoJSON, Pane, useMap } from 'react-leaflet';
import * as L from 'leaflet';
import { mapCenter, setDragging, setInitialMapZoom } from '../helpers/mapFunction';

import { useSelectedFeatureContext } from '../contexts/SelectedFeatureContext';

import Kenya_counties from '../assets/data/shapefiles/Kenya_counties.json';
import Kenya_water_basin from '../assets/data/shapefiles/Kenya_water_basin.json';


const FiltereredDistrictsFeatures = ({ DistrictStyle, DistrictOnEachfeature, layerKey, attribution }) => {
    const { selectedView, selectedFeatureName, dataView } = useSelectedFeatureContext();
    const map = useMap();
    const initialZoom = setInitialMapZoom();



    const selectedJSONData = () => {
        switch (dataView) {
            case 'BASIN':
                return Kenya_water_basin;
            case 'COUNTY':
                return Kenya_counties;
            default:
                return null;
        }
    };




    let selectedFeatureData;
    if (selectedFeatureName !== "All" && selectedFeatureName !== "") {
        selectedFeatureData = selectedJSONData().features.filter(item => item.properties[selectedView] === selectedFeatureName);
    } else {
        selectedFeatureData = selectedJSONData().features;
    }


    useEffect(() => {
        const geoJsonLayer = L.geoJSON(selectedFeatureData);
        const bounds = geoJsonLayer.getBounds();

        if (bounds.isValid()) {
            map.fitBounds(bounds);
        } else {
            map.setView(mapCenter, initialZoom);
        }
    }, [selectedFeatureData, map, initialZoom]);




    return (
        <Pane name="selected_districts">
            <GeoJSON
                // key={selectedDataType.value + selectedTime + intervalType }
                key={`${layerKey} +${dataView}+${selectedFeatureName}`}
                // style={{ fillColor: 'none', weight: 4, color: 'yellow', fillOpacity: "0.4" }}
                // data={selectedFeatureData}
                data={selectedFeatureData}
                style={DistrictStyle}
                onEachFeature={DistrictOnEachfeature}
                attribution={attribution}
            />
        </Pane>
    );
};

export default FiltereredDistrictsFeatures;
