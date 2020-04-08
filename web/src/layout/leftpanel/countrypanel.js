/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable react/jsx-no-target-blank */
// TODO: re-enable rules

import React, { useEffect, useState } from 'react';
import {
  Redirect,
  Link,
  useLocation,
  useParams,
} from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment';

// Components
import LowCarbonInfoTooltip from '../../components/tooltips/lowcarboninfotooltip';
import CircularGauge from '../../components/circulargauge';
import ContributorList from '../../components/contributorlist';
import CountryHistoryCarbonGraph from '../../components/countryhistorycarbongraph';
import CountryHistoryEmissionsGraph from '../../components/countryhistoryemissionsgraph';
import CountryHistoryMixGraph from '../../components/countryhistorymixgraph';
import CountryHistoryPricesGraph from '../../components/countryhistorypricesgraph';
import CountryTable from '../../components/countrytable';

import { dispatch, dispatchApplication } from '../../store';

// Modules
import { updateApplication } from '../../actioncreators';
import { getCurrentZoneData } from '../../selectors';
import { getCo2Scale } from '../../helpers/scales';
import { flagUri } from '../../helpers/flags';
import { getFullZoneName, __ } from '../../helpers/translation';
import { co2Sub } from '../../helpers/formatting';

// TODO: Move all styles from styles.css to here
// TODO: Remove all unecessary id and class tags

const CountryLowCarbonGauge = connect((state) => {
  const d = getCurrentZoneData(state);
  if (!d) {
    return { percentage: null };
  }
  const fossilFuelRatio = state.application.electricityMixMode === 'consumption'
    ? d.fossilFuelRatio
    : d.fossilFuelRatioProduction;
  const countryLowCarbonPercentage = fossilFuelRatio != null
    ? 100 - (fossilFuelRatio * 100)
    : null;
  return {
    percentage: countryLowCarbonPercentage,
  };
})(CircularGauge);
const CountryRenewableGauge = connect((state) => {
  const d = getCurrentZoneData(state);
  if (!d) {
    return { percentage: null };
  }
  const renewableRatio = state.application.electricityMixMode === 'consumption'
    ? d.renewableRatio
    : d.renewableRatioProduction;
  const countryRenewablePercentage = renewableRatio != null
    ? renewableRatio * 100 : null;
  return {
    percentage: countryRenewablePercentage,
  };
})(CircularGauge);

const mapStateToProps = state => ({
  colorBlindModeEnabled: state.application.colorBlindModeEnabled,
  data: getCurrentZoneData(state) || {},
  electricityMixMode: state.application.electricityMixMode,
  isMobile: state.application.isMobile,
  tableDisplayEmissions: state.application.tableDisplayEmissions,
  zones: state.data.grid.zones,
});

