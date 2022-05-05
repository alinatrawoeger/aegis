import React, { useEffect, useState } from "react";
import styles from "./MetricSwitcher.module.css";

type MetricSwitcherProps = {
    isIVolunteer: boolean;
}

const MetricSwitcher: React.FC<MetricSwitcherProps> = ( { isIVolunteer } ) => {
    const [selectedMetric, setMetric] = isIVolunteer ? useState('urgency') : useState('apdex');

    return (
      <>
        <div className={`${styles.metricSwitcherPanel} ${isIVolunteer ? styles.metricSwitcherPanelIVol : styles.metricSwitcherPanelDt}`}>
            {isIVolunteer ? 
                <>
                    <MetricElement caption="Dringlichkeit" id="urgency" selected={selectedMetric === 'urgency'} setMetric={setMetric} isIVolunteer={isIVolunteer} />
                    <MetricElement caption="Priorität" id="priority" selected={selectedMetric === 'priority'} setMetric={setMetric} isIVolunteer={isIVolunteer} />
                    <MetricElement caption="Dauer" id="duration" selected={selectedMetric === 'duration'} setMetric={setMetric} isIVolunteer={isIVolunteer} />
                </>
            : 
                <>
                    <MetricElement caption="Apdex" id="apdex" selected={selectedMetric === 'apdex'} setMetric={setMetric} isIVolunteer={isIVolunteer} />
                    <MetricElement caption="User actions" id="ua" selected={selectedMetric === 'ua'} setMetric={setMetric} isIVolunteer={isIVolunteer} />
                    <MetricElement caption="Load actions" id="loadua" selected={selectedMetric === 'loadua'} setMetric={setMetric} isIVolunteer={isIVolunteer} />
                    <MetricElement caption="Xhr actions" id="xhrua" selected={selectedMetric === 'xhrua'} setMetric={setMetric} isIVolunteer={isIVolunteer} />
                    <MetricElement caption="Custom actions" id="customua" selected={selectedMetric === 'customua'} setMetric={setMetric} isIVolunteer={isIVolunteer} />
                    <MetricElement caption="Errors" id="errors" selected={selectedMetric === 'errors'} setMetric={setMetric} isIVolunteer={isIVolunteer} />
                </>
            }
        </div>
      </>
    );
};

type MetricElementProps = {
    caption: string;
    id: string;
    selected: boolean;
    setMetric: any;
    isIVolunteer: boolean;
}

const MetricElement: React.FC<MetricElementProps> = ( { caption, id, selected, setMetric, isIVolunteer } ) => {
    return (
        <>
            <div className={`${styles.elementPanel}
                             ${isIVolunteer ? styles.elementPanelIVol : styles.elementPanelDt} 
                             ${ selected ? 
                                isIVolunteer ? 
                                    id == 'urgency' ? styles.selectedElementIVolUrgency
                                    : id == 'priority' ? styles.selectedElementIVolPriority
                                    : styles.selectedElementIVolDuration
                                : styles.selectedElementDt : ''}`}
                onClick={() => setMetric(id)} >
                <span>{caption}</span>
            </div>
        </>
    )
}

export default MetricSwitcher;