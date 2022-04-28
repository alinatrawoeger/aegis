import React, { useEffect, useState } from "react";
import styles from "./MetricSwitcher.module.css";

const MetricSwitcher = () => {
    const [selectedMetric, setMetric] = useState('apdex');

    return (
      <>
        <div className={styles.metricSwitcherPanel}>
            <MetricElement caption="Apdex" id="apdex" selected={selectedMetric === 'apdex'} setMetric={setMetric} />
            <MetricElement caption="User actions" id="ua" selected={selectedMetric === 'ua'} setMetric={setMetric} />
            <MetricElement caption="Load actions" id="loadua" selected={selectedMetric === 'loadua'} setMetric={setMetric} />
            <MetricElement caption="Xhr actions" id="xhrua" selected={selectedMetric === 'xhrua'} setMetric={setMetric} />
            <MetricElement caption="Custom actions" id="customua" selected={selectedMetric === 'customua'} setMetric={setMetric} />
            <MetricElement caption="Errors" id="errors" selected={selectedMetric === 'errors'} setMetric={setMetric} />
        </div>
      </>
    );
};

type MetricElementProps = {
    caption: string;
    id: string;
    selected: boolean;
    setMetric: any;
}

const MetricElement: React.FC<MetricElementProps> = ( { caption, id, selected, setMetric } ) => {
    return (
        <>
            <div className={`${styles.elementPanel} ${ selected ? styles.selectedElement : ''}`}
                onClick={() => setMetric(id) }>
                <span>{caption}</span>
            </div>
        </>
    )
}

export default MetricSwitcher;