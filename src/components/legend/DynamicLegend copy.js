import React from 'react';

const DynamicLegend = ({ ColorLegendsDataItem }) => {
    const { Title, Unit, Colors, Value } = ColorLegendsDataItem;
    const gradientColors = Colors.join(', ');
    // const MaxValue = Value[0];
    // const MinValue = Value[Value.length - 1];

    // const firstColor = Colors[0];
    // const lastColor = Colors[Colors.length - 1];


    return (
        <div className="legend_container">

            <div className="accordion" id="accordionLegend">
                <div className="accordion-item">
                    <h2 className="accordion-header" id="headingOne">
                        <button className="accordion-button map_layer_collapse_body" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                            Legend
                        </button>
                    </h2>
                    <div id="collapseOne" className="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionLegend">
                        <div className="accordion-body map_layer_collapse_body">
                            <div className="legend_heading">
                                <p>

                                    {Unit}
                                </p>
                            </div>

                            <div className="legend-color-container">
                                <div className='legend-color' style={{ backgroundImage: `linear-gradient(to top, ${gradientColors})` }}></div>
                                <div className="legend-item">
                                    {
                                        [...Value].reverse().map((item, index, arr) => (
                                            <p key={index}>{index === arr.length - 1 ? `> ${item}` : item}</p>
                                        ))
                                    }


                                </div>

                            </div>
                        </div>
                    </div>
                </div>

            </div>





        </div>
    );
};

export default DynamicLegend;
