/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
// TODO: re-enable rules

import React from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';

import { useSearchParams } from '../../helpers/router';

import FAQPanel from './faqpanel';
import MobileInfoTab from './mobileinfotab';
import ZoneDetailsPanel from './zonedetailspanel';
import ZoneListPanel from './zonelistpanel';

// TODO: Move all styles from styles.css to here

const HandleLegacyRoutes = () => {
  const searchParams = useSearchParams();

  const page = (searchParams.get('page') || 'map')
    .replace('country', 'zone')
    .replace('highscore', 'ranking');
  searchParams.delete('page');

  const zoneId = searchParams.get('countryCode');
  searchParams.delete('countryCode');

  return (
    <Redirect
      to={{
        pathname: zoneId ? `/zone/${zoneId}` : `/${page}`,
        search: searchParams.toString(),
      }}
    />
  );
};

const mapStateToProps = state => ({
  isLeftPanelCollapsed: state.application.isLeftPanelCollapsed,
});

const LeftPanel = ({ isLeftPanelCollapsed }) => (
  <div className={`panel left-panel ${isLeftPanelCollapsed ? 'collapsed' : ''}`}>

    <div id="mobile-header" className="large-screen-hidden brightmode">
      <div className="header-content">
        <div className="logo">
          <div className="image" id="electricitymap-logo" />
        </div>
        <div className="right-header large-screen-hidden">
          <span id="small-loading" className="loading" />
          <span className="current-datetime-from-now" />
        </div>
      </div>
    </div>

    {/* Render different content based on the current route */}
    <Switch>
      <Route exact path="/" component={HandleLegacyRoutes} />
      <Route path="/map" component={ZoneListPanel} />
      <Route path="/ranking" component={ZoneListPanel} />
      <Route path="/zone/:zoneId" component={ZoneDetailsPanel} />
      <Route path="/info" component={MobileInfoTab} />
      <Route path="/faq" component={FAQPanel} />
      {/* TODO: Add a 404 page  */}
    </Switch>
  </div>
);

export default connect(mapStateToProps)(LeftPanel);
