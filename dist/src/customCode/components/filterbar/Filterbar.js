var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import React, { useCallback, useEffect, useState } from "react";
import dtFilters from '../../data/dt_filters';
import iVolFilters from '../../data/ivol_filters';
import styles from "./Filterbar.module.css";
import FilterElement from "./FilterElement";
import FilterSuggestionPanel from "./FilterSuggestions";
var Filterbar = function (_a) {
    var isIVolunteer = _a.isIVolunteer, filters = _a.filters, onSelectedFilters = _a.onSelectedFilters;
    var _b = useState(filters), selectedFilters = _b[0], setSelectedFilters = _b[1];
    var filterSuggestions = useFilterSuggestions(isIVolunteer, selectedFilters, setSelectedFilters);
    if (selectedFilters !== undefined && filters !== selectedFilters) {
        setSelectedFilters(filters);
    }
    var updateSelectedFilters = useCallback(function (value) {
        if (value[1]) { // add filter
            onSelectedFilters(__spreadArray(__spreadArray([], selectedFilters, true), [value[0]], false));
            setSelectedFilters(__spreadArray(__spreadArray([], selectedFilters, true), [value[0]], false));
        }
        else { // remove filter
            var newFilterList = selectedFilters.filter(function (el) { return el.key !== value[0]; });
            onSelectedFilters(newFilterList);
            setSelectedFilters(newFilterList);
        }
    }, [selectedFilters, setSelectedFilters]);
    var filterList = (React.createElement(React.Fragment, null, selectedFilters.map(function (element) { return (React.createElement(FilterElement, { key: element.key, filterKey: element.key, filterValue: element.value, removeFilter: updateSelectedFilters, isIVolunteer: isIVolunteer })); })));
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "".concat(styles.filterbar, " ").concat(isIVolunteer ? styles.filterbarIVol : styles.filterbarDt) },
            React.createElement("div", { className: styles.filterStaticText }, "Filters:"),
            filterList,
            React.createElement(FilterSuggestionPanel, { suggestions: filterSuggestions, isIVolunteer: isIVolunteer, onSetNewFilterValue: updateSelectedFilters }))));
};
var getFilterSuggestions = function (isIVolunteer) {
    if (isIVolunteer) {
        return Object.assign({}, iVolFilters[0]);
    }
    else {
        return Object.assign({}, dtFilters[0]);
    }
};
var useFilterSuggestions = function (isIVolunteer, selectedFilters, setSelectedFilters) {
    var fullList = getFilterSuggestions(isIVolunteer);
    var _a = useState(fullList), filterSuggestions = _a[0], setFilterSuggestions = _a[1];
    useEffect(function () {
        // check if selectedFilters contains a filter from filterSuggestions and remove it from filterSuggestions
        var newFilterList;
        if (isIVolunteer) {
            newFilterList = adjustAvailableFiltersIVol(selectedFilters, fullList);
        }
        else {
            newFilterList = adjustAvailableFiltersDt(selectedFilters, fullList);
        }
        setFilterSuggestions(newFilterList);
    }, [selectedFilters, setSelectedFilters]);
    return filterSuggestions;
};
var adjustAvailableFiltersIVol = function (selectedFilters, fullList) {
    var filterList = Object.assign({}, fullList);
    for (var i = 0; i < selectedFilters.length; i++) {
        var selectedFilterKey = selectedFilters[i].key;
        for (var fullListKey in fullList) {
            if (fullListKey === selectedFilterKey) {
                delete filterList[fullListKey];
            }
        }
    }
    return filterList;
};
var adjustAvailableFiltersDt = function (selectedFilters, fullList) {
    var filterList = Object.assign({}, fullList);
    // remove filterKey if this filter has been set already
    // also, check for hierarchical filters
    var isCitySet, isRegionSet, isCountrySet = false;
    for (var i = 0; i < selectedFilters.length; i++) {
        var selectedFilterKey = selectedFilters[i].key;
        for (var fullListKey in fullList) {
            if (fullListKey === selectedFilterKey) {
                delete filterList[fullListKey];
            }
        }
        isCitySet = selectedFilterKey === 'city' ? true : isCitySet;
        isRegionSet = selectedFilterKey === 'region' ? true : isRegionSet;
        isCountrySet = selectedFilterKey === 'country' ? true : isCountrySet;
    }
    // if set, remove hierarchical filters if a more specific filter has been set already (e.g. continent/country/region/city)
    if (isCitySet) {
        delete filterList['region'];
        delete filterList['country'];
        delete filterList['continent'];
    }
    if (isRegionSet) {
        delete filterList['country'];
        delete filterList['continent'];
    }
    if (isCountrySet) {
        delete filterList['continent'];
    }
    // remove suggestions that aren't possible (e.g. Country = "Austria", City = "Berlin")
    filterList = adjustSuggestionsDt(selectedFilters, filterList);
    return filterList;
};
// TODO something doesn't work in here. Scenario:
// When choosing Continent = EU, Region = Upper Austria --> city loads suggestions correctly
// when then deleting all filters and choosing Continent = NA, Region = any --> city is empty (probably right, NA doesn't have cities except New York)
// when then choosing the first scenario again, city is also empty.
// Loading data directly from the file dt_filters.ts comes in wrongly already wth
var adjustSuggestionsDt = function (selectedFilters, filterList) {
    for (var i = 0; i < selectedFilters.length; i++) {
        var selectedFilterKey = selectedFilters[i].key;
        var selectedFilterValue = selectedFilters[i].value;
        for (var filterListKey in filterList) {
            if (selectedFilterKey === 'continent') {
                // if (filterListKey === 'country' || filterListKey === 'region' || filterListKey === 'city') {
                //     for (let continentKey in newFilterList[filterListKey].properties) {
                //         if (continentKey !== selectedFilterValue) {
                //             delete newFilterList[filterListKey].properties[continentKey];
                //         }
                //     }
                // }
            }
            else if (selectedFilterKey === 'country') {
                // if (filterListKey === 'region' || filterListKey === 'city') {
                //     for (let continentKey in newFilterList[filterListKey].properties) {
                //         for (let countryKey in newFilterList[filterListKey].properties[continentKey]) {
                //             if (countryKey !== selectedFilterValue) {
                //                 delete newFilterList[filterListKey].properties[continentKey][countryKey];
                //             }
                //         }
                //     }
                // }
            }
            else if (selectedFilterKey === 'region') {
                // if (filterListKey === 'city') {
                //     for (let continentKey in filterList[filterListKey].properties) {
                //         for (let countryKey in filterList[filterListKey].properties[continentKey]) {
                //             for (let regionKey in filterList[filterListKey].properties[continentKey][countryKey]) {
                //                 if (regionKey !== selectedFilterValue) {
                //                     delete filterList[filterListKey].properties[continentKey][countryKey][regionKey];
                //                 }
                //             }
                //         }
                //     }
                // }
            }
        }
    }
    return filterList;
};
export default Filterbar;
//# sourceMappingURL=Filterbar.js.map