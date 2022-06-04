import React, { useCallback, useEffect, useState } from 'react';
import { FilterType, getFilterType } from '../../utils';
import styles from "./Filterbar.module.css";
var FilterSuggestionPanel = function (_a) {
    var suggestions = _a.suggestions, isIVolunteer = _a.isIVolunteer, onSetNewFilterValue = _a.onSetNewFilterValue;
    var _b = useState([]), filterList = _b[0], setFilterList = _b[1];
    var _c = useState(false), showFilters = _c[0], setShowFilters = _c[1];
    var _d = useState(), selectedFilter = _d[0], setSelectedFilter = _d[1];
    var _e = useState(false), showSuggestions = _e[0], setShowSuggestions = _e[1];
    var _f = useState(), newFilterValue = _f[0], setNewFilterValue = _f[1];
    // set and update filter list
    useEffect(function () {
        setFilterList(Object.keys(suggestions));
    }, [suggestions]);
    // add new filter and give it back outside
    var newFilterCallback = useCallback(function (value) {
        setNewFilterValue(value);
        onSetNewFilterValue([value, true]);
    }, [newFilterValue, onSetNewFilterValue]);
    // render list to choose filter from
    var renderedFilterlist = null;
    if (showFilters) {
        renderedFilterlist = (React.createElement("div", { className: "".concat(styles.suggestionTextValuesPanel, " ").concat(styles.filterListPanel) }, filterList.map(function (filter, index) {
            return React.createElement(FilterListElement, { key: index, filterName: filter, setShowFilters: setShowFilters, setSelectedFilter: setSelectedFilter, setShowSuggestions: setShowSuggestions });
        })));
    }
    // after choosing filter, render list of suggestions
    var renderedSuggestionList = null;
    if (showSuggestions) {
        var filterSuggestions = getFilterSuggestions(isIVolunteer, suggestions, selectedFilter);
        renderedSuggestionList = (React.createElement(FilterSuggestions, { filterKey: selectedFilter, filterValues: filterSuggestions, setNewFilterValue: newFilterCallback, setShowSuggestions: setShowSuggestions, isIVolunteer: isIVolunteer }));
    }
    return (React.createElement(React.Fragment, null,
        !showFilters && !showSuggestions && filterList.length > 0
            ? React.createElement("div", { className: "".concat(styles.filterElement, " ").concat(styles.addFilterBtn, " ").concat(isIVolunteer ? styles.filterElementIVol : styles.filterElementDt), onClick: function () { return displayFilters(true, setShowFilters); } },
                React.createElement("span", null, "Add filter"))
            : '',
        React.createElement("div", null, renderedFilterlist),
        React.createElement("div", null, renderedSuggestionList)));
};
var FilterListElement = function (_a) {
    var filterName = _a.filterName, setShowFilters = _a.setShowFilters, setSelectedFilter = _a.setSelectedFilter, setShowSuggestions = _a.setShowSuggestions;
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: styles.suggestionValueElement, onClick: function () { return selectFilterName(filterName, setShowFilters, setSelectedFilter, setShowSuggestions); } }, filterName)));
};
var FilterSuggestions = function (_a) {
    var filterKey = _a.filterKey, filterValues = _a.filterValues, setNewFilterValue = _a.setNewFilterValue, setShowSuggestions = _a.setShowSuggestions, isIVolunteer = _a.isIVolunteer;
    var keys = Object.keys(filterValues);
    var filterType = getFilterType(filterKey);
    var dtDefaultFrom = 0.5;
    var dtDefaultTo = 1.0;
    var dtMin = 0.05;
    var dtMax = 1;
    var dtStep = 0.05;
    var iVolDefaultFrom = 10000; // also used as min value
    var iVolDefaultTo = 99999; // also used as max value
    var iVolStep = 1;
    return (React.createElement(React.Fragment, null, filterType === FilterType.TEXT
        ? React.createElement("div", { className: styles.suggestionsTextPanel, onClick: function () { return hideSuggestionPanel(setShowSuggestions); } },
            React.createElement("div", { className: styles.suggestionFiltername },
                filterKey,
                ":"),
            React.createElement("div", { className: styles.suggestionTextValuesPanel }, keys.map(function (valueKey) { return (React.createElement("div", { key: valueKey, className: styles.suggestionValueElement, onClick: function () { return selectFilterValue(setNewFilterValue, filterKey, filterValues[valueKey], setShowSuggestions); } }, filterValues[valueKey])); })))
        : React.createElement("div", { className: styles.suggestionsRangePanel },
            React.createElement("div", { className: styles.suggestionFiltername },
                filterKey,
                ":"),
            React.createElement("div", { className: styles.suggestionRangeValuesPanel },
                React.createElement("div", { className: styles.suggestionRangeFilterLine },
                    React.createElement("div", { className: styles.suggestionRangeValueLabel }, "From:"),
                    React.createElement("input", { className: styles.suggestionRangeValueInput, type: 'number', id: 'rangeFrom', min: isIVolunteer ? iVolDefaultFrom : dtMin, max: isIVolunteer ? iVolDefaultTo : dtMax, step: isIVolunteer ? iVolStep : dtStep, defaultValue: isIVolunteer ? iVolDefaultFrom : dtDefaultFrom, onChange: function () { return onChangeRange(); } })),
                React.createElement("div", { className: styles.suggestionRangeFilterLine },
                    React.createElement("div", { className: styles.suggestionRangeValueLabel }, "To:"),
                    React.createElement("input", { className: styles.suggestionRangeValueInput, type: 'number', id: 'rangeTo', min: isIVolunteer ? iVolDefaultFrom : dtMin, max: isIVolunteer ? iVolDefaultTo : dtMax, step: isIVolunteer ? iVolStep : dtStep, defaultValue: isIVolunteer ? iVolDefaultTo : dtDefaultTo, onChange: function () { return onChangeRange(); } })),
                React.createElement("button", { className: styles.suggestionRangeBtn, id: 'rangeFilterConfirm', onClick: function () { return confirmRangeFilter(setNewFilterValue, filterKey, setShowSuggestions); } }, "Confirm")))));
};
var displayFilters = function (showFilters, setShowFilters) {
    setShowFilters(showFilters);
};
var selectFilterName = function (filterName, setShowFilters, setSelectedFilter, setShowFilterSuggestions) {
    setShowFilters(false);
    setSelectedFilter(filterName);
    setShowFilterSuggestions(true);
};
var selectFilterValue = function (setNewFilterValue, filterKey, filterValue, setShowSuggestions) {
    setNewFilterValue({
        "key": filterKey,
        "value": filterValue
    });
    setShowSuggestions(false);
};
var hideSuggestionPanel = function (setShowFilterSuggestions) {
    setShowFilterSuggestions(false);
};
/**
 * get all FilterValues.
 * Also, handle multi-levelled hierarchies in filter values (e.g. regions/cities)
 *
 * @param isIVolunteer
 */
