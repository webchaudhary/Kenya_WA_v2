import React from 'react'
import { useSelectedFeatureContext } from '../contexts/SelectedFeatureContext';
import DISTRICT_PlaceAttributes from "../assets/data/DISTRICT_PlaceAttributes.json"
import WATERSHED_PlaceAttributes from "../assets/data/WATERSHED_PlaceAttributes.json"


const SelectedFeatureHeading = () => {
    const { selectedView, setSelectedView, selectedFeatureName, setSelectedFeatureName, dataView, setDataView } = useSelectedFeatureContext();

    const handleDataViewChange = (e) => {
        const value = e.target.value
        setSelectedView(value)
        setSelectedFeatureName('All');

        if (["COUNTRY", "COUNTY", ].includes(value)) {
            setDataView("COUNTY");
        } else if ([ "BASIN"].includes(value)) {
            setDataView("BASIN");
        }
    }

    const handleFeatureChange = (e) => {
        setSelectedFeatureName(e.target.value);

    }


    const getUniqueValues = (view) => {
        const uniqueValues = new Set();
        if (dataView === "COUNTY") {
            DISTRICT_PlaceAttributes.forEach((item) => {
                uniqueValues.add(item[view]);
            });
        } else if (dataView === "BASIN") {
            WATERSHED_PlaceAttributes.forEach((item) => {
                uniqueValues.add(item[view]);
            });
        }
        return Array.from(uniqueValues).sort();  // Ensure an array is returned no matter what
    };



    return (
        <>

            <div className='card_container'>
                <select className='m-1' value={selectedView} onChange={handleDataViewChange}>
                    <option value="COUNTRY">Country View</option>
                    {/* <option value="DISTRICT">District View</option> */}
                    <option value="COUNTY">County View</option>
                    <option value="BASIN">Basin View</option>
                    {/* <option value="WATERSHED">Watershed View</option> */}
                    
                    
                </select>

                <select className='m-1' value={selectedFeatureName} onChange={handleFeatureChange}>
                    <option value="All">Select Feature</option>
                    {selectedView && getUniqueValues(selectedView).map((value, index) => (
                        <option key={index} value={value}>{value}</option>
                    ))}
                </select>

                {selectedFeatureName === '' && <p className='m-1' style={{ color: "red" }}>Please select a feature.</p>}

            </div>

            <div className='card_container'>
                <p style={{ fontSize: "18px" }}>
                    <strong> Selected View:</strong> {selectedView.charAt(0).toUpperCase() + selectedView.slice(1).toLowerCase()} | <strong> Selected Feature: </strong> {selectedFeatureName}
                </p>

            </div>

        </>
    )
}

export default SelectedFeatureHeading