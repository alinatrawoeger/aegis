import React, { useCallback, useEffect, useState } from "react";
import styles from "./MetricSwitcher.module.css";

type MetricSwitcherProps = {
    isIVolunteer: boolean;
    onSetMetric: (value) => void;
}

const MetricSwitcher: React.FC<MetricSwitcherProps> = ( { isIVolunteer, onSetMetric } ) => {
    const [selectedMetric, setMetric] = isIVolunteer ? useState('urgency') : useState('apdex');

    const memoizedCallback = useCallback(
        (value) => {
          setMetric(value);
          onSetMetric(value);
        },
        [selectedMetric, onSetMetric],
      );

    return (
      <>
        <div className={`${styles.metricSwitcherPanel} ${isIVolunteer ? styles.metricSwitcherPanelIVol : styles.metricSwitcherPanelDt}`}>
            {isIVolunteer ? 
                <>
                    <MetricElement caption="Dringlichkeit" id="urgency" selected={selectedMetric === 'urgency'} setMetric={memoizedCallback} isIVolunteer={isIVolunteer} />
                    <MetricElement caption="Priorität" id="priority" selected={selectedMetric === 'priority'} setMetric={memoizedCallback} isIVolunteer={isIVolunteer} />
                    <MetricElement caption="Dauer" id="duration" selected={selectedMetric === 'duration'} setMetric={memoizedCallback} isIVolunteer={isIVolunteer} />
                </>
            : 
                <>
                    <MetricElement caption="Apdex" id="apdex" selected={selectedMetric === 'apdex'} setMetric={memoizedCallback} isIVolunteer={isIVolunteer} />
                    <MetricElement caption="User actions" id="useractions" selected={selectedMetric === 'useractions'} setMetric={memoizedCallback} isIVolunteer={isIVolunteer} />
                    <MetricElement caption="Load actions" id="loadactions" selected={selectedMetric === 'loadactions'} setMetric={memoizedCallback} isIVolunteer={isIVolunteer} />
                    <MetricElement caption="Xhr actions" id="xhractions" selected={selectedMetric === 'xhractions'} setMetric={memoizedCallback} isIVolunteer={isIVolunteer} />
                    <MetricElement caption="Custom actions" id="customactions" selected={selectedMetric === 'customactions'} setMetric={memoizedCallback} isIVolunteer={isIVolunteer} />
                    <MetricElement caption="Errors" id="errors" selected={selectedMetric === 'errors'} setMetric={memoizedCallback} isIVolunteer={isIVolunteer} />
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