var getFilterSuggestions = function (isIVolunteer, suggestions, filterKey) {
    var filterType = getFilterType(filterKey);
    var values = {};
    if (isIVolunteer) {
        if (filterType === FilterType.TEXT) {
            values = suggestions[filterKey].properties;
        }
    }
    else {
        if (filterType === FilterType.TEXT) {
            if (filterKey === 'country') {
                var tempValues = {};
                for (var continentKey in suggestions[filterKey].properties) {
                    for (var countryKey in suggestions[filterKey].properties[continentKey]) {
                        tempValues[countryKey] = suggestions[filterKey].properties[continentKey][countryKey];
                    }
                }
                values = tempValues;
            }
            else if (filterKey === 'region') {
                var tempValues = {};
                for (var continentKey in suggestions[filterKey].properties) {
                    for (var countryKey in suggestions[filterKey].properties[continentKey]) {
                        for (var regionKey in suggestions[filterKey].properties[continentKey][countryKey]) {
                            tempValues[regionKey] = suggestions[filterKey].properties[continentKey][countryKey][regionKey];
                        }
                    }
                }
                values = tempValues;
            }
            else if (filterKey === 'city') {
                var tempValues = {};
                for (var continentKey in suggestions[filterKey].properties) {
                    for (var countryKey in suggestions[filterKey].properties[continentKey]) {
                        for (var regionKey in suggestions[filterKey].properties[continentKey][countryKey]) {
                            for (var cityIndex = 0; cityIndex < suggestions[filterKey].properties[continentKey][countryKey][regionKey].length; cityIndex++) {
                                tempValues[regionKey + "/" + cityIndex] = suggestions[filterKey].properties[continentKey][countryKey][regionKey][cityIndex].name;
                            }
                        }
                    }
                }
                values = tempValues;
            }
            else {
                values = suggestions[filterKey].properties;
            }
        }
    }
    return values;
};
var onChangeRange = function () {
    $('#rangeFilterConfirm').prop('disabled', true);
    var from = $('#rangeFrom').val();
    var to = $('#rangeTo').val();
    // enable button when both fields are filled and from < to
    if (from !== '' && to !== '') {
        if (from < to || from === to) {
            $('#rangeFilterConfirm').prop('disabled', false);
        }
    }
};
var confirmRangeFilter = function (setNewFilterValue, filterKey, setShowSuggestions) {
    var from = $('#rangeFrom').val();
    var to = $('#rangeTo').val();
    // confirm only works when both fields are filled and from < to
    if (from !== '' && to !== '') {
        if (from < to || from === to) {
            setNewFilterValue({
                "key": filterKey,
                "value": [from, to]
            });
            setShowSuggestions(false);
        }
    }
};
export default FilterSuggestionPanel;
//# sourceMappingURL=FilterSuggestions.js.map