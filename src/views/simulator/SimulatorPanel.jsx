import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  MenuItem,
  Box,
  FormGroup,
  FormControl,
  InputLabel,
  Input,
  Select,
} from '@material-ui/core';

import { getCurrentServerState } from '~/features/servers/selectors';
import { showNotification } from '~/features/snackbar/slice';
import { MessageSemantics } from '~/features/snackbar/types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import messageHub from '~/message-hub';

import {
  getSelectedFeatureIds,
  getFeatureById,
  getFeaturesInOrder,
} from '~/features/map-features/selectors';

import { getSelectedUAVIds } from '~/features/uavs/selectors';

import {
  changeNoUAVs,
  changeUavSpacing,
  changeUavRow,
  changeUavColumn,
  changeSimPattern,
} from '~/features/swarm/slice';

import { showError } from '~/features/snackbar/actions';
import simulator from '.';

const SimulatorPanel = ({
  selectedUAVIds,
  selectedFeatureIds,
  getFeatureBySelected,
  dispatch,
  simPattern,
  simNoUAVs,
  simSpacing,
  simRow,
  simColumn,
}) => {
  const patternTypes = [
    { id: 1, name: 'Line' },
    { id: 2, name: 'Grid' },
    { id: 3, name: 'Triangle' },
    { id: 4, name: 'Circle' },
    { id: 5, name: 'Spiral' },
  ];

  const handleSelector = (e) => {
    const name = patternTypes.find((item) => item.id === e.target.value)?.name;

    dispatch(changeSimPattern({ simPattern: name }));
  };

  // -----------------------
  // Set point from map
  // -----------------------

  const handlePoint = async (message) => {
    if (selectedFeatureIds.length === 0) {
      dispatch(showError(`${message} needs a path or point`));
      return;
    }
    if (simNoUAVs < 1 || simNoUAVs > 8) {
      dispatch(showError('Number of UAVs should be less than or equal to 8'));
      return;
    }
    const featureId = selectedFeatureIds[0];
    console.log('selectedFeatureIds', selectedFeatureIds, featureId);
    const data = getFeatureBySelected(featureId);
    try {
      console.log('data.points', data);
      const res = await messageHub.sendMessage({
        type: 'X-UAV-socket',
        message,
        ids: selectedUAVIds,
        coords: data.points,
        simNoUAVs,
        simSpacing,
        simRow,
        simColumn,
        simPattern,
      });

      if (Boolean(res.body.message)) {
        dispatch(
          showNotification({
            message: `${message} Message sent`,
            semantics: MessageSemantics.SUCCESS,
          })
        );
      } else {
        dispatch(showError(`${message}`));
      }

      if (message == 'search' || message == 'navigate') {
        if (res?.body?.message[0]?.length == 0) {
          dispatch(
            showNotification({
              message: `Read a Empty Mission`,
              semantics: MessageSemantics.WARNING,
            })
          );
          return;
        }
        dispatch(setMissionFromServer(res.body.message));
        dispatch(setTime(res.body.time?.toFixed(2)));
      }
    } catch (e) {
      dispatch(
        showNotification({
          message: `${message} ${e?.message} Command is Failed`,
          semantics: MessageSemantics.ERROR,
        })
      );
    }
  };
  const handleMsg = async (msg) => {
    try {
      const res = await messageHub.sendMessage({
        type: 'X-UAV-socket',
        message: msg,
        id: selectedUAVIds[0],
      });
      if (Boolean(res?.body?.message)) {
        dispatch(
          showNotification({
            message: `${msg} Message sent`,
            semantics: MessageSemantics.SUCCESS,
          })
        );
      }
    } catch (e) {
      dispatch(showError(`${msg} Message failed to send`));
    }
  };

  return (
    <Box style={{ margin: 10, gap: 20 }}>
      <FormGroup style={{ display: 'flex', flexDirection: 'row', gap: 20 }}>
        {/* Number of UAVs */}
        <FormControl variant='standard'>
          <InputLabel>Number of UAVs</InputLabel>
          <Input
            type='number'
            value={simNoUAVs}
            onChange={(e) =>
              dispatch(changeNoUAVs({ NoOfUAVs: parseInt(e.target.value) }))
            }
          />
        </FormControl>

        {/* Spacing */}
        <FormControl variant='standard'>
          <InputLabel>Spacing</InputLabel>
          <Input
            type='number'
            value={simSpacing}
            onChange={(e) =>
              dispatch(
                changeUavSpacing({ UAVSpacing: parseInt(e.target.value) })
              )
            }
          />
        </FormControl>

        <FormControl variant='standard'>
          <InputLabel>Row</InputLabel>
          <Input
            type='number'
            value={simRow}
            onChange={(e) =>
              dispatch(changeUavRow({ UAVRow: parseInt(e.target.value) }))
            }
          />
        </FormControl>

        <FormControl variant='standard'>
          <InputLabel>Column</InputLabel>
          <Input
            type='number'
            value={simColumn}
            onChange={(e) =>
              dispatch(changeUavColumn(parseInt(e.target.value)))
            }
          />
        </FormControl>

        <FormControl variant='standard' style={{ width: '12rem' }}>
          <InputLabel>Pattern</InputLabel>
          <Select
            type='text'
            value={patternTypes.find((item) => item.name === simPattern)?.id}
            onChange={handleSelector}
          >
            {patternTypes.map((pattern) => (
              <MenuItem key={pattern.id} value={pattern.id}>
                {pattern.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Location (readonly) */}
        {/* <FormControl variant='standard'>
          <InputLabel>Location</InputLabel>
          <Input
            value={simLocation}

            // style={{ color: 'black', fontWeight: 600 }}
          />
        </FormControl> */}

        <Button
          variant='contained'
          color='secondary'
          onClick={() => handlePoint('StartSimulation')}
        >
          Start Simulation
        </Button>
        <Button
          variant='contained'
          color='secondary'
          onClick={() => handleMsg('EndSimulation')}
        >
          Close Simulation
        </Button>
      </FormGroup>
    </Box>
  );
};

// ---------------------
// FIXED PROP TYPES
// ---------------------
SimulatorPanel.propTypes = {
  selectedUAVIds: PropTypes.arrayOf(PropTypes.string),
  selectedFeatureIds: PropTypes.arrayOf(PropTypes.string),
  getFeatureBySelected: PropTypes.func,

  simNoUAVs: PropTypes.number,
  simSpacing: PropTypes.number,
  simRow: PropTypes.number,
  simColumn: PropTypes.number,
  simPattern: PropTypes.string,
};

// ---------------------
// EXPORT
// ---------------------
export default connect(
  (state) => ({
    selectedUAVIds: getSelectedUAVIds(state),
    selectedFeatureIds: getSelectedFeatureIds(state),
    features: getFeaturesInOrder(state),
    getFeatureBySelected: (id) => getFeatureById(state, id),
    socketData: { ...state.socket },
    simNoUAVs: state.socket.NoOfUAVs,
    simSpacing: state.socket.UAVSpacing,
    simRow: state.socket.UAVRow,
    simColumn: state.socket.UAVColumn,
    simPattern: state.socket.simPattern,

    connection: getCurrentServerState(state).state,
  }),
  (dispatch) => ({
    dispatch,
  })
)(withTranslation()(SimulatorPanel));
