import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import TimeAgo from 'react-timeago';

import StatusText from '@skybrush/mui-components/lib/StatusText';
import {
  getSelectedFeatureIds,
  getFeatureById,
  getFeaturesInOrder,
} from '~/features/map-features/selectors';

import MiniTable from '~/components/MiniTable';
import {
  abbreviateGPSFixType,
  getFlightModeLabel,
  getSemanticsForFlightMode,
  getSemanticsForGPSFixType,
} from '~/model/enums';
import { formatNumberSafely, shortTimeAgoFormatter } from '~/utils/formatting';

import { getUAVById } from './selectors';
import { showError } from '../snackbar/actions';
import messageHub from '~/message-hub';

// TODO: Use the internal `naText` of `MiniTable` instead
const naText = <span className='muted'>—</span>;

const StatusSummaryMiniTable = ({
  gpsFix,
  heading,
  lastUpdated,
  localPosition,
  mode,
  position,
  distance_from_GCS,
  bearing_from_GCS,
  dispatch,
  uav_id,
  homePosition,
}) => {
  const [distance_from_GCS_meter, setDistanceFromGCS] = useState(1.01);
  const [bearing_from_GCS_meter, setBearingFromGCS] = useState(1.01);
  const homeDistance = async (msg) => {
    try {
      const res = await messageHub.sendMessage({
        type: 'X-UAV-socket',
        message: msg,
        id: uav_id,
      });
      console.log(res.body.home_dist);

      setDistanceFromGCS(res.body.home_dist[0]);
      setBearingFromGCS(res.body.home_dist[1]);
    } catch (e) {
      dispatch(showError(`${e} Message failed to send`));
    }
  };
  console.log(homePosition);

  useEffect(() => {
    homeDistance('home_distance');
  });

  const { lat, lon, amsl, ahl, agl } = position || {};
  const hasLocalPosition = localPosition && Array.isArray(localPosition);

  const flightModeLabel = mode ? (
    <StatusText status={getSemanticsForFlightMode(mode)}>
      {getFlightModeLabel(mode)}
    </StatusText>
  ) : (
    naText
  );
  const gpsFixType = gpsFix?.type;
  const shouldShowGlobalPositionInfo = !hasLocalPosition || gpsFixType;

  const rows = [['Mode', flightModeLabel], 'sep0'];

  if (shouldShowGlobalPositionInfo) {
    const gpsFixLabel = gpsFixType ? (
      <>
        <StatusText status={getSemanticsForGPSFixType(gpsFixType)}>
          {abbreviateGPSFixType(gpsFixType)}
        </StatusText>
        {gpsFix?.numSatellites && ` (${gpsFix?.numSatellites} sats)`}
      </>
    ) : (
      naText
    );

    let { horizontalAccuracy, verticalAccuracy } = gpsFix || {};

    if (typeof horizontalAccuracy === 'number' && horizontalAccuracy > 50) {
      horizontalAccuracy = '50+';
    } else {
      horizontalAccuracy = formatNumberSafely(
        horizontalAccuracy,
        2,
        '',
        naText
      );
    }

    if (typeof verticalAccuracy === 'number' && verticalAccuracy > 50) {
      verticalAccuracy = '50+';
    } else {
      verticalAccuracy = formatNumberSafely(verticalAccuracy, 2, '', naText);
    }

    const gpsAcc = (
      <>
        {horizontalAccuracy}
        {' / '}
        {verticalAccuracy}
        {' m'}
      </>
    );

    rows.push(
      ['GPS fix', gpsFixLabel],

      ['GPS acc', gpsAcc],
      'sep1',
      ['Lat', formatNumberSafely(lat, 7, '°', naText)],
      ['Lon', formatNumberSafely(lon, 7, '°', naText)],
      ['AMSL', formatNumberSafely(amsl, 2, ' m', naText)],
      ['AHL', formatNumberSafely(ahl, 2, ' m', naText)],
      ['AGL', formatNumberSafely(agl, 2, ' m', naText)]
    );
  }

  if (hasLocalPosition) {
    rows.push(
      ['X', formatNumberSafely(localPosition[0], 2, ' m', naText)],
      ['Y', formatNumberSafely(localPosition[1], 2, ' m', naText)],
      ['Z', formatNumberSafely(localPosition[2], 2, ' m', naText)]
    );
  }

  if (distance_from_GCS_meter) {
    rows.push([
      'Distance From Home',
      formatNumberSafely(distance_from_GCS_meter, 2, 'm', naText),
    ]);
  }

  if (bearing_from_GCS_meter) {
    rows.push([
      'Bearing From Home',
      formatNumberSafely(bearing_from_GCS_meter, 2, '°', naText),
    ]);
  }
  rows.push(['Heading', formatNumberSafely(heading, 1, '°', naText)], 'sep3', [
    'Last seen',
    lastUpdated ? (
      <TimeAgo formatter={shortTimeAgoFormatter} date={lastUpdated} />
    ) : (
      naText
    ),
  ]);

  return <MiniTable items={rows} />;
};

StatusSummaryMiniTable.propTypes = {
  gpsFix: PropTypes.shape({
    type: PropTypes.number,
    numSatellites: PropTypes.number,
    horizontalAccuracy: PropTypes.number,
    verticalAccuracy: PropTypes.number,
  }),
  heading: PropTypes.number,
  lastUpdated: PropTypes.number,
  localPosition: PropTypes.arrayOf(PropTypes.number),
  mode: PropTypes.string,
  distance_from_GCS: PropTypes.number,
  bearing_from_GCS: PropTypes.number,

  position: PropTypes.shape({
    lat: PropTypes.number,
    lon: PropTypes.number,
    amsl: PropTypes.number,
    ahl: PropTypes.number,
    agl: PropTypes.number,
  }),
};

// export default connect(
//   // mapStateToProps
//   (state, ownProps) => ({
//     uav: getUAVById(state, ownProps.uavId),
//     uav_id: ownProps,
//   }),
//   // (state) => ({
//   //   selectedFeatureIds: getSelectedFeatureIds(state),
//   // }),

//   // console.log(state)

//   // mapDispatchToProps
//   (dispatch) => ({ dispatch })
// )(StatusSummaryMiniTable);
export default connect(
  (state, ownProps) => {
    const uav = getUAVById(state, ownProps.uavId);

    return {
      ...uav, // spread all uav props
      uav_id: ownProps.uavId,
    };
  },
  (dispatch) => ({ dispatch })
)(StatusSummaryMiniTable);