const CountryPanel = ({
  colorBlindModeEnabled,
  data,
  electricityMixMode,
  isMobile,
  tableDisplayEmissions,
  zones,
}) => {
  const [tooltip, setTooltip] = useState(null);
  const [pressedBackKey, setPressedBackKey] = useState(false);
  const { zoneId } = useParams();

  const parentPage = {
    pathname: isMobile ? '/ranking' : '/map',
    search: useLocation().search,
  };

  // Back button keyboard navigation
  useEffect(() => {
    const keyHandler = (e) => {
      if (e.key === 'Backspace' || e.key === '/') {
        setPressedBackKey(true);
      }
    };
    document.addEventListener('keyup', keyHandler);
    return () => {
      document.removeEventListener('keyup', keyHandler);
    };
  });

  if (pressedBackKey) {
    return <Redirect to={parentPage} />;
  }

  if (!zones[zoneId]) {
    return <Redirect to="/map" />;
  }

  const { hasParser } = data;
  const datetime = data.stateDatetime || data.datetime;
  const co2ColorScale = getCo2Scale(colorBlindModeEnabled);
  const co2Intensity = electricityMixMode === 'consumption'
    ? data.co2intensity
    : data.co2intensityProduction;

  return (
    <div className="country-panel">
      <div id="country-table-header">
        <div className="left-panel-zone-details-toolbar">
          <Link to={parentPage}>
            <span className="left-panel-back-button">
              <i className="material-icons" aria-hidden="true">arrow_back</i>
            </span>
          </Link>
          <div className="country-name-time">
            <div className="country-name-time-table">
              <div style={{ display: 'table-cell' }}>
                <img id="country-flag" className="flag" alt="" src={flagUri(zoneId, 24)} />
              </div>

              <div style={{ display: 'table-cell' }}>
                <div className="country-name">
                  {getFullZoneName(zoneId)}
                </div>
                <div className="country-time">
                  {datetime ? moment(datetime).format('LL LT') : ''}
                </div>
              </div>
            </div>
          </div>
        </div>

        {hasParser && (
          <React.Fragment>
            <div className="country-table-header-inner">
              <div className="country-col country-emission-intensity-wrap">
                <div
                  id="country-emission-rect"
                  className="country-col-box emission-rect emission-rect-overview"
                  style={{ backgroundColor: co2ColorScale(co2Intensity) }}
                >
                  <div>
                    <span className="country-emission-intensity">
                      {Math.round(co2Intensity) || '?'}
                    </span>
                    g
                  </div>
                </div>
                <div
                  className="country-col-headline"
                  dangerouslySetInnerHTML={{ __html: co2Sub(__('country-panel.carbonintensity')) }}
                />
                <div className="country-col-subtext">(gCO<span className="sub">2</span>eq/kWh)</div>
              </div>
              <div className="country-col country-lowcarbon-wrap">
                <div id="country-lowcarbon-gauge" className="country-gauge-wrap">
                  <CountryLowCarbonGauge
                    onMouseMove={(x, y) => setTooltip({ position: { x, y } })}
                    onMouseOut={() => setTooltip(null)}
                  />
                  {tooltip && <LowCarbonInfoTooltip position={tooltip.position} />}
                </div>
                <div
                  className="country-col-headline"
                  dangerouslySetInnerHTML={{ __html: co2Sub(__('country-panel.lowcarbon')) }}
                />
                <div className="country-col-subtext" />
              </div>
              <div className="country-col country-renewable-wrap">
                <div id="country-renewable-gauge" className="country-gauge-wrap">
                  <CountryRenewableGauge />
                </div>
                <div
                  className="country-col-headline"
                  dangerouslySetInnerHTML={{ __html: co2Sub(__('country-panel.renewable')) }}
                />
              </div>
            </div>
            <div className="country-show-emissions-wrap">
              <div className="menu">
                <a
                  id="production"
                  onClick={() => dispatchApplication('tableDisplayEmissions', false)}
                  className={!tableDisplayEmissions ? 'selected' : null}
                  dangerouslySetInnerHTML={{ __html: __(`country-panel.electricity${electricityMixMode}`) }}
                />
                |
                <a
                  id="emissions"
                  onClick={() => dispatchApplication('tableDisplayEmissions', true)}
                  className={tableDisplayEmissions ? 'selected' : null}
                  dangerouslySetInnerHTML={{ __html: co2Sub(__('country-panel.emissions')) }}
                />
              </div>
            </div>
          </React.Fragment>
        )}
      </div>

      <div className="country-panel-wrap">
        {hasParser ? (
          <React.Fragment>
            <div className="bysource">
              {__('country-panel.bysource')}
            </div>

            <CountryTable />

            <hr />
            <div className="country-history">
              <div className="loading overlay" />
              <span
                className="country-history-title"
                dangerouslySetInnerHTML={{ __html: co2Sub(__(tableDisplayEmissions ? 'country-history.emissions24h' : 'country-history.carbonintensity24h')) }}
              />
              <br />
              <small className="small-screen-hidden">
                <i className="material-icons" aria-hidden="true">file_download</i> <a href="https://data.electricitymap.org/?utm_source=electricitymap.org&utm_medium=referral&utm_campaign=country_panel" target="_blank">{__('country-history.Getdata')}</a>
                <span className="pro"><i className="material-icons" aria-hidden="true">lock</i> pro</span>
              </small>

              {tableDisplayEmissions ? <CountryHistoryEmissionsGraph /> : <CountryHistoryCarbonGraph />}

              <div className="loading overlay" />
              <span className="country-history-title">
                {tableDisplayEmissions
                  ? __(`country-history.emissions${electricityMixMode === 'consumption' ? 'origin' : 'production'}24h`)
                  : __(`country-history.electricity${electricityMixMode === 'consumption' ? 'origin' : 'production'}24h`)
                }
              </span>
              <br />
              <small className="small-screen-hidden">
                <i className="material-icons" aria-hidden="true">file_download</i> <a href="https://data.electricitymap.org/?utm_source=electricitymap.org&utm_medium=referral&utm_campaign=country_panel" target="_blank">{__('country-history.Getdata')}</a>
                <span className="pro"><i className="material-icons" aria-hidden="true">lock</i> pro</span>
              </small>

              <CountryHistoryMixGraph />

              <div className="loading overlay" />
              <span className="country-history-title">
                {__('country-history.electricityprices24h')}
              </span>

              <CountryHistoryPricesGraph />
            </div>
            <hr />
            <div>
              {__('country-panel.source')}
              {': '}
              <a href="https://github.com/tmrowco/electricitymap-contrib#real-time-electricity-data-sources" target="_blank">
                <span className="country-data-source">{data.source || '?'}</span>
              </a>
              <small>
                {' ('}
                <span
                  dangerouslySetInnerHTML={{
                    __html: __(
                      'country-panel.addeditsource',
                      'https://github.com/tmrowco/electricitymap-contrib/tree/master/parsers'
                    ),
                  }}
                />
                {')'}
              </small>
              {' '}
              {__('country-panel.helpfrom')}
              <ContributorList />
            </div>
          </React.Fragment>
        ) : (
          <div className="zone-details-no-parser-message">
            <span dangerouslySetInnerHTML={{ __html: __('country-panel.noParserInfo', 'https://github.com/tmrowco/electricitymap-contrib#adding-a-new-region') }} />
          </div>
        )}

        <div className="social-buttons large-screen-hidden">
          <div>
            { /* Facebook share */}
            <div
              className="fb-share-button"
              data-href="https://www.electricitymap.org/"
              data-layout="button_count"
            />
            { /* Twitter share */}
            <a
              className="twitter-share-button"
              data-url="https://www.electricitymap.org"
              data-via="electricitymap"
              data-lang={locale}
            />
            { /* Slack */}
            <span className="slack-button">
              <a href="https://slack.tmrow.co" target="_blank" className="slack-btn">
                <span className="slack-ico" />
                <span className="slack-text">Slack</span>
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default connect(mapStateToProps)(CountryPanel);
